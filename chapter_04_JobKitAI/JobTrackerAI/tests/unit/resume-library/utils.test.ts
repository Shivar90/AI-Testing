// Tests for saved-resume label + dropdown ranking.
// From "Resume Tailoring workflow.md": show a useful label, rank resumes
// matching the same company/job title first, keep others selectable.

import { describe, expect, it } from 'vitest';
import { rankSavedResumes, savedResumeLabel } from '../../../src/resume-library/utils';
import type { SavedResume } from '../../../src/resume-library/types';

function makeResume(overrides: Partial<SavedResume> = {}): SavedResume {
  return {
    id: 'r1',
    name: 'Acme_Engineer_v1',
    fileName: 'acme.pdf',
    fileType: 'application/pdf',
    fileSize: 10,
    fileBlob: new Blob(),
    companyName: 'Acme',
    jobTitle: 'Engineer',
    createdAt: '2026-08-22T00:00:00.000Z',
    updatedAt: '2026-08-22T00:00:00.000Z',
    ...overrides,
  };
}

describe('savedResumeLabel', () => {
  it('includes name, company, job title and a date', () => {
    const label = savedResumeLabel(makeResume());
    expect(label).toContain('Acme_Engineer_v1');
    expect(label).toContain('Acme');
    expect(label).toContain('Engineer');
    expect(label).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // locale date
  });
});

describe('rankSavedResumes', () => {
  it('ranks same-company resumes first and keeps others selectable', () => {
    const acme = makeResume({ id: 'a', companyName: 'Acme', jobTitle: 'Engineer' });
    const google = makeResume({ id: 'b', companyName: 'Google', jobTitle: 'Engineer' });
    const ranked = rankSavedResumes([google, acme], 'Acme', '');
    expect(ranked[0].id).toBe('a'); // Acme first
    expect(ranked.map((r) => r.id)).toContain('b'); // Google still selectable
  });

  it('ranks same-job-title resumes first', () => {
    const eng = makeResume({ id: 'a', companyName: 'X', jobTitle: 'Engineer' });
    const pm = makeResume({ id: 'b', companyName: 'Y', jobTitle: 'PM' });
    const ranked = rankSavedResumes([pm, eng], '', 'Engineer');
    expect(ranked[0].id).toBe('a');
  });

  it('excludes archived resumes', () => {
    const active = makeResume({ id: 'a' });
    const archived = makeResume({ id: 'b', isArchived: true });
    const ranked = rankSavedResumes([active, archived], '', '');
    expect(ranked.map((r) => r.id)).toEqual(['a']);
  });

  it('keeps gear-uploaded resumes (no company/jobTitle) selectable', () => {
    const gear = makeResume({
      id: 'g',
      companyName: undefined,
      jobTitle: undefined,
    });
    const acme = makeResume({ id: 'a', companyName: 'Acme', jobTitle: 'Engineer' });
    // Searching by "Acme" — the gear resume still appears (after the match).
    const ranked = rankSavedResumes([gear, acme], 'Acme', '');
    expect(ranked.map((r) => r.id)).toEqual(['a', 'g']);
  });
});
