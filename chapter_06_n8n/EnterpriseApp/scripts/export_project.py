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


def comments_of(fields: dict) -> list[dict]:
    """Extract comments (author, created, plain-text body) from issue fields."""
    out: list[dict] = []
    comment_field = fields.get("comment") or {}
    for c in comment_field.get("comments", []) or []:
        out.append(
            {
                "author": (c.get("author") or {}).get("displayName"),
                "created": c.get("created"),
                "body": JiraClient._adf_to_text(c.get("body")),
            }
        )
    return out


def attachments_of(
    fields: dict,
    client: JiraClient,
    attachments_root: Path | None,
    project_key: str,
    issue_key: str,
) -> list[dict]:
    """Record attachment metadata and, when attachments_root is set, download the bytes.

    Each entry stores a relative ``path`` (posix) to the downloaded file under
    attachments_root, so restore_project.py can re-upload it later. Download
    failures are reported but do not abort the whole backup.
    """
    out: list[dict] = []
    for a in fields.get("attachment") or []:
        entry = {
            "filename": a.get("filename"),
            "mimeType": a.get("mimeType"),
            "size": a.get("size"),
        }
        content_url = a.get("content")
        if attachments_root is not None and content_url:
            safe_name = Path(a.get("filename") or "attachment").name
            dest = attachments_root / project_key / issue_key / safe_name
            try:
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(client.get_bytes(content_url))
                entry["path"] = dest.relative_to(attachments_root).as_posix()
            except RuntimeError as exc:
                entry["downloadError"] = str(exc)
                print(f"  WARNING: failed to download attachment "
                      f"{a.get('filename')} on {issue_key}: {exc}", file=sys.stderr)
        out.append(entry)
    return out


def export_project(
    client: JiraClient,
    project: dict,
    story_points_field: str | None,
    sprint_field: str,
    attachments_root: Path | None,
) -> dict:
    """Export one project's issues + sprints as a portable dict."""
    key = project["key"]
    fields = "key,summary,description,issuetype,parent,priority,labels,status,comment,attachment"
    if story_points_field:
        fields += f",{story_points_field}"
    fields += f",{sprint_field}"

    issues = fetch_issues(client, key, fields)

    out_issues = []
    skipped: dict[str, int] = {}
    for issue in issues:
        f = issue.get("fields", {})
        itype = (f.get("issuetype") or {}).get("name", "")
        if itype not in ISSUE_TYPES:
            skipped[itype] = skipped.get(itype, 0) + 1
            print(f"  SKIP {issue['key']}: issue type '{itype}' not in {ISSUE_TYPES}")
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
                "comments": comments_of(f),
                "attachments": attachments_of(
                    f, client, attachments_root, key, issue["key"]
                ),
            }
        )

    return {
        "key": key,
        "name": project.get("name", key),
        "issues": out_issues,
        "sprints": [],
        "skippedIssueTypes": skipped,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Export all JIRA projects to JSON backup")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help="Output JSON path")
    parser.add_argument(
        "--attachments-dir",
        default="",
        help="Download attachment bytes under this folder "
             "(default: '<backup dir>/attachments'); pass 'none' to skip downloads",
    )
    args = parser.parse_args()

    client = JiraClient()
    me = client.handshake()
    print(f"Handshake OK: {me.get('displayName', '?')}")

    projects = list_projects(client)
    if not projects:
        print("No projects found.", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(projects)} project(s): {', '.join(p['key'] for p in projects)}")

    story_points_field = client.find_field_id("Story point estimate")
    # Sprint membership is stored in the "Sprint" custom field (list of sprints).
    sprint_field = client.find_field_id("Sprint")
    if not sprint_field:
        print("WARNING: no 'Sprint' field found; sprint assignments will be empty.", file=sys.stderr)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if args.attachments_dir.lower() == "none":
        attachments_root: Path | None = None
    elif args.attachments_dir:
        attachments_root = Path(args.attachments_dir)
    else:
        attachments_root = out_path.parent / "attachments"

    backup = {
        "schemaVersion": 1,
        "exportedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "projects": [],
    }
    for p in projects:
        print(f"Exporting {p['key']}...")
        backup["projects"].append(
            export_project(client, p, story_points_field, sprint_field, attachments_root)
        )

    out_path.write_text(json.dumps(backup, indent=2, ensure_ascii=False), encoding="utf-8")

    counts = {
        it: sum(1 for p in backup["projects"] for i in p["issues"] if i["issueType"] == it)
        for it in ISSUE_TYPES
    }
    print(f"\nBackup written to {out_path}")
    print("Counts by type: " + ", ".join(f"{k}={v}" for k, v in counts.items()))
    skipped = {
        p["key"]: p["skippedIssueTypes"] for p in backup["projects"] if p["skippedIssueTypes"]
    }
    if skipped:
        print("WARNING: issues skipped (type not exported): "
              + "; ".join(f"{k}: {v}" for k, v in skipped.items()), file=sys.stderr)


if __name__ == "__main__":
    main()
