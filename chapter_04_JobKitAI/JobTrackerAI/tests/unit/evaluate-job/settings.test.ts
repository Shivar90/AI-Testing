// @vitest-environment jsdom
// Tests for evaluation settings persistence (localStorage).
// The engine switcher (Dictionary / Groq / Ollama) is a user-authorized
// feature; settings must default sanely and survive round-trips.

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_EVAL_SETTINGS,
  getEvaluationSettings,
  saveEvaluationSettings,
} from '../../../src/evaluate-job/services/settings';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('getEvaluationSettings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(getEvaluationSettings()).toEqual(DEFAULT_EVAL_SETTINGS);
  });

  it('merges stored values over defaults', () => {
    saveEvaluationSettings({
      ...DEFAULT_EVAL_SETTINGS,
      engine: 'ollama',
      ollamaModel: 'qwen3:8b',
    });
    const settings = getEvaluationSettings();
    expect(settings.engine).toBe('ollama');
    expect(settings.ollamaModel).toBe('qwen3:8b');
    // untouched fields keep defaults
    expect(settings.groqModel).toBe(DEFAULT_EVAL_SETTINGS.groqModel);
  });

  it('falls back to defaults when stored data is corrupt', () => {
    localStorage.setItem('job-tracker-eval-settings', '{not json');
    expect(getEvaluationSettings()).toEqual(DEFAULT_EVAL_SETTINGS);
  });

  it('ignores an invalid engine value', () => {
    localStorage.setItem(
      'job-tracker-eval-settings',
      JSON.stringify({ ...DEFAULT_EVAL_SETTINGS, engine: 'hack' }),
    );
    expect(getEvaluationSettings().engine).toBe(DEFAULT_EVAL_SETTINGS.engine);
  });
});

describe('saveEvaluationSettings', () => {
  it('round-trips settings', () => {
    const custom = {
      engine: 'groq' as const,
      groqApiKey: 'gsk_test',
      groqModel: 'llama-3.3-70b-versatile',
      groqUseProxy: true,
      ollamaUrl: 'http://localhost:11434/v1/chat/completions',
      ollamaModel: 'llama3.2',
    };
    saveEvaluationSettings(custom);
    expect(getEvaluationSettings()).toEqual(custom);
  });
});
