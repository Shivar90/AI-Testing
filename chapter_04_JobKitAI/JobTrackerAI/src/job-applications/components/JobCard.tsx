// Individual job card — shows company, role, resume tag, time/date since
// applied, clickable LinkedIn link, salary, attachment, plus edit/delete
// actions. Renders with a left-border accent per status (screenshot).

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { STATUS_ACCENTS } from '../types/constants';
import type { JobApplication } from '../types';
import { isValidHttpUrl, timeAgo } from '../utils';
import { getSavedResume } from '../../resume-library/services/resumeLibraryDb';
import {
  CalendarIcon,
  DollarIcon,
  EditIcon,
  LinkIcon,
  PaperclipIcon,
  TrashIcon,
} from '../../components/Icons';

interface JobCardProps {
  job: JobApplication;
  onEdit: () => void;
  onDelete: () => void;
  /** Called when the card's "Open linked evaluation" action is clicked. */
  onOpenEvaluation?: (evaluationId: string) => void;
}

export function JobCard({ job, onEdit, onDelete, onOpenEvaluation }: JobCardProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const linkedinHref = isValidHttpUrl(job.linkedinUrl)
    ? job.linkedinUrl
    : undefined;

  // Resume tag: prefer the saved-resume snapshot, fall back to legacy text.
  const resumeName = job.savedResumeNameSnapshot ?? job.resumeUsed;

  const handleDownloadResume = async () => {
    setDownloadError(null);
    if (!job.savedResumeId) return;
    try {
      const saved = await getSavedResume(job.savedResumeId);
      if (!saved) {
        setDownloadError('Saved resume file is no longer available.');
        return;
      }
      const url = URL.createObjectURL(saved.fileBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = saved.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError('Could not download the saved resume.');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-xl bg-white shadow-sm ring-1 ring-gray-200 active:cursor-grabbing dark:bg-gray-800 dark:ring-gray-700 ${STATUS_ACCENTS[job.status]} border-l-4`}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {job.company}
              </h3>
              {linkedinHref && (
                <a
                  href={linkedinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 text-accent-applied hover:text-accent-applied/70"
                  aria-label="Open LinkedIn job"
                  title="Open LinkedIn job"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {job.role}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              aria-label="Edit job"
              title="Edit"
            >
              <EditIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              aria-label="Delete job"
              title="Delete"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          {job.dateApplied && (
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              {timeAgo(job.dateApplied)}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1">
              <DollarIcon className="h-3.5 w-3.5" />
              {job.salary}
            </span>
          )}
        </div>

        {(resumeName || job.attachmentName) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {resumeName && (
              <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <span className="truncate">{resumeName}</span>
                {job.savedResumeId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDownloadResume();
                    }}
                    className="shrink-0 rounded px-0.5 text-accent-applied hover:underline"
                    aria-label="Download saved resume"
                    title="Download resume"
                  >
                    ⤓
                  </button>
                )}
              </span>
            )}
            {job.attachmentName && (
              <span className="inline-flex max-w-full items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <PaperclipIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{job.attachmentName}</span>
              </span>
            )}
            {job.evaluationId && onOpenEvaluation && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEvaluation(job.evaluationId!);
                }}
                className="shrink-0 text-[11px] font-medium text-accent-applied hover:underline"
                title="Open linked evaluation"
              >
                Open evaluation
              </button>
            )}
          </div>
        )}
        {downloadError && (
          <p className="mt-1 text-[11px] text-red-500">{downloadError}</p>
        )}
      </div>
    </div>
  );
}