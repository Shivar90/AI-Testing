// IndexedDB persistence for uploaded resumes on the Evaluate page.
// Resume text is stored locally in the browser only (Requirements.md: "All
// data must persist in the browser using IndexedDB"). Uses the shared DB
// connection (src/services/db.ts).

import { RESUME_STORE } from '../../config/config';
import { getDb } from '../../services/db';
import type { StoredResume } from '../types';

/** Latest uploaded resume, if any. */
export async function getLatestResume(): Promise<StoredResume | undefined> {
  const db = await getDb();
  const all = await db.getAll(RESUME_STORE);
  if (all.length === 0) return undefined;
  return all.reduce((latest, r) =>
    r.uploadedAt > latest.uploadedAt ? r : latest,
  );
}

export async function putResume(resume: StoredResume): Promise<void> {
  const db = await getDb();
  await db.put(RESUME_STORE, resume);
}

export async function deleteResume(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(RESUME_STORE, id);
}
