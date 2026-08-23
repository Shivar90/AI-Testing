// Tests for the Resume Library persistence + archive/delete safety.
// From "Resume Tailoring workflow.md": save PDF/DOCX linked to an evaluation,
// soft-archive when linked to jobs, never silently delete.

// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '../../../src/services/db';
import { SAVED_RESUME_STORE } from '../../../src/config/config';
import {
  archiveSavedResume,
  buildSavedResume,
  getAllSavedResumeMeta,
  getJobsLinkedToResume,
  getSavedResume,
  hardDeleteSavedResume,
  isDuplicateSavedResume,
  putSavedResume,
  replaceAllSavedResumeMeta,
} from '../../../src/resume-library/services/resumeLibraryDb';
import { putJob, deleteJob } from '../../../src/job-applications/services/jobTrackerDb';
import type { SaveTailoredResumeInput } from '../../../src/resume-library/types';

function makeInput(overrides: Partial<SaveTailoredResumeInput> = {}): SaveTailoredResumeInput {
  return {
    name: 'Acme_Embedded_v1',
    fileName: 'resume.pdf',
    fileType: 'application/pdf',
    fileSize: 100,
    fileBlob: new Blob(['x'], { type: 'application/pdf' }),
    evaluationId: 'eval-1',
    companyName: 'Acme',
    jobTitle: 'Engineer',
    ...overrides,
  };
}

beforeEach(async () => {
  // Clean the saved-resumes store so tests are isolated.
  const db = await getDb();
  const all = await db.getAll(SAVED_RESUME_STORE);
  for (const r of all) await db.delete(SAVED_RESUME_STORE, r.id);
  await deleteJob('j1');
});

describe('resumeLibraryDb', () => {
  it('builds and stores a saved resume linked to an evaluation', async () => {
    const saved = buildSavedResume(makeInput());
    await putSavedResume(saved);
    const fetched = await getSavedResume(saved.id);
    expect(fetched?.name).toBe('Acme_Embedded_v1');
    expect(fetched?.evaluationId).toBe('eval-1');
    expect(fetched?.companyName).toBe('Acme');
    expect(fetched?.fileBlob).toBeDefined(); // structured-cloned Blob in fake-indexeddb
  });

  it('detects duplicate saves for the same file + evaluation', async () => {
    const a = buildSavedResume(makeInput());
    await putSavedResume(a);
    expect(await isDuplicateSavedResume({ fileName: 'resume.pdf', evaluationId: 'eval-1' })).toBe(true);
    // different evaluation -> not a duplicate
    expect(
      await isDuplicateSavedResume({ fileName: 'resume.pdf', evaluationId: 'eval-2' }),
    ).toBe(false);
    // archived duplicates don't count
    await archiveSavedResume(a.id);
    expect(await isDuplicateSavedResume({ fileName: 'resume.pdf', evaluationId: 'eval-1' })).toBe(false);
  });

  it('dedupes gear uploads (no evaluationId) by file name', async () => {
    const gear = buildSavedResume(
      makeInput({ evaluationId: undefined, fileName: 'resume.pdf' }),
    );
    await putSavedResume(gear);
    // Same file name, no evaluation -> duplicate.
    expect(
      await isDuplicateSavedResume({ fileName: 'resume.pdf' }),
    ).toBe(true);
    // Different file name -> not a duplicate.
    expect(
      await isDuplicateSavedResume({ fileName: 'other.pdf' }),
    ).toBe(false);
    // A saved resume WITH an evaluation is not matched by a gear upload check.
    const tailored = buildSavedResume(makeInput({ fileName: 'resume.pdf' }));
    await putSavedResume(tailored);
    expect(await isDuplicateSavedResume({ fileName: 'resume.pdf' })).toBe(true);
  });

  it('exports metadata without blobs and restores it', async () => {
    const saved = buildSavedResume(makeInput());
    await putSavedResume(saved);

    const meta = await getAllSavedResumeMeta();
    expect(meta).toHaveLength(1);
    expect(meta[0].id).toBe(saved.id);
    expect(meta[0]).not.toHaveProperty('fileBlob');

    // Simulate restore after a backup: clear + re-import metadata.
    const db = await getDb();
    await db.clear(SAVED_RESUME_STORE);
    await replaceAllSavedResumeMeta(meta);
    const restored = await getSavedResume(saved.id);
    expect(restored?.name).toBe(saved.name);
    expect(restored?.fileBlob).toBeDefined(); // placeholder empty blob
  });

  it('reports jobs linked to a saved resume and archives instead of hard-deleting when linked', async () => {
    const saved = buildSavedResume(makeInput());
    await putSavedResume(saved);

    // no jobs yet -> hard delete works
    expect(await getJobsLinkedToResume(saved.id)).toHaveLength(0);
    await hardDeleteSavedResume(saved.id);
    expect(await getSavedResume(saved.id)).toBeUndefined();

    // with a linked job -> archive keeps the record
    await putSavedResume(saved);
    await putJob({
      id: 'j1',
      company: 'Acme',
      role: 'Engineer',
      dateApplied: '2026-08-22',
      status: 'applied',
      savedResumeId: saved.id,
      savedResumeNameSnapshot: saved.name,
      createdAt: 1000,
    });
    expect(await getJobsLinkedToResume(saved.id)).toHaveLength(1);
    await archiveSavedResume(saved.id);
    expect((await getSavedResume(saved.id))?.isArchived).toBe(true);
    await deleteJob('j1');
  });
});
