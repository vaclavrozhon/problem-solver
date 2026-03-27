import { Elysia } from "elysia"
import { auth_plugin, drizzle_plugin } from "../plugins"
import { jobs_plugin } from "../jobs"
import { eq, sql } from "drizzle-orm"
import { problems, rounds } from "../../drizzle/schema"

import { user_has_openrouter_key } from "../openrouter/provider"
import { user_has_metacentrum_key } from "../metacentrum/provider"
import { NewStandardResearch, get_model_transport } from "@shared/types/research"

export const research_router = new Elysia({ prefix: "/research" })
  .use(auth_plugin)
  .use(drizzle_plugin)
  .use(jobs_plugin)
  .get("/health", { status: "ok" })

  /**
   * [AUTH] POST /research/run-standard-research
   * 
   * Starts standard research configured via body.
   * You must own the problem to run new research and the problem can't
   * have running/queued research.
   * 
   * MANUALLY TESTED?: NO
   */
  .post("/run-standard-research", async ({ db, body, status, jobs, user }) => {
    const problem_id = body.problem_id

    // (1) Validate OpenRouter key only if at least one selected model needs OpenRouter
    const selected_model_ids = [
      ...body.prover.provers.map(p => p.model.id),
      body.verifier.model.id,
      body.summarizer.model.id,
    ]
    const required_transports = new Set(
      selected_model_ids.map(model_id => get_model_transport(model_id))
    )

    if (required_transports.has("openrouter")) {
      const has_openrouter_key = await user_has_openrouter_key(db, user.id)
      if (!has_openrouter_key) return status(403, {
        type: "error",
        message: "Selected configuration includes OpenRouter models. Add an OpenRouter API key in Settings or switch to other transports."
      })
    }

    if (required_transports.has("metacentrum_openai")) {
      const has_metacentrum_key = await user_has_metacentrum_key(db, user.id)
      if (!has_metacentrum_key) return status(403, {
        type: "error",
        message: "Selected configuration includes MetaCentrum models. Add a MetaCentrum API key in Settings."
      })
    }

    // (2) Fetch problem details
    const problem = await db.query.problems.findFirst({
      columns: {
        status: true,
        owner_id: true,
      },
      where: eq(problems.id, problem_id)
    })
    if (!problem) return status(400, {
      type: "error",
      message: "Can't start research for non-existing problem – invalid problem id."
    })

    // (3) Authorization check: must own the problem.
    if (problem.owner_id !== user.id) return status(403, {
      type: "error",
      message: "Can't start research for a problem you don't own!"
    })

    // (4) Check problem is not already running
    if (problem.status === "running" || problem.status === "queued") return status(409, {
      type: "error",
      message: "Can't start research for a problem that has running research!"
    })

    // (5) Queue the job
    try {
      await db.update(problems)
        .set({ status: "queued", updated_at: sql`NOW()` })
        .where(eq(problems.id, problem_id))

      jobs.queue("standard_research")
        .emit("start_research", {
          new_research: body,
          ctx: {
            user_id: user.id,
            current_relative_round_index: 1,
          }
        })
    } catch (e) {
      return status(500, {
        type: "error",
        message: "Failed to queue new research!"
      })
    }

    return {
      type: "success",
      message: "Successfully started Standard Research!"
    }
  }, {
    isAuth: true,
    body: NewStandardResearch
  })
  .post("/force-fail/:problem_id", async ({ db, params: { problem_id }, status, user }) => {
    const problem = await db.query.problems.findFirst({
      columns: {
        id: true,
        owner_id: true,
        status: true,
        active_round_id: true,
      },
      where: eq(problems.id, problem_id),
    })
    if (!problem) return status(404, {
      type: "error",
      message: "Problem not found."
    })
    if (problem.owner_id !== user.id) return status(403, {
      type: "error",
      message: "You can only force-fail your own problem."
    })

    if (problem.active_round_id) {
      const active_round = await db.query.rounds.findFirst({
        columns: { phase: true },
        where: eq(rounds.id, problem.active_round_id),
      })
      const failed_phase = active_round?.phase === "prover_working"
        ? "prover_failed"
        : active_round?.phase === "verifier_working"
          ? "verifier_failed"
          : active_round?.phase === "summarizer_working"
            ? "summarizer_failed"
            : null

      if (failed_phase) {
        await db.update(rounds)
          .set({
            phase: failed_phase,
            error_message: "Manually marked as failed by user.",
            updated_at: sql`NOW()`,
          })
          .where(eq(rounds.id, problem.active_round_id))
      }
    }

    await db.update(problems)
      .set({
        status: "failed",
        active_round_id: null,
        updated_at: sql`NOW()`,
      })
      .where(eq(problems.id, problem_id))

    return {
      type: "success",
      message: "Problem marked as failed. You can start a new round now."
    }
  }, { isAuth: true })
