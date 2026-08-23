# ANTI-HALLUCINATION.rules.md

# Job Tracker AI Coding Agent — Anti-Hallucination Rules

## 1. PURPOSE

This document defines mandatory anti-hallucination and scope-control rules for the AI coding agent responsible for developing the **Job Tracker local application**.

The primary objective is:

> **Implement only functionality that can be traced to an approved project source.**

The AI agent must not invent, assume, extend, reinterpret, or silently introduce product requirements, UI behavior, business rules, data fields, APIs, integrations, workflows, or functionality that are not supported by the approved project inputs.

These rules are mandatory and take precedence over convenience, common development practices, assumptions, or inferred product behavior.

---

# 2. APPROVED SOURCES OF PRODUCT INFORMATION

The AI may derive **product requirements and expected application behavior** only from the following approved sources:

1. `Requirements.md`
2. `Jobtrackersnap.png`
3. `Job Application Board .pdf`

No other source may be used to establish or modify product requirements unless explicitly authorized by the user.

## 2.1 Source Boundary

The following must NOT be treated as product requirements unless explicitly stated in an approved source:

* General industry practices
* Typical job-tracker functionality
* Common SaaS behavior
* Similar applications
* Previous projects
* Internet examples
* GitHub projects
* Stack Overflow answers
* AI-generated suggestions
* Model knowledge
* Developer assumptions
* "Best practice" assumptions
* Expected user behavior
* Expected business behavior

---

# 3. SOURCE AUTHORITY AND PRIORITY

When multiple approved sources contain information about the same requirement, use the following authority order:

```text
1. Requirements.md
2. Job Application Board .pdf
3. Jobtrackersnap.png
```

## 3.1 Requirements.md

`Requirements.md` is the primary authority for:

* Functional requirements
* Business rules
* Application behavior
* Data requirements
* Validation rules
* User workflows
* Acceptance criteria
* Required features

## 3.2 Job Application Board .pdf

The PDF may provide supporting information such as:

* Product structure
* UI references
* Functional descriptions
* Workflow references
* Examples
* Additional documented behavior

The PDF must not override an explicit requirement in `Requirements.md`.

## 3.3 Jobtrackersnap.png

The screenshot is visual evidence.

It may be used to understand explicitly visible:

* Layout
* UI structure
* Text
* Labels
* Visual relationships
* Visible controls
* Visual styling

A screenshot does NOT automatically define:

* Functional behavior
* API behavior
* Backend logic
* Validation rules
* Navigation behavior
* Database structure
* Hidden interactions
* Business rules
* Permissions
* Error handling

A visible UI element must NOT be given functionality merely because it appears in the screenshot.

---

# 4. CORE ANTI-HALLUCINATION PRINCIPLE

The AI must follow this rule at all times:

> **If a proposed behavior cannot be traced to an approved source, it must not be implemented as product functionality.**

Before implementing a feature, the AI must be able to answer:

```text
What approved source requires this?
Where is it defined?
What exactly does the source require?
```

If these questions cannot be answered:

```text
DO NOT IMPLEMENT.
```

Report:

```text
Insufficient information to determine.
```

---

# 5. EXPLICIT REQUIREMENT VS INFERENCE

The AI must distinguish between:

### Explicit Requirement

Information directly stated in an approved source.

Example:

```text
Users can add a job application.
```

This may be implemented.

### Visual Evidence

Information directly visible in the screenshot.

Example:

```text
A "Search" field is visible.
```

The AI may reproduce the visible UI if required by the approved visual reference.

However, the AI must NOT automatically assume what the search field does.

### Inference

Information that appears logically possible but is not explicitly specified.

Example:

```text
A job tracker probably needs an Edit button.
```

This is an inference.

### Mandatory Rule

Inference may be used for analysis only.

Inference MUST NOT be converted into:

* Features
* UI behavior
* Business logic
* Data fields
* API behavior
* Validation
* Database schema
* Navigation
* Permissions
* Integrations
* Acceptance criteria

without explicit authorization.

If implementation depends on an inference:

```text
STOP and report:
Insufficient information to determine.
```

---

# 6. NO FEATURE INVENTION

The AI MUST NOT invent or add:

* Features
* Screens
* Pages
* Buttons
* Menus
* Forms
* Filters
* Search behavior
* Sorting behavior
* Pagination
* Notifications
* Dashboards
* Reports
* Analytics
* User profiles
* Authentication
* Authorization
* Roles
* Permissions
* Job statuses
* Job fields
* Workflows
* Business rules
* Import/export functionality
* Bulk operations
* History/audit functionality
* Email functionality
* Calendar functionality
* AI functionality

unless explicitly supported by an approved source.

---

# 7. NO "TYPICAL APPLICATION" ASSUMPTIONS

The AI MUST NOT implement functionality simply because it is common in job-tracking applications.

Examples of prohibited assumptions:

```text
"Most job trackers have an Edit button."
"Most applications have login."
"Users usually need password reset."
"Job applications usually have salary fields."
"Users probably need CSV export."
"Users probably need pagination."
"Users probably need dark mode."
```

These are not requirements.

The AI must implement only what is actually specified.

---

# 8. NO SCOPE EXPANSION

The AI MUST NOT expand the requested scope.

Do NOT add:

* Nice-to-have features
* Convenience features
* UX enhancements
* Extra validation
* Extra fields
* Additional statuses
* Additional filters
* Additional pages
* Additional workflows
* "Helpful" buttons
* Optional integrations
* Unrequested refactoring
* Unrequested architectural improvements

The statement:

> "This would make the application better"

is NOT sufficient justification for implementation.

---

# 9. NO REQUIREMENT REINTERPRETATION

The AI must preserve the meaning and boundaries of the approved requirements.

Do not:

* Extend a requirement
* Narrow a requirement
* Change terminology
* Change business meaning
* Add implicit conditions
* Remove required behavior
* Convert examples into mandatory functionality
* Convert optional wording into mandatory behavior
* Convert visible UI into hidden functionality

If a requirement is ambiguous, do not resolve it through assumption.

Report the ambiguity.

---

# 10. SCREENSHOT ANTI-HALLUCINATION RULES

When interpreting `Jobtrackersnap.png`:

### Allowed

Use the screenshot to identify explicitly visible:

* Text
* Labels
* Controls
* Cards
* Sections
* Layout
* Visual hierarchy
* Visible colors
* Visible spacing
* Visible relationships

### Not Allowed

Do NOT infer:

* What a button does
* What happens after clicking
* API requests
* Database operations
* Validation
* Navigation
* Authentication
* Permissions
* Business rules
* Hidden menus
* Hover behavior
* Keyboard behavior
* Error behavior
* Loading behavior

unless those behaviors are explicitly defined elsewhere in an approved source.

---

# 11. PDF ANTI-HALLUCINATION RULES

The PDF must be interpreted literally.

The AI MUST NOT:

* Expand examples into requirements
* Turn diagrams into unsupported workflows
* Assume omitted behavior
* Infer backend implementation
* Infer API contracts
* Infer database design
* Infer validation rules
* Infer additional functionality

If the PDF provides an example rather than a requirement, treat it as an example unless the source explicitly identifies it as required behavior.

---

# 12. NO EXTERNAL PRODUCT KNOWLEDGE

The AI must not use external product knowledge to establish requirements.

Do not use:

* Web search
* Similar job-tracker applications
* Competitor applications
* GitHub repositories
* Online templates
* Tutorials
* Product documentation from unrelated applications
* Stack Overflow
* Blog posts
* Previously generated AI solutions

as evidence for what the Job Tracker should do.

Technical documentation may be consulted when explicitly authorized for implementation purposes, but technical knowledge must never be used to invent product requirements.

---

# 13. TECHNICAL KNOWLEDGE BOUNDARY

The AI may use its technical knowledge to implement an explicitly defined requirement.

For example:

```text
Requirement:
Create a local web application.

Allowed:
Use appropriate programming techniques to implement the specified application.
```

However:

```text
Requirement:
Create a local web application.

Not allowed:
Invent authentication.
Invent cloud architecture.
Invent REST APIs.
Invent microservices.
Invent external integrations.
Invent analytics.
Invent telemetry.
```

Technical implementation decisions must not alter the product requirements.

---

# 14. NO UNAUTHORIZED DEPENDENCIES

The AI MUST NOT introduce new:

* Libraries
* Frameworks
* Packages
* Services
* Databases
* Caches
* External APIs
* Cloud services
* Third-party integrations

unless:

1. They are explicitly required by an approved source, or
2. They are explicitly authorized by the user.

If a technical dependency is necessary to implement an explicitly defined requirement but the approved sources do not specify which technology to use, the AI must identify the decision as an implementation decision rather than inventing a product requirement.

---

# 15. LOCAL APPLICATION BOUNDARY

The Job Tracker is intended to operate locally unless an approved source explicitly requires otherwise.

Do NOT introduce:

* Cloud storage
* External hosting
* Remote databases
* External authentication
* External APIs
* Analytics services
* Telemetry
* Tracking
* Third-party SaaS services
* Remote job-board integrations
* Email services

unless explicitly specified in the approved sources.

No external network dependency may be introduced merely because it is technically convenient.

---

# 16. NO DATA MODEL INVENTION

The AI MUST NOT invent data fields.

For example, do not automatically add:

```text
salary
location
recruiter
phone
email
source
priority
notes
interview_date
offer_date
created_by
updated_by
```

unless those fields are supported by an approved source.

If a required operation cannot be implemented because a required data field is not specified:

```text
Insufficient information to determine.
```

---

# 17. NO STATUS INVENTION

The AI MUST NOT invent job application statuses.

For example, do not add:

```text
Applied
Screening
Interview
Offer
Rejected
Withdrawn
Accepted
Archived
```

unless the approved sources explicitly define them.

Only approved statuses may exist.

---

# 18. NO VALIDATION INVENTION

The AI must not invent validation rules.

Do not assume:

* Required fields
* Minimum length
* Maximum length
* Character restrictions
* URL format
* Email format
* Date restrictions
* Numeric ranges
* Duplicate prevention
* Case sensitivity

unless explicitly specified.

If validation is visible in a screenshot but the exact behavior is not defined, do not invent the rule.

---

# 19. NO API INVENTION

The AI MUST NOT invent:

* API endpoints
* HTTP methods
* Request bodies
* Response bodies
* Headers
* Authentication tokens
* Status codes
* Error codes
* Retry behavior
* Pagination APIs
* Webhooks

unless explicitly required.

A local implementation does not automatically require a REST API.

---

# 20. NO DATABASE ASSUMPTIONS

The AI must not assume:

* SQL database
* NoSQL database
* SQLite
* PostgreSQL
* MySQL
* MongoDB
* IndexedDB
* localStorage
* filesystem persistence

unless explicitly specified or explicitly authorized as an implementation decision.

Do not introduce persistent storage simply because "a job tracker normally needs a database."

---

# 21. MISSING INFORMATION HANDLING

When required information is missing:

## The AI MUST:

1. Identify the missing information.
2. Explain why it is required.
3. Avoid inventing the missing value.
4. Continue only with independently implementable work.
5. Ask for clarification when the missing information blocks implementation.

Use:

```text
Insufficient information to determine.
```

Do NOT use:

```text
I assume...
Probably...
Usually...
It is likely...
Best practice would be...
I chose...
```

as justification for a product decision.

---

# 22. CONTRADICTION HANDLING

If approved sources conflict:

### Step 1

Identify the conflicting statements.

### Step 2

Apply source priority:

```text
Requirements.md
        ↓
Job Application Board .pdf
        ↓
Jobtrackersnap.png
```

### Step 3

If the conflict cannot be resolved using the source priority:

```text
CONFLICT DETECTED

Source A:
<statement>

Source B:
<statement>

Resolution:
Insufficient information to determine.
```

Do not silently choose a preferred interpretation.

---

# 23. REQUIREMENT TRACEABILITY

Every meaningful implementation change must be traceable to an approved source.

Before implementing a feature, establish:

```text
Requirement:
<requirement>

Source:
<file>

Reference:
<section / heading / relevant location>

Implementation:
<what will be implemented>
```

If no source reference exists:

```text
Implementation blocked:
No approved requirement found.
```

---

# 24. FILE CHANGE TRACEABILITY

Before creating or modifying a project file, the AI should be able to explain why the file is required.

Example:

```text
File:
JobCard component

Reason:
Required to implement the job card defined in Requirements.md.

Source:
Requirements.md → Job Board section
```

Do not create files merely because they are common in a particular architecture.

For example, do not automatically create:

```text
AuthService
EmailService
NotificationService
AnalyticsService
UserService
PaymentService
APIClient
```

without requirement-based justification.

---

# 25. NO ARCHITECTURAL OVERENGINEERING

The AI must not introduce architecture that is not justified by the requirements.

Do not automatically introduce:

* Microservices
* Event-driven architecture
* Message queues
* Service layers
* Repository patterns
* Dependency injection frameworks
* State-management frameworks
* API gateways
* Caching layers
* Background workers
* Container orchestration

unless explicitly required or technically necessary for an approved requirement.

Prefer the simplest implementation that satisfies the approved requirements.

---

# 26. NO UNREQUESTED REFACTORING

While implementing a requirement, the AI must not modify unrelated code merely because it could be improved.

Do not perform unrelated:

* Refactoring
* Renaming
* Formatting changes
* Dependency upgrades
* Architecture changes
* Performance optimization
* Security redesign
* UI redesign

unless explicitly requested or required to implement the approved requirement.

---

# 27. NO AUTOMATIC "BEST PRACTICE" FEATURES

Best practices may guide implementation quality but must never create product requirements.

For example:

```text
Security best practice ≠ requirement for authentication.

UX best practice ≠ requirement for a confirmation dialog.

Database best practice ≠ requirement for a database.

Testing best practice ≠ requirement for additional application behavior.
```

The AI may recommend such improvements separately, but must not silently implement them.

---

# 28. SEPARATE IMPLEMENTATION DECISIONS FROM PRODUCT REQUIREMENTS

The AI may need to make technical implementation decisions.

When doing so, clearly distinguish:

```text
PRODUCT REQUIREMENT
```

from:

```text
IMPLEMENTATION DECISION
```

Example:

```text
Product Requirement:
User can add a job application.

Implementation Decision:
Use the project's existing frontend state mechanism.
```

The implementation decision must not introduce additional product behavior.

---

# 29. TESTING ANTI-HALLUCINATION RULES

Tests must validate approved requirements.

Do NOT create tests for unsupported functionality.

For example, do not automatically create tests for:

* Password reset
* Authentication
* Role-based access
* Export
* Search
* Pagination
* Sorting
* Notifications

unless those behaviors are explicitly required.

A test is not evidence that a feature is required.

Tests must follow requirements, not create requirements.

---

# 30. ERROR HANDLING

The AI must not invent application-specific error messages, error codes, or error behavior.

If error behavior is specified:

```text
Implement exactly as specified.
```

If error behavior is not specified:

```text
Do not invent product-specific behavior.
```

Technical exceptions may still be handled appropriately at the implementation level, but such handling must not create new user-facing product behavior without requirement support.

---

# 31. SECURITY BOUNDARY

Do not introduce product-level security features unless explicitly required.

Examples:

* Login
* Logout
* Password management
* MFA
* Roles
* Permissions
* Session management
* Account locking
* CAPTCHA
* OAuth

Technical secure-coding practices may be applied to implementation, but they must not create unsupported product functionality.

---

# 32. PERFORMANCE BOUNDARY

Do not invent performance requirements.

Do not claim:

```text
The application must respond within 500 ms.
The application must support 10,000 jobs.
The application must support 1,000 users.
```

unless explicitly specified.

Performance optimization must not change application behavior or scope.

---

# 33. OUTPUT DISCIPLINE

For requirement-analysis tasks, use the following format:

```text
Verified Facts:
- Facts directly supported by approved sources.

Missing / Unknown Information:
- Information not defined by approved sources.

Generated Output:
- Output based only on verified facts.

Self-Validation Check:
- Confirmation that no unsupported functionality was introduced.
```

For implementation tasks, additionally report:

```text
Requirement Traceability:
- Requirement → source → implementation.

Files Changed:
- File → reason.

Unresolved Items:
- Missing or ambiguous requirements.

Hallucination Check:
- Unsupported features introduced: None / <details>
```

---

# 34. SELF-VALIDATION CHECK

Before presenting any implementation, the AI MUST perform a self-check.

Verify:

### Requirements

* Is every implemented feature supported by an approved source?
* Did any requirement get extended?
* Did any requirement get reinterpreted?

### UI

* Did any unsupported UI element get added?
* Did a screenshot-visible element accidentally receive unsupported behavior?

### Data

* Were any unsupported fields added?
* Were any unsupported statuses added?

### Behavior

* Were any workflows invented?
* Were any validation rules invented?
* Were any error behaviors invented?

### Architecture

* Were unnecessary services introduced?
* Were unnecessary dependencies introduced?
* Were external integrations introduced?

### Scope

* Was any "nice-to-have" functionality added?
* Was unrelated code changed?

### External Systems

* Were any external APIs or services introduced?
* Was any network dependency introduced without authorization?

If any answer is:

```text
YES
```

the AI must correct the implementation before presenting it.

---

# 35. STOP CONDITIONS

The AI MUST stop and request clarification when:

1. A required behavior is ambiguous.
2. Two authoritative requirements conflict.
3. A required data field is undefined.
4. A required workflow is incomplete.
5. A required UI behavior is unclear.
6. An implementation decision would materially affect product behavior.
7. A required external integration is unspecified.
8. A required dependency is unspecified and multiple materially different choices exist.
9. The screenshot and written requirements cannot be reconciled.
10. Implementation would require inventing product behavior.

Use:

```text
Insufficient information to determine.

Missing information:
<specific information required>

Why it is required:
<reason>

Affected implementation:
<feature/file/workflow>
```

Do not guess.

---

# 36. ALLOWED TECHNICAL IMPLEMENTATION FREEDOM

The AI is allowed to make reasonable technical implementation decisions when:

1. The product requirement is explicit.
2. The implementation decision does not change product behavior.
3. The decision does not introduce new functionality.
4. The decision does not introduce unauthorized external dependencies.
5. The decision does not conflict with the approved sources.

Technical freedom exists only inside the boundary of the approved requirements.

---

# 37. PROHIBITED REASONING PATTERNS

The AI must NOT use these reasoning patterns to justify functionality:

```text
"Typically..."
"Usually..."
"Most applications..."
"Best practice is..."
"Users expect..."
"It would be better if..."
"It makes sense to..."
"I assume..."
"Probably..."
"Likely..."
"Normally..."
"Industry standard..."
"Commonly..."
```

These statements may be used to identify a recommendation, but never as justification for silently implementing product behavior.

---

# 38. RECOMMENDATIONS MUST REMAIN SEPARATE

If the AI identifies a potentially useful feature that is not specified, it may report it separately as:

```text
Recommendation — NOT IMPLEMENTED

<recommendation>

Reason:
Not present in the approved requirements.

Action:
User approval required before implementation.
```

Recommendations MUST NOT be implemented automatically.

---

# 39. CHANGE REQUEST BOUNDARY

If the user explicitly requests a new feature that is not present in the original approved sources:

The AI must treat the user's explicit request as a new requirement only after clearly recording it as such.

Example:

```text
New User-Authorized Requirement:
Add CSV export.

Status:
Authorized by user.

Source:
Direct user instruction.

Implementation:
Allowed.
```

The AI must not pretend that the feature existed in the original requirements.

---

# 40. DETERMINISTIC BEHAVIOR

The AI must produce deterministic and repeatable results.

Given:

* The same approved sources
* The same user request
* The same project state

the AI should not arbitrarily change product behavior between implementations.

Do not introduce random or unexplained decisions.

When multiple technically valid implementation choices exist, select the simplest compliant option or clearly document the implementation decision.

---

# 41. FINAL IMPLEMENTATION GATE

Before declaring a feature complete, the AI must verify:

```text
[ ] Requirement exists in an approved source.
[ ] Requirement meaning has not been changed.
[ ] Implementation matches the requirement.
[ ] No unsupported feature was introduced.
[ ] No unsupported UI behavior was introduced.
[ ] No unsupported data field was introduced.
[ ] No unsupported validation was introduced.
[ ] No unsupported API was introduced.
[ ] No unsupported integration was introduced.
[ ] No unauthorized dependency was introduced.
[ ] No unrelated refactoring was performed.
[ ] Tests validate only approved behavior.
[ ] Missing information has been reported.
[ ] Contradictions have been resolved or reported.
[ ] Self-validation completed.
```

If any required check fails:

```text
DO NOT DECLARE THE FEATURE COMPLETE.
```

---

# 42. ABSOLUTE RULE

The following rule overrides all convenience and assumptions:

> **WHEN IN DOUBT, DO NOT INVENT.**

If the approved sources do not provide enough information:

```text
Insufficient information to determine.
```

Ask for clarification rather than guessing.

The AI's responsibility is not to make the product "more complete."

The AI's responsibility is to make the product **exactly as specified**.

---

# 43. OPERATING WORKFLOW

For every significant implementation task, follow this sequence:

```text
STEP 1 — READ
Read all applicable approved sources.

        ↓

STEP 2 — EXTRACT
Extract explicit requirements and visual evidence.

        ↓

STEP 3 — CLASSIFY
Classify each item as:
- Explicit Requirement
- Visual Evidence
- Reference Information
- Unknown
- Conflict

        ↓

STEP 4 — TRACE
Identify the source supporting each implementation decision.

        ↓

STEP 5 — IDENTIFY GAPS
List missing or ambiguous information.

        ↓

STEP 6 — PLAN
Create an implementation plan using only approved requirements.

        ↓

STEP 7 — IMPLEMENT
Implement only authorized functionality.

        ↓

STEP 8 — TEST
Test only approved behavior.

        ↓

STEP 9 — SELF-VALIDATE
Check implementation against approved sources.

        ↓

STEP 10 — REPORT
Report:
- Implemented requirements
- Source traceability
- Files changed
- Tests
- Missing information
- Unresolved conflicts
- Hallucination validation
```

---

# 44. FINAL RULE

> **SOURCE → REQUIREMENT → TRACEABILITY → IMPLEMENTATION → VALIDATION**

There must be no unsupported step between these stages.

```text
Approved Source
      ↓
Explicit Requirement
      ↓
Traceable Implementation
      ↓
Requirement-Based Test
      ↓
Self-Validation
```

Anything outside this chain requires explicit user authorization.

**END OF ANTI-HALLUCINATION RULES**
