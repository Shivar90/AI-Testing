// IndexedDB persistence for the Evaluate a Job feature.
// Requirements.md: "All data must persist in the browser using IndexedDB".
// Evaluation submissions (company, designation, JD, resume text, and the
// computed result) are stored per submission so a user can return to a
// previous evaluation. Resume text is stored locally only — it never leaves
// the browser. Uses the shared DB connection (src/services/db.ts).

import { EVALUATION_STORE } from '../../config/config';
import { getDb } from '../../services/db';
import type { EvaluationResult } from '../types';

export interface StoredEvaluation {
  id: string;
  company: string;
  designation: string;
  jobDescription: string;
  resumeText: string;
  result: EvaluationResult;
  createdAt: number;
}

export async function getAllEvaluations(): Promise<StoredEvaluation[]> {
  const db = await getDb();
  const all = await db.getAll(EVALUATION_STORE);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getEvaluation(
  id: string,
): Promise<StoredEvaluation | undefined> {
  const db = await getDb();
  return db.get(EVALUATION_STORE, id);
}

export async function putEvaluation(
  evaluation: StoredEvaluation,
): Promise<void> {
  const db = await getDb();
  await db.put(EVALUATION_STORE, evaluation);
}

export async function deleteEvaluation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(EVALUATION_STORE, id);
}
