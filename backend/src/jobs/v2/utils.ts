import { and, desc, eq, or, sql } from "drizzle-orm"
import { DbOrTx } from "../research_utils"
import { problem_files, problems, rounds } from "../../../drizzle/schema"

/**
 * Returns `TODO.md`, `TASK.md`, `NOTES.md` and `PROOFS.md`
 * for problem with `id=problem_id`
 */
export async function get_main_problem_files(db: DbOrTx, problem_id: string) {
  // TODO: Implement
  // Each completed round should have a specific copy of these files
  // therefore first we find the problem by id, get round count
  // and retrieve files from previous round to build files for new round

  // (1) Check if problem with ID exists
  const current_round = await db.query.problems.findFirst({
    columns: {
      current_round: true,
    },
    where: eq(problems.id, problem_id),
  })
  if (!current_round) throw new Error(`Problem doesn't exits – id: ${problem_id}`)
  
  // (2) Problem exists, let's retrieve Problem TASK
  // There's always only one copy of Problem Task
  const problem_task = await db.query.problem_files.findFirst({
    columns: {
      content: true,
    },
    where: and(
      eq(problem_files.problem_id, problem_id),
      eq(problem_files.file_type, "task"),
    ),
  })
  if (!problem_task) throw new Error(`Couldn't find Problem Task for problem with id: ${problem_id}`)
  
  // TODO: Rework this a bit
  // (3) Let's get main files
  // We'll select all, sort them by Round INDEX and get the file with highest ROUND INDEX
  // BUG^^^^ workaround by created_at sorting not reliable
  const [notes_file] = await db.query.problem_files.findMany({
    columns: {
      content: true,
    },
    where: and(
      eq(problem_files.problem_id, problem_id),
      eq(problem_files.file_type, "notes"),
    ),
    orderBy: desc(problem_files.created_at),
    limit: 1
  })
  const [proofs_file] = await db.query.problem_files.findMany({
    columns: {
      content: true,
    },
    where: and(
      eq(problem_files.problem_id, problem_id),
      eq(problem_files.file_type, "proofs"),
    ),
    orderBy: desc(problem_files.created_at),
    limit: 1
  })
  const [todo_file] = await db.query.problem_files.findMany({
    columns: {
      content: true,
    },
    where: and(
      eq(problem_files.problem_id, problem_id),
      eq(problem_files.file_type, "todo"),
    ),
    orderBy: desc(problem_files.created_at),
    limit: 1
  })
  
  return {
    problem_task: problem_task.content,
    todo_file: todo_file.content,
    notes_file: notes_file.content,
    proofs_file: proofs_file.content,
  }
}

/**
 * Creates new round for the research problem with given problem_id
 * @returns `round.id` and `round.index`
 */
export async function create_new_round(db: DbOrTx, problem_id: string) {
  // (0) Verify problem exists
  const problem = await db.query.problems.findFirst({
    columns: {
      active_round_id: true,
      current_round: true,
      status: true,
    },
    where: eq(problems.id, problem_id),
  })
  if (!problem) throw new Error("TODO Problem doesn't exist")
  if (problem.active_round_id || problem.status === "running" || problem.status === "queued") throw new Error("TODO Problem has running research – can't create new research round!")
  
  // (1) Create new round
  const [new_round] = await db.insert(rounds)
    .values({
      problem_id,
      research_type: "v2",
      index: problem.current_round + 1,
      phase: "verifier_working" // TODO,
    })
    .returning()
  
  // (2) Update problem with new round
  await db.update(problems)
    .set({
      active_round_id: new_round.id,
      current_round: new_round.index,
      status: "running",
    })
    .where(eq(problems.id, problem_id))
  
  return new_round
}

export async function finish_active_round(db: DbOrTx, problem_id: string) {
  // (0) Verify problem exists
  const problem = await db.query.problems.findFirst({
    columns: {
      active_round_id: true,
    },
    where: eq(problems.id, problem_id),
  })
  if (!problem) throw new Error("TODO Problem with given ID doesn't exist!")
  
  // (1) Update
  await db.transaction(async (tx) => {
    await tx.update(rounds)
      .set({
        phase: "finished",
        completed_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where(eq(rounds.id, problem.active_round_id!))
    
    await tx.update(problems)
      .set({
        active_round_id: null,
        status: "completed",
      })
      .where(eq(problems.id, problem_id))
      
  })
}

async function get_current_active_round(db: DbOrTx, problem_id: string) {
  // (0) Check problem exists TODO

  const problem = await db.query.problems.findFirst({
    columns: {
      active_round_id: true
    },
    where: eq(problems.id, problem_id),
  })
  if (!problem) throw new Error("TODO Error problem has currently no active round!")
  return problem.active_round_id! // BUG not really but I hate "!"
}

export async function save_file(
  db: DbOrTx,
  problem_id: string,
  file_type: "notes" | "proofs" | "todo",
  content: string,
) {
  // (0) Check problem exists TODO
  
  const round_id = await get_current_active_round(db, problem_id)
  await db.insert(problem_files)
    .values({
      problem_id,
      round_id,
      file_name: `${file_type}.md`,
      file_type,
      content,
    })
}
