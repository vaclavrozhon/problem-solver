import { INITIAL_MAIN_FILES, type File, type ProblemFiles } from "@shared/types/problem"
import type { VerifierOutput } from "@shared/types/research"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import { problem_files, rounds } from "../../drizzle/schema"
import { eq, and, asc } from "drizzle-orm"

export type MainFilesHistory = {
  round_index: number,
  notes: string,
  proofs: string,
  output: string,
}[]

export async function reconstruct_main_files_history(
  db: PostgresJsDatabase<any>,
  problem_id: string
): Promise<MainFilesHistory> {
  // (1) Use shared initial values (round 0 files get updated in place by verifier)
  const initial_notes = INITIAL_MAIN_FILES.notes
  const initial_proofs = INITIAL_MAIN_FILES.proofs
  const initial_output = INITIAL_MAIN_FILES.output

  // (2) Fetch all verifier_output files ordered by round index
  const verifier_outputs = await db
    .select({
      round_index: rounds.index,
      content: problem_files.content,
    })
    .from(problem_files)
    .innerJoin(rounds, eq(problem_files.round_id, rounds.id))
    .where(and(
      eq(problem_files.problem_id, problem_id),
      eq(problem_files.file_type, "verifier_output")
    ))
    .orderBy(asc(rounds.index))

  // (3) Build history by applying operations
  const history: MainFilesHistory = [{
    round_index: 0,
    notes: initial_notes,
    proofs: initial_proofs,
    output: initial_output,
  }]

  let curr_notes: string = initial_notes
  let curr_proofs: string = initial_proofs
  let curr_output: string = initial_output

  for (const verifier_output of verifier_outputs) {
    const parsed: VerifierOutput = JSON.parse(verifier_output.content)

    curr_notes = parsed.notes_update.action === "append"
      ? curr_notes + "\n\n" + parsed.notes_update.content
      : parsed.notes_update.content

    curr_proofs = parsed.proofs_update.action === "append"
      ? curr_proofs + "\n\n" + parsed.proofs_update.content
      : parsed.proofs_update.content

    curr_output = parsed.output_update.action === "append"
      ? curr_output + "\n\n" + parsed.output_update.content
      : parsed.output_update.content

    history.push({
      round_index: verifier_output.round_index,
      notes: curr_notes,
      proofs: curr_proofs,
      output: curr_output,
    })
  }

  return history
}

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

    const round_instructions = current_round_files.find(f => f.file_type === "round_instructions")

    const prover_files = by_type_in_curr_round("prover")

    const prover_index = (f: File) => parseInt(f.file_name.match(/[0-9]+/)?.[0] ?? "0")
    const prover_count = Math.max(0, ...prover_files.map(prover_index))

    const provers: File[][] = []
    for (let i = 1; i <= prover_count; i++) {
      provers.push(prover_files.filter(f => prover_index(f) === i))
    }

    file_list.rounds.push({
      round_index: round,
      round_instructions,
      verifier: by_type_in_curr_round("verifier"),
      summarizer: by_type_in_curr_round("summarizer"),
      provers,
      // ------- V2 Experiemntal
      todo: by_type_in_curr_round("todo"),
      notes: by_type_in_curr_round("notes"),
      proofs: by_type_in_curr_round("proofs"),
      // ------
    })
  }

  return file_list
}
