// Data hook for the Evaluate a Job domain: loads stored evaluations from
// IndexedDB and serialises new evaluations to it.

import { useCallback, useEffect, useState } from 'react';
import { evaluateWithEngine } from '../services/analysis';
import {
  deleteEvaluation,
  getAllEvaluations,
  getEvaluation,
  putEvaluation,
  type StoredEvaluation,
} from '../services/evaluationDb';
import type { EvaluationSettings, EvaluateJobInput } from '../types';

/** Stable unique id (same strategy as the job-applications domain). */
function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<StoredEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const all = await getAllEvaluations();
      setEvaluations(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runEvaluation = useCallback(
    async (
      settings: EvaluationSettings,
      input: EvaluateJobInput,
    ): Promise<StoredEvaluation> => {
      const result = await evaluateWithEngine(settings, input);
      const evaluation: StoredEvaluation = {
        id: generateId(),
        company: input.company.trim(),
        designation: input.designation.trim(),
        jobDescription: input.jobDescription,
        resumeText: input.resumeText,
        result,
        createdAt: Date.now(),
      };
      await putEvaluation(evaluation);
      setEvaluations((prev) => [evaluation, ...prev]);
      return evaluation;
    },
    [],
  );

  const removeEvaluation = useCallback(async (id: string): Promise<void> => {
    await deleteEvaluation(id);
    setEvaluations((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getStoredEvaluation = useCallback(
    (id: string) => getEvaluation(id),
    [],
  );

  return {
    evaluations,
    loading,
    runEvaluation,
    removeEvaluation,
    getStoredEvaluation,
  };
}
