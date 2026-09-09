"""Restore JIRA projects from a backup JSON (export_project.py output).

Recreates projects, epics, stories, tasks, and bugs (with priority, points,
labels, parent epic) and assigns issues to sprints by name. Idempotent: existing
projects/issues are reused by key/summary, never duplicated. Comments and
downloaded attachments from the backup are re-added only to freshly created
issues (reused issues are left untouched). Fails loudly on any non-2xx (per LLM.md).

Usage: python restore_project.py [--in backup/jira_backup.json] [--projects EA,SCRUM]
"""

import argparse
import json
import sys
from pathlib import Path

from jira_client import JiraClient

SCRIPTS_DIR = Path(__file__).resolve().parent
DEFAULT_IN = SCRIPTS_DIR.parent / "backup" / "jira_backup.json"

HIERARCHY = {"Epic": 0, "Story": 1, "Task": 1, "Bug": 1}


def restore_extras(
    client: JiraClient,
    issue_key: str,
    issue: dict,
    attachments_root: Path | None,
) -> None:
    """Re-add captured comments and downloaded attachments to a fresh issue."""
    for c in issue.get("comments") or []:
        body = (c.get("body") or "").strip()
        if not body:
            continue
        note = ""
        if c.get("author") or c.get("created"):
            note = f"\n\n_Originally by {c.get('author')} on {c.get('created')} (restored)._"
        client.post_comment(issue_key, body + note)
        print(f"    + comment restored on {issue_key}")
    for a in issue.get("attachments") or []:
        rel = a.get("path")
        if not rel or not attachments_root:
            if not a.get("downloadError"):
                print(f"    WARNING: attachment '{a.get('filename')}' on {issue_key} has no "
                      f"downloaded file in this backup; skipping.", file=sys.stderr)
            continue
        src = attachments_root / rel
        if not src.is_file():
            print(f"    WARNING: attachment file missing: {src}", file=sys.stderr)
            continue
        client.upload_attachment(issue_key, src, a.get("mimeType"))
        print(f"    + attachment '{a.get('filename')}' restored on {issue_key}")


def ensure_project(client: JiraClient, project: dict) -> str:
    """Create the project if missing; return its key."""
    key = project["key"]
    existing = client.get_project(key)
    if existing:
        print(f"  Project {key} exists — reusing.")
        return key
    payload = {
        "key": key,
        "name": project["name"],
        "projectTypeKey": "software",
        "projectTemplateKey": "com.pyxis.greenhopper.jira:gh-simplified-scrum-classic",
        "leadAccountId": client.request("GET", "/rest/api/3/myself").get("accountId"),
    }
    created = client.request("POST", "/rest/api/3/project", json_body=payload)
    print(f"  Project created: {created.get('key')} ({created.get('name')})")
    return key


def existing_issues(client: JiraClient, project_key: str, issue_type: str) -> dict[str, str]:
    """Return {summary: key} for existing issues of a type in the project."""
    issues = client.search_jql(
        f"project={project_key} AND issuetype={issue_type}", fields="key,summary"
    )
    return {i["fields"]["summary"].strip(): i["key"] for i in issues}


def restore_project(
    client: JiraClient, project: dict, attachments_root: Path | None
) -> None:
    """Restore one project's issues + sprint assignments."""
    key = ensure_project(client, project)
    issues = project.get("issues", [])

    # Group by hierarchy level so epics are created before children.
    by_level: dict[int, list[dict]] = {0: [], 1: []}
    for issue in issues:
        level = HIERARCHY.get(issue["issueType"], 1)
        by_level[level].append(issue)

    # Epic summaries -> keys (import key is the original key, reused).
    epic_keys: dict[str, str] = {}

    # 1. Epics
    existing = existing_issues(client, key, "Epic")
    for issue in by_level[0]:
        summary = issue["summary"].strip()
        if summary in existing:
            epic_keys[issue["key"]] = existing[summary]
            print(f"  Epic reused: {existing[summary]}")
            continue
        created = client.create_issue(
            {
                "project": {"key": key},
                "issuetype": {"name": "Epic"},
                "summary": summary,
                "description": issue.get("description", ""),
                "labels": issue.get("labels", []),
                "priority": {"name": issue.get("priority") or "Medium"},
            }
        )
        epic_keys[issue["key"]] = created.get("key")
        print(f"  Epic created: {created.get('key')}")
        restore_extras(client, created.get("key"), issue, attachments_root)

    # 2. Stories / Tasks / Bugs
    existing_by_type = {
        t: existing_issues(client, key, t) for t in ("Story", "Task", "Bug")
    }
    story_points_field = client.find_field_id("Story point estimate")
    created_children: list[tuple[str, str]] = []  # (key, sprint_name)
    for issue in by_level[1]:
        itype = issue["issueType"]
        summary = issue["summary"].strip()
        if summary in existing_by_type[itype]:
            created_children.append((existing_by_type[itype][summary], issue.get("sprint")))
            print(f"  {itype} reused: {existing_by_type[itype][summary]}")
            continue
        fields: dict = {
            "project": {"key": key},
            "issuetype": {"name": itype},
            "summary": summary,
            "description": issue.get("description", ""),
            "labels": issue.get("labels", []),
            "priority": {"name": issue.get("priority") or "Medium"},
        }
        parent_key = issue.get("parent")
        if parent_key and parent_key in epic_keys:
            fields["parent"] = {"key": epic_keys[parent_key]}
        points = issue.get("points")
        if story_points_field and points:
            fields[story_points_field] = points
        created = client.create_issue(fields)
        created_children.append((created.get("key"), issue.get("sprint")))
        print(f"  {itype} created: {created.get('key')}")
        restore_extras(client, created.get("key"), issue, attachments_root)

    # 3. Sprints: create missing + assign
    board = client.find_board(key)
    if not board:
        print(f"  WARNING: no board for {key}; skipping sprint assignment.")
        return
    sprint_names = sorted(
        {s for _, s in created_children if s},
        key=lambda n: (int(n.split()[-1]) if n.split()[-1].isdigit() else 0),
    )
    for sprint_name in sprint_names:
        sprint = client.find_sprint_by_name(board["id"], sprint_name)
        if sprint is None:
            sprint = client.create_sprint(board["id"], {"name": sprint_name, "state": "future"})
            print(f"  Sprint created: {sprint_name}")
        keys = [k for k, s in created_children if s == sprint_name]
        client.move_issues_to_sprint(sprint["id"], keys)
        print(f"  Assigned {len(keys)} issues to '{sprint_name}'")


def main() -> None:
    parser = argparse.ArgumentParser(description="Restore JIRA from backup JSON")
    parser.add_argument("--in", dest="in_path", default=str(DEFAULT_IN), help="Backup JSON path")
    parser.add_argument(
        "--projects",
        default="",
        help="Comma-separated project keys to restore (default: all in backup)",
    )
    args = parser.parse_args()

    in_path = Path(args.in_path)
    if not in_path.exists():
        print(f"Backup not found: {in_path}", file=sys.stderr)
        sys.exit(1)

    backup = json.loads(in_path.read_text(encoding="utf-8"))
    client = JiraClient()
    me = client.handshake()
    print(f"Handshake OK: {me.get('displayName', '?')}")

    # Attachment bytes are stored next to the backup file under ``attachments/``.
    attachments_root = in_path.parent / "attachments"

    projects = backup.get("projects", [])
    if args.projects:
        wanted = {k.strip().upper() for k in args.projects.split(",") if k.strip()}
        projects = [p for p in projects if p["key"].upper() in wanted]
        missing = wanted - {p["key"].upper() for p in projects}
        if missing:
            print(f"WARNING: project(s) not in backup: {', '.join(sorted(missing))}",
                  file=sys.stderr)

    for project in projects:
        print(f"\nRestoring project {project['key']}...")
        restore_project(client, project, attachments_root)

    total = sum(len(p.get("issues", [])) for p in projects)
    print(f"\nRestore complete. {len(projects)} project(s), {total} issues in backup.")


if __name__ == "__main__":
    main()
