// Resume Library management modal — lists saved resumes with view/download,
// archive and delete actions. Deleting a resume linked to jobs archives it
// instead (workflow doc: never silently delete; keep job history intact).

import { useEffect, useState } from 'react';
import {
  getJobsLinkedToResume,
  getSavedResume,
} from '../services/resumeLibraryDb';
import { useSavedResumes } from '../hooks/useSavedResumes';
import { savedResumeLabel } from '../utils';
import type { SavedResume } from '../types';
import { XIcon } from '../../components/Icons';

interface ResumeLibraryModalProps {
  onClose: () => void;
}

export function ResumeLibraryModal({ onClose }: ResumeLibraryModalProps) {
  const { resumes, loading, removeResume } = useSavedResumes();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [linkedInfo, setLinkedInfo] = useState<{
    id: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!confirmId) return;
    void getJobsLinkedToResume(confirmId).then((jobs) =>
      setLinkedInfo({ id: confirmId, count: jobs.length }),
    );
  }, [confirmId]);

  const handleDownload = async (resume: SavedResume) => {
    const saved = await getSavedResume(resume.id);
    if (!saved) return;
    const url = URL.createObjectURL(saved.fileBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = saved.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleRemove = async (id: string) => {
    const result = await removeResume(id);
    setMessage(result.message ?? null);
    setConfirmId(null);
    setLinkedInfo(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Resume library"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Resume Library
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {message && (
          <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-500/10 dark:text-green-400">
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : resumes.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No saved resumes yet. Save one from the Evaluate page.
          </p>
        ) : (
          <ul className="space-y-2">
            {resumes.map((r) => (
              <li
                key={r.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm dark:border-gray-700 ${
                  r.isArchived
                    ? 'opacity-60'
                    : 'border-gray-200 dark:bg-gray-800/50'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800 dark:text-gray-100">
                    {r.name}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                    {savedResumeLabel(r)}
                    {r.isArchived ? ' · archived' : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void handleDownload(r)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-accent-applied hover:bg-accent-applied/10"
                    title="Download"
                  >
                    Download
                  </button>
                  {confirmId === r.id ? (
                    <>
                      <span className="text-xs text-gray-500">
                        {linkedInfo && linkedInfo.count > 0
                          ? `Linked to ${linkedInfo.count} job(s) — this will archive it.`
                          : 'Delete permanently?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleRemove(r.id)}
                        className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmId(null);
                          setLinkedInfo(null);
                        }}
                        className="rounded-md px-2 py-1 text-xs text-gray-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(r.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Delete or archive"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
