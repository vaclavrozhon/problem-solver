import { Elysia } from "elysia"
import { drizzle_plugin, auth_plugin } from "../db/plugins"
import { problems, problem_files, rounds, llms } from "../../drizzle/schema"
import { desc, eq, and, like, sql, or, inArray } from "drizzle-orm"
import { core, parse, z } from "zod"

import type { ProblemRoundSumary, ResearchRound } from "@shared/types/problem"
import { format_raw_files_data } from "@backend/problems/index.utils"
import { CreateProblemFormSchema } from "@shared/types/CreateProblem"

const protected_routes = new Elysia({ name: "problem-protected_routes" })
  .use(drizzle_plugin)
  .use(auth_plugin)
  .get("/health", { status: "ok" })
  .get("/my-problems", async ({ db, user, status }) => {
    try {
      const response = await db
        .select({
          id: problems.id,
          name: problems.name,
          updated_at: problems.updated_at,
          is_running: eq(problems.status, "running"),
          phase: problems.status,
          current_round: problems.current_round,
          total_rounds: problems.current_round,
        })
        .from(problems)
        .where(eq(problems.owner_id, user.id))
      if (response.length === 0) return (204)
      return response
    } catch (e) {
      return status(500, {
        type: "error",
        message: "Failed to retrieve your problems."
      })
    }
  }, { isAuth: true })
  /**
   * Retrieves overview for problem by given id.
   * 
   * If invalid UUID format, throws error. BUG: Well not actually it doesnt care about (in)valid UUID format
   * 
   * If no problem matchces given id, returns nothing.
   */
  .get("/overview/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {
      const result = await db.query.problems.findFirst({
        columns: {
          name: true,
          status: true,
          current_round: true,
          updated_at: true,
          created_at: true,
        },
        where: eq(problems.id, problem_id),
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              raw_user_meta_data: true,
            }
          },
          rounds: {
            columns: {
              index: true,
              phase: true,
              error_message: true,
              prover_time: true,
              verifier_time: true,
              summarizer_time: true,
              usage: true,
              estimated_usage: true,
              failed_provers: true,
            }
          }
        }
      })
      if (!result) return status(204)

      const round_summaries: ProblemRoundSumary[] = []

      for (let round of result.rounds.filter(round => round.index !== 0)) {
        let round_summary: ProblemRoundSumary = {
          round_index: round.index,
          phase: round.phase,
          duration: {
            provers_total: round.prover_time,
            verifier: round.verifier_time,
            summarizer: round.summarizer_time,
          },
          usage: round.usage,
          estimated_usage: round.estimated_usage,
          error: null
        }
        if (round.error_message || round.failed_provers) round_summary.error = {
          message: round.error_message,
          failed_provers: round.failed_provers,
        }
        round_summaries.push(round_summary)
      }

      return {
        name: result.name,
        phase: result.status,
        total_rounds: result.current_round,
        updated_at: result.updated_at,
        created_at: result.created_at,
        owner: {
          id: result.user.id,
          name: result.user.raw_user_meta_data.name ?? result.user.email,
        },
        round_summaries,
      }
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve Overview for problem with id: '${problem_id}'.`
      })
    }
  }, { isAuth: true })
  .get("/research_overview/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {
      const result = await db
        .select({
          name: problems.name,
          status: problems.status,
        })
        .from(problems)
        .where(eq(problems.id, problem_id))
      if (result.length === 0) return status(204)
      return result[0]
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve research overview for problem with id: ${problem_id}`
      })
    }
  }, { isAuth: true })
  .get("/conversations/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {
      const result = await db
        .select({
          name: problems.name,
        })
        .from(problems)
        .where(eq(problems.id, problem_id))
      // TODO: if 204, show no problem found or something
      if (result.length === 0) return status(204)

      // Ok, now we know the problem exists
      const files = await db.query.problem_files.findMany({
        where: and(
          eq(problem_files.problem_id, problem_id),
          or(
            sql`${problem_files.file_type}::text LIKE '%_output'`,
            sql`${problem_files.file_type}::text LIKE '%_reasoning'`,
          )
        ),
        with: {
          round: {
            columns: {
              index: true,
            }
          }
        }
      })

      const rounds: ResearchRound[] = []

      for (let file of files.filter(f => f.file_type.includes("_output"))) {
        if (!rounds[file.round.index - 1]) rounds[file.round.index - 1] = {
          round_number: file.round.index,
          provers: []
        }

        let corresponding_reasoning = files
          .find(f =>f.round_id == file.round_id
              && f.file_name === file.file_name.replace("output", "reasoning"))
        // Removing the encrypted part of the reasoning
        // as it's unnecessary inside conversations view
        if (corresponding_reasoning) {
          let parsed_reasoning = JSON.parse(corresponding_reasoning.content)
          let filtered = parsed_reasoning.filter((reasoning: any) => 
            reasoning.type !== "reasoning.encrypted"
          )
          corresponding_reasoning = {
            content: JSON.stringify(filtered, null, 2)
          }
        }

        if (file.file_type === "prover_output") {
          let prover_n = Number(file.file_name.match(/[0-9]+/g)![0])
          rounds[file.round.index - 1]["provers"][prover_n - 1] = {
            output: file.content,
            reasoning: corresponding_reasoning?.content,
            model: file.model_id,
            usage: file.usage?.cost ?? null,
          }
        } else if (file.file_type === "verifier_output") {
          let verifier = JSON.parse(file.content)
          rounds[file.round.index - 1]["verdict"] = verifier.verdict
          rounds[file.round.index - 1]["verifier"] = {
            output: verifier.feedback_md,
            reasoning: corresponding_reasoning?.content,
            model: file.model_id,
            usage: file.usage?.cost ?? null,
          }
        } else {
          let summarizer = JSON.parse(file.content)
          rounds[file.round.index - 1]["summarizer"] = {
            output: summarizer.summary,
            reasoning: corresponding_reasoning?.content,
            model: file.model_id,
            usage: file.usage?.cost ?? null,
          }
        }
      }

      return {
        name: result[0].name,
        rounds
      }
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve Conversations for problem with id: '${problem_id}'.`
      })
    }
  }, { isAuth: true })
  .get("/files/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {

    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve list of files for problem with ID: '${problem_id}'.`
      })
    }
  }, { isAuth: true })
  .get("/file_by_id/:file_id", async ({ db, params: { file_id }, status }) => {
    try {
      const result = await db
        .select() // TODO: select only required cols
        .from(problem_files)
        .where(eq(problem_files.id, file_id))
        .limit(1)
      if (result.length === 0) return status(204)
      return result[0]
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve file with ID: '${file_id}'.`
      })
    }
  }, { isAuth: true })
  .get("/all_files/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {
      const result = await db.query.problem_files.findMany({
        columns: {
          id: true,
          file_name: true,
          file_type: true,
          round_id: true,
          model_id: true,
        },
        with: {
          problem: {
            columns: {
              name: true,
            }
          },
          round: {
            columns: {
              index: true,
            }
          }
        },
        where: eq(problem_files.problem_id, problem_id)
      })
      if (result.length === 0) return status(204)

      const files = result.map(({ problem, ...rest }) => rest)

      return {
        problem_name: result[0]["problem"]["name"],
        files: format_raw_files_data(files),
      }
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve files for problem with ID: '${problem_id}'.`
      })
    }
  }, { isAuth: true })
  .post("/create-new-problem", async ({ db, user, body, status }) => {
    try {
      let new_problem_id = await db.transaction(async (tx) => {
        const [new_problem] = await tx.insert(problems)
          .values({
            owner_id: user.id,
            name: body.problem_name,
          })
          .returning({ id: problems.id })
        const [round_zero] = await tx.insert(rounds)
          .values({
            problem_id: new_problem.id,
            index: 0,
            phase: "finished",
            research_type: "standard",
          })
          .returning({ id: rounds.id })

        await tx.insert(problem_files)
          .values([
            {
              problem_id: new_problem.id,
              round_id: round_zero.id,
              file_type: "task",
              file_name: "task.txt",
              content: body.problem_task,
            },
            {
              problem_id: new_problem.id,
              round_id: round_zero.id,
              file_type: "proofs",
              file_name: "proofs.md",
              content: "# Rigorous Proofs",
            },
            {
              problem_id: new_problem.id,
              round_id: round_zero.id,
              file_type: "notes",
              file_name: "notes.md",
              content: "# Research Notes",
            },
            {
              problem_id: new_problem.id,
              round_id: round_zero.id,
              file_type: "output",
              file_name: "output.md",
              content: "# Main Results",
            },
          ])
        return new_problem.id
      })
      return {
        type: "success",
        message: "New problem created successfully!",
        data: {
          problem_id: new_problem_id,
        }
      }
    } catch (e) {
      return status(500, {
        type: "error",
        message: "Failed to create new problem :("
      })
    }
  }, {
    body: CreateProblemFormSchema,
    isAuth: true,
  })

export const problems_router = new Elysia({ prefix: "/problems" })
  .use(drizzle_plugin)
  .get("/archive", async ({ db }) => {
    return db
      .select({
        id: problems.id,
        owner_id: problems.owner_id,
        name: problems.name,
      })
      .from(problems)
      .orderBy(desc(problems.created_at))
  })
  .use(protected_routes)