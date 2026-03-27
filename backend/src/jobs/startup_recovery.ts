import { and, eq, inArray, sql } from "drizzle-orm"
import { problems, rounds } from "../../drizzle/schema"
import type { Database } from "../db"

type StartupRecoveryMode = "none" | "fail_and_purge"

export function get_startup_recovery_mode(): StartupRecoveryMode {
  const mode = Bun.env.JOB_STARTUP_RECOVERY_MODE
  if (mode === "none" || mode === "fail_and_purge") return mode
  return "fail_and_purge"
}

export async function reconcile_inflight_research(db: Database) {
  const in_flight = await db.query.problems.findMany({
    columns: {
      id: true,
      active_round_id: true,
    },
    where: inArray(problems.status, ["queued", "running"]),
  })

  if (in_flight.length === 0) {
    return { affected_problems: 0, affected_rounds: 0 }
  }

  const problem_ids = in_flight.map((p) => p.id)
  const active_round_ids = in_flight
    .map((p) => p.active_round_id)
    .filter((id): id is string => Boolean(id))

  let affected_rounds = 0

  await db.transaction(async (tx) => {
    if (active_round_ids.length > 0) {
      const working_rounds = await tx.query.rounds.findMany({
        columns: {
          id: true,
          phase: true,
        },
        where: and(
          inArray(rounds.id, active_round_ids),
          inArray(rounds.phase, ["prover_working", "verifier_working", "summarizer_working"])
        ),
      })
      affected_rounds = working_rounds.length

      for (const round of working_rounds) {
        const failed_phase = round.phase === "prover_working"
          ? "prover_failed"
          : round.phase === "verifier_working"
            ? "verifier_failed"
            : "summarizer_failed"

        await tx.update(rounds)
          .set({
            phase: failed_phase,
            error_message: "Canceled on backend restart (startup recovery).",
            updated_at: sql`NOW()`,
          })
          .where(eq(rounds.id, round.id))
      }
    }

    await tx.update(problems)
      .set({
        status: "failed",
        active_round_id: null,
        updated_at: sql`NOW()`,
      })
      .where(inArray(problems.id, problem_ids))
  })

  return { affected_problems: in_flight.length, affected_rounds }
}

