# EnterpriseApp — JIRA Backup & Restore Guide

This folder contains a **complete backup of everything that was present on the shared JIRA
instance** (projects, epics, user stories, tasks, bugs, sprint assignments, comments, and
attachment files), plus the scripts used to create, export, and re-import that data.

You can restore this backup into **any other JIRA instance / account credentials** at any time —
nothing here is tied to the original instance except the (read-only) scripts that talk to it.

---

## 1. What the backup contains

Snapshot taken **2026-09-09** (read-only export — the JIRA instance was **not** modified):

| Backup file | Contents |
|---|---|
| `backup/jira_backup_2026-09-09.json` | Authoritative timestamped backup (all data below) |
| `backup/jira_backup.json` | Same snapshot under the canonical name (used by scripts by default) |
| `backup/attachments/` | Downloaded attachment binaries (`SCRUM/SCRUM-1/VMOloginpage.PNG`) |

| Project | Key | Epics | Stories | Tasks | Bugs | Sprints |
|---|---|---|---|---|---|---|
| Enterprise Application | EA | 4 (`EA-1`…`EA-4`) | 26 (`EA-5`…`EA-30`) | 0 | 10 (`EA-31`…`EA-40`) | EA Sprint 1–4 |
| QA AI Team | SCRUM | 1 (`SCRUM-2`) | 1 (`SCRUM-1`) | 1 (`SCRUM-3`) | 0 | SCRUM Sprint 1 |

**Extras captured in the backup:**
- 1 comment on `EA-31` — “This is production bug” (by SHIVANAND REURE, 2026-09-06).
- 1 attachment on `SCRUM-1` — `VMOloginpage.PNG` (58 KB, stored under `backup/attachments/`).

Every issue record stores its key, type, summary, full description text, priority, story
points, labels, parent epic, sprint name, status, comments, and attachment metadata + path.

---

## 2. Prerequisites

- Python 3.10+ and the `requests` package: `pip install requests`
- JIRA credentials — they are read from environment variables, or from a `.env` file next to
  the scripts (`.env` is gitignored and must never be committed).

---

## 3. Restore everything into a NEW JIRA account (step by step)

### Step 1 — Get credentials for the new instance
- Your new site URL, e.g. `https://your-site.atlassian.net`
- The email you log in with (e.g. `you@gmail.com`)
- An API token created at https://id.atlassian.com/manage-profile/security/api-tokens
  (Create API token → copy the `ATATT3...` value).

### Step 2 — Point the scripts at the new instance
Copy the template and fill in the **new** values:

```
copy .env.example .env
```

Then edit `.env`:

```
JIRA_URL=https://your-site.atlassian.net
JIRA_EMAIL=you@gmail.com
JIRA_API_TOKEN=ATATT3...your-new-token
```

(Alternatively, export `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` as environment variables.)

The account must have **permission to create projects** (Jira admin / project creation).

### Step 3 — Run the restore

Restore **everything** (both projects):

```
python scripts\restore_project.py --in backup\jira_backup_2026-09-09.json
```

Restore **only the Enterprise Application project**:

```
python scripts\restore_project.py --in backup\jira_backup_2026-09-09.json --projects EA
```

### Step 4 — Expected output & verification

The script performs a handshake, then for each project: creates/reuses the project → creates
epics → creates stories/tasks/bugs (priority, points, labels, epic parent) → creates missing
sprints and assigns issues → restores comments and uploads attachments. Finish with:

```
Restore complete. 2 project(s), 43 issues in backup.
```

Open the new JIRA site to verify: projects `EA` and `SCRUM`, epics EA-1..4, stories, the 10
bugs, sprints “EA Sprint 1..4”, the comment on EA-31, and the screenshot attached to SCRUM-1.

---

## 4. What is restored vs. what is not

**Restored:** issue summaries and full descriptions, epic hierarchy (parent links), priority,
story points, labels, sprint name assignments, comment text, attachment files.

**Not preserved (by design of this backup format):**
- **Issue status** — new issues always start as `To Do`; statuses like Done/In Progress are
  recorded in the backup but not re-applied (a fresh project workflow starts everything at To Do).
- **Sprint dates and goals** — sprints are recreated by name and start as `future` sprints.
- **Assignees, watchers, votes, issue links, board layout, workflow schemes.**
- Descriptions are stored as plain text (original rich-text/bullet formatting is flattened);
  comment authorship appears as the restoring user, with the original author + date noted in
  the comment text.

**Re-running is safe:** the restore is idempotent — existing projects/issues are matched by key
and summary and reused (never duplicated). Comments/attachments are only posted to issues that
are freshly created, so a second run adds nothing twice.

---

## 5. Re-exporting a fresh backup (optional)

To take a new snapshot at any later point (e.g. after adding more stories), run:

```
python scripts\export_project.py --out backup\jira_backup_YYYY-MM-DD.json
python scripts\export_project.py          # also refresh the canonical backup/jira_backup.json
```

The export is **read-only** — it only performs GET requests against JIRA. Attachments are
downloaded automatically into `backup/attachments/` (pass `--attachments-dir none` to skip).

---

## 6. Related files

| File | Purpose |
|---|---|
| `scripts/export_project.py` | Pull everything from JIRA → backup JSON + attachment files |
| `scripts/restore_project.py` | Import backup JSON (+ attachments) into a JIRA instance |
| `scripts/create_project.py` / `create_bugs.py` | Original creation scripts (from `import.json` / `bugs.json`) |
| `scripts/jira_client.py` | Shared JIRA Cloud REST client (reads `.env`) |
| `backup/jira_backup_2026-09-09.json` | The full snapshot to import later |

---

## 7. Credential hygiene (optional, when you stop using the old account)

Nothing in this folder deletes anything from JIRA. When you are done with the old shared
instance:
1. Revoke the old API token at https://id.atlassian.com/manage-profile/security/api-tokens.
2. Delete or blank the old values in `.env` (it is gitignored, but keeping a live token on disk
   is unnecessary once unused). The backup files above contain **no** credentials and are safe
   to keep.
