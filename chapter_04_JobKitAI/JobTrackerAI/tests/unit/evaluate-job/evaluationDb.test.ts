// @vitest-environment jsdom
// Tests for evaluation persistence in IndexedDB via the shared DB.

import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import {
  deleteEvaluation,
  getAllEvaluations,
  putEvaluation,
  type StoredEvaluation,
} from '../../../src/evaluate-job/services/evaluationDb';

function makeEvaluation(overrides: Partial<StoredEvaluation> = {}): StoredEvaluation {
  return {
    id: 'e1',
    company: 'Acme',
    designation: 'Engineer',
    jobDescription: 'JD',
    resumeText: 'Resume',
    result: {
      strengths: [{ keyword: 'python', label: 'Python' }],
      gaps: [],
      unresolvedCount: 0,
      basis: 'groq',
    },
    createdAt: 1000,
    ...overrides,
  };
}

describe('evaluationDb (shared DB)', () => {
  it('stores, lists and deletes evaluations', async () => {
    await deleteEvaluation('e1');
    await putEvaluation(makeEvaluation({ id: 'e1', createdAt: 1000 }));
    await putEvaluation(makeEvaluation({ id: 'e2', createdAt: 2000 }));
    const all = await getAllEvaluations();
    // Newest first.
    expect(all.map((e) => e.id)).toEqual(['e2', 'e1']);
    await deleteEvaluation('e1');
    await deleteEvaluation('e2');
    expect(await getAllEvaluations()).toHaveLength(0);
  });

  it('preserves the evaluation result shape', async () => {
    await deleteEvaluation('e1');
    await putEvaluation(makeEvaluation({ id: 'e1' }));
    const [stored] = await getAllEvaluations();
    expect(stored.result.strengths[0].keyword).toBe('python');
    expect(stored.result.basis).toBe('groq');
  });
});
