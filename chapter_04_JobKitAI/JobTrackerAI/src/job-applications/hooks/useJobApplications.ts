// Data hook: owns loading jobs from IndexedDB and serialising every CRUD
// mutation to it ("All CRUD operations persist instantly to IndexedDB").

import { useCallback, useEffect, useState } from 'react';
import {
  deleteJob,
  getAllJobs,
  putJob,
  replaceAllJobs,
} from '../services/jobTrackerDb';
import type { JobApplication } from '../types';
import { generateId } from '../utils';

export interface CreateJobInput {
  company: string;
  role: string;
  linkedinUrl?: string;
  resumeUsed?: string;
  savedResumeId?: string;
  evaluationId?: string;
  savedResumeNameSnapshot?: string;
  dateApplied: string;
  salary?: string;
  notes?: string;
  status: JobApplication['status'];
  attachmentName?: string;
  attachment?: Blob;
}

export function useJobApplications() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const all = await getAllJobs();
      setJobs(all);
    } catch (err) {
      setError('Failed to load jobs from IndexedDB.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addJob = useCallback(
    async (input: CreateJobInput): Promise<void> => {
      const job: JobApplication = {
        ...input,
        id: generateId(),
        createdAt: Date.now(),
      };
      await putJob(job);
      setJobs((prev) => [...prev, job]);
    },
    [],
  );

  const updateJob = useCallback(async (job: JobApplication): Promise<void> => {
    await putJob(job);
    setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
  }, []);

  const removeJob = useCallback(async (id: string): Promise<void> => {
    await deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const moveJob = useCallback(
    async (id: string, status: JobApplication['status']): Promise<void> => {
      const existing = jobs.find((j) => j.id === id);
      if (!existing) return;
      if (existing.status === status) return;
      await updateJob({ ...existing, status });
    },
    [jobs, updateJob],
  );

  const restoreAll = useCallback(
    async (all: JobApplication[]): Promise<void> => {
      await replaceAllJobs(all);
      setJobs(all);
    },
    [],
  );

  return {
    jobs,
    loading,
    error,
    addJob,
    updateJob,
    removeJob,
    moveJob,
    restoreAll,
  };
}