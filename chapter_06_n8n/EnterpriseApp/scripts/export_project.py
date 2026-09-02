"""Export every JIRA project (epics, stories, tasks, bugs, sprints) to JSON.

Produces a portable backup file (default: EnterpriseApp/backup/jira_backup.json)
so all data can be re-imported into a fresh/expired JIRA instance via
restore_project.py. Fails loudly on any non-2xx (per LLM.md).
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from jira_client import JiraClient

SCRIPTS_DIR = Path(__file__).resolve().parent
DEFAULT_OUT = SCRIPTS_DIR.parent / "backup" / "jira_backup.json"

ISSUE_TYPES = ("Epic", "Story", "Task", "Bug")


def list_projects(client: JiraClient) -> list[dict]:
    """Return all visible projects (paginated search)."""
    projects: list[dict] = []
    start = 0
    while True:
        data = client.request(
            "GET",
            "/rest/api/3/project/search",
            params={"maxResults": 50, "startAt": start},
        )
        values = data.get("values", [])
        projects.extend(values)
        total = data.get("total", 0)
        start += len(values)
        if start >= total or not values:
            break
    return projects


def fetch_issues(client: JiraClient, project_key: str, fields: str) -> list[dict]:
    """Fetch ALL issues for a project (paginated by 100)."""
    issues: list[dict] = []
    start = 0
    while True:
        data = client.request(
            "GET",
            "/rest/api/3/search/jql",
            params={
                "jql": f"project={project_key} ORDER BY key ASC",
                "fields": fields,
                "maxResults": 100,
                "startAt": start,
            },
        )
        page = data.get("issues", [])
        issues.extend(page)
        total = data.get("total", 0)
        start += len(page)
        if start >= total or not page:
            break
    return issues


def sprint_name_of(issue_fields: dict, sprint_field: str) -> str | None:
    """Resolve the sprint name an issue is in from its sprint custom field."""
    if not sprint_field:
        return None
    sprints = issue_fields.get(sprint_field) or []
    if not sprints:
        return None
    # Multiple sprints possible; prefer the newest by start date.
    sprints = [s for s in sprints if isinstance(s, dict)]
    if not sprints:
        return None
    sprints.sort(key=lambda s: s.get("startDate") or "", reverse=True)
    return sprints[0].get("name")


def export_project(
    client: JiraClient,
    project: dict,
    board_ids: dict[str, int],
    story_points_field: str | None,
    sprint_field: str,
) -> dict:
    """Export one project's issues + sprints as a portable dict."""
    key = project["key"]
    fields = "key,summary,description,issuetype,parent,priority,labels,status"
    if story_points_field:
        fields += f",{story_points_field}"
    fields += f",{sprint_field}"

    issues = fetch_issues(client, key, fields)

    out_issues = []
    for issue in issues:
        f = issue.get("fields", {})
        itype = (f.get("issuetype") or {}).get("name", "")
        if itype not in ISSUE_TYPES:
            continue
        points = None
        if story_points_field:
            points = f.get(story_points_field)
        sprint = None
        if itype in ("Story", "Task", "Bug"):
            sprint = sprint_name_of(f, sprint_field)
        out_issues.append(
            {
                "key": issue["key"],
                "issueType": itype,
                "summary": f.get("summary", ""),
                "description": client._adf_to_text(f.get("description")),
                "priority": (f.get("priority") or {}).get("name"),
                "points": points,
                "labels": f.get("labels", []),
                "parent": (f.get("parent") or {}).get("key"),
                "sprint": sprint,
                "status": (f.get("status") or {}).get("name"),
            }
        )

    return {"key": key, "name": project.get("name", key), "issues": out_issues, "sprints": []}


def main() -> None:
    parser = argparse.ArgumentParser(description="Export all JIRA projects to JSON backup")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help="Output JSON path")
    args = parser.parse_args()

    client = JiraClient()
    me = client.handshake()
    print(f"Handshake OK: {me.get('displayName', '?')}")

    projects = list_projects(client)
    if not projects:
        print("No projects found.", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(projects)} project(s): {', '.join(p['key'] for p in projects)}")

    board_ids: dict[str, int] = {}
    for p in projects:
        board = client.find_board(p["key"])
        if board:
            board_ids[p["key"]] = board["id"]

    story_points_field = client.find_field_id("Story point estimate")
    # Sprint membership is stored in the "Sprint" custom field (list of sprints).
    sprint_field = client.find_field_id("Sprint")
    if not sprint_field:
        print("WARNING: no 'Sprint' field found; sprint assignments will be empty.", file=sys.stderr)

    backup = {
        "schemaVersion": 1,
        "exportedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "projects": [],
    }
    for p in projects:
        print(f"Exporting {p['key']}...")
        backup["projects"].append(export_project(client, p, board_ids, story_points_field, sprint_field))

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(backup, indent=2, ensure_ascii=False), encoding="utf-8")

    counts = {
        it: sum(1 for p in backup["projects"] for i in p["issues"] if i["issueType"] == it)
        for it in ISSUE_TYPES
    }
    print(f"\nBackup written to {out_path}")
    print("Counts by type: " + ", ".join(f"{k}={v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
