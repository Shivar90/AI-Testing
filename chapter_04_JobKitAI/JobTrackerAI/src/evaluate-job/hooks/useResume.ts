// Hook for the currently uploaded resume used on the Evaluate page.

import { useCallback, useEffect, useState } from 'react';
import { getLatestResume } from '../services/resumeStorage';
import type { StoredResume } from '../types';

export function useResume() {
  const [resume, setResume] = useState<StoredResume | null>(null);

  useEffect(() => {
    void getLatestResume().then((r) => setResume(r ?? null));
  }, []);

  const handleResumeUploaded = useCallback((next: StoredResume) => {
    setResume(next);
  }, []);

  return { resume, handleResumeUploaded };
}
