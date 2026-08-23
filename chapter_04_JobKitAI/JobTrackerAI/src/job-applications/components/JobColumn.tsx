// A single Kanban column — header with title + count, independently scrollable
// list, and a drop target for drag-and-drop (Requirements.md + screenshot).

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { STATUS_BG, STATUS_LABELS } from '../types/constants';
import type { JobApplication, Status } from '../types';
import { JobCard } from './JobCard';

interface JobColumnProps {
  status: Status;
  jobs: JobApplication[];
  columnCount: number;
  onEdit: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
  onOpenEvaluation?: (evaluationId: string) => void;
}

export function JobColumn({
  status,
  jobs,
  columnCount,
  onEdit,
  onDelete,
  onOpenEvaluation,
}: JobColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-0 w-72 shrink-0 flex-col rounded-2xl bg-gray-100/80 p-2 dark:bg-gray-800/50 ${
        isOver ? 'ring-2 ring-accent-applied/60' : ''
      }`}
    >
      <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_BG[status]}`} />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {STATUS_LABELS[status]}
        </h2>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {columnCount}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-0.5 pb-1">
        <SortableContext
          items={jobs.map((j) => j.id)}
          strategy={verticalListSortingStrategy}
        >
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => onEdit(job)}
              onDelete={() => onDelete(job)}
              onOpenEvaluation={onOpenEvaluation}
            />
          ))}
          {jobs.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
              Drop jobs here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}