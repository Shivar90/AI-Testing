// Tests for the LLM response parser and chat completion helper.
// The Groq and Ollama engines are user-authorized additions that must return
// the same strengths/gaps shape as the dictionary engine.

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildEvaluationPrompt,
  chatCompletion,
  parseEvaluationResult,
} from '../../../src/evaluate-job/services/llm';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseEvaluationResult', () => {
  it('parses markdown ## Strengths / ## Gaps sections', () => {
    const raw = [
      '## Strengths',
      '- Python',
      '- React',
      '',
      '## Gaps',
      '- Docker',
      '- Kubernetes',
    ].join('\n');
    const result = parseEvaluationResult(raw, 'groq');
    expect(result.strengths.map((s) => s.label)).toEqual(['Python', 'React']);
    expect(result.gaps.map((g) => g.label)).toEqual(['Docker', 'Kubernetes']);
    expect(result.basis).toBe('groq');
  });

  it('parses JSON output', () => {
    const raw = JSON.stringify({
      strengths: ['Python', 'React'],
      gaps: ['Docker'],
    });
    const result = parseEvaluationResult(raw, 'groq');
    expect(result.strengths.map((s) => s.keyword)).toEqual(['python', 'react']);
    expect(result.gaps.map((g) => g.keyword)).toEqual(['docker']);
    expect(result.basis).toBe('groq');
  });

  it('handles empty sections', () => {
    const result = parseEvaluationResult('## Strengths\n\n## Gaps\n', 'ollama');
    expect(result.strengths).toHaveLength(0);
    expect(result.gaps).toHaveLength(0);
    expect(result.basis).toBe('ollama');
  });

  it('returns empty result for unrelated output', () => {
    const result = parseEvaluationResult('I cannot evaluate this.', 'ollama');
    expect(result.strengths).toHaveLength(0);
    expect(result.gaps).toHaveLength(0);
  });

  it('normalises keywords to lowercase but keeps labels', () => {
    const result = parseEvaluationResult(
      '## Strengths\n- TypeScript\n\n## Gaps\n- AWS\n',
      'groq',
    );
    expect(result.strengths[0].keyword).toBe('typescript');
    expect(result.strengths[0].label).toBe('TypeScript');
    expect(result.gaps[0].keyword).toBe('aws');
    expect(result.gaps[0].label).toBe('AWS');
    expect(result.basis).toBe('groq');
  });
});

describe('buildEvaluationPrompt', () => {
  it('includes company, designation, JD and resume', () => {
    const messages = buildEvaluationPrompt({
      company: 'Acme',
      designation: 'Engineer',
      jobDescription: 'JD text',
      resumeText: 'Resume text',
    });
    const userMsg = messages.find((m) => m.role === 'user')!;
    expect(userMsg.content).toContain('Acme');
    expect(userMsg.content).toContain('Engineer');
    expect(userMsg.content).toContain('JD text');
    expect(userMsg.content).toContain('Resume text');
  });
});

describe('chatCompletion', () => {
  it('throws when no API key is provided', async () => {
    await expect(
      chatCompletion({
        url: 'http://localhost:1/v1/chat/completions',
        apiKey: '',
        model: 'm',
        messages: [],
      }),
    ).rejects.toThrow('API key is required');
  });

  it('returns the first assistant message content', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '## Strengths\n- Python' } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { content } = await chatCompletion({
      url: 'http://example.com/v1/chat/completions',
      apiKey: 'key',
      model: 'm',
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(content).toBe('## Strengths\n- Python');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://example.com/v1/chat/completions');
    expect(init.headers.Authorization).toBe('Bearer key');
    expect(JSON.parse(init.body).model).toBe('m');
  });

  it('throws a descriptive error on HTTP failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      }),
    );
    await expect(
      chatCompletion({
        url: 'http://example.com/v1/chat/completions',
        apiKey: 'bad',
        model: 'm',
        messages: [],
      }),
    ).rejects.toThrow('HTTP 401: Invalid API key');
  });
});
