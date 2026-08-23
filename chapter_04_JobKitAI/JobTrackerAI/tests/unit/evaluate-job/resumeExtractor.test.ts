// Tests for resume file extraction (PDF/DOCX) used on the Evaluate page.
// Uploading a real resume file (PDF or DOCX) is a user-authorized addition;
// extraction must stay local and reject unsupported files.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the heavy libraries BEFORE importing the module under test.
const pdfMock = {
  getDocument: vi.fn(),
  GlobalWorkerOptions: {},
};
const mammothMock = {
  extractRawText: vi.fn(),
};
vi.mock('pdfjs-dist', () => pdfMock);
vi.mock('mammoth', () => mammothMock);

import { detectResumeKind, extractResumeText } from '../../../src/evaluate-job/services/resumeExtractor';

function makeFile(name: string, content: BlobPart[] = ['text']): File {
  return new File(content, name, { type: 'application/octet-stream' });
}

beforeEach(() => {
  pdfMock.getDocument.mockReset();
  mammothMock.extractRawText.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('detectResumeKind', () => {
  it('detects pdf and docx by extension', () => {
    expect(detectResumeKind('resume.pdf')).toBe('pdf');
    expect(detectResumeKind('Resume_V3.DOCX')).toBe('docx');
  });

  it('marks other extensions unsupported', () => {
    expect(detectResumeKind('resume.txt')).toBe('unsupported');
  });
});

describe('extractResumeText', () => {
  it('rejects unsupported file types', async () => {
    await expect(extractResumeText(makeFile('resume.txt'))).rejects.toThrow(
      'Unsupported file type',
    );
  });

  it('extracts text from a PDF via pdfjs', async () => {
    const fakePdf = {
      numPages: 2,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: 'Python', transform: [1, 0, 0, 1, 0, 10] },
            { str: 'developer', transform: [1, 0, 0, 1, 0, 10] },
            { str: 'React', transform: [1, 0, 0, 1, 0, 5] },
          ],
        }),
      }),
    };
    pdfMock.getDocument.mockReturnValue({ promise: Promise.resolve(fakePdf) });
    const text = await extractResumeText(makeFile('resume.pdf'));
    expect(text).toContain('Python developer');
    expect(text).toContain('React');
    expect(fakePdf.getPage).toHaveBeenCalledTimes(2);
  });

  it('extracts text from a DOCX via mammoth', async () => {
    mammothMock.extractRawText.mockResolvedValue({
      value: 'QA Lead Resume with Playwright and Cypress.',
    });
    const text = await extractResumeText(makeFile('resume.docx'));
    expect(text).toContain('Playwright');
    expect(mammothMock.extractRawText).toHaveBeenCalledOnce();
  });

  it('throws when a PDF has no extractable text', async () => {
    pdfMock.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({ items: [] }),
        }),
      }),
    });
    await expect(extractResumeText(makeFile('scan.pdf'))).rejects.toThrow(
      'Could not read any text',
    );
  });
});
