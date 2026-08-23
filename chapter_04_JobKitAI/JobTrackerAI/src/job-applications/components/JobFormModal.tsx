// Add/Edit job modal — used for both creating a new job and editing an
// existing one (Requirements.md: "Add new job via a modal/slide-over form" and
// "Edit any card inline or via modal"). Validates required fields (company,
// role) and the applied date before saving.

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { COLUMNS, STATUS_BG } from '../types/constants';
import type { JobApplication, Status } from '../types';
import { validateJobForm, type ValidationErrors } from '../validators';
import { toInputDate } from '../utils';
import { useSavedResumes } from '../../resume-library/hooks/useSavedResumes';
import { rankSavedResumes, savedResumeLabel } from '../../resume-library/utils';
import { XIcon } from '../../components/Icons';

export interface JobFormValue {
  company: string;
  role: string;
  linkedinUrl: string;
  resumeUsed: string;
  savedResumeId?: string;
  savedResumeNameSnapshot?: string;
  dateApplied: string;
  salary: string;
  notes: string;
  status: Status;
  attachmentName: string;
  attachment?: Blob;
}

interface JobFormModalProps {
  job?: JobApplication;
  initialStatus?: Status;
  /** Preselected saved resume (e.g. from "Create Job Application"). */
  initialSavedResume?: { id: string; name: string } | null;
  onSave: (value: JobFormValue) => void;
  onClose: () => void;
}

export function JobFormModal({
  job,
  initialStatus = 'wishlist',
  initialSavedResume,
  onSave,
  onClose,
}: JobFormModalProps) {
  const [form, setForm] = useState<JobFormValue>(() => ({
    company: job?.company ?? '',
    role: job?.role ?? '',
    linkedinUrl: job?.linkedinUrl ?? '',
    resumeUsed: job?.resumeUsed ?? initialSavedResume?.name ?? '',
    savedResumeId: job?.savedResumeId ?? initialSavedResume?.id,
    savedResumeNameSnapshot: job?.savedResumeNameSnapshot ?? initialSavedResume?.name,
    dateApplied: job ? toInputDate(job.dateApplied) : toInputDate(new Date().toISOString()),
    salary: job?.salary ?? '',
    notes: job?.notes ?? '',
    status: job?.status ?? initialStatus,
    attachmentName: job?.attachmentName ?? '',
    attachment: job?.attachment,
  }));
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { resumes } = useSavedResumes();
  // Resumes matching the current company/job title rank first; all remain selectable.
  const rankedResumes = rankSavedResumes(
    resumes,
    form.company,
    form.role,
  );

  const set = (field: keyof JobFormValue, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleResumeSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = rankedResumes.find((r) => r.id === id);
    setForm((prev) => ({
      ...prev,
      savedResumeId: selected ? selected.id : undefined,
      savedResumeNameSnapshot: selected ? selected.name : undefined,
      resumeUsed: selected ? selected.name : prev.resumeUsed,
    }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, attachmentName: file.name, attachment: file }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateJobForm({
      company: form.company,
      role: form.role,
      dateApplied: form.dateApplied,
    });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onSave(form);
  };

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-accent-applied focus:ring-2 focus:ring-accent-applied/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500';
  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400';
  const errCls = 'mt-1 text-xs text-red-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={job ? 'Edit job' : 'Add job'}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {job ? 'Edit Job' : 'Add Job'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="company">Company name *</label>
            <input
              id="company"
              className={inputCls}
              value={form.company}
              onChange={(e) => set('company', e.target.value)}
              placeholder="Acme Corp"
            />
            {errors.company && <p className={errCls}>{errors.company}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="role">Job title / role *</label>
            <input
              id="role"
              className={inputCls}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              placeholder="Senior Software Engineer"
            />
            {errors.role && <p className={errCls}>{errors.role}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="status">Status</label>
              <select
                id="status"
                className={inputCls}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="dateApplied">Date applied</label>
              <input
                id="dateApplied"
                type="date"
                className={inputCls}
                value={form.dateApplied}
                onChange={(e) => set('dateApplied', e.target.value)}
              />
              {errors.dateApplied && (
                <p className={errCls}>{errors.dateApplied}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="resumeUsed">Resume used</label>
              <select
                id="resumeUsed"
                className={inputCls}
                value={form.savedResumeId ?? ''}
                onChange={handleResumeSelect}
              >
                <option value="">Select a resume</option>
                {rankedResumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {savedResumeLabel(r)}
                  </option>
                ))}
                {/* Legacy plain-text value stays selectable for old records. */}
                {form.resumeUsed &&
                  !rankedResumes.some((r) => r.name === form.resumeUsed) && (
                    <option value="" disabled>
                      {form.resumeUsed} (legacy)
                    </option>
                  )}
              </select>
              {form.resumeUsed &&
                !rankedResumes.some((r) => r.name === form.resumeUsed) && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Keeping legacy resume name: {form.resumeUsed}
                  </p>
                )}
            </div>
            <div>
              <label className={labelCls} htmlFor="salary">Salary range</label>
              <input
                id="salary"
                className={inputCls}
                value={form.salary}
                onChange={(e) => set('salary', e.target.value)}
                placeholder="₹25-30 LPA or $150-180K"
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="linkedinUrl">LinkedIn job URL</label>
            <input
              id="linkedinUrl"
              type="url"
              className={inputCls}
              value={form.linkedinUrl}
              onChange={(e) => set('linkedinUrl', e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              className={inputCls}
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Recruiter name, referral info, etc."
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="attachment">Attachment</label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="attachment"
                className={`${inputCls} cursor-pointer text-center ${form.attachmentName ? 'border-accent-follow-up' : ''}`}
              >
                <span className={form.attachmentName ? 'text-accent-follow-up' : ''}>
                  {form.attachmentName || 'Choose a file…'}
                </span>
              </label>
              <input
                id="attachment"
                type="file"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          </div>

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
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${STATUS_BG[form.status]}`}
            >
              {job ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}