// Validation for the Resume Library (OWASP-aligned file-upload checks).
// From "Resume Tailoring workflow.md": validate PDF/DOCX extension + MIME,
// enforce a file-size limit, warn on duplicate saves.

import { MAX_SAVED_RESUME_BYTES } from '../../config/config';
import type { SavedResumeFileType } from '../types';

export interface SavedResumeValidationErrors {
  name?: string;
  file?: string;
}

export interface ValidatedResumeFile {
  fileType: SavedResumeFileType;
  fileSize: number;
  fileName: string;
}

const PDF_MIME = 'application/pdf';
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function detectSavedResumeFileType(
  file: File,
): SavedResumeFileType | null {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf') && file.type === PDF_MIME) return PDF_MIME;
  if (lower.endsWith('.docx') && file.type === DOCX_MIME) return DOCX_MIME;
  // Some browsers send an empty MIME for these; fall back to extension.
  if (lower.endsWith('.pdf')) return PDF_MIME;
  if (lower.endsWith('.docx')) return DOCX_MIME;
  return null;
}

export function validateSavedResumeInput(data: {
  name: string;
  file: File | null;
}): SavedResumeValidationErrors {
  const errors: SavedResumeValidationErrors = {};
  if (!data.name.trim()) {
    errors.name = 'Resume name is required.';
  }
  if (!data.file) {
    errors.file = 'Please choose a PDF or DOCX file.';
  } else if (detectSavedResumeFileType(data.file) === null) {
    errors.file = 'Unsupported file type. Please upload a PDF or DOCX file.';
  } else if (data.file.size > MAX_SAVED_RESUME_BYTES) {
    errors.file = `File is too large. Maximum size is ${Math.floor(
      MAX_SAVED_RESUME_BYTES / (1024 * 1024),
    )} MB.`;
  }
  return errors;
}
