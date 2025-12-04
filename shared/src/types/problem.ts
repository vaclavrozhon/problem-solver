import type { RoundPhase, ProblemFile, Round } from "@backend/jobs/research_utils"

export interface ProblemRoundSumary {
  round_index: number,
  // TODO
  // one_line_summary: string,
  phase: RoundPhase,
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

export type File = Pick<
  ProblemFile,
  "id" | "round_id" | "file_name" | "file_type" | "model_id" | "usage"
> & {
  round: Pick<Round, "index">
}

export interface ProblemFiles {
  task: File,
  results: {
    notes: File,
    proofs: File,
    output: File,
  },
  rounds: {
    round_index: number,
    provers: File[][],
    verifier: File[],
    summarizer: File[],
  }[],
}
