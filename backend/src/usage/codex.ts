import { spawn } from "node:child_process"
import { createInterface } from "node:readline"

import type { CodexUsageSnapshot } from "@shared/profile/provider_usage"

let latest_snapshot: CodexUsageSnapshot | null = null

function now_ts() {
  return Math.floor(Date.now() / 1000)
}

function normalize_percent(value: unknown) {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

function normalize_window(raw: unknown) {
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  const used = normalize_percent(candidate.usedPercent ?? candidate.used_percent)
  if (used === null) return null
  const resets_at_raw = candidate.resetsAt ?? candidate.resets_at
  const window_minutes_raw = candidate.windowDurationMins ?? candidate.window_minutes
  const resets_at = resets_at_raw === null || resets_at_raw === undefined
    ? null
    : Number(resets_at_raw)
  const window_minutes = window_minutes_raw === null || window_minutes_raw === undefined
    ? null
    : Number(window_minutes_raw)
  return {
    used_percent: used,
    remaining_percent: Math.max(0, 100 - used),
    resets_at: typeof resets_at === "number" && Number.isFinite(resets_at) ? Math.round(resets_at) : null,
    window_minutes: typeof window_minutes === "number" && Number.isFinite(window_minutes) ? Math.round(window_minutes) : null,
  }
}

function normalize_codex_rate_limits(payload: Record<string, unknown>, captured_at = now_ts()): CodexUsageSnapshot {
  const snapshot_map = payload.rateLimitsByLimitId
  let chosen: Record<string, unknown> | null = null
  if (snapshot_map && typeof snapshot_map === "object") {
    const candidate = snapshot_map as Record<string, unknown>
    if (candidate.codex && typeof candidate.codex === "object") {
      chosen = candidate.codex as Record<string, unknown>
    } else {
      for (const value of Object.values(candidate)) {
        if (value && typeof value === "object") {
          chosen = value as Record<string, unknown>
          break
        }
      }
    }
  }
  if (!chosen && payload.rateLimits && typeof payload.rateLimits === "object") {
    chosen = payload.rateLimits as Record<string, unknown>
  }

  return {
    available: true,
    captured_at,
    limit_id: typeof chosen?.limitId === "string"
      ? chosen.limitId
      : typeof chosen?.limit_id === "string"
        ? chosen.limit_id
        : null,
    limit_name: typeof chosen?.limitName === "string"
      ? chosen.limitName
      : typeof chosen?.limit_name === "string"
        ? chosen.limit_name
        : null,
    plan_type: typeof chosen?.planType === "string"
      ? chosen.planType
      : typeof chosen?.plan_type === "string"
        ? chosen.plan_type
        : null,
    weekly: normalize_window(chosen?.secondary ?? null),
    five_hour: normalize_window(chosen?.primary ?? null),
    error: null,
  }
}

function build_error(message: string): CodexUsageSnapshot {
  return {
    available: false,
    captured_at: latest_snapshot?.captured_at ?? null,
    weekly: latest_snapshot?.weekly ?? null,
    five_hour: latest_snapshot?.five_hour ?? null,
    limit_id: latest_snapshot?.limit_id ?? null,
    limit_name: latest_snapshot?.limit_name ?? null,
    plan_type: latest_snapshot?.plan_type ?? null,
    error: message,
  }
}

export function latest_codex_usage_snapshot() {
  return latest_snapshot ? { ...latest_snapshot } : null
}

export async function read_live_codex_usage_snapshot(): Promise<CodexUsageSnapshot> {
  const codex_bin = Bun.env.CODEX_BIN ?? "codex"

  return await new Promise<CodexUsageSnapshot>((resolve) => {
    const proc = spawn(codex_bin, ["app-server", "--listen", "stdio://"], {
      stdio: ["pipe", "pipe", "pipe"],
    })
    if (!proc.stdin || !proc.stdout || !proc.stderr) {
      resolve(build_error("Codex app-server stdio is unavailable."))
      return
    }
    const stderr_chunks: string[] = []
    let notification_payload: Record<string, unknown> | null = null
    let settled = false

    const reader = createInterface({ input: proc.stdout })
    const finish = (snapshot: CodexUsageSnapshot) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      reader.close()
      if (proc.exitCode === null) proc.kill()
      if (snapshot.available) latest_snapshot = snapshot
      resolve(snapshot)
    }

    const timeout = setTimeout(() => {
      finish(build_error("Codex rate-limit probe timed out."))
    }, 15000)

    proc.on("error", (error) => {
      finish(build_error(`Failed to start Codex app-server: ${error.message}`))
    })

    proc.stderr.on("data", chunk => {
      stderr_chunks.push(chunk.toString())
    })

    reader.on("line", line => {
      let payload: Record<string, unknown>
      try {
        payload = JSON.parse(line)
      } catch {
        return
      }

      if (payload.method === "account/rateLimits/updated" && payload.params && typeof payload.params === "object") {
        notification_payload = payload.params as Record<string, unknown>
        return
      }

      if (payload.id !== 2) return

      if (payload.result && typeof payload.result === "object") {
        finish(normalize_codex_rate_limits(payload.result as Record<string, unknown>))
        return
      }

      if (payload.error && typeof payload.error === "object") {
        const message = typeof (payload.error as Record<string, unknown>).message === "string"
          ? (payload.error as Record<string, string>).message
          : "unknown Codex app-server error"
        finish(build_error(message))
      }
    })

    proc.on("close", () => {
      if (settled) return
      if (notification_payload) {
        finish(normalize_codex_rate_limits(notification_payload))
        return
      }
      const stderr = stderr_chunks.join("").trim()
      finish(build_error(stderr || "Codex app-server exited before returning rate limits."))
    })

    proc.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        clientInfo: { name: "bolzano-web", version: "0.1" },
        capabilities: { experimentalApi: true },
      },
    }) + "\n")
    proc.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "account/rateLimits/read",
    }) + "\n")
  })
}
