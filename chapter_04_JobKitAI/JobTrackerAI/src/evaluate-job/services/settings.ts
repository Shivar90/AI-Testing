// Settings persistence for the Evaluate a Job engines.
// Stored in localStorage (the key/URLs are user preferences, not job data —
// job data itself stays in IndexedDB per Requirements.md).

import type { EngineKind, EvaluationSettings } from '../types';

export const SETTINGS_STORAGE_KEY = 'job-tracker-eval-settings';

export const ENGINE_LABELS: Record<EngineKind, string> = {
  dictionary: 'Dictionary (offline)',
  groq: 'Groq (cloud)',
  ollama: 'Ollama (local)',
};

export const DEFAULT_EVAL_SETTINGS: EvaluationSettings = {
  engine: 'groq',
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  groqUseProxy: false,
  ollamaUrl: 'http://localhost:11434/v1/chat/completions',
  ollamaModel: 'llama3.2',
};

function isEngineKind(value: unknown): value is EngineKind {
  return value === 'dictionary' || value === 'groq' || value === 'ollama';
}

/** Load settings, merging any stored values over the defaults. */
export function getEvaluationSettings(): EvaluationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_EVAL_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<EvaluationSettings>;
    return {
      engine: isEngineKind(parsed.engine) ? parsed.engine : DEFAULT_EVAL_SETTINGS.engine,
      groqApiKey: typeof parsed.groqApiKey === 'string' ? parsed.groqApiKey : '',
      groqModel: typeof parsed.groqModel === 'string' && parsed.groqModel ? parsed.groqModel : DEFAULT_EVAL_SETTINGS.groqModel,
      groqUseProxy: typeof parsed.groqUseProxy === 'boolean' ? parsed.groqUseProxy : DEFAULT_EVAL_SETTINGS.groqUseProxy,
      ollamaUrl: typeof parsed.ollamaUrl === 'string' && parsed.ollamaUrl ? parsed.ollamaUrl : DEFAULT_EVAL_SETTINGS.ollamaUrl,
      ollamaModel: typeof parsed.ollamaModel === 'string' && parsed.ollamaModel ? parsed.ollamaModel : DEFAULT_EVAL_SETTINGS.ollamaModel,
    };
  } catch {
    return { ...DEFAULT_EVAL_SETTINGS };
  }
}

export function saveEvaluationSettings(settings: EvaluationSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
