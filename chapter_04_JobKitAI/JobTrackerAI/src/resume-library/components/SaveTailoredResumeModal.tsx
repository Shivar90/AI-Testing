// Modal for saving a manually-tailored resume against an evaluation result.
// From "Resume Tailoring workflow.md": upload the finished PDF/DOCX, require a
// friendly resume name, show prefilled read-only evaluation context, allow
// notes, and warn on duplicate saves.

import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  buildSavedResume,
  isDuplicateSavedResume,
  putSavedResume,
} from '../services/resumeLibraryDb';
import { validateSavedResumeInput, type SavedResumeValidationErrors } from '../validators';
import type { SavedResume } from '../types';
import { XIcon } from '../../components/Icons';

interface SaveTailoredResumeModalProps {
  /** Company name from the linked evaluation. */
  company: string;
  /** Job title / designation from the linked evaluation. */
  designation: string;
  /** Evaluation date (ISO). */
  evaluationDate: string;
  /** The evaluation id to link. */
  evaluationId: string;
  onSaved: (resume: SavedResume) => void;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-accent-applied focus:ring-2 focus:ring-accent-applied/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500';
const labelCls =
  'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400';
const errCls = 'mt-1 text-xs text-red-500';

export function SaveTailoredResumeModal({
  company,
  designation,
  evaluationDate,
  evaluationId,
  onSaved,
  onClose,
}: SaveTailoredResumeModalProps) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<SavedResumeValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setDuplicate(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateSavedResumeInput({ name, file });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    if (!file) return;
    const dup = await isDuplicateSavedResume({
      fileName: file.name,
      evaluationId,
    });
    if (dup && !duplicate) {
      setDuplicate(true);
      return; // ask the user to confirm re-saving
    }

    setSaving(true);
    setSaveError(null);
    try {
      const fileType = file.type as SavedResume['fileType'];
      const saved = buildSavedResume({
        name,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        fileBlob: file,
        evaluationId,
        companyName: company,
        jobTitle: designation,
        notes,
      });
      await putSavedResume(saved);
      onSaved(saved);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Save tailored resume"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Save tailored resume
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Prefilled read-only evaluation context */}
        <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
          <p>
            <span className="font-medium">Company:</span> {company}
          </p>
          <p>
            <span className="font-medium">Job Title:</span> {designation}
          </p>
          <p>
            <span className="font-medium">Evaluation Date:</span>{' '}
            {new Date(evaluationDate).toLocaleDateString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="sr-name">
              Resume Name *
            </label>
            <input
              id="sr-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme_Embedded_Test_Automation_v1"
            />
            {errors.name && <p className={errCls}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="sr-file">
              Resume file (PDF or DOCX) *
            </label>
            <label
              htmlFor="sr-file"
              className={`${inputCls} cursor-pointer text-center`}
            >
              {file ? file.name : 'Choose a file…'}
            </label>
            <input
              id="sr-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFile}
            />
            {errors.file && <p className={errCls}>{errors.file}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="sr-notes">Notes</label>
            <textarea
              id="sr-notes"
              className={inputCls}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional — e.g. what changed in this version"
            />
          </div>

          {duplicate && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              A resume with this file name is already saved for this
              evaluation. Save again to replace it.
            </p>
          )}

          {saveError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {saveError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent-applied px-4 py-2 text-sm font-medium text-white hover:bg-accent-applied/90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : duplicate ? 'Save anyway' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
