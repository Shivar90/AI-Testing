// LLM-backed evaluation via OpenAI-compatible chat completions.
// Both Groq (https://api.groq.com/openai/v1/chat/completions) and Ollama
// (http://localhost:11434/v1/chat/completions) implement the same shape:
//   POST { model, messages } → choices[0].message.content
// This module is a thin fetch wrapper (no new dependencies) plus a parser
// that converts the LLM's answer back into the app's EvaluationResult.

import type { EngineKind, EvaluationResult, RequirementMatch } from '../types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  url: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  /** Optional signal to abort the request. */
  signal?: AbortSignal;
}

export interface ChatCompletionResult {
  content: string;
}

/**
 * Call an OpenAI-compatible /chat/completions endpoint and return the first
 * assistant message. Throws a descriptive Error on missing key, HTTP errors,
 * or malformed responses.
 */
export async function chatCompletion(
  options: ChatCompletionOptions,
): Promise<ChatCompletionResult> {
  const { url, apiKey, model, messages, signal } = options;
  if (!apiKey.trim()) {
    throw new Error('An API key is required for this engine.');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Evaluation was cancelled.');
    }
    throw new Error(
      `Could not reach ${url}. Check that the service is running and reachable.`,
    );
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      detail = body.error?.message ?? '';
    } catch {
      // ignore parse failures; fall back to status text
    }
    throw new Error(
      `Engine returned HTTP ${response.status}${detail ? `: ${detail}` : ''}`,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('Engine returned a response that could not be read.');
  }

  const content = extractContent(data);
  if (content === null) {
    throw new Error('Engine returned an unexpected response shape.');
  }
  return { content };
}

function extractContent(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as { choices?: unknown };
  if (!Array.isArray(d.choices) || d.choices.length === 0) return null;
  const first = d.choices[0] as { message?: { content?: unknown } };
  const content = first?.message?.content;
  return typeof content === 'string' ? content : null;
}

/** Build the analysis prompt shared by Groq and Ollama. */
export function buildEvaluationPrompt(input: {
  company: string;
  designation: string;
  jobDescription: string;
  resumeText: string;
}): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are a career coach that compares a job description against a ' +
        'candidate resume. Respond ONLY with a markdown list under two ' +
        'headings, exactly like this:\n\n' +
        '## Strengths\n- skill 1\n- skill 2\n\n' +
        '## Gaps\n- missing skill 1\n- missing skill 2\n\n' +
        'Strengths are skills the job description requires that the resume ' +
        'demonstrates. Gaps are skills the job description requires that the ' +
        'resume does not demonstrate. Use concise skill names. If a section ' +
        'has no items, output an empty bullet list under its heading.',
    },
    {
      role: 'user',
      content:
        `Company: ${input.company}\n` +
        `Designation: ${input.designation}\n\n` +
        `JOB DESCRIPTION:\n${input.jobDescription}\n\n` +
        `RESUME:\n${input.resumeText}`,
    },
  ];
}

/**
 * Parse an LLM answer into a plain EvaluationResult. The LLM engines do not
 * compute unresolved items, so unresolvedCount is always 0 — the required
 * `basis` param records which engine produced the result so consumers can
 * distinguish "nothing unresolved" from "not computed".
 */
export function parseEvaluationResult(
  raw: string,
  basis: EngineKind,
): EvaluationResult {
  const text = raw.trim();

  // Prefer JSON: {"strengths": [...], "gaps": [...]}
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        strengths?: unknown;
        gaps?: unknown;
      };
      if (Array.isArray(parsed.strengths) || Array.isArray(parsed.gaps)) {
        return {
          strengths: toMatches(parsed.strengths),
          gaps: toMatches(parsed.gaps),
          unresolvedCount: 0,
          basis,
        };
      }
    } catch {
      // fall through to section parsing
    }
  }

  // Markdown: ## Strengths / ## Gaps bullet lists.
  const strengths = parseSection(text, 'Strengths');
  const gaps = parseSection(text, 'Gaps');
  return { strengths, gaps, unresolvedCount: 0, basis };
}

function toMatches(value: unknown): RequirementMatch[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => ({ keyword: v.toLowerCase(), label: v }));
}

function parseSection(text: string, heading: string): RequirementMatch[] {
  const re = new RegExp(`##\\s*${heading}[\\s\\S]*?(?=\\n##\\s|$)`, 'i');
  const match = text.match(re);
  if (!match) return [];
  const lines = match[0]
    .split('\n')
    .slice(1)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
  return toMatches(lines);
}
