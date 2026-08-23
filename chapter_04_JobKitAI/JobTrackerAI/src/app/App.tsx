// App shell — owns header, theme, search, CRUD modal state, the board, and
// page routing. Two pages today: the board and the "Evaluate a Job" page
// (Requirements.md). Routing is a lightweight tab switch inside the header so
// the job-applications domain stays untouched by the evaluate-job domain.

import { useCallback, useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { JobBoard } from '../job-applications/components/JobBoard';
import { JobFormModal } from '../job-applications/components/JobFormModal';
import { DeleteConfirmModal } from '../job-applications/components/DeleteConfirmModal';
import { EvaluateJobPage } from '../evaluate-job/components/EvaluateJobPage';
import { useJobApplications } from '../job-applications/hooks/useJobApplications';
import type { JobApplication, Status } from '../job-applications/types';
import { downloadBackup, parseBackupFile } from '../utils/exportImport';

type Page = 'board' | 'evaluate';

type ModalState =
  | { kind: 'none' }
  | {
      kind: 'add';
      status?: Status;
      initialSavedResume?: { id: string; name: string };
      evaluationId?: string;
    }
  | { kind: 'edit'; job: JobApplication }
  | { kind: 'delete'; job: JobApplication };

type Theme = 'light' | 'dark';

export default function App() {
  const { jobs, loading, error, addJob, updateJob, removeJob, moveJob, restoreAll } =
    useJobApplications();
  const [page, setPage] = useState<Page>('board');
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('job-tracker-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [importError, setImportError] = useState<string | null>(null);
  const [openEvaluationId, setOpenEvaluationId] = useState<string | null>(null);

  const handleOpenEvaluation = useCallback((evaluationId: string) => {
    setOpenEvaluationId(evaluationId);
    setPage('evaluate');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('job-tracker-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );

  const handleExport = useCallback(async () => {
    const { getAllSavedResumeMeta } = await import(
      '../resume-library/services/resumeLibraryDb'
    );
    const savedResumes = await getAllSavedResumeMeta();
    downloadBackup(jobs, savedResumes);
  }, [jobs]);

  const handleImport = useCallback(
    async (file: File) => {
      setImportError(null);
      try {
        const parsed = await parseBackupFile(file);
        await restoreAll(parsed.jobs);
        if (parsed.savedResumes) {
          const { replaceAllSavedResumeMeta } = await import(
            '../resume-library/services/resumeLibraryDb'
          );
          await replaceAllSavedResumeMeta(parsed.savedResumes);
        }
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed.');
      }
    },
    [restoreAll],
  );

  const handleSave = useCallback(
    async (value: {
      company: string;
      role: string;
      linkedinUrl: string;
      resumeUsed: string;
      savedResumeId?: string;
      savedResumeNameSnapshot?: string;
      dateApplied: string;
      salary: string;
      notes: string;
      status: Status;
      attachmentName: string;
      attachment?: Blob;
    }) => {
      if (modal.kind === 'edit') {
        const { attachmentName, attachment, ...rest } = value;
        const job: JobApplication = {
          ...rest,
          id: modal.job.id,
          createdAt: modal.job.createdAt,
          attachmentName: attachmentName || modal.job.attachmentName,
          attachment: attachment ?? modal.job.attachment,
        };
        await updateJob(job);
      } else if (modal.kind === 'add') {
        await addJob({
          ...value,
          status: value.status,
          evaluationId: modal.evaluationId,
        });
      }
      setModal({ kind: 'none' });
    },
    [modal, updateJob, addJob],
  );

  const handleMove = useCallback(
    (id: string, status: Status) => void moveJob(id, status),
    [moveJob],
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-100">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        search={search}
        onSearch={setSearch}
        onAddJob={() => setModal({ kind: 'add' })}
        onExport={handleExport}
        onImport={handleImport}
        importError={importError}
        onDismissImportError={() => setImportError(null)}
        activePage={page}
        onNavigate={(nextPage) => {
          setPage(nextPage);
          if (nextPage !== 'evaluate') setOpenEvaluationId(null);
        }}
      />

      <main className="flex-1 overflow-hidden">
        {page === 'evaluate' ? (
          <EvaluateJobPage
            openEvaluationId={openEvaluationId}
            onCreateJobApplication={({ savedResume }) => {
              setModal({
                kind: 'add',
                status: 'applied',
                initialSavedResume: { id: savedResume.id, name: savedResume.name },
                evaluationId: savedResume.evaluationId,
              });
              setPage('board');
            }}
          />
        ) : loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading jobs…
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-red-500">
            {error}
          </div>
        ) : (
          <JobBoard
            jobs={jobs}
            search={search}
            onMove={handleMove}
            onEdit={(job) => setModal({ kind: 'edit', job })}
            onDelete={(job) => setModal({ kind: 'delete', job })}
            onOpenEvaluation={handleOpenEvaluation}
          />
        )}
      </main>

      {modal.kind === 'add' && (
        <JobFormModal
          initialStatus={modal.status ?? 'wishlist'}
          initialSavedResume={modal.initialSavedResume}
          onSave={handleSave}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}
      {modal.kind === 'edit' && (
        <JobFormModal
          job={modal.job}
          onSave={handleSave}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}
      {modal.kind === 'delete' && (
        <DeleteConfirmModal
          company={modal.job.company}
          onConfirm={() => void removeJob(modal.job.id).then(() => setModal({ kind: 'none' }))}
          onCancel={() => setModal({ kind: 'none' })}
        />
      )}
    </div>
  );
}