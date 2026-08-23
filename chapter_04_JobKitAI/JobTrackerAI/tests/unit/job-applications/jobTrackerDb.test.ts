// @vitest-environment jsdom
// Tests for job application persistence in IndexedDB via the shared DB.
// Regression test: the job-applications, evaluations and resumes stores must
// all coexist in one database (previously each module opened the DB alone and
// the stores were lost).

import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { getDb } from '../../../src/services/db';
import { EVALUATION_STORE, JOB_STORE, RESUME_STORE, SAVED_RESUME_STORE } from '../../../src/config/config';
import {
  deleteJob,
  getAllJobs,
  getJob,
  putJob,
  replaceAllJobs,
} from '../../../src/job-applications/services/jobTrackerDb';
import type { JobApplication } from '../../../src/job-applications/types';

function makeJob(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: 'j1',
    company: 'Acme',
    role: 'Engineer',
    dateApplied: '2026-08-22',
    status: 'applied',
    createdAt: 1000,
    ...overrides,
  };
}

describe('jobTrackerDb (shared DB)', () => {
  it('creates all four stores in one database', async () => {
    const db = await getDb();
    const names = Array.from(db.objectStoreNames);
    expect(names).toContain(JOB_STORE);
    expect(names).toContain(EVALUATION_STORE);
    expect(names).toContain(RESUME_STORE);
    expect(names).toContain(SAVED_RESUME_STORE);
  });

  it('puts, gets, lists and deletes jobs', async () => {
    await deleteJob('j1');
    await putJob(makeJob());
    expect(await getJob('j1')).toMatchObject({ company: 'Acme' });
    const all = await getAllJobs();
    expect(all.some((j) => j.id === 'j1')).toBe(true);
    await deleteJob('j1');
    expect(await getJob('j1')).toBeUndefined();
  });

  it('replaceAllJobs clears and repopulates', async () => {
    await putJob(makeJob({ id: 'old' }));
    await replaceAllJobs([makeJob({ id: 'new' })]);
    const all = await getAllJobs();
    expect(all.map((j) => j.id).sort()).toEqual(['new']);
  });
});
