import { spawn } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type { GeminiProfileUsage, GeminiUsageSnapshot } from "@shared/profile/provider_usage"

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))
const BACKEND_ROOT = resolve(MODULE_DIR, "../..")
const HELPER_PATH = resolve(BACKEND_ROOT, "scripts/gemini_quota_probe.mjs")
const WORKSPACE_ROOT = resolve(BACKEND_ROOT, "..")
const GEMINI_PRO_MODEL_ID = "gemini-3-pro-preview"
const GEMINI_FLASH_MODEL_ID = "gemini-3-flash-preview"

let latest_snapshot: GeminiUsageSnapshot | null = null

function now_ts() {
  return Math.floor(Date.now() / 1000)
}

function normalize_percent(value: unknown) {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

function normalize_timestamp(value: unknown) {
  if (value === null || value === undefined) return null
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value)
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const as_number = Number(trimmed)
  if (Number.isFinite(as_number)) return Math.round(as_number)
  const parsed = Date.parse(trimmed.replace(/Z$/, "+00:00"))
  return Number.isFinite(parsed) ? Math.round(parsed / 1000) : null
}

function normalize_profile_quota(raw: unknown): GeminiProfileUsage | null {
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  const remaining_fraction = candidate.remaining_fraction ?? candidate.remainingFraction
  const remaining_percent = remaining_fraction === null || remaining_fraction === undefined
    ? normalize_percent(candidate.remaining_percent)
    : normalize_percent(Number(remaining_fraction) * 100)
  const used_percent = remaining_percent === null ? null : Math.max(0, 100 - remaining_percent)
  const amount_or_null = (value: unknown) =>
    typeof value === "number" || typeof value === "string"
      ? value
      : null
  return {
    remaining_percent,
    used_percent,
    resets_at: normalize_timestamp(candidate.reset_time ?? candidate.resetTime),
    remaining_amount: amount_or_null(candidate.remaining_amount ?? candidate.remainingAmount),
    limit_amount: amount_or_null(candidate.limit_amount ?? candidate.limitAmount),
    matched_model_id: typeof candidate.matched_model_id === "string"
      ? candidate.matched_model_id
      : typeof candidate.matchedModelId === "string"
        ? candidate.matchedModelId
        : null,
  }
}

function normalize_gemini_usage_snapshot(payload: Record<string, unknown>, captured_at = now_ts()): GeminiUsageSnapshot {
  const raw_profiles = payload.profiles && typeof payload.profiles === "object"
    ? payload.profiles as Record<string, unknown>
    : {}
  return {
    available: true,
    captured_at,
    profiles: {
      pro: normalize_profile_quota(raw_profiles.pro),
      flash: normalize_profile_quota(raw_profiles.flash),
    },
    pooled: normalize_profile_quota(payload.pooled),
    error: null,
  }
}

function build_error(message: string): GeminiUsageSnapshot {
  return {
    available: false,
    captured_at: latest_snapshot?.captured_at ?? null,
    profiles: latest_snapshot?.profiles ?? { pro: null, flash: null },
    pooled: latest_snapshot?.pooled ?? null,
    error: message,
  }
}

function extract_json_object(text: string) {
  const stripped = text.trim()
  if (!stripped) throw new Error("Gemini quota helper returned empty output.")
  const candidates = stripped.split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith("{"))
  if (stripped.startsWith("{")) candidates.push(stripped)
  for (const candidate of [...candidates].reverse()) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>
    } catch {
      // noop
    }
  }
  throw new Error("Gemini quota helper returned invalid JSON.")
}

export function latest_gemini_usage_snapshot() {
  return latest_snapshot ? { ...latest_snapshot } : null
}

export async function read_live_gemini_usage_snapshot(): Promise<GeminiUsageSnapshot> {
  const profiles = JSON.stringify([
    { profile_id: "pro", model_id: GEMINI_PRO_MODEL_ID },
    { profile_id: "flash", model_id: GEMINI_FLASH_MODEL_ID },
  ])

  return await new Promise<GeminiUsageSnapshot>((resolve) => {
    const proc = spawn("node", [
      HELPER_PATH,
      "--cwd",
      WORKSPACE_ROOT,
      "--profiles-json",
      profiles,
    ], {
      cwd: WORKSPACE_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    })
    if (!proc.stdout || !proc.stderr) {
      resolve(build_error("Gemini quota helper stdio is unavailable."))
      return
    }
    const stdout_chunks: string[] = []
    const stderr_chunks: string[] = []

    proc.on("error", error => {
      resolve(build_error(`Failed to start Gemini quota helper: ${error.message}`))
    })

    proc.stdout.on("data", chunk => stdout_chunks.push(chunk.toString()))
    proc.stderr.on("data", chunk => stderr_chunks.push(chunk.toString()))

    proc.on("close", code => {
      if (code !== 0) {
        resolve(build_error(stderr_chunks.join("").trim() || stdout_chunks.join("").trim() || `Gemini quota helper failed (${code}).`))
        return
      }
      try {
        const parsed = extract_json_object(stdout_chunks.join(""))
        const snapshot = normalize_gemini_usage_snapshot(parsed)
        latest_snapshot = snapshot
        resolve(snapshot)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to parse Gemini quota helper output."
        resolve(build_error(message))
      }
    })
  })
}
