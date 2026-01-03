import { z } from "zod"
// Keep shared types independent of backend to avoid cycles.
// These mirror backend enums/fields used by the frontend.

// Problem status type (mirrors backend problem-status enum)
// TODO: Link this to drizzle defintion
export type ProblemStatus = "created" | "idle" | "queued" | "running" | "failed" | "completed"

// Initial placeholder content for main files when a problem is created
export const INITIAL_MAIN_FILES = {
  notes: "# Research Notes",
  proofs: "# Rigorous Proofs",
  output: "# Main Results",
} as const

export type RoundPhase =
  | "prover_working" | "prover_finished" | "prover_failed"
  | "verifier_working" | "verifier_finished" | "verifier_failed"
  | "summarizer_working" | "summarizer_finished" | "summarizer_failed"
  | "finished"

export type FileType =
  | "task" | "proofs" | "notes" | "output"
  | "round_instructions"
  | "prover_prompt" | "verifier_prompt" | "summarizer_prompt"
  | "prover_reasoning" | "verifier_reasoning" | "summarizer_reasoning"
  | "prover_output" | "verifier_output" | "summarizer_output"

export interface RoundRef { index: number, phase?: RoundPhase }
export interface ProblemFileRef {
  id: string
  round_id: string
  file_name: string
  file_type: FileType
  model_id?: string | null
  usage?: unknown
}
// TODO: Link this to the Drizzle definition
export type Verdict = "promising" | "uncertain" | "unlikely"

export interface ProblemRoundSumary {
  round_index: number,
  // TODO
  // one_line_summary: string,
  phase: RoundPhase,
  verdict: Verdict | null,
  duration: {
    provers_total: number | null,
    verifier: number | null,
    summarizer: number | null,
  },
  error: {
    message: string | null,
    failed_provers: string[] | null,
  } | null,
  usage: number,
  estimated_usage: number | null,
}

// Used for Conversation purposes
export interface ResearchRound {
  round_number: number,
  verdict?: string, // TODO: Add types of verdicts
  provers: {
    output: string,
    reasoning?: string,
    usage: number |  null ,
    model: string | null, // TODO: correct type
  }[],
  verifier?: {
    output: string,
    reasoning?: string,
    usage: number |  null ,
    model: string | null, // TODO: correct type
  },
  summarizer?: {
    output: string,
    reasoning?: string,
    usage: number |  null ,
    model: string | null, // TODO: correct type
  },
}

export type File = ProblemFileRef & { round: Pick<RoundRef, "index"> }

export interface ProblemFiles {
  task: File,
  results: {
    notes: File,
    proofs: File,
    output: File,
  },
  rounds: {
    round_index: number,
    round_instructions?: File,
    provers: File[][],
    verifier: File[],
    summarizer: File[],
  }[],
}

// Schemas

/**
 * versioned prompt file format 
 * - v1: system_prompt and user_prompt fields
 * - legacy (no version field): plaintext user prompts
 */
export interface PromptFileContent {
  version: 1
  system_prompt: string
  user_prompt: string
}

/**
 * detects whether prompt is using versioning
 */
export function is_versioned_prompt(content: unknown): content is PromptFileContent {
  return (
    typeof content === "object"
      && content !== null
      && "version" in content
      && (content as Record<string, unknown>).version === 1
      && "system_prompt" in content
      && "user_prompt" in content
  )
}

export const CreateProblemFormSchema = z.object({
  problem_name: z.string().trim()
    .nonempty("Problem name is required")
    .min(5, "Problem Name needs to be at least 5 characters long."),
  problem_task: z.string().trim()
    .nonempty("Problem description is required")
    .min(20, "Problem Task description needs to be at least 20 characters long."),
})