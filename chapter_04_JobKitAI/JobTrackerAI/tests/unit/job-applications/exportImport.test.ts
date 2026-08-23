// @vitest-environment jsdom
// Tests for JSON backup export/import.
// Requirements.md nice-to-have: "Export all data as JSON for backup" and
// "Import JSON to restore data".

import { describe, expect, it, vi } from 'vitest';
import {
  buildBackupPayload,
  downloadBackup,
  parseBackupFile,
} from '../../../src/utils/exportImport';
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

describe('buildBackupPayload', () => {
  it('wraps jobs with app marker and timestamp', () => {
    const payload = buildBackupPayload([makeJob()]);
    expect(payload.app).toBe('job-tracker');
    expect(payload.jobs).toHaveLength(1);
    expect(typeof payload.exportedAt).toBe('string');
  });

  it('includes saved-resume metadata when provided', () => {
    const meta = {
      id: 'r1',
      name: 'Acme_v1',
      fileName: 'acme.pdf',
      fileType: 'application/pdf' as const,
      fileSize: 100,
      createdAt: '2026-08-22T00:00:00.000Z',
      updatedAt: '2026-08-22T00:00:00.000Z',
    };
    const payload = buildBackupPayload([], [meta]);
    expect(payload.savedResumes).toEqual([meta]);
  });

  it('omits savedResumes when empty', () => {
    const payload = buildBackupPayload([makeJob()], []);
    expect(payload.savedResumes).toBeUndefined();
  });
});

describe('parseBackupFile', () => {
  it('parses a valid backup file', async () => {
    const file = new File(
      [JSON.stringify(buildBackupPayload([makeJob()]))],
      'backup.json',
      { type: 'application/json' },
    );
    const parsed = await parseBackupFile(file);
    expect(parsed.jobs).toHaveLength(1);
    expect(parsed.jobs[0].company).toBe('Acme');
    expect(parsed.savedResumes).toBeUndefined();
  });

  it('parses saved-resume metadata from a backup', async () => {
    const meta = {
      id: 'r1',
      name: 'Acme_v1',
      fileName: 'acme.pdf',
      fileType: 'application/pdf' as const,
      fileSize: 100,
      createdAt: '2026-08-22T00:00:00.000Z',
      updatedAt: '2026-08-22T00:00:00.000Z',
    };
    const file = new File(
      [JSON.stringify(buildBackupPayload([makeJob()], [meta]))],
      'backup.json',
    );
    const parsed = await parseBackupFile(file);
    expect(parsed.savedResumes).toHaveLength(1);
    expect(parsed.savedResumes?.[0].name).toBe('Acme_v1');
    // The blob is never exported.
    expect(parsed.savedResumes?.[0]).not.toHaveProperty('fileBlob');
  });

  it('accepts old backups without savedResumes (backward compat)', async () => {
    const file = new File(
      [JSON.stringify({ app: 'job-tracker', jobs: [makeJob()] })],
      'old.json',
    );
    const parsed = await parseBackupFile(file);
    expect(parsed.jobs).toHaveLength(1);
    expect(parsed.savedResumes).toBeUndefined();
  });

  it('rejects invalid JSON', async () => {
    const file = new File(['{not json'], 'bad.json', { type: 'application/json' });
    await expect(parseBackupFile(file)).rejects.toThrow('not valid JSON');
  });

  it('rejects a non-job-tracker payload', async () => {
    const file = new File([JSON.stringify({ app: 'other', jobs: [] })], 'x.json');
    await expect(parseBackupFile(file)).rejects.toThrow(
      'does not match the expected Job Tracker backup format',
    );
  });

  it('rejects jobs missing required fields', async () => {
    const file = new File(
      [JSON.stringify({ app: 'job-tracker', jobs: [{ id: 'x' }] })],
      'x.json',
    );
    await expect(parseBackupFile(file)).rejects.toThrow(
      'does not match the expected Job Tracker backup format',
    );
  });
});

describe('downloadBackup', () => {
  it('triggers a JSON download', () => {
    const clickSpy = vi.fn();
    const fakeAnchor = { href: '', download: '', click: clickSpy };
    vi.stubGlobal('URL', {
      createObjectURL: () => 'blob:fake',
      revokeObjectURL: () => {},
    });
    vi.stubGlobal(
      'document',
      { createElement: () => fakeAnchor },
    );
    downloadBackup([makeJob()]);
    expect(clickSpy).toHaveBeenCalled();
    expect(fakeAnchor.download).toContain('job-tracker-backup-');
  });
});
