// Evaluation engine for the Evaluate a Job page.
//
// The dictionary engine is purely local, deterministic keyword matching
// (Requirements.md: "After resume is submitted display strength and gaps for
// that JD properly", with "No external database, no API calls — 100% local").
// The Groq and Ollama engines are user-authorized additions that delegate to
// an LLM via OpenAI-compatible chat completions (see llm.ts).

import { COMMON_SKILL_KEYWORDS } from './keywords';
import {
  buildEvaluationPrompt,
  chatCompletion,
  parseEvaluationResult,
} from './llm';
import type {
  EngineKind,
  EvaluationResult,
  EvaluationSettings,
  RequirementMatch,
} from '../types';

const NORMALIZATION_RE = /[^a-z0-9+#.]+/g;
// Trailing periods (sentence ends like "Docker.") must not stick to a keyword.
const TRAILING_DOTS_RE = /\.+(?=\s|$)/g;

function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(NORMALIZATION_RE, ' ')
    .replace(TRAILING_DOTS_RE, '')} `;
}

/** Extract distinctive skill terms from a piece of text. */
export function extractKeywords(text: string): Set<string> {
  const normalized = normalize(text);
  const found = new Set<string>();
  for (const keyword of COMMON_SKILL_KEYWORDS) {
    // Match on word boundaries (padded spaces) so "react" doesn't match
    // "reactor", and "ai" doesn't match "said". The keyword itself is the
    // canonical display form — the seed list is lowercase.
    if (normalized.includes(` ${keyword} `)) {
      found.add(keyword);
    }
  }
  return found;
}

function toMatch(keyword: string): RequirementMatch {
  // The keyword already comes from COMMON_SKILL_KEYWORDS with canonical casing
  // (the list is lowercase, so label === keyword). Building the object directly
  // avoids an O(n) scan per match that could only ever return its own input.
  return { keyword, label: keyword };
}

export function evaluateJob(
  jobDescription: string,
  resumeText: string,
): EvaluationResult {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);

  const strengths: RequirementMatch[] = [];
  const gaps: RequirementMatch[] = [];

  // Deterministic ordering — matches seed-list order.
  for (const keyword of COMMON_SKILL_KEYWORDS) {
    if (!jdKeywords.has(keyword)) continue;
    if (resumeKeywords.has(keyword)) {
      strengths.push(toMatch(keyword));
    } else {
      gaps.push(toMatch(keyword));
    }
  }

  // The dictionary engine resolves every JD keyword — each lands in either
  // strengths or gaps — so unresolvedCount 0 is truthful, not a placeholder.
  // basis records which engine produced this result (per the review's
  // provenance request) so consumers can tell "nothing unresolved" apart from
  // "this engine does not compute unresolved items" (the LLM engines).
  return {
    strengths,
    gaps,
    unresolvedCount: 0,
    basis: 'dictionary',
  };
}

/** Endpoint + model for each LLM engine. */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Run the selected engine. Dictionary is synchronous and local; Groq and
 * Ollama call an OpenAI-compatible chat completions endpoint and parse the
 * answer into the same EvaluationResult shape.
 */
export async function evaluateWithEngine(
  settings: EvaluationSettings,
  input: {
    company: string;
    designation: string;
    jobDescription: string;
    resumeText: string;
  },
): Promise<EvaluationResult> {
  switch (settings.engine) {
    case 'dictionary':
      return evaluateJob(input.jobDescription, input.resumeText);

    case 'groq': {
      if (settings.groqUseProxy) {
        // Server-side proxy holds the key (Vercel env var). The browser sends
        // no API key.
        return runLlmEvaluation({
          engine: 'groq',
          url: '/api/groq',
          apiKey: 'proxy', // sent as Bearer but ignored by the proxy
          model: settings.groqModel,
          input,
        });
      }
      if (!settings.groqApiKey.trim()) {
        throw new Error(
          'Groq API key is required. Add it in the engine settings (gear icon).',
        );
      }
      return runLlmEvaluation({
        engine: 'groq',
        url: GROQ_URL,
        apiKey: settings.groqApiKey,
        model: settings.groqModel,
        input,
      });
    }

    case 'ollama': {
      return runLlmEvaluation({
        engine: 'ollama',
        url: settings.ollamaUrl,
        apiKey: 'ollama', // required by the schema but ignored by Ollama
        model: settings.ollamaModel,
        input,
      });
    }

    default:
      return assertNever(settings.engine);
  }
}

function runLlmEvaluation(options: {
  engine: EngineKind;
  url: string;
  apiKey: string;
  model: string;
  input: { company: string; designation: string; jobDescription: string; resumeText: string };
}): Promise<EvaluationResult> {
  return chatCompletion({
    url: options.url,
    apiKey: options.apiKey,
    model: options.model,
    messages: buildEvaluationPrompt(options.input),
  }).then(({ content }) => parseEvaluationResult(content, options.engine));
}

function assertNever(value: never): never {
  throw new Error(`Unknown engine: ${String(value)}`);
}
