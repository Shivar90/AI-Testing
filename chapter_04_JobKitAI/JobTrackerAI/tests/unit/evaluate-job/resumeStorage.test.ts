// @vitest-environment jsdom
// Tests for resume persistence in IndexedDB via the shared DB.
// Regression: the resumes store must exist in the same database as the job
// and evaluation stores — previously it was missing, causing
// "One of the specified object stores was not found" on upload.

import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { getDb } from '../../../src/services/db';
import { EVALUATION_STORE, JOB_STORE, RESUME_STORE } from '../../../src/config/config';
import {
  deleteResume,
  getLatestResume,
  putResume,
} from '../../../src/evaluate-job/services/resumeStorage';
import type { StoredResume } from '../../../src/evaluate-job/types';

function makeResume(overrides: Partial<StoredResume> = {}): StoredResume {
  return {
    id: 'r1',
    fileName: 'SDE_Resume_v3.pdf',
    text: 'Python React AWS',
    uploadedAt: 1000,
    ...overrides,
  };
}

describe('resumeStorage', () => {
  it('creates the resumes store alongside the other stores', async () => {
    const db = await getDb();
    const names = Array.from(db.objectStoreNames);
    expect(names).toContain(RESUME_STORE);
    expect(names).toContain(JOB_STORE);
    expect(names).toContain(EVALUATION_STORE);
  });

  it('returns undefined when no resume exists', async () => {
    // Delete everything first to guarantee a clean store.
    const existing = await getLatestResume();
    if (existing) await deleteResume(existing.id);
    expect(await getLatestResume()).toBeUndefined();
  });

  it('stores and retrieves the latest resume', async () => {
    await deleteResume('a');
    await deleteResume('b');
    await putResume(makeResume({ id: 'a', uploadedAt: 1000 }));
    await putResume(makeResume({ id: 'b', fileName: 'QA_Lead_Resume.docx', uploadedAt: 2000 }));
    const latest = await getLatestResume();
    expect(latest?.id).toBe('b');
    expect(latest?.fileName).toBe('QA_Lead_Resume.docx');
  });

  it('deletes a stored resume', async () => {
    await deleteResume('a');
    await deleteResume('b');
    await putResume(makeResume({ id: 'a' }));
    await putResume(makeResume({ id: 'b' }));
    await deleteResume('a');
    await deleteResume('b');
    expect(await getLatestResume()).toBeUndefined();
  });
});
