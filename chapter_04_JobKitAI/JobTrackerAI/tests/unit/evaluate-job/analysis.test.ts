// Tests for the Evaluate a Job analysis engine.
// Requirement: "After resume is submitted display strength and gaps for that
// JD properly" (Requirements.md → Evaluate Job board). Source: Requirements.md.

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  evaluateJob,
  evaluateWithEngine,
  extractKeywords,
} from '../../../src/evaluate-job/services/analysis';
import { DEFAULT_EVAL_SETTINGS } from '../../../src/evaluate-job/services/settings';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('extractKeywords', () => {
  it('finds known skill keywords in text', () => {
    const found = extractKeywords(
      'We need a Senior Engineer with Python and React experience',
    );
    expect(found.has('python')).toBe(true);
    expect(found.has('react')).toBe(true);
  });

  it('matches keywords case-insensitively', () => {
    const found = extractKeywords('PYTHON React');
    expect(found.has('python')).toBe(true);
    expect(found.has('react')).toBe(true);
  });

  it('does not match substrings of longer words', () => {
    const found = extractKeywords('reactor engineering');
    expect(found.has('react')).toBe(false);
    expect(found.has('engineering')).toBe(false);
  });

  it('returns an empty set for text with no known keywords', () => {
    expect(extractKeywords('nothing relevant here').size).toBe(0);
  });
});

describe('evaluateJob', () => {
  const jd = `
    We are looking for a Senior Full-Stack Engineer.
    Requirements:
    - Strong Python and React skills
    - Experience with AWS and Docker
    - Write unit tests with Jest
  `;

  it('reports JD keywords present in the resume as strengths', () => {
    const resume = `
      Python developer with React experience.
      Deployed services on AWS using Docker.
      Write unit tests with Jest.
    `;
    const result = evaluateJob(jd, resume);
    expect(result.strengths.map((s) => s.keyword)).toEqual(
      expect.arrayContaining(['python', 'react', 'aws', 'docker', 'jest']),
    );
    // Dictionary labels mirror the seed-list keyword exactly (no casing to
    // preserve — the seed list is lowercase).
    expect(result.strengths.map((s) => s.label)).toEqual(
      result.strengths.map((s) => s.keyword),
    );
    expect(result.gaps).toHaveLength(0);
  });

  it('reports JD keywords missing from the resume as gaps', () => {
    const resume = 'I know Python only.';
    const result = evaluateJob(jd, resume);
    expect(result.gaps.map((g) => g.keyword)).toEqual(
      expect.arrayContaining(['react', 'aws', 'docker', 'jest']),
    );
    expect(result.strengths.map((s) => s.keyword)).toEqual(['python']);
    expect(result.gaps.map((g) => g.label)).toEqual(
      result.gaps.map((g) => g.keyword),
    );
  });

  it('is deterministic for the same inputs', () => {
    const a = evaluateJob(jd, 'Python React AWS');
    const b = evaluateJob(jd, 'Python React AWS');
    expect(a).toEqual(b);
  });

  it('resolves every JD keyword into exactly one of strengths or gaps', () => {
    const resume = 'I know Python and Docker.';
    const result = evaluateJob(jd, resume);
    const jdKeywords = extractKeywords(jd);
    const resolved = new Set([
      ...result.strengths.map((s) => s.keyword),
      ...result.gaps.map((g) => g.keyword),
    ]);
    // The dictionary engine fully resolves the JD keyword set, so the
    // unresolvedCount of 0 is truthful, not a placeholder.
    expect(resolved).toEqual(jdKeywords);
    expect(result.unresolvedCount).toBe(0);
  });

  it('returns empty strengths and gaps when JD has no known keywords', () => {
    const result = evaluateJob('We need a driven go-getter.', 'Python');
    expect(result.strengths).toHaveLength(0);
    expect(result.gaps).toHaveLength(0);
  });
});

describe('evaluateWithEngine', () => {
  const input = {
    company: 'Acme',
    designation: 'Engineer',
    jobDescription: 'We need Python and Docker.',
    resumeText: 'I know Python.',
  };

  it('uses the dictionary engine for engine=dictionary', async () => {
    const result = await evaluateWithEngine(
      { ...DEFAULT_EVAL_SETTINGS, engine: 'dictionary' },
      input,
    );
    expect(result.strengths.map((s) => s.keyword)).toEqual(['python']);
    expect(result.gaps.map((g) => g.keyword)).toEqual(['docker']);
    expect(result.basis).toBe('dictionary');
  });

  it('throws a clear error for Groq without an API key', async () => {
    await expect(
      evaluateWithEngine(
        { ...DEFAULT_EVAL_SETTINGS, engine: 'groq', groqApiKey: '' },
        input,
      ),
    ).rejects.toThrow('Groq API key is required');
  });

  it('posts to the Ollama URL and parses the LLM answer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '## Strengths\n- Python\n\n## Gaps\n- Docker',
              },
            },
          ],
        }),
      }),
    );

    const result = await evaluateWithEngine(
      {
        ...DEFAULT_EVAL_SETTINGS,
        engine: 'ollama',
        ollamaUrl: 'http://localhost:11434/v1/chat/completions',
        ollamaModel: 'llama3.2',
      },
      input,
    );
    expect(result.strengths.map((s) => s.keyword)).toEqual(['python']);
    expect(result.gaps.map((g) => g.keyword)).toEqual(['docker']);

    const fetchMock = vi.mocked(fetch);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:11434/v1/chat/completions');
    const headers = init?.headers as Record<string, string> | undefined;
    expect(JSON.parse(String(init?.body)).model).toBe('llama3.2');
    expect(headers?.['Authorization']).toBe('Bearer ollama');
  });
});
