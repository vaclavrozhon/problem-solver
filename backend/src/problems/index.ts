import { Elysia } from "elysia"
import { drizzle_plugin, auth_plugin } from "../db/plugins"
import { problems, problem_files } from "../../drizzle/schema"
import { desc, eq, and, like, sql } from "drizzle-orm"
import { parse, z } from "zod"
import { time } from "drizzle-orm/mysql-core"

import type { ProblemRoundTimes, ResearchRound } from "@shared/types/problem"
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
        }
      })
      if (!result) return status(204)

      // Ok, now we know that problem with received id exists
      // const round_metadata_files = await db
      //   .select()
      //   .from(problem_files)
      //   .where(
      //     and(
      //       eq(problem_files.problem_id, problem_id),
      //       eq(problem_files.file_type, "round_meta")
      //     )
      //   )

      const times: ProblemRoundTimes[] = []

      // TODO: if files.length === 0
      // TODO/NOTE: Current implementation generates metadata file for round only when it has completely finished. That means all provers, verifier and summarizer are successfuly done. In the future, this should be segmented and we should provide times gradually.
      // BUG: Should parse with ZOD
      // for (let round of round_metadata_files) {
      //   if (!round.content) continue
      //   const parsed_metadata: {
      //     round: number,
      //     started_at: number,
      //     ended_at: number,
      //     stages: {
      //       provers: Record<string, {
      //         start_ts: number,
      //         end_ts: number,
      //         duration_s: number,
      //         ok: boolean,
      //       }>,
      //       verifier: {
      //         start_ts: number,
      //         end_ts: number,
      //         duration_s: number,
      //       },
      //       summarizer: {
      //         start_ts: number,
      //         end_ts: number,
      //         duration_s: number,
      //       }
      //     },
      //     one_line_summary: string,
      //   } = JSON.parse(round.content)

      //   times.push({
      //     round: parsed_metadata.round,
      //     one_line_summary: parsed_metadata.one_line_summary,
      //     durations: {
      //       provers_total: Object.values(parsed_metadata.stages.provers).reduce((total, prover) => total + prover.duration_s, 0),
      //       verifier: parsed_metadata.stages.verifier.duration_s,
      //       summarizer: parsed_metadata.stages.summarizer.duration_s,
      //     }
      //   })
      // }

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
        times,
      }
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve Overview for problem with id: '${problem_id}'.`
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
      if (result.length === 0) return status(204)

      // Ok, now we know the problem exists
      const files = await db
        .select()
        .from(problem_files)
        .where(
          and(
            eq(problem_files.problem_id, problem_id),
            sql`${problem_files.file_type}::text LIKE '%_output'`
          )
        )
      
      const rounds: ResearchRound[] = []

      for (let file of files) {
        if (!rounds[file.round - 1]) rounds[file.round - 1] = {
          round_number: file.round,
          provers: []
        }

        // TODO/BUG: Fix these ts in the future. right now it will always work
        if (file.file_type === "prover_output") {
          // @ts-expect-error
          // BUG: This will break if we get prover number 10 or higher!!
          let prover_n = Number(file.file_name.match(/\d/g)[0])
          console.log(prover_n)
          rounds[file.round - 1]["provers"][prover_n - 1] = file.content
        } else if (file.file_type === "verifier_output") {
          let verifier = JSON.parse(file.content)
          rounds[file.round - 1]["verifier"] = {
            verdict: verifier.verdict,
            output: verifier.feedback_md
          }
        } else {
          rounds[file.round - 1]["summarizer"] = JSON.parse(file.content).summary
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
      const result =  await db.query.problem_files.findMany({
        columns: {
          id: true,
          file_name: true,
          file_type: true,
          round: true,

        },
        with: {
          problems: {
            columns: {
              name: true,
            }
          }
        },
        where: eq(problem_files.problem_id, problem_id)
      })
      if (result.length === 0) return status(204)
      const files = result.map(({ problems, ...rest }) => rest)

      return {
        problem_name: result[0]["problems"]["name"],
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
        await tx.insert(problem_files)
          .values([
            {
              problem_id: new_problem.id,
              round: 0,
              file_type: "task",
              file_name: "task.txt",
              content: body.problem_task,
            },
            {
              problem_id: new_problem.id,
              round: 0,
              file_type: "proofs",
              file_name: "proofs.md",
              content: "# Rigorous Proofs",
            },
            {
              problem_id: new_problem.id,
              round: 0,
              file_type: "notes",
              file_name: "notes.md",
              content: "# Research Notes",
            },
            {
              problem_id: new_problem.id,
              round: 0,
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
    isAuth: true 
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