// TODO: could add `per_prover` times
// The data for it should already be inside the DB
export interface ProblemRoundTimes {
  round: number,
  one_line_summary: string,
  durations: {
    provers_total: number,
    verifier: number,
    summarizer: number,
  }
}

// Used for Conversation purposes
export interface ResearchRound {
  round_number: number,
  provers: string[],
  verifier?: {
    output: string,
    verdict: string,
  },
  summarizer?: string,
}

export interface File {
  id: string,
  round: number,
  file_name: string,
  file_type: string,
}

export interface ProblemFiles {
  task: File,
  results: {
    notes: File,
    proofs: File,
    output: File, // aka Main Results
  },
  rounds: {
    round: number,
    provers: File[][],
    verifier: File[],
    summarizer: File[],
    metadata: any[],
  }[],
}
