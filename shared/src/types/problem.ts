// Keep shared types independent of backend to avoid cycles.
// These mirror backend enums/fields used by the frontend.

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
    provers: File[][],
    verifier: File[],
    summarizer: File[],
  }[],
}
