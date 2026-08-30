# 🔎 Findings — Jira → Test Plan Generator

**Purpose:** Research, discoveries, and constraints gathered during the project. Updated continuously.

---

## 🧠 Thinking Notes (why these findings matter)

- **The v3/v2 split is the fork in the road.** Choosing the wrong API generation breaks the entire fetch layer (ADF vs wiki markup, auth style, base path). I default to **Cloud v3** because it is the modern standard, and keep `JIRA_API_VERSION` in `.env` so a Server/DC instance switches cleanly.
- **`renderedFields` is my escape hatch.** Parsing ADF JSON recursively is precise but laborious; asking Jira to render the field to HTML and stripping tags is pragmatic. I document both so the normalize layer can start with the simple path and upgrade to the precise one if output quality demands it.
- **ACs are the payload.** The test plan's value is 90% in the acceptance criteria → test case mapping. So I treat "where do ACs live" as a first-class discovery question rather than an assumption.
- **Curl commands double as the handshake.** Each curl here is not just documentation — it is exactly what I will run (or translate to Python `requests`) in Phase 2 to verify credentials before building any real logic.

---

## 1. Core Finding: Jira REST API

Jira exposes two REST API generations — this is the single most important constraint:

| Aspect | Jira Cloud | Jira Server / Data Center |
|--------|-----------|---------------------------|
| Base URL | `https://<your-domain>.atlassian.net` | `https://<host>:<port>/jira` or `<host>` |
| API root | `/rest/api/3` | `/rest/api/2` (v3 also on DC 9+) |
| Description format | **ADF** (Atlassian Document Format — nested JSON) | Wiki markup (older) / ADF |
| Auth | Basic (email + API token) or OAuth2 | Basic (user + password/pat) or PAT/Bearer |
| Rate limit | 100 req / 30s (default) | instance-dependent |

**Decision:** default to **Cloud v3 (`/rest/api/3`)** with a fallback flag for Server/DC v2.

### 1.1 Fetch a single issue (primary call)

```
GET /rest/api/3/issue/{issueIdOrKey}
```

This returns a JSON object with `id`, `key`, `fields.summary`, `fields.description` (ADF), `fields.issuetype`, `fields.priority`, `fields.status`, `fields.components`, `fields.labels`, `fields.fixVersions`, `fields.parent`, `fields.subtasks`, `fields.issuelinks`, `fields.created`, `fields.updated`, etc.

**Curl (Cloud, basic auth):**

```bash
curl -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Accept: application/json" \
  "https://your-domain.atlassian.net/rest/api/3/issue/PROJ-123?fields=summary,description,issuetype,priority,status,components,labels,fixVersions,parent,subtasks,issuelinks,comments,created,updated&expand=renderedFields"
```

- `fields=` restricts payload size (nice-to-have; API returns all fields by default).
- `expand=renderedFields` returns **rendered HTML** of description — a pragmatic alternative to parsing ADF by hand.
- Use the `email:apiToken` combination; a **Jira API Token** is generated at https://id.atlassian.com/manage-profile/security/api-tokens (never commit it).

**Curl with Bearer (PAT on Server/DC):**

```bash
curl -H "Authorization: Bearer $JIRA_PAT" \
  -H "Accept: application/json" \
  "https://jira.example.com/rest/api/2/issue/PROJ-123"
```

### 1.2 Fetch subtasks / linked issues (for scope expansion)

Subtask keys arrive inside `fields.subtasks[].key` but are **thin objects** — you must fetch each one (or use a JQL search) to get their descriptions.

```bash
curl -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Accept: application/json" \
  "https://your-domain.atlassian.net/rest/api/3/search?jql=key%20in%20(PROJ-123,PROJ-124,PROJ-125)&fields=summary,description,status,priority"
```

**Linked issues** come from `fields.issuelinks[].outwardIssue.key` / `.inwardIssue.key` — same fetch pattern. Watch for **cyclic links** (A ↔ B) — must dedupe visited keys.

### 1.3 Search / JQL (future: "all stories in epic EPIC-1")

```
GET /rest/api/3/search?jql=...&maxResults=50&fields=...
```

**Curl:**

```bash
curl -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -G \
  --data-urlencode 'jql=project = PROJ AND issuetype = Story' \
  --data-urlencode 'fields=summary,description,status' \
  --data-urlencode 'maxResults=50' \
  "https://your-domain.atlassian.net/rest/api/3/search"
```

### 1.4 Auth methods compared

| Method | Where | Token source |
|--------|-------|--------------|
| Basic: `email:api_token` | Cloud | https://id.atlassian.com/manage-profile/security/api-tokens |
| Bearer (PAT) | Server/DC | Jira admin → Personal Access Tokens |
| OAuth 2.0 (3LO) | Cloud app | App credentials + authorization flow |
| OAuth 1.0a | Server/DC (legacy) | Consumer key + RSA keypair |

**Recommendation:** Cloud → Basic with API token. Keep `JIRA_EMAIL` and `JIRA_API_TOKEN` in `.env` only.

---

## 2. Finding: Acceptance Criteria — the heart of the test plan

- In many projects ACs live in the **description** (as bullet lists, "Given/When/Then", or "AC1/AC2" lines).
- Description comes back as **ADF JSON** in v3. Two extraction paths:
  1. Parse ADF nodes (`paragraph`, `bulletList`, `orderedList`, `codeBlock`, `table`) recursively → plain text. ADF: `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}`
  2. Use `expand=renderedFields` and strip HTML tags (faster to build, less precise).
- **Discovery question:** confirm with the user whether ACs are in the description, a dedicated **custom field** (e.g., `customfield_10021` "Acceptance Criteria"), or a checklist from a marketplace app (e.g., Xray, Zephyr — which store data in their own custom fields / separate issue types).

**Generic approach:** fetch all custom fields (`fields` key starts with `customfield_`), scan for likely candidates by name/label if the API allows, and let a small deterministic map (in `.env` or a config JSON) pin the field id: `AC_FIELD = customfield_10021`.

---

## 3. Finding: ADF vs Wiki Markup

- **v3 Cloud:** description is ADF JSON.
- **v2 Server:** description may be wiki markup (`h2. Title`, `*bold*`, `{panel}`) on older instances.
- **Mitigation:** normalize layer must support both. Heuristic: if `fields.description` is a dict with `"type": "doc"` → ADF; if a string → wiki markup (or rendered HTML when `expand=renderedFields` is used).

---

## 4. Finding: Test-plan-specific Jira apps (possible integration targets)

- **Xray:** test issues, `Xray Test Execution`, own REST endpoints (`/rest/raven/1.0/...`).
- **Zephyr Scale / Squad:** test management with own schemas and endpoints.
- **Structure / Advanced Roadmaps:** hierarchy data via apps.
- If the user's team uses one of these, the "fetch" SOP must extend to their endpoints. (Discovery question 3.)

---

## 5. Constraints & Assumptions (recorded)

- [x] No credentials available yet → Phase 2 (Link) blocked until `.env` exists.
- [x] Network egress to `*.atlassian.net` assumed available (unverified).
- [x] No existing Python code in `tools/` (folder is empty — confirmed).
- [x] Deterministic business logic; LLM only assists with prose (test step wording) if at all — per BLAST Golden Rule.
- [ ] Whether output must be Confluence page / Notion / Markdown — **pending discovery answer**.
- [ ] Whether traceability to Jira (test-case ↔ AC) is mandatory — **pending discovery answer**.

---

## 6. Research log (GitHub / web)

| Date | Source | Finding |
|------|--------|---------|
| 2026-08-29 | Atlassian docs (atlassian.com/software/jira/guides) | v3 REST returns ADF; v2 returns wiki markup; `renderedFields` expand available |
| 2026-08-29 | Developer docs (developer.atlassian.com/cloud/jira/platform/rest/v3) | Issue endpoint schema, search/JQL endpoint, rate limits |
| ⏳ | GitHub search: "jira test plan generator" | Pending |
| ⏳ | GitHub search: "adf parser python" | Pending — candidates: `atlassian-python-api` library, custom ADF walker |

**Library candidates:** `atlassian-python-api` (wraps REST v2/v3 with auth helpers) — verify before adopting; a hand-rolled `requests`-based fetch keeps the tool layer deterministic and dependency-light (BLAST prefers atomic, testable scripts).

---

## 7. Immediate next actions

1. Get discovery answers (task_plan Phase 1.1).
2. Confirm instance type + get credentials into `.env`.
3. Run handshake (Phase 2) — `GET /rest/api/3/myself`.
4. Pull one real issue; validate against Input schema in `LLM.md`.
