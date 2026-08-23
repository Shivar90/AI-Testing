// Hook that loads and manages the saved-resume library.

import { useCallback, useEffect, useState } from 'react';
import {
  archiveSavedResume,
  getAllSavedResumes,
  getJobsLinkedToResume,
  hardDeleteSavedResume,
} from '../services/resumeLibraryDb';
import type { SavedResume } from '../types';

export function useSavedResumes() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const all = await getAllSavedResumes();
      setResumes(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const removeResume = useCallback(
    async (id: string): Promise<{ ok: boolean; linkedJobs: number; message?: string }> => {
      const linked = await getJobsLinkedToResume(id);
      if (linked.length > 0) {
        // Linked: soft archive instead of hard delete.
        await archiveSavedResume(id);
        await refresh();
        return {
          ok: true,
          linkedJobs: linked.length,
          message: `Resume archived — it is linked to ${linked.length} job application(s).`,
        };
      }
      await hardDeleteSavedResume(id);
      await refresh();
      return { ok: true, linkedJobs: 0, message: 'Resume deleted.' };
    },
    [refresh],
  );

  return { resumes, loading, refresh, removeResume };
}
