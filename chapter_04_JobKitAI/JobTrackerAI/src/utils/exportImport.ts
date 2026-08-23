// JSON backup (export) and restore (import) utilities.
// Matches the download/upload controls visible in the Header (screenshot) and
// the "Export all data as JSON" nice-to-have in Requirements.md.

import type { JobApplication } from '../job-applications/types';
import type { SavedResume } from '../resume-library/types';

/**
 * Metadata of a saved resume, exported without the file Blob (large binary).
 * The Blob is never serialized — download will be unavailable after restore,
 * but the library listing/links survive. Documented limitation.
 */
export type SavedResumeMeta = Omit<SavedResume, 'fileBlob'>;

export interface BackupPayload {
  app: 'job-tracker';
  exportedAt: string;
  jobs: JobApplication[];
  /** Optional saved-resume metadata (no blobs). Backward compatible. */
  savedResumes?: SavedResumeMeta[];
}

export function buildBackupPayload(
  jobs: JobApplication[],
  savedResumes?: SavedResumeMeta[],
): BackupPayload {
  const payload: BackupPayload = {
    app: 'job-tracker',
    exportedAt: new Date().toISOString(),
    jobs,
  };
  if (savedResumes && savedResumes.length > 0) {
    payload.savedResumes = savedResumes;
  }
  return payload;
}

export function downloadBackup(
  jobs: JobApplication[],
  savedResumes?: SavedResumeMeta[],
): void {
  const payload = buildBackupPayload(jobs, savedResumes);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `job-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an uploaded backup file.
 * Returns the jobs array (plus optional saved-resume metadata), or throws a
 * descriptive error if invalid.
 */
export async function parseBackupFile(
  file: File,
): Promise<{ jobs: JobApplication[]; savedResumes?: SavedResumeMeta[] }> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  if (!isValidBackup(parsed)) {
    throw new Error(
      'File does not match the expected Job Tracker backup format.',
    );
  }
  return {
    jobs: parsed.jobs,
    savedResumes: Array.isArray(parsed.savedResumes)
      ? parsed.savedResumes
      : undefined,
  };
}

// Minimal structural validation of a backup payload.
function isValidBackup(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.app !== 'job-tracker') return false;
  if (!Array.isArray(v.jobs)) return false;
  const jobsOk = v.jobs.every(
    (job) =>
      !!job &&
      typeof (job as JobApplication).id === 'string' &&
      typeof (job as JobApplication).company === 'string' &&
      typeof (job as JobApplication).role === 'string' &&
      typeof (job as JobApplication).dateApplied === 'string' &&
      typeof (job as JobApplication).status === 'string',
  );
  const savedOk =
    v.savedResumes === undefined ||
    (Array.isArray(v.savedResumes) &&
      v.savedResumes.every(
        (r) =>
          !!r &&
          typeof (r as SavedResume).id === 'string' &&
          typeof (r as SavedResume).name === 'string' &&
          typeof (r as SavedResume).fileName === 'string',
      ));
  return jobsOk && savedOk;
}