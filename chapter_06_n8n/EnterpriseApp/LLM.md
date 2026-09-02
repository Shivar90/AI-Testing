# 📜 LLM.md — Project Constitution: Enterprise Application (VWO)

## Identity
This project translates the VWO product/API documents into a sprint-based JIRA structure: epics + detailed user stories, created in JIRA Cloud at `shivanandreure90.atlassian.net`.

## Data Schemas

### Story Object (import.json / JIRA create payload)
| Field | Type | Notes |
|-------|------|-------|
| summary | string | "As a <role>, I want <feature> so that <value>" |
| description | string | Context + source doc reference + acceptance criteria |
| priority | High/Medium/Low | Mapped from PRD FR priorities |
| points | int (1,2,3,5,8) | Fibonacci |
| labels | string[] | e.g. `login`, `api`, `prd`, `enterprise-app` |
| epic | string | Epic key/name |
| sprint | int (1–4) | Sprint assignment |

### JIRA REST API Invariants
- Base URL: `https://shivanandreure90.atlassian.net`
- Auth: HTTP Basic (`email:API_TOKEN`) — token NEVER committed; read from env or `.env`
- Endpoints: `/rest/api/3/myself`, `/rest/api/3/project`, `/rest/api/3/issue`, `/rest/api/3/search`
- Issue type names: `Epic`, `Story` (project must have Scrum board for sprints)

## Behavioral Rules
1. **Traceability:** every story links to a source document section (PRD FR# or API spec).
2. **No invented requirements:** all ACs derive from the extracted doc text.
3. **Detailed stories:** each has summary, description, AC bullets, priority, points, labels, sprint.
4. **Dependency order:** auth/login (Sprint 1) before experimentation features (Sprint 2), insights (Sprint 3), enterprise readiness (Sprint 4).
5. **Fail loudly:** if JIRA API returns non-2xx, log the exact error to `progress.md`; do not silently continue.
6. **Secrets hygiene:** `.env` gitignored; only `*.example` committed.

## Golden Rules
- Update docs (task_plan/findings/progress/LLM) whenever the plan changes.
- Verify every API call result before proceeding.
- Import JSON is the source of truth for JIRA creation; keep it in sync with what is created.
