// Domain model for the Evaluate a Job feature.
// Fields derive exactly from Requirements.md "Evaluate Job board":
// Company Name, Designation, Job description (JD), plus the resume that is
// submitted against the JD to surface strengths and gaps.

/** Input captured by the Evaluate Job form before analysis. */
export interface EvaluateJobInput {
  company: string;
  designation: string;
  jobDescription: string;
  resumeText: string;
}

/** A single matched or missing requirement derived from the JD. */
export interface RequirementMatch {
  /** Normalised keyword/phrase (lowercase). */
  keyword: string;
  /** Display form of the keyword (original casing). */
  label: string;
}

/** Which analysis engine produced an EvaluationResult. */
export type EvaluationBasis = EngineKind;

/** Result of evaluating a resume against a job description. */
export interface EvaluationResult {
  /** Skills/requirements present in both resume and JD. */
  strengths: RequirementMatch[];
  /** JD requirements missing from the resume. */
  gaps: RequirementMatch[];
  /**
   * Count of requirements that could not be assessed. The dictionary engine
   * resolves every JD keyword (each lands in strengths or gaps), so its zero
   * is truthful; the LLM engines do not compute this, so their zero means
   * "not computed" — distinguish via `basis`.
   */
  unresolvedCount: number;
  /** Engine that produced this result. */
  basis: EvaluationBasis;
}

/** Which analysis engine the Evaluate page uses. */
export type EngineKind = 'dictionary' | 'groq' | 'ollama';

/** A resume uploaded on the Evaluate page, with extracted plain text. */
export interface StoredResume {
  /** Stable unique id. */
  id: string;
  /** Original file name, e.g. "SDE_Resume_v3.pdf". */
  fileName: string;
  /** Plain-text content extracted from the file. */
  text: string;
  /** Epoch ms when the resume was uploaded. */
  uploadedAt: number;
}

/** User-configurable settings for the evaluation engines. */
export interface EvaluationSettings {
  /** Selected engine (default: groq — user-authorized default). */
  engine: EngineKind;
  /** Groq API key (user's token). Stored in localStorage only. */
  groqApiKey: string;
  /** Groq model id (OpenAI-compatible chat completions). */
  groqModel: string;
  /**
   * When true, Groq calls go through the Vercel serverless proxy
   * (/api/groq) which holds GROQ_API_KEY server-side — the browser never
   * sends a key. When false (local dev), the browser calls Groq directly
   * using the locally-stored key.
   */
  groqUseProxy: boolean;
  /** Ollama OpenAI-compatible endpoint URL. */
  ollamaUrl: string;
  /** Ollama model id (must be pulled locally). */
  ollamaModel: string;
}
