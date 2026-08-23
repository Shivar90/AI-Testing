// Application configuration.
// IMPLEMENTATION DECISION: single IndexedDB database for all persisted data
// (Requirements.md: "All data must persist in the browser using IndexedDB").

export const DB_NAME = 'job-tracker';
export const DB_VERSION = 5;
export const JOB_STORE = 'job-applications';
export const EVALUATION_STORE = 'evaluations';
export const RESUME_STORE = 'resumes';
export const SAVED_RESUME_STORE = 'saved-resumes';

// Upper bound for attachment files stored on a card (screenshot shows a
// paperclip attachment). Technical guardrail, not a product requirement.
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB

// Upper bound for saved resume files in the resume library.
export const MAX_SAVED_RESUME_BYTES = 10 * 1024 * 1024; // 10 MB
