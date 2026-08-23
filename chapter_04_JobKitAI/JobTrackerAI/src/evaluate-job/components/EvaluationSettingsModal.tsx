// Engine settings modal for the Evaluate a Job page (opened from the gear
// icon). Lets the user pick which engine evaluates a resume against a JD,
// configure that engine (Groq key/model, Ollama URL/model), and upload the
// resume file (PDF/DOCX) whose text is used for evaluation.

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ENGINE_LABELS } from '../services/settings';
import { extractResumeText } from '../services/resumeExtractor';
import { putResume } from '../services/resumeStorage';
import {
  buildSavedResume,
  isDuplicateSavedResume,
  putSavedResume,
} from '../../resume-library/services/resumeLibraryDb';
import type { EngineKind, EvaluationSettings, StoredResume } from '../types';
import type { SavedResume } from '../../resume-library/types';
import { XIcon } from '../../components/Icons';

interface EvaluationSettingsModalProps {
  settings: EvaluationSettings;
  resume: StoredResume | null;
  onSave: (settings: EvaluationSettings) => void;
  onResumeUploaded: (resume: StoredResume) => void;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-accent-applied focus:ring-2 focus:ring-accent-applied/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500';
const labelCls =
  'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400';

const ENGINES: EngineKind[] = ['dictionary', 'groq', 'ollama'];

export function EvaluationSettingsModal({
  settings,
  resume,
  onSave,
  onResumeUploaded,
  onClose,
}: EvaluationSettingsModalProps) {
  const [form, setForm] = useState<EvaluationSettings>({ ...settings });
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof EvaluationSettings>(key: K, value: EvaluationSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleResumeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResumeError(null);
    try {
      const text = await extractResumeText(file);
      const stored: StoredResume = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        fileName: file.name,
        text,
        uploadedAt: Date.now(),
      };
      await putResume(stored);
      onResumeUploaded(stored);

      // Also add the file to the resume library so it appears in the
      // Add/Edit Job "Resume used" dropdown (user guide: "Resume used — pick
      // from your saved resume library").
      const dup = await isDuplicateSavedResume({
        fileName: file.name,
        // no evaluationId -> library-wide dedupe on same file name
      });
      if (!dup) {
        const fileType = file.type as SavedResume['fileType'];
        const saved = buildSavedResume({
          name: file.name.replace(/\.[^.]+$/, ''),
          fileName: file.name,
          fileType,
          fileSize: file.size,
          fileBlob: file,
          notes: 'Uploaded from Job Match',
        });
        await putSavedResume(saved);
      }
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      engine: form.engine,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Evaluation engine settings"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Evaluation Settings
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="eval-engine">Engine</label>
            <select
              id="eval-engine"
              className={inputCls}
              value={form.engine}
              onChange={(e) => set('engine', e.target.value as EngineKind)}
            >
              {ENGINES.map((engine) => (
                <option key={engine} value={engine}>
                  {ENGINE_LABELS[engine]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {form.engine === 'dictionary' &&
                'Offline keyword matching — no API key, no network.'}
              {form.engine === 'groq' &&
                'Cloud LLM via Groq. Sends the JD and resume to the Groq API.'}
              {form.engine === 'ollama' &&
                'Local LLM via Ollama. Keep Ollama running on this machine.'}
            </p>
          </div>

          {form.engine === 'groq' && (
            <>
              <div>
                <label className={labelCls} htmlFor="eval-groq-key">
                  Groq API key
                </label>
                <input
                  id="eval-groq-key"
                  type="password"
                  className={inputCls}
                  value={form.groqApiKey}
                  onChange={(e) => set('groqApiKey', e.target.value)}
                  placeholder="gsk_..."
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="eval-groq-model">
                  Groq model
                </label>
                <input
                  id="eval-groq-model"
                  className={inputCls}
                  value={form.groqModel}
                  onChange={(e) => set('groqModel', e.target.value)}
                  placeholder="llama-3.3-70b-versatile"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="eval-groq-proxy"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-accent-applied focus:ring-accent-applied/20"
                  checked={form.groqUseProxy}
                  onChange={(e) => set('groqUseProxy', e.target.checked)}
                />
                <label
                  htmlFor="eval-groq-proxy"
                  className="text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Use secure server-side proxy (recommended for Vercel — key is
                  never sent to the browser)
                </label>
              </div>
            </>
          )}

          {form.engine === 'ollama' && (
            <>
              <div>
                <label className={labelCls} htmlFor="eval-ollama-url">
                  Ollama URL
                </label>
                <input
                  id="eval-ollama-url"
                  type="url"
                  className={inputCls}
                  value={form.ollamaUrl}
                  onChange={(e) => set('ollamaUrl', e.target.value)}
                  placeholder="http://localhost:11434/v1/chat/completions"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="eval-ollama-model">
                  Ollama model
                </label>
                <input
                  id="eval-ollama-model"
                  className={inputCls}
                  value={form.ollamaModel}
                  onChange={(e) => set('ollamaModel', e.target.value)}
                  placeholder="llama3.2"
                />
              </div>
            </>
          )}

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className={labelCls} htmlFor="eval-resume-upload">
                Resume file (PDF or DOCX)
              </label>
              {resume && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Current: {resume.fileName}
                </span>
              )}
            </div>
            <label
              htmlFor="eval-resume-upload"
              className={`${inputCls} mt-1 cursor-pointer text-center ${
                uploading ? 'opacity-60' : ''
              }`}
            >
              <span>
                {uploading
                  ? 'Reading file…'
                  : resume
                    ? 'Replace resume file'
                    : 'Choose a resume file…'}
              </span>
            </label>
            <input
              id="eval-resume-upload"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleResumeFile}
              disabled={uploading}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              The file is read on this device and its text is used for
              evaluation.
            </p>
            {resumeError && (
              <p className="mt-1 text-xs text-red-500">{resumeError}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-applied px-4 py-2 text-sm font-medium text-white hover:bg-accent-applied/90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
