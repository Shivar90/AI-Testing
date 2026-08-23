// Domain model for the Job Tracker application.
// Fields are derived exactly from Requirements.md "Data Model" plus visual
// evidence in Jobtrackersnap.png (salary display, attachment paperclip).

/** Approved Kanban column statuses (Requirements.md). */
export type Status =
  | 'wishlist'
  | 'applied'
  | 'follow-up'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface JobApplication {
  /** Stable unique id (crypto.randomUUID) — ARCHITECTURE §8. */
  id: string;
  /** Company name (text, required). */
  company: string;
  /** Job title / role (text, required). */
  role: string;
  /** LinkedIn job URL (URL, clickable). */
  linkedinUrl?: string;
  /** Resume used (dropdown of previously used resume names). */
  resumeUsed?: string;
  /** Linked saved resume from the resume library (workflow doc). */
  savedResumeId?: string;
  /** Linked evaluation, when the job came from a tailored-resume flow. */
  evaluationId?: string;
  /** Snapshot of the resume name so it survives archive/delete. */
  savedResumeNameSnapshot?: string;
  /** Date applied — ISO string, auto-set on creation, editable. */
  dateApplied: string;
  /** Salary range (optional text, e.g. "$150-180K"). */
  salary?: string;
  /** Notes (optional textarea: recruiter name, referral info, etc.). */
  notes?: string;
  /** Status — maps to the Kanban column. */
  status: Status;
  /** Attachment file name (visual evidence on the card). */
  attachmentName?: string;
  /** Attachment file data (visual evidence on the card). */
  attachment?: Blob;
  /** Epoch ms at creation. */
  createdAt: number;
}

/** Payload captured by the add/edit form before persistence. */
export type JobApplicationInput = Omit<
  JobApplication,
  'id' | 'createdAt' | 'status'
> & {
  status?: Status;
};
