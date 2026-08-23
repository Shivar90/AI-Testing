Modify the existing JobTrackerAI application with a minimal feature addition.

IMPORTANT CONSTRAINTS:
- Do NOT redesign or replace existing pages, UI, routes, Kanban board, evaluation engines, settings, storage design, or current user flows.
- Keep all existing functionality working exactly as it does now.
- Make only backward-compatible IndexedDB schema/data changes.
- Reuse existing components, hooks, services, validators, types, styles, and test patterns wherever possible.
- Do not add a backend, authentication, cloud storage, or AI resume-writing feature.
- Resume tailoring remains fully manual: the user edits their resume outside the application and then uploads the finished PDF or DOCX.

FEATURE GOAL:
After evaluating a job description, the user manually tailors their resume. They upload that finished PDF or DOCX into the application, save it as a reusable resume record, and later select the correct saved resume from the “Resume Used” dropdown when creating or editing the related job application.

REQUIRED USER FLOW:
1. User opens Evaluate a Job and evaluates a JD with their current resume.
2. Existing strengths and gaps results are shown as today.
3. Add one small action below/near the evaluation result:
   “Save tailored resume for this evaluation”.
4. Clicking it opens a small modal or compact panel. Do not create a new full page unless the existing architecture makes that necessary.
5. User has manually updated their resume outside the app and uploads the final file:
   - Support PDF and DOCX only.
   - Require a user-friendly Resume Name, such as:
     “CompanyName_Embedded_Test_Automation_v1”
   - Show prefilled read-only context from the linked evaluation:
     Company Name, Job Title, Evaluation Date.
   - Allow optional notes.
6. On save, persist the uploaded resume file and its metadata locally in IndexedDB.
7. The new saved resume must be associated with:
   - evaluationId
   - companyName
   - jobTitle
   - createdAt
8. After successful save:
   - show a success message
   - provide an optional “Create Job Application” button
   - if clicked, open the existing Add Job form with Company Name, Job Title, and Resume Used preselected.
9. In the existing Add Job and Edit Job forms, update the current Resume Used dropdown:
   - Include all saved resumes.
   - Display a useful label:
     “[Resume Name] — [Company] — [Job Title] — [saved date]”
   - If company/job title fields have values, show resumes matching the same company or job title first.
   - Do not hide other resumes; they must remain selectable.
   - Keep legacy/plain-text resume values working for old job records.
10. Once a job application is saved, persist the selected saved-resume ID on the job record.
11. On the job card edit/details area, display:
   - Resume Used name
   - “View/Download Resume” action for the associated PDF/DOCX
   - “Open linked evaluation” action when evaluationId exists.
12. When the user deletes a saved resume that is already linked to a job:
   - Show a warning with the number/list of linked job applications.
   - Do not silently delete it.
   - Prefer soft delete/archive, or require explicit confirmation.
   - Existing job history must continue displaying the original resume name even if the file is no longer available.

DATA MODEL:
Add a backward-compatible SavedResume entity/store, approximately:

type SavedResume = {
  id: string;
  name: string;
  fileName: string;
  fileType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  fileSize: number;
  fileBlob: Blob;
  evaluationId?: string;
  companyName?: string;
  jobTitle?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
};

Extend the existing JobApplication model only with optional fields:
- savedResumeId?: string
- evaluationId?: string
- savedResumeNameSnapshot?: string

BACKWARD COMPATIBILITY:
- Existing job applications with the old “resume used” text must continue to display correctly.
- Do not delete or corrupt existing IndexedDB data.
- For existing records, treat savedResumeId and evaluationId as optional.
- Ensure existing JSON export/import continues to work.
- Extend export/import to include saved resume metadata and files only if the current export supports attachments.
- If attachment export is not currently supported, document that limitation rather than breaking existing backup/restore behavior.

VALIDATION AND SAFETY:
- Validate PDF/DOCX extension and MIME type.
- Set a reasonable file-size limit and show a clear error.
- Prevent duplicate-save accidents by warning when the same file name and same evaluation are already saved.
- Use object URLs safely and revoke them after use.
- Preserve the existing privacy promise: all files and metadata stay in IndexedDB on the device.

TESTS:
Add/extend unit and E2E tests for:
- Save a PDF resume linked to an evaluation.
- Save a DOCX resume linked to an evaluation.
- Resume appears in Add Job and Edit Job dropdown.
- Matching resume ranks first for the same company/job title.
- Create Job Application preselects evaluation and saved resume.
- Job record retains selected savedResumeId and evaluationId after refresh.
- Legacy jobs without savedResumeId still work.
- Invalid type, oversized file, duplicate-save warning, missing resume name.
- Resume deletion/archive behavior when linked to one or more jobs.
- Existing evaluation, board, export/import, and drag/drop tests still pass.

IMPLEMENTATION APPROACH:
First inspect the existing codebase and identify:
- Current evaluation entity and IndexedDB store
- Current job application type/store/form
- Current attachment handling
- Existing Resume Used dropdown implementation
- Existing modal, toast, validation, and test conventions

Then make the smallest possible targeted changes. Before coding, provide a concise list of affected files and the migration approach. After coding, run type-check, unit tests, and production build. Do not modify unrelated files.