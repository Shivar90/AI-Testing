// Domain model for the Resume Library — saved, reusable resumes that can be
// linked to job applications and evaluations.
// Derived from "Resume Tailoring workflow.md" (data model section).

export type SavedResumeFileType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export interface SavedResume {
  /** Stable unique id (crypto.randomUUID). */
  id: string;
  /** User-friendly resume name, e.g. "Acme_Embedded_Test_Automation_v1". */
  name: string;
  /** Original uploaded file name. */
  fileName: string;
  fileType: SavedResumeFileType;
  /** File size in bytes. */
  fileSize: number;
  /** The resume file itself, stored locally in IndexedDB. */
  fileBlob: Blob;
  /** Linked evaluation (when saved from an evaluation). */
  evaluationId?: string;
  companyName?: string;
  jobTitle?: string;
  notes?: string;
  /** ISO string. */
  createdAt: string;
  /** ISO string. */
  updatedAt: string;
  /** Soft-delete flag — archived resumes stay linked to jobs. */
  isArchived?: boolean;
}

/** Input when saving a tailored resume from an evaluation. */
export interface SaveTailoredResumeInput {
  name: string;
  fileName: string;
  fileType: SavedResumeFileType;
  fileSize: number;
  fileBlob: Blob;
  evaluationId?: string;
  companyName?: string;
  jobTitle?: string;
  notes?: string;
}
