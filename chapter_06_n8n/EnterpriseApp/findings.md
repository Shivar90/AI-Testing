# 🔍 Findings — Enterprise Application (VWO) Requirements Analysis

## Document Extraction Results

### 1. App VWO Login - API Documention - Requirment.docx
**Purpose:** Defines the login API for `vwo.com` for both valid and invalid users.

**Key spec:**
- **URL:** `https://app.vwo.com/#/login` (UI) and `https://app.vwo.com/login` (API)
- **Method:** POST
- **Payload:** `{"username", "password", "remember", "recaptcha_response_field"}`
- **Headers:** `Content-Type: application/json`
- **Auth:** NO (unauthenticated endpoint)
- **Response:** Rich JSON validation — `id`, `name`, `email`, `accountId`, `isDemoAccount`, `shouldSeeOnboarding`, `policy.ruleset` (canBrowse/canDesign/canPublish/isAdmin/isOwner), `accounts[]`, `currentAccount` (plan, productsEnabled: testing/deploy/data360, flags), `proxyToken`, `playerToken`, `isActive`, `createdOn`, `lastLogin`, `twoFactorAuthenticationEnabled`, `isSamlEnabled`.

**Implications for stories:** login success path, invalid credentials error path, response schema validation, token/proxyToken handling, account/policy flags verification, 2FA-related fields.

### 2. VWO Project Requirement API Testing ( HLR).docx
**Purpose:** High-level requirement for API testing of VWO. Two API families: **Login API** and **Registration (Signup) API**.

**Login behavior:**
- User enters email + valid password → log into dashboard
- Invalid credentials → error

**Verification dimensions to test (per API):**
- URL, Payload, HTTP Method, Status
- Request body, Response body, Header, Auth, Cookie, Token

**Example curl:** `POST https://app.vwo.com/login` with JSON body, Chrome UA headers, `Content-Type: application/json;charset=UTF-8`.

**Implications for stories:** API test strategy epic — test matrix covering request/response/header/auth/cookie/token for both login and registration.

### 3. Product Requirements Document (PRD) VWO.com.pdf (6 pages)
**Product:** VWO — Visual Website Optimizer — enterprise-grade Digital Experience Optimization (DXO) & Conversion Rate Optimization (CRO) platform. **Prepared by Pramod Dutta, Jan 7, 2026.**

**Business objectives:** improve conversion across funnels (sign-ups, purchases, lead forms); test hypotheses empirically; reduce engineering dependency for experimentation; unified insights across testing/personalization/analytics.

**Stakeholders:** Product Managers, UX/UI Designers, Growth & Marketing, Data Analysts/CRO Specialists, Engineering/DevOps.

**Core features (4.1–4.5):**
- **Experimentation & Testing:** A/B, Split URL, Multivariate; audience targeting; custom goals/metrics; Bayesian SmartStats engine; version previews, cross-device/browser QA, scheduling, reporting.
- **Behavioral Insights:** Heatmaps (click/scroll/focus), session recordings, on-page surveys & feedback, funnel analytics.
- **Personalization:** segment by geography/behavior/demographics; real-time customized content.
- **Program & Workflow Management:** central planning, collaboration, Kanban-style backlogs.
- **Integrations:** Shopify, Salesforce, Segment, Snowflake, WordPress, Drupal, CDPs, analytics, tracking/reporting.

**Functional requirements (FR1–FR9):**
| ID | Feature | Priority |
|----|---------|----------|
| FR1 | A/B, Split & Multivariate Testing | Must |
| FR2 | SmartStats Engine | Must |
| FR3 | Visual & Code Editor | Must |
| FR4 | Heatmaps & Session Recordings | Must |
| FR5 | Audience Targeting | High |
| FR6 | Real-time Reporting & Dashboards | Must |
| FR7 | Personalization Engine | High |
| FR8 | Integration Connectors | High |
| FR9 | Collaboration & Workflow Management | Medium |

**Non-functional requirements:**
- Performance: responds within **2 seconds** for editing workflows
- Security: **2FA, RBAC, activity logs**
- Scalability: high visitor volumes without performance loss
- Data Privacy: **GDPR, CCPA** compliance
- Reliability: **99.9% uptime SLA**

**Success KPIs:** conversion rate % increase, experiments launched/quarter, engineering time reduction, personalized campaign engagement, NPS.

**Risks:** technical complexity (mitigate: SDKs + docs + templates), data accuracy (SmartStats + cross-tool validation), user adoption (guided tours + in-app support).

**Future:** AI-driven test idea suggestions, native mobile SDK, predictive analytics/ROI forecasting.

## Epic / Story Mapping (proposed)
| Epic | Source | Sprint |
|------|--------|--------|
| EA-1 Authentication & Access (Login + Registration APIs) | Login doc + HLR | 1 |
| EA-2 Experimentation & Testing Engine | PRD §4.1, FR1–FR3, FR6 | 2 |
| EA-3 Behavioral Insights & Personalization | PRD §4.2–4.3, FR4–FR5, FR7 | 3 |
| EA-4 Enterprise Readiness: Security, Compliance, Integrations & Quality | PRD §4.5, §7, FR8–FR9 | 4 |

## Constraints / Notes
- JIRA is **Cloud** (`shivanandreure90.atlassian.net`) → API v3, basic auth (email + API token)
- Token comes from env/`.env` (never committed); `.env` will be gitignored
- Sprint creation requires a Scrum board; project template must support Sprints/Epics
- Story points Fibonacci (1,2,3,5,8); priority High/Medium/Low; labels for traceability
