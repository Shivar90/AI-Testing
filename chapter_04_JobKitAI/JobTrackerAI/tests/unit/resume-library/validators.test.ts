// Tests for the Resume Library validation.
// From "Resume Tailoring workflow.md": validate PDF/DOCX extension + MIME,
// enforce a file-size limit, require a resume name.

import { describe, expect, it } from 'vitest';
import {
  detectSavedResumeFileType,
  validateSavedResumeInput,
} from '../../../src/resume-library/validators';
import { MAX_SAVED_RESUME_BYTES } from '../../../src/config/config';

function makeFile(name: string, type: string, size = 100): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('detectSavedResumeFileType', () => {
  it('accepts pdf and docx by extension + MIME', () => {
    expect(
      detectSavedResumeFileType(makeFile('a.pdf', 'application/pdf')),
    ).toBe('application/pdf');
    expect(
      detectSavedResumeFileType(
        makeFile(
          'a.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ),
    ).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  });

  it('falls back to extension when MIME is empty', () => {
    expect(detectSavedResumeFileType(makeFile('a.pdf', ''))).toBe(
      'application/pdf',
    );
  });

  it('rejects other types', () => {
    expect(detectSavedResumeFileType(makeFile('a.txt', 'text/plain'))).toBeNull();
    expect(detectSavedResumeFileType(makeFile('a.exe', 'application/pdf'))).toBeNull();
  });
});

describe('validateSavedResumeInput', () => {
  const pdf = makeFile('a.pdf', 'application/pdf');

  it('accepts a valid name + pdf', () => {
    expect(validateSavedResumeInput({ name: 'Acme_v1', file: pdf })).toEqual({});
  });

  it('requires a name', () => {
    expect(
      validateSavedResumeInput({ name: '  ', file: pdf }).name,
    ).toBeDefined();
  });

  it('requires a file', () => {
    expect(validateSavedResumeInput({ name: 'x', file: null }).file).toBeDefined();
  });

  it('rejects unsupported file type', () => {
    expect(
      validateSavedResumeInput({ name: 'x', file: makeFile('a.txt', 'text/plain') }).file,
    ).toContain('Unsupported file type');
  });

  it('rejects oversized files', () => {
    const big = makeFile('big.pdf', 'application/pdf', MAX_SAVED_RESUME_BYTES + 1);
    expect(validateSavedResumeInput({ name: 'x', file: big }).file).toContain(
      'too large',
    );
  });
});
