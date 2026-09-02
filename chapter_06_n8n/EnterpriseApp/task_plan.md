# 🗺️ Task Plan — Enterprise Application (VWO) Sprint-Based JIRA Setup

**Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)
**North Star Objective:** Create the **"Enterprise Application"** project in JIRA (`shivanandreure90.atlassian.net`) with a sprint-based structure — proper epics and detailed user stories derived from the three source documents, ready to execute.

## Source Documents
| # | Document | Type | Location |
|---|----------|------|----------|
| 1 | App VWO Login - API Documention - Requirment | docx | `chapter_06_n8n/Agents/docs/` |
| 2 | Product Requirements Document (PRD) VWO.com | pdf | `chapter_06_n8n/Agents/docs/` |
| 3 | VWO Project Requirement API Testing (HLR) | docx | `chapter_06_n8n/Agents/docs/` |

## Deliverables
- [x] Extract text from all 3 documents → `requirements/`
- [x] Project folder structure (BLAST-style)
- [x] Epic & User Story breakdown (detailed: AC, priority, points, labels, sprint)
- [x] Jira import JSON (`scripts/import.json`)
- [x] Project created in JIRA via REST API (handshake → project → epics → stories → sprints)
- [x] Documentation: `findings.md`, `progress.md`, `LLM.md`

## Epic / Story Breakdown

### EA-1 — Authentication & Access (Sprint 1)
Stories:
1. Login with valid credentials (High, 5)
2. Login with invalid credentials returns error (High, 3)
3. Login response schema validation (High, 5)
4. Session/token handling (proxyToken/playerToken/cookies) (High, 5)
5. Registration/Signup API (High, 5)
6. API test matrix: headers/auth/cookie/token for login & registration (Medium, 3)

### EA-2 — Experimentation & Testing Engine (Sprint 2)
Stories:
7. A/B testing campaign setup (Must/High, 8)
8. Split URL testing (High, 5)
9. Multivariate testing (MVT) (Medium, 8)
10. SmartStats Bayesian engine (Must/High, 8)
11. Visual & code editor (Must/High, 8)
12. Custom goals & metric configuration (High, 5)
13. Audience targeting & segmentation (High, 5)
14. Real-time reporting & dashboards (Must/High, 8)

### EA-3 — Behavioral Insights & Personalization (Sprint 3)
Stories:
15. Heatmaps (click/scroll/focus) (Must/High, 8)
16. Session recordings (Must/High, 8)
17. Funnel analytics & drop-off (High, 5)
18. On-page surveys & feedback (Medium, 3)
19. Personalization engine (segments + real-time content) (High, 8)
20. Integration connectors (Shopify, Salesforce, Segment, Snowflake) (High, 8)

### EA-4 — Enterprise Readiness: Security, Compliance, Integrations & Quality (Sprint 4)
Stories:
21. Performance: 2s editing workflow response (High, 5)
22. Security: 2FA, RBAC, activity logs (Must/High, 8)
23. Data privacy: GDPR/CCPA compliance (Must/High, 8)
24. Reliability: 99.9% uptime SLA (High, 5)
25. Collaboration & workflow management (Kanban) (Medium, 5)
26. Cross-device/cross-browser QA & previews (Medium, 5)

## Sprint Plan (2-week sprints × 4)
| Sprint | Focus | Stories |
|--------|-------|---------|
| Sprint 1 | Auth & Login/Registration APIs (foundation, dependency-first) | 1–6 |
| Sprint 2 | Core Experimentation features (A/B, split, MVT, editor, goals) | 7–14 |
| Sprint 3 | Insights (heatmaps, recordings, funnels) + Personalization + Integrations | 15–20 |
| Sprint 4 | NFRs, security, reporting, collaboration, quality & edge cases | 21–26 |

## Phases
1. **Blueprint** — extract + analyze docs, define epics/stories ✓
2. **Link** — JIRA API handshake (`/rest/api/3/myself`) ✓
3. **Architect** — build import.json + creation script ✓
4. **Stylize** — verify JIRA project, stories readable, sprints assigned ✓
5. **Trigger** — push all stories, document results ✓

## Master Checklist
- [x] All 3 docs extracted to readable text
- [x] import.json contains all epics + detailed stories (AC/priority/points/sprint)
- [x] JIRA handshake 200
- [x] Project "Enterprise Application" created with all issues
- [x] 4 sprints visible/assigned
- [x] progress.md logs full activity trail
