// IndexedDB persistence for the Resume Library (saved resumes).
// All data stays in the browser (Requirements.md: "All data must persist in
// the browser using IndexedDB"; workflow doc: "all files and metadata stay in
// IndexedDB on the device"). Uses the shared DB connection.

import { JOB_STORE, SAVED_RESUME_STORE } from '../../config/config';
import { getDb } from '../../services/db';
import type { JobApplication } from '../../job-applications/types';
import type { SavedResume, SaveTailoredResumeInput } from '../types';

export async function getAllSavedResumes(): Promise<SavedResume[]> {
  const db = await getDb();
  const all = await db.getAll(SAVED_RESUME_STORE);
  return all.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Metadata of all saved resumes, without the file Blobs (for export). */
export async function getAllSavedResumeMeta(): Promise<
  Omit<SavedResume, 'fileBlob'>[]
> {
  const all = await getAllSavedResumes();
  return all.map(({ fileBlob: _blob, ...meta }) => meta);
}

/**
 * Restore saved-resume metadata from a backup (blobs are not exported, so the
 * file is unavailable until re-uploaded; the library listing/links survive).
 */
export async function replaceAllSavedResumeMeta(
  metas: Omit<SavedResume, 'fileBlob'>[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SAVED_RESUME_STORE, 'readwrite');
  await tx.store.clear();
  for (const meta of metas) {
    await tx.store.put({ ...meta, fileBlob: new Blob() } as SavedResume);
  }
  await tx.done;
}

export async function getSavedResume(
  id: string,
): Promise<SavedResume | undefined> {
  const db = await getDb();
  return db.get(SAVED_RESUME_STORE, id);
}

/** Create a saved resume from validated input. */
export function buildSavedResume(input: SaveTailoredResumeInput): SavedResume {
  const now = new Date().toISOString();
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: input.name.trim(),
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    fileBlob: input.fileBlob,
    evaluationId: input.evaluationId,
    companyName: input.companyName,
    jobTitle: input.jobTitle,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export async function putSavedResume(
  resume: SavedResume,
): Promise<void> {
  const db = await getDb();
  await db.put(SAVED_RESUME_STORE, resume);
}

/** Soft-delete: archive so linked job cards keep their snapshot. */
export async function archiveSavedResume(id: string): Promise<void> {
  const db = await getDb();
  const existing = await db.get(SAVED_RESUME_STORE, id);
  if (!existing) return;
  await db.put(SAVED_RESUME_STORE, {
    ...existing,
    isArchived: true,
    updatedAt: new Date().toISOString(),
  });
}

/** Hard delete — only safe when no jobs are linked. */
export async function hardDeleteSavedResume(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(SAVED_RESUME_STORE, id);
}

/** Job applications that reference the given saved resume id. */
export async function getJobsLinkedToResume(
  savedResumeId: string,
): Promise<JobApplication[]> {
  const db = await getDb();
  const all = await db.getAll(JOB_STORE);
  return all.filter((j) => j.savedResumeId === savedResumeId);
}

/**
 * True if a resume with the same file name is already saved for the same
 * evaluation (duplicate-save prevention, workflow doc), or — when neither the
 * existing entry nor the new one is tied to an evaluation — the same file
 * name already exists in the library (gear uploads).
 */
export async function isDuplicateSavedResume(input: {
  fileName: string;
  evaluationId?: string;
}): Promise<boolean> {
  const all = await getAllSavedResumes();
  return all.some((r) => {
    if (r.isArchived) return false;
    if (r.fileName !== input.fileName) return false;
    if (input.evaluationId) {
      return r.evaluationId === input.evaluationId;
    }
    // No evaluation on either side -> library-wide same-file dedupe.
    return !r.evaluationId;
  });
}
