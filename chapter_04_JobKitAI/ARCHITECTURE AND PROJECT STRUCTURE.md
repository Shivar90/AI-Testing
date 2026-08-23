# ARCHITECTURE AND PROJECT STRUCTURE

## 1. ARCHITECT-LEVEL RESPONSIBILITY

The AI agent must act as a **Senior/Principal Full-Stack Application Architect** when designing the Job Tracker application.

Before implementation, the agent must determine an appropriate web application architecture based on:

* Explicit requirements
* Expected application complexity
* Local/localhost execution requirement
* Maintainability
* Testability
* Separation of concerns
* Scalability of the codebase
* Developer experience
* Clear ownership of application modules

The selected architecture must be justified by the requirements.

Do NOT select a framework merely because it is popular.

Do NOT introduce unnecessary architectural complexity.

---

# 2. WEB APPLICATION FRAMEWORK

The agent must select a **modern, maintainable web application framework/stack** suitable for the Job Tracker.

The framework decision must consider:

```text
- Frontend architecture
- Backend requirements
- Local execution
- Data persistence requirements
- API requirements, if explicitly required
- Testability
- Maintainability
- Project complexity
- Long-term extensibility
```

Before implementation, provide:

```text id="g4oml7"
## Framework Decision

Selected Stack:
<framework / technology>

Reason:
<technical justification>

Why it satisfies the approved requirements:
<explanation>

Alternatives considered:
<only if necessary>

Requirement impact:
<confirm that the framework does not introduce unsupported product functionality>
```

The framework is an **implementation decision**, not a product requirement.

---

# 3. ARCHITECTURE PRINCIPLES

Use a clean and maintainable architecture with clear separation between:

```text id="w0j8x5"
Presentation / UI
        ↓
Application / Business Logic
        ↓
Data Access / Persistence
        ↓
Storage
```

The exact layers must be determined by the selected technology and actual requirements.

Do not create layers that provide no practical value.

The architecture should support:

* Maintainability
* Testability
* Reusability
* Clear separation of concerns
* Easy debugging
* Future extension without unnecessary coupling

---

# 4. MANDATORY PROJECT STRUCTURE DESIGN

Before writing application code, create and document the proposed folder structure.

The structure must clearly separate:

```text id="3p5v4d"
Application code
Configuration
Reusable components
Business logic
Data models
Data access
Pages/routes
Assets
Tests
Test data
Documentation
Runtime data
Logs
Reports
```

The exact names depend on the selected framework.

Do not create unnecessary folders simply to make the architecture appear more complex.

---

# 5. JOB APPLICATION DOMAIN MODULE

The Job Tracker must have a clearly isolated **Job Application domain/module**.

All code directly related to managing a job application should be organized under a dedicated domain/module rather than being scattered throughout unrelated folders.

For example:

```text id="h6e2ql"
src/
│
├── job-applications/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── models/
│   ├── validators/
│   ├── types/
│   └── utils/
```

The exact structure must follow the selected framework.

The purpose is to maintain clear ownership of Job Application functionality.

---

# 6. PER-JOB-APPLICATION DATA ORGANIZATION

If the application requirements specify that each individual job application must have its own collection of files/artifacts, implement a dedicated runtime data structure for each job application.

For example:

```text id="y8s7x4"
data/
└── job-applications/
    ├── <job-application-id-1>/
    │   ├── application-data
    │   ├── attachments
    │   ├── notes
    │   └── related-files
    │
    ├── <job-application-id-2>/
    │   ├── application-data
    │   ├── attachments
    │   ├── notes
    │   └── related-files
```

IMPORTANT:

The actual contents of each job-application folder must be derived from the approved requirements.

Do NOT automatically create:

```text id="v5bqrf"
resume/
cover-letter/
interview/
emails/
notes/
offer/
rejection/
```

unless these artifacts are explicitly supported by the requirements.

---

# 7. SOURCE CODE VS RUNTIME DATA

Do not confuse source-code organization with job-application data organization.

### Source code

Contains application implementation:

```text id="p8z3l4"
src/
├── components/
├── job-applications/
├── services/
├── models/
└── ...
```

### Runtime/application data

Contains actual job application records and associated artifacts:

```text id="q2m6w1"
data/
└── job-applications/
    ├── <application-id>/
    ├── <application-id>/
    └── <application-id>/
```

Individual job applications must NOT become source-code folders.

For example, do NOT create:

```text id="8v3tq0"
src/
└── Google-SWE/
    ├── job.py
    └── application.py
```

unless explicitly required.

Job applications are **data/domain entities**, not software modules.

---

# 8. UNIQUE JOB APPLICATION IDENTIFIER

If the requirements require persistent identification of individual job applications, use a stable unique identifier.

The identifier must be generated according to the approved requirements or an explicit implementation decision.

Do NOT derive identifiers from assumptions such as:

```text id="f2xw0z"
company-name + job-title + date
```

unless explicitly specified.

If the identifier strategy is not defined and materially affects the data model:

```text id="s0zqbc"
Insufficient information to determine.
```

---

# 9. DOMAIN OWNERSHIP

All Job Application functionality must have a clearly identifiable owner within the architecture.

For example:

```text id="q9t4x2"
Job Application
│
├── Domain Model
├── UI Components
├── Business Logic
├── Data Access
├── Validation
├── Types
└── Tests
```

Avoid scattering the same business functionality across unrelated modules.

---

# 10. SHARED VS JOB-SPECIFIC CODE

The agent must distinguish between:

### Shared application functionality

Reusable across the application:

```text id="q0o7j3"
components/
utils/
config/
common/
```

### Job Application functionality

Specific to the Job Application domain:

```text id="0e7b7z"
job-applications/
```

### Individual Job Application Data

Runtime records/artifacts:

```text id="4n9y0r"
data/job-applications/<application-id>/
```

Do not duplicate shared code inside individual job-application directories.

---

# 11. RECOMMENDED HIGH-LEVEL STRUCTURE

The exact framework-specific structure must be determined after analyzing the requirements.

The following is an architectural example, NOT a mandatory framework:

```text id="9g8l2k"
job-tracker/
│
├── README.md
├── Requirements.md
├── Jobtrackersnap.png
├── Job Application Board .pdf
├── ANTI-HALLUCINATION.rules.md
│
├── src/
│   ├── app/
│   │
│   ├── job-applications/
│   │   ├── components/
│   │   ├── models/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── components/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── config/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── data/
│   └── job-applications/
│       ├── <application-id>/
│       └── <application-id>/
│
├── assets/
│
├── docs/
│
└── reports/
```

This is an **architectural reference only**.

The AI MUST NOT blindly copy this structure.

It must adapt the structure to the selected framework and actual requirements.

---

# 12. ARCHITECTURE DECISION RECORD

Before implementation, document major architectural decisions.

For example:

```text id="4r2y1e"
# Architecture Decision

## Requirement
<requirement>

## Decision
<technical decision>

## Reason
<reason>

## Alternatives
<alternatives if relevant>

## Product Impact
None.

## Requirement Traceability
<source>
```

Architecture decisions must not introduce new product behavior.

---

# 13. FOLDER CREATION RULE

Do not create folders merely because they are common in enterprise applications.

Every major folder must have a purpose.

Before creating a major folder, ask:

```text id="yr4wkl"
What responsibility does this folder own?
Why is it required?
Which application concern does it contain?
```

Avoid meaningless structures such as:

```text id="9o1v0z"
helpers/
misc/
common2/
temp/
stuff/
```

unless there is a clearly defined purpose.

---

# 14. ARCHITECTURE VALIDATION

Before implementation is declared complete, verify:

```text id="v6j7p0"
[ ] Framework is appropriate for the application.
[ ] Framework choice does not introduce unsupported product functionality.
[ ] Application layers have clear responsibilities.
[ ] Job Application domain is clearly isolated.
[ ] Shared code is separated from domain-specific code.
[ ] Runtime job data is separated from source code.
[ ] Individual job applications have isolated data/artifact locations when required.
[ ] No unnecessary architectural layers were introduced.
[ ] No unnecessary dependencies were introduced.
[ ] Folder structure is maintainable.
[ ] Tests are separated appropriately.
[ ] Configuration is separated from application logic.
[ ] Documentation is separated from implementation.
```

---

# 15. ARCHITECT-LEVEL FINAL RULE

The AI must design the application as a **real maintainable web application**, not as a single prototype file or collection of unrelated scripts.

However:

> **Enterprise-grade architecture does NOT mean unnecessary complexity.**

The target is:

```text id="p6w2q8"
Professional
        +
Maintainable
        +
Testable
        +
Modular
        +
Requirement-driven
        +
Minimal unnecessary complexity
```

The architecture must serve the approved requirements.

The requirements must never be changed merely to justify the architecture.

# END OF ARCHITECTURE AND PROJECT STRUCTURE RULES
