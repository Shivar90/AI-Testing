// Single shared IndexedDB connection for the whole application.
//
// WHY: the app previously had three separate modules (job applications,
// evaluations, resumes) each calling openDB() on the SAME database at the
// SAME version, but each only creating its own store in its own upgrade
// callback. IndexedDB only runs onupgradeneeded when the version changes, so
// whichever module opened the DB first "won" and the other stores were never
// created — leading to "One of the specified object stores was not found".
//
// This module opens the DB once and creates ALL stores in one upgrade
// handler. Bump DB_VERSION whenever a store/index is added or changed.

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import {
  DB_NAME,
  DB_VERSION,
  EVALUATION_STORE,
  JOB_STORE,
  RESUME_STORE,
  SAVED_RESUME_STORE,
} from '../config/config';
import type { JobApplication } from '../job-applications/types';
import type { StoredEvaluation } from '../evaluate-job/services/evaluationDb';
import type { StoredResume } from '../evaluate-job/types';
import type { SavedResume } from '../resume-library/types';

interface JobTrackerDB extends DBSchema {
  [JOB_STORE]: {
    key: string;
    value: JobApplication;
    indexes: { 'by-status': string };
  };
  [EVALUATION_STORE]: {
    key: string;
    value: StoredEvaluation;
    indexes: { 'by-created': number };
  };
  [RESUME_STORE]: {
    key: string;
    value: StoredResume;
    indexes: { 'by-uploaded': number };
  };
  [SAVED_RESUME_STORE]: {
    key: string;
    value: SavedResume;
    indexes: { 'by-created': string };
  };
}

let dbPromise: Promise<IDBPDatabase<JobTrackerDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<JobTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<JobTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(JOB_STORE)) {
          const store = db.createObjectStore(JOB_STORE, { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains(EVALUATION_STORE)) {
          const store = db.createObjectStore(EVALUATION_STORE, {
            keyPath: 'id',
          });
          store.createIndex('by-created', 'createdAt');
        }
        if (!db.objectStoreNames.contains(RESUME_STORE)) {
          const store = db.createObjectStore(RESUME_STORE, { keyPath: 'id' });
          store.createIndex('by-uploaded', 'uploadedAt');
        }
        if (!db.objectStoreNames.contains(SAVED_RESUME_STORE)) {
          const store = db.createObjectStore(SAVED_RESUME_STORE, {
            keyPath: 'id',
          });
          store.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}
