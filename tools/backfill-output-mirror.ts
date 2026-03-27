#!/usr/bin/env bun
import { get_db } from "../backend/src/db"
import { backfill_all_problems } from "../backend/src/mirror/output_mirror"

async function main() {
  const started_at = Date.now()
  try {
    const db = get_db()
    const summary = await backfill_all_problems(db)
    const elapsed_ms = Date.now() - started_at

    console.log("[mirror:backfill] summary")
    console.log(JSON.stringify({
      total: summary.total,
      succeeded: summary.succeeded,
      failed: summary.failed,
      elapsed_ms,
    }, null, 2))

    if (summary.failed > 0) {
      console.log("[mirror:backfill] failures:")
      for (const item of summary.results.filter((result) => !result.success)) {
        console.log(`- ${item.problem_id}: ${item.error}`)
      }
      process.exit(1)
    }
  } catch (error) {
    console.error(
      "[mirror:backfill] failed to connect/read database. " +
      "Ensure Postgres is running and DATABASE_URL/DATABASE_PASSWORD in .env are correct."
    )
    console.error((error as Error).message)
    process.exit(1)
  }
}

await main()
