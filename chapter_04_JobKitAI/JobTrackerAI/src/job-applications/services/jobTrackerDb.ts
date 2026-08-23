// IndexedDB persistence layer for the Job Application domain.
// "All CRUD operations persist instantly to IndexedDB" (Requirements.md).
// Uses the shared DB connection (src/services/db.ts) so all stores coexist.

import { JOB_STORE } from '../../config/config';
import { getDb } from '../../services/db';
import type { JobApplication } from '../types';

export async function getAllJobs(): Promise<JobApplication[]> {
  const db = await getDb();
  return db.getAll(JOB_STORE);
}

export async function getJob(id: string): Promise<JobApplication | undefined> {
  const db = await getDb();
  return db.get(JOB_STORE, id);
}

export async function putJob(job: JobApplication): Promise<void> {
  const db = await getDb();
  await db.put(JOB_STORE, job);
}

export async function deleteJob(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(JOB_STORE, id);
}

/** Replace the entire store (used by import restore). */
export async function replaceAllJobs(jobs: JobApplication[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(JOB_STORE, 'readwrite');
  await tx.store.clear();
  for (const job of jobs) {
    await tx.store.put(job);
  }
  await tx.done;
}
