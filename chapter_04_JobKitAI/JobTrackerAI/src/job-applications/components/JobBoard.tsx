// The Kanban board — a horizontal row of six columns with drag-and-drop
// between them (Requirements.md: "Kanban Columns (drag-and-drop between
// them)" using @dnd-kit/core). Cards are filtered by the search term.

import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { COLUMNS } from '../types/constants';
import type { JobApplication, Status } from '../types';
import { JobCard } from './JobCard';
import { JobColumn } from './JobColumn';

interface JobBoardProps {
  jobs: JobApplication[];
  search: string;
  onMove: (id: string, status: Status) => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
  onOpenEvaluation?: (evaluationId: string) => void;
}

export function JobBoard({
  jobs,
  search,
  onMove,
  onEdit,
  onDelete,
  onOpenEvaluation,
}: JobBoardProps) {
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q),
    );
  }, [jobs, search]);

  const jobsByStatus = useMemo(() => {
    const map = new Map<Status, JobApplication[]>();
    for (const column of COLUMNS) map.set(column.id, []);
    for (const job of filtered) {
      map.get(job.status)?.push(job);
    }
    // Deterministic order by date applied (newest first) within a column.
    for (const column of COLUMNS) {
      const list = map.get(column.id)!;
      list.sort(
        (a, b) =>
          new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
      );
    }
    return map;
  }, [filtered]);

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    const job = jobs.find((j) => j.id === String(event.active.id));
    setActiveJob(job ?? null);
  }, [jobs]);

  const handleDragOver = useCallback(
    (event: {
      active: { id: string | number };
      over: { id: string | number } | null;
    }) => {
      const { active, over } = event;
      if (!over) return;
      const activeJob = jobs.find((j) => j.id === String(active.id));
      const targetColumn = COLUMNS.find((c) => c.id === String(over.id));
      if (!activeJob || !targetColumn) return;
      if (activeJob.status === targetColumn.id) return;
      onMove(activeJob.id, targetColumn.id);
    },
    [jobs, onMove],
  );

  const handleDragEnd = useCallback(() => {
    setActiveJob(null);
  }, []);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={COLUMNS.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto px-4 pb-4 pt-2">
            {COLUMNS.map((column) => (
              <JobColumn
                key={column.id}
                status={column.id}
                jobs={jobsByStatus.get(column.id) ?? []}
                columnCount={jobsByStatus.get(column.id)?.length ?? 0}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpenEvaluation={onOpenEvaluation}
              />
            ))}
          </div>
        </div>
      </SortableContext>
      <DragOverlay>
        {activeJob ? (
          <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}