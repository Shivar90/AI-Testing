# 🗺️ Task Plan — Jira → Test Plan Generator

**Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)
**Architecture:** A.N.T. 3-layer (Architecture / Navigation / Tools)
**North Star Objective:** Given a single Jira ID, deterministically produce a structured, professional **Test Plan** document (objective, scope, acceptance criteria, test cases with steps + expected results, risks, environment).

---

## 🧠 How I Think About This Project

- **The one-input-one-output principle.** The whole tool reduces to: `PROJ-123 → (fetch) → (normalize) → (generate) → (render)`. Every design decision in this plan exists to protect that pipeline from becoming unpredictable.
- **Determinism over cleverness.** If the same Jira ID yields two different test plans on two runs, the tool is worthless to a QA team. So the generation path is pure rules: no LLM in the loop by default.
- **Jira is messy.** ADF JSON descriptions, custom fields named per-instance, thin subtask objects, cyclic issue links. I handle messiness in one place (the normalize layer) so nothing downstream ever sees raw API JSON.
- **Fail loudly, never silently.** A missing acceptance criterion must surface as an explicit gap in the plan — not as a fabricated test case and not as an empty section.
- **Discovery before building.** The 5 questions below decide everything (which API version, where ACs live, where output goes). Guessing here would waste the whole build.

## 🏗️ How Exactly We Can Create This Project

1. **Phase 1 (Blueprint):** Answer the 5 Discovery Questions → freeze the Input/Output schemas in `LLM.md` → research GitHub for reusable pieces.
2. **Phase 2 (Link):** Create `.env` from the user's Jira credentials → run a minimal handshake (`GET /rest/api/3/myself`) → only proceed if it returns 200.
3. **Phase 3 (Architect):** Write the three SOPs in `architecture/` (fetch, build, deliver) → then write the atomic Python tools that follow the SOPs exactly → unit-test each with fixture data.
4. **Phase 4 (Stylize):** Render a sample plan from a real issue → show the user → polish the Markdown to professional standard.
5. **Phase 5 (Trigger):** Wire the CLI entry point (`python main.py PROJ-123`) → end-to-end smoke test → document.

---

## ✅ Protocol 0 — Initialization (Mandatory)

- [x] Read `BLAST.md` master prompt
- [x] Create `task_plan.md` (this file) — phases, goals, checklists
- [x] Create `findings.md` — research, discoveries, constraints
- [x] Create `progress.md` — activity log (what was done / errors / results)
- [x] Create `LLM.md` — Project Constitution (data schemas, behavioral rules, architectural invariants)
- [ ] **HALT** — no scripts in `tools/` until:
  - [ ] Discovery Questions answered (Phase 1)
  - [ ] Data Schema approved in `LLM.md`
  - [ ] Blueprint approved in this file

---

## 🟢 Phase 1 — B: Blueprint (Vision & Logic)

### 1.1 Discovery Questions (await answers from user)

| # | Question | Answer | Status |
|---|----------|--------|--------|
| 1 | **North Star:** What is the singular desired outcome of this tool? (e.g., "One Jira ID in → one ready-to-execute test plan out") | — | ⏳ pending |
| 2 | **Integrations:** Which external services? (Jira Cloud, Jira Server/DC, Confluence, Slack, Notion…). Are API keys/tokens ready? | — | ⏳ pending |
| 3 | **Source of Truth:** Where does the primary data live? (Jira issue fields, subtasks, linked issues, epics, comments, acceptance criteria) | — | ⏳ pending |
| 4 | **Delivery Payload:** How and where should the final test plan be delivered? (Markdown file, Confluence page, Notion, email, HTML report…) | — | ⏳ pending |
| 5 | **Behavioral Rules:** How should the system act? (e.g., test case naming convention, priority mapping, "Do Not" invent acceptance criteria, must trace every test case back to a requirement) | — | ⏳ pending |

### 1.2 Data-First Rule

- [ ] Define **Input JSON Schema** (Jira issue fetch config) in `LLM.md`
- [ ] Define **Output JSON Schema** (Test Plan payload) in `LLM.md`
- [ ] Get schema approval from user **before** any coding

### 1.3 Research (GitHub + web)

- [ ] Search GitHub for existing "Jira to test plan" tools / test-case generators
- [ ] Review Jira REST API v3 docs (ADF format) vs v2 (wiki markup)
- [ ] Review acceptance-criteria extraction techniques (description ADF, custom fields)
- [ ] Log all findings in `findings.md`

### Phase 1 Exit Criteria

- [ ] All 5 discovery questions answered
- [ ] Data schema approved
- [ ] Blueprint approved → write SOP in `architecture/`

---

## ⚡ Phase 2 — L: Link (Connectivity)

- [ ] Confirm Jira instance type: Cloud (`*.atlassian.net`) vs Server/DC (`/rest/api/2`)
- [ ] Verify credentials: `.env` with `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_BASE_URL`
- [ ] **Handshake:** minimal script in `tools/` to `GET /rest/api/3/myself` (or `/2/myself`) and confirm 200
- [ ] Fetch a sample issue and validate response shape against the Input schema
- [ ] Record results in `progress.md`; do NOT proceed to full logic if Link is broken

---

## ⚙️ Phase 3 — A: Architect (3-Layer Build)

### Layer 1: Architecture (`architecture/`)

- [ ] Write SOP `jira_fetch.md` — endpoint, query params, auth, pagination, error handling, rate limits
- [ ] Write SOP `test_plan_builder.md` — how raw Jira data becomes a test plan (rules, edge cases, golden rule)
- [ ] Write SOP `delivery.md` — final payload formatting and output destination
- [ ] Golden Rule: if logic changes, update the SOP **before** the code

### Layer 2: Navigation (Decision Making)

- [ ] Define the orchestration flow (route data between SOPs and tools)
- [ ] Flow: `input → fetch_jira_issue → normalize → extract_criteria → generate_test_cases → assemble_plan → deliver`

### Layer 3: Tools (`tools/`) — deterministic Python

- [ ] `tools/fetch_jira_issue.py` — atomic fetch of issue + subtasks + linked issues
- [ ] `tools/normalize_jira.py` — ADF → plain text, field mapping
- [ ] `tools/build_test_plan.py` — deterministic test plan generation (naming, priority mapping, traceability)
- [ ] `tools/render_plan.py` — output to Markdown (and future targets)
- [ ] Unit tests for every tool (edge cases: empty description, missing custom fields, cyclic issue links)
- [ ] Secrets via `.env` only; intermediate files in `.tmp/` only

---

## ✨ Phase 4 — S: Stylize (Refinement & UI)

- [ ] Refine the output Markdown: professional headings, tables, clear sections
- [ ] Optionally render an HTML/PDF report
- [ ] Present sample output to user for feedback
- [ ] Finalize after feedback

---

## 🏁 Phase 5 — T: Trigger (Automation)

- [ ] Decide trigger: CLI invocation `python main.py PROJ-123` / scheduled job / webhook
- [ ] End-to-end smoke test on a real Jira ID
- [ ] Document usage in `architecture/` + README

---

## 📋 Master Checklist (Goals)

- [ ] Fetch any Jira issue by ID (Cloud + Server)
- [ ] Extract summary, type, priority, status, components, labels, description/acceptance criteria
- [ ] Expand to subtasks and linked issues when present
- [ ] Convert Atlassian Document Format (ADF) to readable text
- [ ] Generate test cases: steps + expected results, priority mapped from Jira priority
- [ ] Enforce traceability: every test case links back to requirement/acceptance criterion
- [ ] Assemble professional test plan document (Markdown)
- [ ] Deliver to chosen target (file / Confluence / etc.)
