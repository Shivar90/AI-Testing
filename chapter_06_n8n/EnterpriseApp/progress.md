# 📈 Progress — Enterprise Application (VWO) JIRA Setup

## Activity Log

### Step 1 — Document Extraction ✅
- Extracted `App VWO Login - API Documention - Requirment.docx` → `requirements/app_vwo_login_api.txt` (PowerShell zip + XML strip)
- Extracted `VWO Project Requirement API Testing ( HLR).docx` → `requirements/hlr_vwo_api_testing.txt`
- Extracted `Product Requirements Document (PRD) VWO.com.pdf` → `requirements/prd_vwo.txt` (PyPDF2, UTF-8, 6 pages / 8237 chars)
- All 3 docs readable; no password protection or image-only pages

### Step 2 — Analysis ✅
- Mapped docs → 4 epics, sprint plan (see `findings.md`)

### Step 3 — BLAST Docs ✅
- Created `task_plan.md`, `findings.md`, this file
- (LLM.md written next)

### Step 4 — Import JSON ✅
- [x] Built `scripts/import.json` with project + 4 epics + 26 detailed stories + 4 sprints

### Step 5 — JIRA REST API ✅
- [x] Made script fully idempotent (epics/stories matched by summary; re-run never duplicates)
- [x] Made sprint setup fail loudly (board/sprint errors are no longer swallowed)
- [x] `.env.example` created with placeholders; `.env` verified gitignored (repo root `.gitignore:31`)
- [x] Handshake `GET /rest/api/3/myself` → 200 (SHIVANAND REURE)
- [x] Create/verify project "Enterprise Application" (EA, id 10033)
- [x] Create epics + stories (EA-1..EA-4 epics, EA-5..EA-30 stories = 30 issues)
- [x] Create + assign 4 sprints (ids 35-38; 6/8/6/6 stories assigned)
- [x] Verify via `GET /rest/api/3/search/jql` → 30 issues, all stories parented to epics

**Run result (2026-09-01):** End-to-end SUCCESS. Project reused (was created earlier in this session), all 4 epics + 26 stories reused (no duplicates — idempotency verified), 4 sprints created, stories assigned, verify passed with exactly 30 issues.

### Step 6 — 10 Bug Issues ✅
- [x] `scripts/bugs.json` with 10 bugs (traceable to source docs, priority/severity/sprint/epic)
- [x] `scripts/create_bugs.py` — idempotent by summary, epic parent, sprint assignment
- [x] Created EA-31..EA-40 (10 bugs), parented to epics, assigned to sprints (4/3/2/1)
- [x] Verified: 10 bugs in project EA; re-run reuses all (idempotent)

### Step 7 — Backup / Restore JSON ✅
- [x] `scripts/export_project.py` — exports ALL projects (epics, stories, tasks, bugs) with summary/description/priority/points/labels/parent/sprint/status → `backup/jira_backup.json`
- [x] `scripts/restore_project.py` — recreates projects + issues + sprint assignments from backup; idempotent (reuses by summary, never duplicates)
- [x] `backup/jira_backup.json` written: 2 projects (EA, SCRUM), 43 issues (5 Epic, 27 Story, 1 Task, 10 Bug), 36 sprint assignments
- [x] Restore verified in-place: all 43 reused, no duplicates, sprints re-assigned (EA S1=10, S2=11, S3=8, S4=7; SCRUM S1=1)
- [x] `jira_client.py` gained `_adf_to_text`, `get_issue`, `find_field_id` helpers (ADF → plain text for backup portability)

**Backup location:** `EnterpriseApp/backup/jira_backup.json` — commit this file so data survives even if JIRA expires.

## Errors & Resolutions
- **Console encoding (cp1252)** while printing PDF text → wrote to UTF-8 file instead ✅
- **Plan-mode blocked shell extraction** → extraction deferred to implementation phase (now done) ✅
- **No credentials in shell** → `JIRA_EMAIL`/`JIRA_API_TOKEN`/`JIRA_TOKEN` unset, no `EnterpriseApp/.env`. Script fails loudly with exact missing-var message (by design). Provide creds via env vars or `.env` to complete run. → Resolved: `.env` created from `.env.example`, gitignored. ✅
- **POST /rest/api/3/project → 400** → wrong payload keys (`lead`/`template`); fixed to `projectTypeKey` + `projectTemplateKey` + `leadAccountId` (accountId from /myself) and correct company-managed scrum template `com.pyxis.greenhopper.jira:gh-simplified-scrum-classic`. ✅
- **GET /rest/api/3/search → 403 CloudFront / 410 removed** → search endpoint migrated to `/rest/api/3/search/jql`; JQL now passed as query params (GET with JSON body rejected by CDN). ✅
- **POST /rest/api/3/issue → 400** → JIRA Cloud requires `description` in Atlassian Document Format (ADF); added plain-text → ADF conversion in `create_issue`. ✅
- **POST /rest/agile/1.0/sprint → 400** → `SprintCreateBean` accepts `name/goal/originBoardId/startDate/endDate` only (no `state` at creation, no boardId query param); dates need full ISO-8601 timestamps; added `_iso8601` normalizer. ✅

## Environment
- Python 3.14.6 with PyPDF2 3.0.1
- PowerShell 5.1 (System.IO.Compression available)
- JIRA: Cloud API v3, basic auth
