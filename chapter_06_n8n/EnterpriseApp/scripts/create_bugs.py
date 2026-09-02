"""Create 10 bug issues in the "Enterprise Application" (EA) JIRA project.

Uses the same JIRA REST approach as create_project.py:
  1. Handshake GET /rest/api/3/myself -> 200
  2. Resolve Epic issues (EA-1..EA-4) as parents
  3. Create missing bugs from scripts/bugs.json (idempotent by summary)
  4. Assign bugs to their sprint by sprint name (EA Sprint N)

Idempotent: bugs are matched by summary and only created when missing; re-runs
reuse what is already there. Fails loudly on any non-2xx (per LLM.md).
"""

import json
from pathlib import Path

from jira_client import JiraClient

SCRIPTS_DIR = Path(__file__).resolve().parent
BUGS_PATH = SCRIPTS_DIR / "bugs.json"


def load_bugs() -> dict:
    with open(BUGS_PATH, encoding="utf-8") as fh:
        return json.load(fh)


def existing_bugs(client: JiraClient, project_key: str) -> dict[str, str]:
    """Return {summary: key} for existing Bug issues in the project."""
    issues = client.search_jql(
        f"project={project_key} AND issuetype=Bug", fields="key,summary"
    )
    return {issue["fields"]["summary"].strip(): issue["key"] for issue in issues}


def epic_map(client: JiraClient, project_key: str) -> dict[str, str]:
    """Return {import_epic_key: jira_epic_key} for the EA epics."""
    issues = client.search_jql(
        f"project={project_key} AND issuetype=Epic", fields="key,summary"
    )
    result: dict[str, str] = {}
    for issue in issues:
        summary = issue["fields"]["summary"]
        key = issue["key"]
        if "Authentication & Access" in summary:
            result["EA-1"] = key
        elif "Experimentation & Testing" in summary:
            result["EA-2"] = key
        elif "Behavioral Insights" in summary:
            result["EA-3"] = key
        elif "Enterprise Readiness" in summary:
            result["EA-4"] = key
    return result


def sprint_map(client: JiraClient, project_key: str) -> dict[int, dict]:
    """Return {sprint_number: {id, name}} for EA Sprint 1..4."""
    board = client.find_board(project_key)
    if not board:
        return {}
    result: dict[int, dict] = {}
    for sprint_no in range(1, 5):
        sprint = client.find_sprint_by_name(board["id"], f"EA Sprint {sprint_no}")
        if sprint:
            result[sprint_no] = {"id": sprint["id"], "name": sprint["name"]}
    return result


def create_bugs(
    client: JiraClient,
    project_key: str,
    bugs: list[dict],
    epics: dict[str, str],
    existing: dict[str, str],
) -> list[tuple[str, int]]:
    """Create missing bugs; return [(jira_key, sprint_number)]."""
    created: list[tuple[str, int]] = []
    for bug in bugs:
        summary = bug["summary"]
        sprint_no = bug.get("sprint", 0)
        if summary in existing:
            created.append((existing[summary], sprint_no))
            print(f"  Bug reused: {existing[summary]} (sprint {sprint_no})")
            continue
        fields: dict = {
            "project": {"key": project_key},
            "issuetype": {"name": "Bug"},
            "summary": summary,
            "description": bug["description"],
            "labels": bug.get("labels", []),
            "priority": {"name": bug.get("priority", "Medium")},
        }
        epic_ref = bug.get("epic")
        if epic_ref and epic_ref in epics:
            fields["parent"] = {"key": epics[epic_ref]}
        result = client.create_issue(fields)
        key = result.get("key")
        created.append((key, sprint_no))
        print(f"  Bug created: {key} (sprint {sprint_no})")
    return created


def assign_to_sprints(
    client: JiraClient,
    project_key: str,
    created_bugs: list[tuple[str, int]],
) -> None:
    """Assign bugs to sprints by sprint number (skip if sprint not found)."""
    sprints = sprint_map(client, project_key)
    for sprint_no, sprint in sprints.items():
        keys = [key for key, no in created_bugs if no == sprint_no]
        if not keys:
            continue
        client.move_issues_to_sprint(sprint["id"], keys)
        print(f"  Assigned {len(keys)} bugs to '{sprint['name']}'")
    missing = {no for _, no in created_bugs} - set(sprints)
    if missing:
        print(f"  WARNING: sprint(s) {sorted(missing)} not found; bugs left in backlog.")


def main() -> None:
    data = load_bugs()
    bugs = data["bugs"]
    project_key = "EA"

    print(f"Enterprise Application -> JIRA ({project_key})")
    print(f"Payload: {len(bugs)} bugs")

    client = JiraClient()

    # 1. Handshake
    me = client.handshake()
    print(f"\n[1/4] Handshake OK: {me.get('displayName', me.get('emailAddress', '?'))}")

    # 2. Resolve epics
    print("\n[2/4] Resolving EA epics...")
    epics = epic_map(client, project_key)
    if len(epics) != 4:
        raise RuntimeError(f"Expected 4 EA epics, found {len(epics)}")
    print(f"  Epics: {epics}")

    # 3. Create bugs (idempotent by summary)
    print(f"\n[3/4] Creating {len(bugs)} bugs...")
    existing = existing_bugs(client, project_key)
    created_bugs = create_bugs(client, project_key, bugs, epics, existing)

    # 4. Assign to sprints
    print("\n[4/4] Assigning bugs to sprints...")
    assign_to_sprints(client, project_key, created_bugs)

    total = client.search_jql(f"project={project_key} AND issuetype=Bug", "key")
    print(f"\nVerification: {len(total)} bugs in project {project_key} (expected {len(bugs)})")
    if len(total) != len(bugs):
        raise RuntimeError(f"Expected {len(bugs)} bugs but found {len(total)}")

    print("\nDone. Update progress.md with these results.")


if __name__ == "__main__":
    main()
