import { Elysia } from "elysia"
import { drizzle_plugin, auth_plugin } from "../plugins"
import { problems, problem_files, rounds, profiles } from "../../drizzle/schema"
import { desc, eq, and, sql, or, inArray } from "drizzle-orm"
import { z } from "zod"
import slugify from "slugify"

import { INITIAL_MAIN_FILES, type ProblemRoundSumary, type ResearchRound } from "@shared/types/problem"
import { format_raw_files_data, reconstruct_main_files_history } from "@backend/problems/index.utils"
import { create_zip, divide_files_into_rounds } from "@backend/problems/download.utils"
import { CreateProblemFormSchema } from "@shared/types/problem"


export const problems_router = new Elysia({ prefix: "/problems" })
  .use(drizzle_plugin)
  .use(auth_plugin)

  /**
   * [AUTH] GET /problems/my-problems
   * 
   * Retrieves all problems the user has created.
   * 
   * TODO: Extend this by problems for groups and update API response:
   * {
   *  group-A: [...],
   *  ...
   *  group-G: [...],
   *  own: [...],
   * }
   * 
   * TODO: Write tests.
   * MANUALLY TESTED?: YES, WORKS.
   */
  .get("/my-problems", async ({ db, user, status }) => {
    try {
      const response = await db
        .select({
          id: problems.id,
          name: problems.name,
          created_at: problems.created_at,
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

  // BUG
  /**
   * [AUTH] GET /problems/overview/:problem_id
   *  
   * Retrieves overview for problem by given id.
   * 
   * If invalid UUID format, throws error. BUG: Well not actually it doesnt care about (in)valid UUID format
   * 
   * If no problem matchces given id, returns nothing.
   * 
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem. Could be implementd via macro so that we dont repeat ourselves.
   * MANUALLY TESTED?: Yes, but needs new breaking features.
   */
   // BUG: Quick workaround to allow problem viewing for unauthroized users
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
          profile: {
            columns: {
              id: true,
              name: true,
              email: true,
            }
          },
          rounds: {
            columns: {
              id: true,
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

      // Fetch verifier outputs to extract verdicts
      const round_ids = result.rounds.map(r => r.id)
      const verifier_outputs = round_ids.length > 0
        ? await db.query.problem_files.findMany({
            columns: { round_id: true, content: true },
            where: and(
              eq(problem_files.file_type, "verifier_output"),
              inArray(problem_files.round_id, round_ids)
            )
          })
        : []

      const verdict_by_round_id = new Map<string, string | null>()
      for (const v_output of verifier_outputs) {
        try {
          const parsed = JSON.parse(v_output.content)
          verdict_by_round_id.set(v_output.round_id, parsed.verdict ?? null)
        } catch {
          verdict_by_round_id.set(v_output.round_id, null)
        }
      }

      const round_summaries: ProblemRoundSumary[] = []

      for (let round of result.rounds.filter(round => round.index !== 0)) {
        let round_summary: ProblemRoundSumary = {
          round_index: round.index,
          phase: round.phase,
          verdict: (verdict_by_round_id.get(round.id) as ProblemRoundSumary["verdict"]) ?? null,
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
          id: result.profile.id,
          name: result.profile.name,
        },
        round_summaries,
      }
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve Overview for problem with id: '${problem_id}'.`
      })
    }
  })

  /**
   * [AUTH] GET /problems/research_overview/:problem_id
   * 
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem.
   * MANUALLY TESTED?: NO.
   */
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

  /**
   * [AUTH] GET /problems/conversations/:problem_id
   * 
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem.
   * MANUALLY TESTED?: NO.
   */
  // BUG: Quick workaround to allow problem viewing for unauthroized users
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

        const corresponding_reasoning = files
          .find(f =>f.round_id == file.round_id
              && f.file_name === file.file_name.replace("output", "reasoning"))
        // Removing the encrypted part of the reasoning
        // as it's unnecessary inside conversations view
        let filtered_reasoning_content: string | undefined
        if (corresponding_reasoning) {
          let parsed_reasoning = JSON.parse(corresponding_reasoning.content)
          let filtered = parsed_reasoning.filter((reasoning: any) =>
            reasoning.type !== "reasoning.encrypted"
          )
          filtered_reasoning_content = JSON.stringify(filtered, null, 2)
        }

        if (file.file_type === "prover_output") {
          let prover_n = Number(file.file_name.match(/[0-9]+/g)![0])
          rounds[file.round.index - 1]["provers"][prover_n - 1] = {
            output: file.content,
            reasoning: filtered_reasoning_content,
            model: file.model_id,
            usage: file.usage?.cost ?? null,
          }
        } else if (file.file_type === "verifier_output") {
          let verifier = JSON.parse(file.content)
          rounds[file.round.index - 1]["verdict"] = verifier.verdict
          rounds[file.round.index - 1]["verifier"] = {
            output: verifier.feedback_md,
            reasoning: filtered_reasoning_content,
            model: file.model_id,
            usage: file.usage?.cost ?? null,
          }
        } else {
          let summarizer = JSON.parse(file.content)
          rounds[file.round.index - 1]["summarizer"] = {
            output: summarizer.summary,
            reasoning: filtered_reasoning_content,
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
  })

  /**
   * [AUTH] GET /problems/files/:problem_id
   * 
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem.
   * MANUALLY TESTED?: NO.
   */
  // BUG: Quick workaround to allow problem viewing for unauthroized users
  .get("/files/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve list of files for problem with ID: '${problem_id}'.`
      })
    }
  })

  /**
   * [AUTH] GET /problems/main_files_history/:problem_id
   * 
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem.
   * MANUALLY TESTED?: NO.
   */
  // BUG: Quick workaround to allow problem viewing for unauthroized users
  .get("/main_files_history/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {
      const history = await reconstruct_main_files_history(db, problem_id)
      if (history.length === 0) return status(204)
      return history
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to retrieve main files history for problem with ID: '${problem_id}'.`
      })
    }
  })

  /**
   * [AUTH] GET /problems/file_by_id/:file_id
   * 
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem.
   * MANUALLY TESTED?: NO.
   */
  // BUG: Quick workaround to allow problem viewing for unauthroized users
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
  })

  /**
   * GET /problems/download/file/:file_id
   * 
   * Returns a single file as a download attachment.
   * 
   * MANUALLY TESTED?: YES, works!
   */
  .get("/download/file/:file_id", async ({ db, params: { file_id }, status }) => {
    try {
      let file
      if (file_id.startsWith("problem_id--")) {
        let problem_id = file_id.split("&main_file--")[0].split("problem_id--")[1]
        let query = file_id.split("&main_file--")[1]
        if (query.length === 0 || !problem_id) return status(204)
        let main_file = query.split("-")[0]
        let round = Number(query.split("-")[1])
        if (!["notes", "output", "proofs"].includes(main_file) || round < 0) return status(204)
        // Check whether problem with given `problem_id` exists
        const result = await db.query.problems.findFirst({
          columns: {
            id: true,
          },
          where: eq(problems.id, problem_id)
        })
        if (!result) return status(204)
        
        let main_files = await reconstruct_main_files_history(db, problem_id)
        let main_file_round = main_files.find(f => f.round_index === round)
        if (!main_file_round) return status(204)
        file = {
          file_name: main_file,
          content: main_file_round[main_file as "notes" | "output" | "proofs"],
        }
      } else {
        file = await db.query.problem_files.findFirst({
          columns: {
            file_name: true,
            content: true,
          },
          where: eq(problem_files.id, file_id),
        })
      }
      if (!file) return status(204)
      
      
      let extension, content_type
      try {
        JSON.parse(file.content)
        content_type = "application/json; charset=utf-8"
        extension = "json"
      } catch (_) {
        content_type = "text/markdown; charset=utf-8"
        extension = "md"
      }

      return new Response(file.content, {
        headers: {
          "Content-Type": content_type,
          "Content-Disposition": `attachment; filename="${file.file_name.split(".")[0]}.${extension}"`,
        },
      })
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to download file with ID: '${file_id}'.`
      })
    }
  }, {
    params: z.object({
      file_id: z.xor([
        z.uuid(),
        z.string().startsWith("problem_id--").includes("&main_file--")
      ])
    })
  })

  /**
   * GET /problems/download/round/:problem_id/:round_index
   * 
   * Returns all files for a specific round as a zip download.
   * 
   * Only for `round > 0`
   * 
   * MANUALLY TESTED?: Yes, works.
   */
  .get("/download/round/:problem_id/:round_index", async ({ db, params, status }) => {
    try {
      const problem = await db.query.problems.findFirst({
        columns: {
          name: true,
        },
        where: eq(problems.id, params.problem_id),
      })
      if (!problem) return status(204)
      
      const round = await db.query.rounds.findFirst({
        columns: {
          id: true,
          index: true,
        },
        where: and(
          eq(rounds.problem_id, params.problem_id),
          eq(rounds.index, params.round_index)
        ),
      })
      if (!round) return status(204)

      const files = await db.query.problem_files.findMany({
        columns: {
          file_name: true,
          file_type: true,
          content: true,
          created_at: true,
        },
        with: {
          round: {
            columns: {
              index: true,
            }
          }
        },
        where: eq(problem_files.round_id, round.id),
      })
      if (files.length === 0) return status(204)
      
      let main_files = await reconstruct_main_files_history(db, params.problem_id)
      let formatted_files = divide_files_into_rounds(
        files,
        main_files.filter(f => f.round_index === params.round_index)
      )
      
      const zip = await create_zip(formatted_files)
      const download_name = `${slugify(problem.name)}-round-${params.round_index}.zip`

      return new Response(zip, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${download_name}"`,
        },
      })
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to download round files for problem with ID: '${params.problem_id}'.`
      })
    }
  }, {
    params: z.object({
      problem_id: z.uuid(),
      round_index: z.coerce.number().min(1),
    })
  })

  /**
   * [AUTH] GET /problems/download/all/:problem_id
   * 
   * Returns all files for a given problem as a zip download.
   * 
   * MANUALLY TESTED?: NO.
   */
  .get("/download/all/:problem_id", async ({ db, params: { problem_id }, status }) => {
    try {
      const problem = await db.query.problems.findFirst({
        columns: {
          name: true,
        },
        where: eq(problems.id, problem_id),
      })
      if (!problem) return status(204)

      const files = await db.query.problem_files.findMany({
        columns: {
          file_name: true,
          file_type: true,
          content: true,
          created_at: true,
        },
        with: {
          round: {
            columns: {
              index: true,
            }
          }
        },
        where: eq(problem_files.problem_id, problem_id),
      })
      if (files.length === 0) return status(204)

      let main_files = (await reconstruct_main_files_history(db, problem_id))
        .filter(f => f.round_index !== 0)
      let formatted_files = divide_files_into_rounds(files, main_files)

      const zip = await create_zip(formatted_files)
      const download_name = `${slugify(problem.name)}-everything.zip`

      return new Response(zip, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${download_name}"`,
        },
      })
    } catch (e) {
      return status(500, {
        type: "error",
        message: `Failed to download files for problem with ID: '${problem_id}'.`
      })
    }
  }, {
    params: z.object({
      problem_id: z.uuid(),
    })
  })

  /**
   * [AUTH] GET /problems/all_files/:problem_id
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem.
   * MANUALLY TESTED?: NO.
   */
  // BUG: Quick workaround to allow problem viewing for unauthroized users
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
  })

  /**
   * [AUTH] POST /problems/create-new-problem
   * 
   * TODO: Write tests.
   * TODO: Implement problem sharing. Default behavior should be that this problem can only be viewed by ADMIN/OWNER of the problem.
   * MANUALLY TESTED?: NO.
   */
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
              content: INITIAL_MAIN_FILES.proofs,
            },
            {
              problem_id: new_problem.id,
              round_id: round_zero.id,
              file_type: "notes",
              file_name: "notes.md",
              content: INITIAL_MAIN_FILES.notes,
            },
            {
              problem_id: new_problem.id,
              round_id: round_zero.id,
              file_type: "output",
              file_name: "output.md",
              content: INITIAL_MAIN_FILES.output,
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

  // TODO
  /**
   * TODO: This needs to be moved to ADMIN as it's admin only feature.
   */
  .get("/archive", async ({ db }) => {
    // BUG: Possibly make sure that "owner_name" is type defined
    return await db
      .select({
        id: problems.id,
        owner_id: problems.owner_id,
        name: problems.name,
        created_at: problems.created_at,
        updated_at: problems.updated_at,
        phase: problems.status,
        total_rounds: problems.current_round,
        owner_name: profiles.name,
      })
      .from(problems)
      .leftJoin(profiles, eq(problems.owner_id, profiles.id))
      .orderBy(desc(problems.created_at))
  }, { isAdmin: true })
