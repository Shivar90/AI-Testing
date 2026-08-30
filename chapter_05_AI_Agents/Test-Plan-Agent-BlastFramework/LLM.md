# 📜 LLM.md — Project Constitution

> **Role:** The Project Constitution. Defines the **data schemas**, **behavioral rules**, and **architectural invariants** that every part of this system must obey. If code and this document disagree, **this document wins** — update the constitution first, then the code. All three layer types (Architecture SOPs, Navigation logic, Tools) must conform to the schemas below.

---

## 🧠 My Thinking on Schemas, Rules & Architecture

### Schemas
- **Schemas are the contract between layers.** I define an explicit **Normalized Jira Model** (§3) because raw Jira API JSON is unstable (field names differ, custom fields are per-instance). Once the fetch layer normalizes to this shape, the generate and render layers never need to know Jira exists.
- **The Output Schema (§4) is the deliverable, so it is the most constrained.** Every test case must trace to a requirement — that invariant is what makes the plan auditable by a QA lead.
- **Enums and defaults, not free text.** `output_format`, priority ranks, and booleans with defaults (`expand_subtasks: true`) keep the input deterministic and validate-able at the boundary.

### Rules
- **Determinism is the top behavioral rule.** Two runs, same data → byte-identical output. That is why the core generation path is rule-based Python, and any LLM assist is an explicit, optional, flagged add-on.
- **No fabrication.** BLAST says "never guess at business logic" — I extend it to test content: missing ACs become documented gaps, never invented test cases.
- **Fail loudly.** A hard error with an actionable message beats a wrong-looking plan every time.

### Architecture
- **A.N.T. 3-layer keeps business logic deterministic.** The Navigation layer never holds logic — it only routes data between SOPs and tools, so the "thinking" stays inspectable and the "doing" stays testable.
- **Tools are atomic and file-based.** Each script does one thing and exchanges canonical JSON via `.tmp/`, which makes every step unit-testable with fixtures and resumable after a failure.
- **SOPs precede code (Golden Rule).** Rules live in `architecture/` markdown; code is only an execution of the SOP. When behavior changes, the SOP changes first — this is what makes the system self-documenting and self-healing.

---

## 1. System Identity

- **Project:** Jira → Test Plan Generator (B.L.A.S.T. Protocol, A.N.T. 3-layer architecture).
- **Mission:** Given one Jira issue ID, deterministically produce a professional, structured Test Plan with traceable test cases.
- **Priority:** Reliability over speed. **Never guess at business logic.** LLMs are probabilistic; business logic must be deterministic.

---

## 2. Input Schema (what the system consumes)

### 2.1 CLI / Trigger Input

```json
{
  "jira_id": "PROJ-123",
  "expand_subtasks": true,
  "include_linked": true,
  "output_format": "markdown",
  "output_path": "output/PROJ-123-test-plan.md"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `jira_id` | string | ✅ | Regex `^[A-Z][A-Z0-9]*-\d+$`; must exist in Jira or abort with clear error |
| `expand_subtasks` | boolean | ❌ default `true` | If true, fetch each subtask's summary + description |
| `include_linked` | boolean | ❌ default `true` | Include linked issues (dedupe; guard against cycles) |
| `output_format` | enum(`markdown`, `html`, `json`) | ❌ default `markdown` | `json` = raw payload for debugging |
| `output_path` | string | ❌ | Where to write the final file |

### 2.2 Configuration (`.env` only, never hardcoded)

```
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=<token>          # Cloud: API token
JIRA_PAT=<token>                # Server/DC: Personal Access Token (alt)
JIRA_API_VERSION=3              # 3 = Cloud/DC9+, 2 = legacy Server
AC_FIELD=customfield_10021      # optional: custom field id for Acceptance Criteria
```

**Invariant:** no credential may appear in code, SOPs, logs, or commit history.

---

## 3. Normalized Jira Model (intermediate shape)

Every tool in the fetch layer outputs this canonical shape — the rest of the system depends only on it, never on raw API JSON:

```json
{
  "key": "PROJ-123",
  "id": "10001",
  "summary": "Add login with SSO",
  "issue_type": "Story",
  "priority": { "name": "High", "rank": 3 },
  "status": "In Progress",
  "components": ["Auth"],
  "labels": ["sso", "p1"],
  "fix_versions": ["1.4.0"],
  "parent": "EPIC-7",
  "description_plain": "…",
  "acceptance_criteria": ["User can log in with Okta", "…"],
  "subtasks": [
    { "key": "PROJ-124", "summary": "…", "status": "Done", "acceptance_criteria": [] }
  ],
  "linked": [
    { "key": "PROJ-125", "direction": "outward", "type": "Blocks", "summary": "…" }
  ],
  "comments": [{ "author": "…", "body_plain": "…", "created": "…" }],
  "custom_fields": { "customfield_10021": "…" },
  "fetched_at": "2026-08-29T09:55:00Z"
}
```

**Rules:**
- `description_plain` is always a string (ADF → plain text or rendered-HTML → stripped).
- `acceptance_criteria` is always an array of strings (split by bullet lines / Given-When-Then blocks). Empty array when none found — never `null`.
- Priority ranks: Highest=1, High=2, Medium=3, Low=4, Lowest=5.

---

## 4. Output Schema (the Test Plan payload)

```json
{
  "title": "Test Plan — PROJ-123: Add login with SSO",
  "meta": {
    "jira_id": "PROJ-123",
    "issue_type": "Story",
    "priority": "High",
    "status": "In Progress",
    "components": ["Auth"],
    "generated_at": "2026-08-29T10:00:00Z",
    "generator_version": "0.1.0",
    "source_url": "https://your-domain.atlassian.net/browse/PROJ-123"
  },
  "objective": "…",
  "scope": { "in_scope": ["…"], "out_of_scope": ["…"] },
  "requirements": [
    { "id": "REQ-1", "source": "Acceptance Criterion 1", "text": "User can log in with Okta" }
  ],
  "test_cases": [
    {
      "id": "TC-1",
      "title": "Verify user can log in with Okta",
      "priority": "High",
      "type": "Functional",
      "requirement_ids": ["REQ-1"],
      "preconditions": ["User account exists", "Okta tenant reachable"],
      "steps": [
        { "step": 1, "action": "Navigate to login page", "expected": "Login page renders" },
        { "step": 2, "action": "Click 'Sign in with SSO'", "expected": "Redirect to Okta" }
      ],
      "data_required": "…",
      "environment": "Staging",
      "status": "Draft"
    }
  ],
  "test_environment": { "browsers": ["Chrome", "Edge"], "devices": ["Desktop"], "platform": "Staging" },
  "risks_and_assumptions": [{ "risk": "…", "mitigation": "…", "severity": "Medium" }],
  "entry_exit_criteria": { "entry": ["…"], "exit": ["…"] },
  "traceability_matrix": { "REQ-1": ["TC-1", "TC-2"] }
}
```

**Invariants:**
- Every test case MUST reference ≥ 1 `requirement_ids` (traceability — the "Do Not" rule).
- `test_cases[].steps` must be ordered from 1..N, non-empty.
- No hallucinated facts: any statement not derivable from Jira data must live in `risks_and_assumptions`, never in `test_cases`.
- `traceability_matrix` must be consistent with `test_cases[].requirement_ids` (build it, don't type it).

---

## 5. Behavioral Rules (how the system acts)

1. **Traceability is mandatory.** Every test case links back to a requirement/AC. Orphan test cases are rejected at render time.
2. **No invention.** Do not fabricate acceptance criteria, steps, or preconditions. If data is missing → emit an explicit gap/assumption, not a guessed value.
3. **Deterministic core.** The same Jira ID + same data → byte-identical test plan (LLM not used in the generation path; any prose helper must be optional and flagged).
4. **Priority mapping:** Jira Highest→P0, High→P1, Medium→P2, Low→P3, Lowest→P4 (configurable in a config table, not scattered in code logic).
5. **Naming convention:** `Verify <verb phrase from AC> (<scope if needed>)`.
6. **Do Not:** invent Jira IDs, invent ACs, log credentials, write outside `.tmp/` for intermediates, modify source of truth.
7. **Error behavior:** hard-fail loudly with actionable message (`Issue PROJ-999 not found (404)`) — no silent fallbacks that produce wrong plans.

---

## 6. Architectural Invariants (A.N.T. 3-Layer)

- **Layer 1 — Architecture (`architecture/`):** Markdown SOPs (fetch, build, deliver). Golden Rule: *if logic changes, update the SOP before the code.*
- **Layer 2 — Navigation:** the reasoning/orchestration layer. Routes data between SOPs and tools; holds no business logic of its own.
- **Layer 3 — Tools (`tools/`):** deterministic, atomic Python scripts. One concern per script. All I/O testable with fixtures.
- **Boundaries:** Tools never talk to each other directly — they exchange canonical JSON via `.tmp/`. Navigation calls tools in order.
- **Secrets:** only `.env`; never in code/SOPs/logs.
- **Temp files:** only `.tmp/` (gitignored).
- **Testing:** every tool ships with unit tests (edge cases: empty description, missing custom fields, cyclic issue links, non-existent issue, rate-limit 429, auth 401).

---

## 7. Schema Approval Gate

- [ ] User approves **Input Schema** (§2) and **Output Schema** (§4)
- [ ] User answers the 5 Discovery Questions (task_plan.md §1.1)
- [ ] Blueprint approved in `task_plan.md`
- [ ] Only then: write `architecture/` SOPs → `tools/` scripts

**Amendments:** every schema/rule change must be recorded below with date + rationale.

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-08-29 | Initial constitution | Protocol 0 initialization |
