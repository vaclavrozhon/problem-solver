import { spawn } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type { ClaudeUsageSnapshot } from "@shared/profile/provider_usage"

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))
const HELPER_PATH = resolve(MODULE_DIR, "../../scripts/claude_usage_probe.py")

let latest_snapshot: ClaudeUsageSnapshot | null = null
let last_error: string | null = null

function normalize_window(raw: unknown) {
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  const numeric = (value: unknown) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.round(parsed) : null
  }
  return {
    used_percent: numeric(candidate.used_percent),
    remaining_percent: numeric(candidate.remaining_percent),
    resets_at: numeric(candidate.resets_at),
  }
}

function base_snapshot(): ClaudeUsageSnapshot {
  return {
    available: false,
    refreshed: false,
    captured_at: null,
    weekly: null,
    session: null,
    overage: null,
    error: last_error,
  }
}

function normalize_snapshot(payload: Record<string, unknown>): ClaudeUsageSnapshot {
  const numeric = (value: unknown) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.round(parsed) : null
  }
  return {
    available: payload.available === true,
    refreshed: true,
    captured_at: numeric(payload.captured_at),
    weekly: normalize_window(payload.weekly),
    session: normalize_window(payload.session),
    overage: normalize_window(payload.overage),
    error: typeof payload.error === "string" ? payload.error : null,
  }
}

export function cached_claude_usage_snapshot(): ClaudeUsageSnapshot {
  if (!latest_snapshot) return base_snapshot()
  return {
    ...latest_snapshot,
    error: last_error,
  }
}

export async function refresh_claude_usage_snapshot(): Promise<ClaudeUsageSnapshot> {
  const python_bin = Bun.env.CLAUDE_USAGE_PYTHON_BIN ?? "python3"

  return await new Promise<ClaudeUsageSnapshot>((resolve) => {
    const proc = spawn(python_bin, [HELPER_PATH], {
      stdio: ["ignore", "pipe", "pipe"],
    })
    if (!proc.stdout || !proc.stderr) {
      last_error = "Claude usage helper stdio is unavailable."
      resolve(cached_claude_usage_snapshot())
      return
    }
    const stdout_chunks: string[] = []
    const stderr_chunks: string[] = []

    proc.on("error", error => {
      last_error = `Failed to start Claude usage helper: ${error.message}`
      resolve(cached_claude_usage_snapshot())
    })

    proc.stdout.on("data", chunk => stdout_chunks.push(chunk.toString()))
    proc.stderr.on("data", chunk => stderr_chunks.push(chunk.toString()))

    proc.on("close", code => {
      const stdout = stdout_chunks.join("").trim()
      const stderr = stderr_chunks.join("").trim()
      if (code !== 0 && !stdout) {
        last_error = stderr || `Claude usage helper failed (${code}).`
        resolve(cached_claude_usage_snapshot())
        return
      }

      try {
        const parsed = JSON.parse(stdout) as Record<string, unknown>
        const snapshot = normalize_snapshot(parsed)
        latest_snapshot = snapshot
        last_error = snapshot.error
        resolve(cached_claude_usage_snapshot())
      } catch {
        last_error = stderr || "Claude usage helper returned invalid JSON."
        resolve(cached_claude_usage_snapshot())
      }
    })
  })
}
