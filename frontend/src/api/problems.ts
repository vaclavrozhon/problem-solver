import { api } from "./index"

// TODO: how to export all functions to index.ts from where we again export all and then we just need to import from "api" iykyk

/**
 * Retrieves all necessary data for list of all created research problems.
 * 
 * Used at `/archive`.
 */
export async function get_problems_archive() {
  const response = await api.problems.archive.get()
  if (response.error || response.data === null) throw response.error
  return response.data
}

/**
 * Retrieves user's problem overview.
 * 
 * Used at `/`.
 */
export async function get_users_problems() {
  const response = await api.problems["my-problems"].get()
  if (response.error || response.data === null) throw response.error
  return response.data
}

/**
 * Retrieves problem's overview by it's id.
 * 
 * Used at `/problem/$problem_id`.
 */
export async function get_problem_overview(problem_id: string) {
  const response = await api.problems.overview({ problem_id }).get()
  if (response.error || response.data === null) throw response.error
  if (response.data === "No Content") throw new Error(`Couldn't find problem with id: '${problem_id}' .`)
  return response.data
}

/**
 * Retrives problem's conversations by problem's id.
 * 
 * Used at `/problems/$problem_id/conversations`.
 */
export async function get_problem_conversations(problem_id: string) {
  const response = await api.problems.conversations({ problem_id }).get()
  if (response.error || response.data === null) throw response.error
  if (response.data === "No Content") throw new Error(`Couldn't find problem with id: '${problem_id}' .`)
  return response.data
}

/**
 * Retrieves file by file's id.
 * 
 * Used at '/problem/$problem_id/files?file_id=ID'.
 */
export async function get_file_by_id(file_id: string) {
  const response = await api.problems.file_by_id({ file_id }).get()
  if (response.error || response.data === null) throw response.error
  if (response.data === "No Content") throw new Error(`Couldn't find file with id: '${file_id}'.`)
  return response.data
}

/**
 * Retrieves all files for problem with given id.
 * 
 * Used at '/problem/$problem_id/files?...'
 */
export async function get_all_files_for_problem(problem_id: string) {
  const response = await api.problems.all_files({ problem_id }).get()
  if (response.error || response.data === null) throw response.error
  if (response.data === "No Content") throw new Error(`Couldn't get files for problem with id: '${problem_id}'.`)
  return response.data
}

/**
 * Retrieves basic overview to check if problem is ready for new research.
 * 
 * Used at '/problem/$problem_id/research'
 */
export async function get_research_overview(problem_id: string) {
  const response = await api.problems.research_overview({ problem_id }).get()
  if (response.error || response.data === null) throw response.error
  if (response.data === "No Content") throw new Error(`Couldn't get name for problem with id: '${problem_id}'.`)
  return response.data
}

export type MainFilesHistoryEntry = {
  round_index: number
  notes: string
  proofs: string
  output: string
}

/**
 * Retrieves main files (notes, proofs, output) reconstructed per round.
 *
 * Used at '/problem/$problem_id/files' for viewing file evolution.
 */
export async function get_main_files_history(problem_id: string): Promise<MainFilesHistoryEntry[]> {
  const response = await api.problems.main_files_history({ problem_id }).get()
  if (response.error || response.data === null) throw response.error
  if (response.data === "No Content") return []
  return response.data
}