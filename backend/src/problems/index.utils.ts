import type { File, ProblemFiles } from "@shared/types/problem"

export function format_raw_files_data(files: File[]): ProblemFiles {
  const by_type = (type: string) => files.find(f => f.file_type === type)

  const file_list: ProblemFiles = {
    task: by_type("task")!,
    results: {
      notes: by_type("notes")!,
      proofs: by_type("proofs")!,
      output: by_type("output")!,
    },
    rounds: []
  }

  const highest_round = Math.max(0, ...files.map(f => f.round.index))

  for (let round = 1; round <= highest_round; round++) {
    const current_round_files = files.filter(f => f.round.index === round)

    const by_type_in_curr_round = (type: string) =>
      current_round_files.filter(f => f.file_type.startsWith(type))

    const prover_files = by_type_in_curr_round("prover")

    const prover_index = (f: File) => parseInt(f.file_name.match(/[0-9]+/)?.[0] ?? "0")
    const prover_count = Math.max(0, ...prover_files.map(prover_index))

    const provers: File[][] = []
    for (let i = 1; i <= prover_count; i++) {
      provers.push(prover_files.filter(f => prover_index(f) === i))
    }

    file_list.rounds.push({
      round_index: round,
      verifier: by_type_in_curr_round("verifier"),
      summarizer: by_type_in_curr_round("summarizer"),
      provers,
    })
  }

  return file_list
}
