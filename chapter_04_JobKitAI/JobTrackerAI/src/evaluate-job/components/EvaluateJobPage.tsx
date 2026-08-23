// Evaluate a Job page — Requirements.md "Evaluate Job board":
//   - Company Name field, Designation field, Job description textarea
//   - Submit button
//   - After resume is submitted, display strength and gaps for the JD
// The engine (Dictionary / Groq / Ollama) is chosen via the gear icon on the
// right; Groq is the default. Past evaluations are stored in IndexedDB and
// listed below the form.

import { useState, type FormEvent, useEffect } from 'react';
import { evaluateWithEngine } from '../services/analysis';
import { useEvaluations } from '../hooks/useEvaluations';
import { useEvaluationSettings } from '../hooks/useEvaluationSettings';
import { useResume } from '../hooks/useResume';
import { ENGINE_LABELS } from '../services/settings';
import type { EvaluationResult } from '../types';
import { validateEvaluateJobInput, type EvaluateJobValidationErrors } from '../validators';
import { EvaluationSettingsModal } from './EvaluationSettingsModal';
import { SaveTailoredResumeModal } from '../../resume-library/components/SaveTailoredResumeModal';
import { ResumeLibraryModal } from '../../resume-library/components/ResumeLibraryModal';
import type { SavedResume } from '../../resume-library/types';
import { GearIcon, XIcon } from '../../components/Icons';

interface EvaluateJobPageProps {
  /** Opened by the app when a job card links to an evaluation. */
  openEvaluationId?: string | null;
  /** Called after saving a tailored resume + choosing "Create Job Application". */
  onCreateJobApplication?: (info: { savedResume: SavedResume }) => void;
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-accent-applied focus:ring-2 focus:ring-accent-applied/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500';
const labelCls =
  'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400';
const errCls = 'mt-1 text-xs text-red-500';

export function EvaluateJobPage({
  openEvaluationId,
  onCreateJobApplication,
}: EvaluateJobPageProps) {
  const { evaluations, loading, runEvaluation, removeEvaluation, getStoredEvaluation } =
    useEvaluations();
  const { settings, updateSettings } = useEvaluationSettings();
  const { resume, handleResumeUploaded } = useResume();

  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [errors, setErrors] = useState<EvaluateJobValidationErrors>({});
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastEvaluationId, setLastEvaluationId] = useState<string | null>(null);
  const [evaluationDate, setEvaluationDate] = useState<string>(() =>
    new Date().toISOString(),
  );
  const [showSaveTailored, setShowSaveTailored] = useState(false);
  const [savedResume, setSavedResume] = useState<SavedResume | null>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showResumeLibrary, setShowResumeLibrary] = useState(false);

  // Prefill the resume textarea from the last uploaded resume.
  useEffect(() => {
    if (resume) setResumeText(resume.text);
  }, [resume]);

  // When opened from a job card's "Open linked evaluation", load it.
  useEffect(() => {
    if (!openEvaluationId) return;
    void getStoredEvaluation(openEvaluationId).then((stored) => {
      if (!stored) return;
      setCompany(stored.company);
      setDesignation(stored.designation);
      setJobDescription(stored.jobDescription);
      setResumeText(stored.resumeText);
      setResult(stored.result);
      setLastEvaluationId(stored.id);
      setEvaluationDate(new Date(stored.createdAt).toISOString());
    });
  }, [openEvaluationId, getStoredEvaluation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateEvaluateJobInput({
      company,
      designation,
      jobDescription,
    });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    // A resume (uploaded via the gear icon) is required for evaluation.
    if (!resumeText.trim()) {
      setResumeError(
        'Upload a resume (PDF/DOCX) via the gear icon before evaluating.',
      );
      return;
    }
    setResumeError(null);

    setRunning(true);
    setRunError(null);
    try {
      const computed = await evaluateWithEngine(settings, {
        company,
        designation,
        jobDescription,
        resumeText,
      });
      setResult(computed);
      const stored = await runEvaluation(settings, {
        company,
        designation,
        jobDescription,
        resumeText,
      });
      setLastEvaluationId(stored.id);
      setEvaluationDate(new Date(stored.createdAt).toISOString());
      setSavedResume(null);
      setShowCreateJob(false);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Evaluation failed.');
    } finally {
      setRunning(false);
    }
  };

  const totalRequirements =
    (result?.strengths.length ?? 0) + (result?.gaps.length ?? 0);

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Job Fit Analysis
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Compare a job description against your resume to see how well it
            fits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Evaluation engine settings"
          title={`Engine: ${ENGINE_LABELS[settings.engine]} — settings`}
        >
          <GearIcon className="h-5 w-5" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="eval-company">
              Company Name *
            </label>
            <input
              id="eval-company"
              className={inputCls}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp"
            />
            {errors.company && <p className={errCls}>{errors.company}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="eval-designation">
              Designation *
            </label>
            <input
              id="eval-designation"
              className={inputCls}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Senior Software Engineer"
            />
            {errors.designation && (
              <p className={errCls}>{errors.designation}</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="eval-jd">
            Job description *
          </label>
          <textarea
            id="eval-jd"
            className={inputCls}
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here (LinkedIn / other platforms)..."
          />
          {errors.jobDescription && (
            <p className={errCls}>{errors.jobDescription}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className={labelCls}>Resume</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResumeLibrary(true)}
                className="text-xs font-medium text-accent-applied hover:underline"
              >
                Manage saved resumes
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="text-xs font-medium text-accent-applied hover:underline"
              >
                {resume ? 'Upload a new one' : 'Upload resume'}
              </button>
            </div>
          </div>
          {resume ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {resume.fileName}
              </p>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs text-gray-400 dark:text-gray-500">
                  Preview extracted text
                </summary>
                <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-gray-500 dark:text-gray-400">
                  {resumeText}
                </p>
              </details>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-400 dark:border-gray-600 dark:text-gray-500">
              No resume uploaded yet. Upload a PDF or DOCX via the gear icon.
            </p>
          )}
          {resumeError && <p className={errCls}>{resumeError}</p>}
        </div>

        <div className="flex items-center justify-end gap-3">
          {running && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Analyzing…
            </span>
          )}
          <button
            type="submit"
            disabled={running}
            className="rounded-lg bg-accent-applied px-5 py-2 text-sm font-medium text-white hover:bg-accent-applied/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? 'Analyzing…' : 'Job Match'}
          </button>
        </div>
      </form>

      {runError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {runError}
        </p>
      )}

      {result && (
        <section className="mt-6">
          <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
            Evaluated with: {ENGINE_LABELS[settings.engine]}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Strengths
              <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                {result.strengths.length}
              </span>
            </h3>
            {result.strengths.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
                No strengths matched.
              </p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {result.strengths.map((s) => (
                  <li
                    key={s.keyword}
                    className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400"
                  >
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Gaps
              <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {result.gaps.length}
              </span>
            </h3>
            {result.gaps.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
                No gaps found.
              </p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {result.gaps.map((g) => (
                  <li
                    key={g.keyword}
                    className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400"
                  >
                    {g.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          </div>
        </section>
      )}

      {result && lastEvaluationId && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {savedResume ? (
            <>
              <p className="text-sm text-green-700 dark:text-green-400">
                ✓ Saved resume “{savedResume.name}” to your library.
              </p>
              {!showCreateJob && onCreateJobApplication && (
                <button
                  type="button"
                  onClick={() => setShowCreateJob(true)}
                  className="rounded-lg bg-accent-applied px-4 py-2 text-sm font-medium text-white hover:bg-accent-applied/90"
                >
                  Create Job Application
                </button>
              )}
              {showCreateJob && onCreateJobApplication && (
                <button
                  type="button"
                  onClick={() => onCreateJobApplication({ savedResume })}
                  className="rounded-lg bg-accent-applied px-4 py-2 text-sm font-medium text-white hover:bg-accent-applied/90"
                >
                  Open Add Job form
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowSaveTailored(true)}
              className="rounded-lg border border-accent-applied px-4 py-2 text-sm font-medium text-accent-applied hover:bg-accent-applied/10"
            >
              Save tailored resume for this evaluation
            </button>
          )}
        </div>
      )}

      {result && totalRequirements === 0 && (
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          No common skill keywords were detected in the job description. Try a
          more detailed JD for richer analysis.
        </p>
      )}

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Past evaluations
        </h3>
        {loading ? (
          <p className="mt-2 text-sm text-gray-400">Loading…</p>
        ) : evaluations.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            No evaluations yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {evaluations.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {e.company} — {e.designation}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(e.createdAt).toLocaleString()} ·{' '}
                    {e.result.strengths.length} strengths,{' '}
                    {e.result.gaps.length} gaps
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeEvaluation(e.id)}
                  className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  aria-label="Delete evaluation"
                  title="Delete"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showSettings && (
        <EvaluationSettingsModal
          settings={settings}
          resume={resume}
          onSave={(next) => {
            updateSettings(next);
            setShowSettings(false);
          }}
          onResumeUploaded={handleResumeUploaded}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showSaveTailored && lastEvaluationId && (
        <SaveTailoredResumeModal
          company={company}
          designation={designation}
          evaluationDate={evaluationDate}
          evaluationId={lastEvaluationId}
          onSaved={(saved) => {
            setSavedResume(saved);
            setShowSaveTailored(false);
          }}
          onClose={() => setShowSaveTailored(false)}
        />
      )}

      {showResumeLibrary && (
        <ResumeLibraryModal onClose={() => setShowResumeLibrary(false)} />
      )}
    </div>
  );
}
