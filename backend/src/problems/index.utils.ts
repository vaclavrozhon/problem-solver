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

  const highest_round = Math.max(0, ...files.map(f => f.round))

  for (let round = 1; round <= highest_round; round++) {
    const current_round_files = files.filter(f => f.round === round)

    const metadata = current_round_files.filter(f => (
      f.file_type === "round_meta" || f.file_type === "response_ids"
    ))

    const metadata_ids = new Set(metadata.map(f => f.id))
    const not_metadata_by_type = (type: string) => current_round_files.filter(f => (
      f.file_type.startsWith(type) && !metadata_ids.has(f.id)
    ))

    const prover_files = not_metadata_by_type("prover")

    const prover_index = (f: File) => parseInt(f.file_name.match(/\d+/)?.[0] ?? "0")
    const prover_count = Math.max(0, ...prover_files.map(prover_index))

    const provers: File[][] = []
    for (let i = 1; i <= prover_count; i++) {
      provers.push(prover_files.filter(f => prover_index(f) === i))
    }

    file_list.rounds.push({
      round,
      metadata,
      verifier: not_metadata_by_type("verifier"),
      summarizer: not_metadata_by_type("summarizer"),
      provers,
    })
  }

  return file_list
}
