import { mkdir, writeFile } from "node:fs/promises"
import { extname, isAbsolute, join, resolve } from "node:path"
import { and, eq, inArray } from "drizzle-orm"
import slugify from "slugify"
import { problem_files, problems, rounds } from "../../drizzle/schema"
import type { DbOrTx } from "@backend/jobs/research_utils"

const MAIN_FILE_TYPES = ["task", "notes", "proofs", "output"] as const
const MAIN_FILE_NAME_MAP: Record<(typeof MAIN_FILE_TYPES)[number], string> = {
  task: "task.md",
  notes: "notes.md",
  proofs: "proofs.md",
  output: "outputs.md",
}

export function output_mirror_enabled() {
  const value = (Bun.env.OUTPUT_MIRROR_ENABLED ?? "1").toLowerCase()
  return value !== "0" && value !== "false"
}

function get_output_root() {
  const configured = Bun.env.OUTPUT_MIRROR_ROOT ?? "outputs"
  if (isAbsolute(configured)) return configured

  // Keep mirror paths stable regardless of current working directory:
  // resolve relative paths from repo root (this file is backend/src/mirror/*).
  const repo_root = resolve(import.meta.dir, "../../..")
  return resolve(repo_root, configured)
}

function to_problem_slug(name: string) {
  const slug = slugify(name, { lower: true, strict: true, trim: true })
  return slug || "problem"
}

function sanitize_file_name(value: string) {
  const normalized = value
    .trim()
    .replace(/[\s/\\:]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
  return normalized || "file"
}

function choose_file_extension(content: string) {
  try {
    const parsed = JSON.parse(content)
    if (parsed !== null && typeof parsed === "object") return ".json"
  } catch {
    // noop
  }
  return ".md"
}

async function get_problem_meta(db: DbOrTx, problem_id: string) {
  const problem = await db.query.problems.findFirst({
    columns: {
      id: true,
      owner_id: true,
      name: true,
      created_at: true,
      updated_at: true,
    },
    where: eq(problems.id, problem_id),
  })
  if (!problem) throw new Error(`Problem not found: ${problem_id}`)
  return problem
}

function get_problem_dir(meta: Awaited<ReturnType<typeof get_problem_meta>>) {
  const root = get_output_root()
  const short_id = meta.id.slice(0, 8)
  const problem_slug = `${to_problem_slug(meta.name)}-${short_id}`
  return join(root, meta.owner_id, problem_slug)
}

async function write_meta_json(problem_dir: string, meta: Awaited<ReturnType<typeof get_problem_meta>>) {
  await mkdir(problem_dir, { recursive: true })
  await writeFile(join(problem_dir, "meta.json"), JSON.stringify({
    problem_id: meta.id,
    owner_id: meta.owner_id,
    problem_name: meta.name,
    problem_slug: `${to_problem_slug(meta.name)}-${meta.id.slice(0, 8)}`,
    mirror_created_at: meta.created_at,
    last_synced_at: new Date().toISOString(),
  }, null, 2), "utf8")
}

async function write_round_index(
  db: DbOrTx,
  problem_id: string,
  round_id: string,
  problem_dir: string
) {
  const round = await db.query.rounds.findFirst({
    columns: {
      id: true,
      index: true,
      phase: true,
      updated_at: true,
    },
    where: and(eq(rounds.id, round_id), eq(rounds.problem_id, problem_id)),
  })
  if (!round) return

  const round_dir = join(problem_dir, `round-${String(round.index).padStart(2, "0")}`)
  await mkdir(round_dir, { recursive: true })

  const files = await db.query.problem_files.findMany({
    columns: {
      id: true,
      file_name: true,
      file_type: true,
      created_at: true,
    },
    where: eq(problem_files.round_id, round_id),
  })

  await writeFile(join(round_dir, "index.json"), JSON.stringify({
    round_id: round.id,
    round_index: round.index,
    phase: round.phase,
    updated_at: round.updated_at,
    files: files.map((file) => ({
      id: file.id,
      file_name: file.file_name,
      file_type: file.file_type,
      created_at: file.created_at,
    })),
  }, null, 2), "utf8")
}

export async function sync_problem_main_files(db: DbOrTx, problem_id: string) {
  if (!output_mirror_enabled()) return

  const meta = await get_problem_meta(db, problem_id)
  const problem_dir = get_problem_dir(meta)
  await write_meta_json(problem_dir, meta)

  const files = await db.query.problem_files.findMany({
    columns: {
      file_type: true,
      content: true,
      created_at: true,
    },
    where: and(
      eq(problem_files.problem_id, problem_id),
      inArray(problem_files.file_type, [...MAIN_FILE_TYPES])
    ),
  })

  const latest_by_type = new Map<string, { content: string, created_at: string }>()
  for (const file of files) {
    const existing = latest_by_type.get(file.file_type)
    if (!existing || file.created_at > existing.created_at) {
      latest_by_type.set(file.file_type, { content: file.content, created_at: file.created_at })
    }
  }

  for (const file_type of MAIN_FILE_TYPES) {
    const item = latest_by_type.get(file_type)
    if (!item) continue
    await writeFile(join(problem_dir, MAIN_FILE_NAME_MAP[file_type]), item.content, "utf8")
  }
}

export async function sync_problem_file(db: DbOrTx, problem_file_id: string) {
  if (!output_mirror_enabled()) return

  const file = await db.query.problem_files.findFirst({
    columns: {
      id: true,
      problem_id: true,
      round_id: true,
      file_name: true,
      file_type: true,
      content: true,
    },
    where: eq(problem_files.id, problem_file_id),
    with: {
      round: {
        columns: {
          index: true,
        },
      },
    },
  })
  if (!file) return

  const meta = await get_problem_meta(db, file.problem_id)
  const problem_dir = get_problem_dir(meta)
  await write_meta_json(problem_dir, meta)

  if (file.file_type === "task" || file.file_type === "notes" || file.file_type === "proofs" || file.file_type === "output") {
    await sync_problem_main_files(db, file.problem_id)
  }

  const round_index = file.round?.index ?? 0
  const round_dir = join(problem_dir, `round-${String(round_index).padStart(2, "0")}`)
  await mkdir(round_dir, { recursive: true })

  const ext = choose_file_extension(file.content)
  const sanitized_name = sanitize_file_name(file.file_name)
  const has_ext = extname(sanitized_name).toLowerCase() === ext
  const target_name = has_ext ? sanitized_name : `${sanitized_name}${ext}`
  await writeFile(join(round_dir, target_name), file.content, "utf8")

  await write_round_index(db, file.problem_id, file.round_id, problem_dir)
}

export async function sync_problem_round(db: DbOrTx, problem_id: string, round_id: string) {
  if (!output_mirror_enabled()) return

  const files = await db.query.problem_files.findMany({
    columns: { id: true },
    where: and(eq(problem_files.problem_id, problem_id), eq(problem_files.round_id, round_id)),
  })

  for (const file of files) {
    await sync_problem_file(db, file.id)
  }
}

export async function backfill_all_problems(db: DbOrTx) {
  const all_problems = await db.query.problems.findMany({
    columns: { id: true },
  })

  const results: Array<{ problem_id: string, success: boolean, error?: string }> = []

  for (const problem of all_problems) {
    try {
      await sync_problem_main_files(db, problem.id)
      const all_rounds = await db.query.rounds.findMany({
        columns: { id: true },
        where: eq(rounds.problem_id, problem.id),
      })
      for (const round of all_rounds) {
        await sync_problem_round(db, problem.id, round.id)
      }
      results.push({ problem_id: problem.id, success: true })
    } catch (error) {
      results.push({
        problem_id: problem.id,
        success: false,
        error: (error as Error).message,
      })
    }
  }

  return {
    total: all_problems.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  }
}
