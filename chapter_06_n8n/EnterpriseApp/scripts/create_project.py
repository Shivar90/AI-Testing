"""Create the "Enterprise Application" project in JIRA via REST API.

Runs the task_plan.md Step 5 checklist in order:
  1. Handshake GET /rest/api/3/myself -> 200
  2. Create/verify project "Enterprise Application" (key EA)
  3. Create 4 epics + 26 stories from scripts/import.json
  4. Create + assign 4 sprints
  5. Verify via GET /rest/api/3/search

Idempotent: epics/stories are matched by summary against existing issues and
only created when missing; re-runs reuse what is already there. Fails loudly on
any non-2xx (per LLM.md) — sprint/board failures are NOT swallowed.
"""

import json
from pathlib import Path

from jira_client import JiraClient

SCRIPTS_DIR = Path(__file__).resolve().parent
IMPORT_PATH = SCRIPTS_DIR / "import.json"

# Sprint number -> story indices (1-based) in import.json "stories".
SPRINT_FIELD = "sprint"
EPIC_KEY_FIELD = "epic"


def load_import() -> dict:
    with open(IMPORT_PATH, encoding="utf-8") as fh:
        return json.load(fh)


def find_story_points_field(client: JiraClient) -> str | None:
    """Return the customfield id whose name is 'Story point estimate', if any."""
    for field in client.get_fields():
        if field.get("name", "").strip().lower() == "story point estimate":
            return field["id"]
    return None


def project_exists(client: JiraClient, key: str) -> dict | None:
    return client.get_project(key)


def existing_epics(client: JiraClient, project_key: str) -> dict[str, str]:
    """Return {summary: key} for existing Epic issues in the project."""
    issues = client.search_jql(
        f"project={project_key} AND issuetype=Epic", fields="key,summary"
    )
    return {issue["fields"]["summary"].strip(): issue["key"] for issue in issues}


def existing_stories(client: JiraClient, project_key: str) -> dict[str, str]:
    """Return {summary: key} for existing Story issues in the project."""
    issues = client.search_jql(
        f"project={project_key} AND issuetype=Story", fields="key,summary"
    )
    return {issue["fields"]["summary"].strip(): issue["key"] for issue in issues}


def create_epics(
    client: JiraClient, project_key: str, epics: list[dict], existing: dict[str, str]
) -> dict[str, str]:
    """Create missing epics; return {import_key: jira_key}. Reuses existing by summary."""
    created: dict[str, str] = {}
    for epic in epics:
        summary = epic["summary"]
        if summary in existing:
            jira_key = existing[summary]
            created[epic["key"]] = jira_key
            print(f"  Epic reused: {jira_key} ({epic['key']})")
            continue
        result = client.create_issue(
            {
                "project": {"key": project_key},
                "issuetype": {"name": "Epic"},
                "summary": summary,
                "description": epic["description"],
                "labels": epic.get("labels", []),
            }
        )
        jira_key = result.get("key")
        created[epic["key"]] = jira_key
        print(f"  Epic created: {jira_key} ({epic['key']})")
    return created


def create_stories(
    client: JiraClient,
    project_key: str,
    stories: list[dict],
    epic_keys: dict[str, str],
    story_points_field: str | None,
    existing: dict[str, str],
) -> list[tuple[str, int, str]]:
    """Create missing stories; return [(jira_key, sprint_number, import_epic_ref)]."""
    created: list[tuple[str, int, str]] = []
    for story in stories:
        summary = story["summary"]
        sprint_no = story.get(SPRINT_FIELD, 0)
        epic_ref = story.get(EPIC_KEY_FIELD) or ""
        if summary in existing:
            key = existing[summary]
            created.append((key, sprint_no, epic_ref))
            print(f"  Story reused: {key} (sprint {sprint_no})")
            continue
        fields: dict = {
            "project": {"key": project_key},
            "issuetype": {"name": "Story"},
            "summary": summary,
            "description": story["description"],
            "labels": story.get("labels", []),
        }
        if epic_ref and epic_ref in epic_keys:
            fields["parent"] = {"key": epic_keys[epic_ref]}
        priority = story.get("priority")
        if priority:
            fields["priority"] = {"name": priority}
        if story_points_field and story.get("points"):
            fields[story_points_field] = story["points"]
        result = client.create_issue(fields)
        key = result.get("key")
        created.append((key, sprint_no, epic_ref))
        print(f"  Story created: {key} (sprint {sprint_no})")
    return created


def setup_sprints(
    client: JiraClient,
    project_key: str,
    sprints: list[dict],
    created_stories: list[tuple[str, int, str]],
) -> list[dict]:
    """Find board, create sprints, assign stories by sprint number. Fail loudly."""
    board = client.find_board(project_key)
    if not board:
        raise RuntimeError(
            f"No board found for project {project_key}; sprints cannot be "
            "created via API. Create a Scrum board, then re-run."
        )
    print(f"  Board: {board.get('name')} (id={board.get('id')}, type={board.get('type')})")

    sprint_ids: list[dict] = []
    for sprint in sprints:
        result = client.create_sprint(board["id"], sprint)
        sprint_ids.append(result)
        print(f"  Sprint created: {result.get('name')} (id={result.get('id')}, state={result.get('state')})")

    # Assign each story to its sprint by sprint number (1-based).
    for idx, sprint in enumerate(sprints, start=1):
        sprint_id = sprint_ids[idx - 1].get("id")
        story_keys = [
            key for key, sprint_no, _ in created_stories if sprint_no == idx
        ]
        client.move_issues_to_sprint(sprint_id, story_keys)
        print(f"  Assigned {len(story_keys)} stories to '{sprint['name']}'")
    return sprint_ids


def verify(client: JiraClient, project_key: str, expected_issues: int) -> None:
    data = client.search(f"project={project_key}")
    issues = data.get("issues", [])
    print(f"\nVerification: {len(issues)} issues in project {project_key} (expected ~{expected_issues})")
    for issue in issues:
        fields = issue.get("fields", {})
        issue_type = fields.get("issuetype", {}).get("name", "?")
        parent = fields.get("parent", {}).get("key", "")
        print(f"  {issue['key']} [{issue_type}] {fields.get('summary', '')[:60]} {parent and '(epic: ' + parent + ')' or ''}")
    if len(issues) != expected_issues:
        raise RuntimeError(
            f"Expected {expected_issues} issues but search returned {len(issues)}"
        )


def main() -> None:
    data = load_import()
    project_cfg = data["project"]
    project_key = project_cfg["key"]

    epics = data["epics"]
    stories = data["stories"]
    sprints = data["sprints"]
    expected_issues = len(epics) + len(stories)

    print(f"Enterprise Application -> JIRA ({project_key})")
    print(f"Payload: {len(epics)} epics, {len(stories)} stories, {len(sprints)} sprints")

    client = JiraClient()

    # 1. Handshake
    me = client.handshake()
    print(f"\n[1/5] Handshake OK: {me.get('displayName', me.get('emailAddress', '?'))}")

    # 2. Project (create if missing)
    print(f"\n[2/5] Checking project {project_key}...")
    existing = project_exists(client, project_key)
    if existing:
        print(f"  Project already exists: {existing.get('name')} ({existing.get('key')}) — reusing.")
    else:
        created = client.create_project(project_cfg)
        print(f"  Project created: {created.get('name')} ({created.get('key')})")

    # 3. Epics + stories (idempotent: match by summary)
    print(f"\n[3/5] Creating {len(epics)} epics...")
    existing_epics_map = existing_epics(client, project_key)
    epic_keys = create_epics(client, project_key, epics, existing_epics_map)

    print(f"\n[3/5] Creating {len(stories)} stories...")
    sp_field = find_story_points_field(client)
    if sp_field:
        print(f"  Story points field: {sp_field}")
    else:
        print("  No 'Story point estimate' field found — skipping points.")
    existing_stories_map = existing_stories(client, project_key)
    created_stories = create_stories(
        client, project_key, stories, epic_keys, sp_field, existing_stories_map
    )

    # 4. Sprints (fail loudly: no try/except)
    print(f"\n[4/5] Setting up {len(sprints)} sprints...")
    setup_sprints(client, project_key, sprints, created_stories)

    # 5. Verify
    print("\n[5/5] Verifying via search...")
    verify(client, project_key, expected_issues)

    print("\nDone. Update progress.md / task_plan.md with these results.")


if __name__ == "__main__":
    main()
