#!/usr/bin/env bun
import { mkdir, readFile, writeFile, readdir, stat, copyFile } from "node:fs/promises"
import { basename, dirname, extname, join } from "node:path"
import {
  NewStandardResearch,
  get_model_by_id,
  type ModelID,
  type ReasoningEffort,
} from "../shared/src/types/research"

interface CliOptions {
  problem_path: string
  name?: string
  prover_spec: string
  verifier_spec: string
  summarizer_spec: string
  rounds: number
  prover_count: number
  timeout_min: number
  backend_url: string
  username: string
  password: string
  auto_delete: boolean
  tag?: string
}

type RunStatus = "success" | "failed" | "timeout" | "runner_error"

type ModelRole = "prover" | "verifier" | "summarizer"

interface ParsedModelSpec {
  model_id: ModelID
  reasoning_effort: ReasoningEffort | boolean | null
}

interface ApiResponse<T = unknown> {
  status: number
  data: T | null
  raw: string
}

class CookieJar {
  private values = new Map<string, string>()

  absorb(response: Response) {
    const headers = response.headers as Headers & { getSetCookie?: () => string[] }
    const set_cookie = typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : (response.headers.get("set-cookie") ? [response.headers.get("set-cookie") as string] : [])

    for (const cookie_line of set_cookie) {
      if (!cookie_line) continue
      const [pair] = cookie_line.split(";")
      const eq = pair.indexOf("=")
      if (eq <= 0) continue
      const key = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1).trim()
      this.values.set(key, value)
    }
  }

  header_value() {
    if (this.values.size === 0) return ""
    return Array.from(this.values.entries()).map(([k, v]) => `${k}=${v}`).join("; ")
  }
}

const MODEL_ALIASES: Record<string, ModelID> = {
  "gpt-5.4": "gpt-5.4",
  "gpt-5.2": "gpt-5.2",
  "gpt-5.3-codex": "gpt-5.3-codex",
  "gpt-5.3-codex-spark": "gpt-5.3-codex-spark",
  "gemini-3-pro": "gemini/gemini-3-pro-preview",
  "gemini-3-pro-preview": "gemini/gemini-3-pro-preview",
  "gemini-3-flash": "gemini/gemini-3-flash-preview",
  "gemini-3-flash-preview": "gemini/gemini-3-flash-preview",
  "claude-opus-4.6": "claude/claude-opus-4-6",
  "claude-sonnet-4.6": "claude/claude-sonnet-4-6",
  "claude-haiku-4.5": "claude/claude-haiku-4-5",
  "metacentrum-kimi-k2.5": "metacentrum/kimi-k2.5",
  "kimi-k2.5-metacentrum": "metacentrum/kimi-k2.5",
  "metacentrum-gpt-oss-120b": "metacentrum/gpt-oss-120b",
  "gpt-oss-120b-metacentrum": "metacentrum/gpt-oss-120b",
  "metacentrum-deepseek-v3.2": "metacentrum/deepseek-v3.2-thinking",
  "deepseek-v3.2-metacentrum": "metacentrum/deepseek-v3.2-thinking",
  "metacentrum-glm-4.7": "metacentrum/glm-4.7",
  "glm-4.7-metacentrum": "metacentrum/glm-4.7",
}

async function main() {
  const started_at = Date.now()
  const options = parse_args(process.argv.slice(2))

  const run_slug = build_run_slug(options)
  const run_dir = join("debug", "runs", run_slug)
  const tmp_debug_dir = join(run_dir, "tmp-debug")
  await mkdir(tmp_debug_dir, { recursive: true })

  const timeline: Array<Record<string, unknown>> = []
  const cookie_jar = new CookieJar()

  let problem_id: string | null = null
  let status: RunStatus = "runner_error"
  let runner_error: string | null = null
  let research_start_ts = 0
  let research_end_ts = 0

  try {
    const problem_task = (await readFile(options.problem_path, "utf8")).trim()
    if (!problem_task) throw new Error(`Problem file is empty: ${options.problem_path}`)

    const problem_name = options.name ?? derive_problem_name(options.problem_path)

    const prover_model = parse_model_spec(options.prover_spec, "prover")
    const verifier_model = parse_model_spec(options.verifier_spec, "verifier")
    const summarizer_model = parse_model_spec(options.summarizer_spec, "summarizer")

    const request_body = NewStandardResearch.parse({
      problem_id: "00000000-0000-4000-8000-000000000001",
      rounds: String(options.rounds),
      round_instructions: "",
      prover: {
        count: String(options.prover_count),
        prompt: (await readFile(join("shared", "src", "prompts", "user", "prover.md"), "utf8")).trim(),
        system_prompt: (await readFile(join("shared", "src", "prompts", "system", "prover.md"), "utf8")).trim(),
        provers: Array.from({ length: options.prover_count }, () => ({
          model: {
            id: prover_model.model_id,
            config: {
              reasoning_effort: prover_model.reasoning_effort,
              web_search: false,
            },
            role: "prover",
          },
        })),
      },
      verifier: {
        prompt: (await readFile(join("shared", "src", "prompts", "user", "verifier.md"), "utf8")).trim(),
        system_prompt: (await readFile(join("shared", "src", "prompts", "system", "verifier.md"), "utf8")).trim(),
        model: {
          id: verifier_model.model_id,
          config: {
            reasoning_effort: verifier_model.reasoning_effort,
            web_search: false,
          },
          role: "verifier",
        },
      },
      summarizer: {
        prompt: (await readFile(join("shared", "src", "prompts", "user", "summarizer.md"), "utf8")).trim(),
        system_prompt: (await readFile(join("shared", "src", "prompts", "system", "summarizer.md"), "utf8")).trim(),
        model: {
          id: summarizer_model.model_id,
          config: {
            reasoning_effort: summarizer_model.reasoning_effort,
            web_search: false,
          },
          role: "summarizer",
        },
      },
    })

    await write_json(join(run_dir, "request.json"), {
      cli: options,
      started_at: new Date(started_at).toISOString(),
      normalized: {
        problem_name,
        problem_path: options.problem_path,
        prover: prover_model,
        verifier: verifier_model,
        summarizer: summarizer_model,
      },
    })

    await expect_ok(api_fetch(cookie_jar, options.backend_url, "/api/health", { method: "GET" }), "backend health")

    await expect_ok(api_fetch(cookie_jar, options.backend_url, "/api/auth/signin", {
      method: "POST",
      body: {
        identifier: options.username,
        password: options.password,
      },
    }), "auth signin")

    await expect_ok(api_fetch(cookie_jar, options.backend_url, "/api/auth/me", { method: "GET" }), "auth me")

    const create_resp = await expect_ok(api_fetch(cookie_jar, options.backend_url, "/api/problems/create-new-problem", {
      method: "POST",
      body: {
        problem_name: problem_name,
        problem_task: problem_task,
      },
    }), "create problem")

    const created_id = ((create_resp.data as any)?.data?.problem_id ?? null) as string | null
    if (!created_id) throw new Error(`Missing problem_id in create response: ${JSON.stringify(create_resp.data)}`)
    problem_id = created_id

    const research_payload = {
      ...request_body,
      problem_id: problem_id,
    }

    research_start_ts = Date.now()
    await expect_ok(api_fetch(cookie_jar, options.backend_url, "/api/research/run-standard-research", {
      method: "POST",
      body: research_payload,
    }), "start research")

    const timeout_ms = options.timeout_min * 60_000
    let terminal_status: string | null = null

    while (Date.now() - research_start_ts < timeout_ms) {
      const poll_ts = Date.now()
      const overview = await api_fetch(cookie_jar, options.backend_url, `/api/problems/research_overview/${problem_id}`, { method: "GET" })
      if (overview.status >= 400) {
        timeline.push({ ts: new Date(poll_ts).toISOString(), event: "poll_error", status: overview.status, data: overview.data, raw: overview.raw })
      } else {
        const data = overview.data as { status?: string } | null
        const current = data?.status ?? "unknown"
        timeline.push({ ts: new Date(poll_ts).toISOString(), event: "poll", status: current })

        if (current === "completed" || current === "failed" || current === "idle") {
          terminal_status = current
          break
        }
      }
      await sleep(3000)
    }

    if (!terminal_status) {
      status = "timeout"
      research_end_ts = Date.now()
      timeline.push({ ts: new Date(research_end_ts).toISOString(), event: "timeout", timeout_min: options.timeout_min })

      if (problem_id) {
        const ff = await api_fetch(cookie_jar, options.backend_url, `/api/research/force-fail/${problem_id}`, { method: "POST" })
        timeline.push({ ts: new Date().toISOString(), event: "force_fail", status: ff.status, data: ff.data, raw: ff.raw })
      }
    } else {
      research_end_ts = Date.now()
      status = terminal_status === "completed" ? "success" : "failed"
    }

    await collect_problem_artifacts(cookie_jar, options.backend_url, run_dir, problem_id)

    await copy_tmp_debug_range(tmp_debug_dir, (research_start_ts || started_at) - 30_000, (research_end_ts || Date.now()) + 30_000)

    if (problem_id && options.auto_delete) {
      const del = await api_fetch(cookie_jar, options.backend_url, `/api/problems/${problem_id}`, { method: "DELETE" })
      await write_json(join(run_dir, "cleanup.json"), {
        action: "delete_problem",
        status: del.status,
        data: del.data,
        raw: del.raw,
      })
    } else {
      await write_json(join(run_dir, "cleanup.json"), {
        action: "keep_problem",
        problem_id,
      })
    }
  } catch (error) {
    runner_error = error instanceof Error ? error.message : String(error)
    status = "runner_error"
    research_end_ts = research_end_ts || Date.now()
  }

  await write_json(join(run_dir, "timeline.json"), timeline)
  await write_summary(join(run_dir, "summary.md"), {
    status,
    problem_id,
    run_dir,
    started_at,
    research_start_ts,
    research_end_ts,
    runner_error,
    auto_delete: options.auto_delete,
  })

  console.log(`Run status: ${status}`)
  console.log(`Artifacts: ${run_dir}`)
  if (problem_id) console.log(`Problem ID: ${problem_id}`)
  if (runner_error) console.error(`Error: ${runner_error}`)

  if (status === "success") process.exit(0)
  if (status === "failed") process.exit(10)
  if (status === "timeout") process.exit(11)
  process.exit(12)
}

function parse_args(args: string[]): CliOptions {
  const get = (flag: string) => {
    const i = args.indexOf(flag)
    if (i === -1) return undefined
    return args[i + 1]
  }
  const has = (flag: string) => args.includes(flag)

  const problem_path = get("--problem")
  const prover_spec = get("--prover")
  const verifier_spec = get("--verifier")
  const summarizer_spec = get("--summarizer")

  if (!problem_path) throw new Error("Missing required flag: --problem <path>")
  if (!prover_spec) throw new Error("Missing required flag: --prover <model_spec>")
  if (!verifier_spec) throw new Error("Missing required flag: --verifier <model_spec>")
  if (!summarizer_spec) throw new Error("Missing required flag: --summarizer <model_spec>")

  const backend_port = Bun.env.BACKEND_PORT ?? "3942"
  const rounds = Number(get("--rounds") ?? "1")
  const prover_count = Number(get("--prover-count") ?? "1")
  const timeout_min = Number(get("--timeout-min") ?? "45")

  if (!Number.isFinite(rounds) || rounds < 1) throw new Error(`Invalid --rounds value: ${get("--rounds")}`)
  if (!Number.isFinite(prover_count) || prover_count < 1) throw new Error(`Invalid --prover-count value: ${get("--prover-count")}`)
  if (!Number.isFinite(timeout_min) || timeout_min <= 0) throw new Error(`Invalid --timeout-min value: ${get("--timeout-min")}`)

  return {
    problem_path,
    name: get("--name"),
    prover_spec,
    verifier_spec,
    summarizer_spec,
    rounds,
    prover_count,
    timeout_min,
    backend_url: (get("--backend-url") ?? `http://localhost:${backend_port}`).replace(/\/$/, ""),
    username: get("--username") ?? Bun.env.LOCAL_AUTH_USERNAME ?? "admin",
    password: get("--password") ?? Bun.env.LOCAL_AUTH_PASSWORD ?? "admin",
    auto_delete: has("--auto-delete"),
    tag: get("--tag"),
  }
}

function parse_model_spec(spec: string, role: ModelRole): ParsedModelSpec {
  const trimmed = spec.trim()
  const match = trimmed.match(/^(.+?)(?:\(([^)]+)\)|:([^:]+))?$/)
  if (!match) throw new Error(`Invalid model spec: ${spec}`)

  const alias_or_id = match[1].trim()
  const effort_raw = (match[2] ?? match[3] ?? "").trim()

  const maybe_id = (MODEL_ALIASES[alias_or_id] ?? alias_or_id) as ModelID
  const model = get_model_by_id(maybe_id)
  if (!model) throw new Error(`Unknown model: ${alias_or_id}`)

  const reasoning_config = model.config.reasoning
  const reasoning_effort = normalize_reasoning_effort(reasoning_config, effort_raw, model.id)

  return {
    model_id: maybe_id,
    reasoning_effort,
  }
}

function normalize_reasoning_effort(
  config: null | "toggle" | readonly ReasoningEffort[],
  effort_raw: string,
  model_id: string
): ReasoningEffort | boolean | null {
  if (config === null) {
    if (effort_raw) throw new Error(`Model ${model_id} does not support reasoning configuration. Omit effort.`)
    return null
  }

  if (config === "toggle") {
    if (!effort_raw) return true
    const v = effort_raw.toLowerCase()
    if (["true", "on", "enabled"].includes(v)) return true
    if (["false", "off", "disabled", "none"].includes(v)) return false
    throw new Error(`Model ${model_id} expects toggle reasoning effort (true/false), got: ${effort_raw}`)
  }

  const normalized = (effort_raw || "medium").toLowerCase() as ReasoningEffort
  if (!config.includes(normalized)) {
    throw new Error(`Model ${model_id} supports reasoning efforts [${config.join(", ")}], got: ${normalized}`)
  }
  return normalized
}

async function api_fetch(cookie_jar: CookieJar, backend_url: string, path: string, init: {
  method: "GET" | "POST" | "DELETE"
  body?: unknown
}): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
  }
  if (init.body !== undefined) headers["Content-Type"] = "application/json"

  const cookie = cookie_jar.header_value()
  if (cookie) headers["Cookie"] = cookie

  const response = await fetch(`${backend_url}${path}`, {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })

  cookie_jar.absorb(response)

  const raw = await response.text()
  let data: unknown = null
  try {
    data = raw ? JSON.parse(raw) : null
  } catch {
    data = null
  }

  return {
    status: response.status,
    data,
    raw,
  }
}

async function expect_ok(promise: Promise<ApiResponse>, context: string) {
  const response = await promise
  if (response.status >= 400) {
    const message = extract_error_message(response)
    throw new Error(`${context} failed (${response.status}): ${message}`)
  }
  return response
}

function extract_error_message(response: ApiResponse) {
  const maybe = response.data as { message?: string } | null
  if (typeof maybe?.message === "string") return maybe.message
  if (response.raw) return response.raw
  return "Unknown error"
}

async function collect_problem_artifacts(cookie_jar: CookieJar, backend_url: string, run_dir: string, problem_id: string) {
  const endpoints: Array<{ name: string, path: string }> = [
    { name: "overview", path: `/api/problems/overview/${problem_id}` },
    { name: "conversations", path: `/api/problems/conversations/${problem_id}` },
    { name: "all_files", path: `/api/problems/all_files/${problem_id}` },
    { name: "main_files_history", path: `/api/problems/main_files_history/${problem_id}` },
  ]

  for (const endpoint of endpoints) {
    const result = await api_fetch(cookie_jar, backend_url, endpoint.path, { method: "GET" })
    await write_json(join(run_dir, `${endpoint.name}.json`), {
      status: result.status,
      data: result.data,
      raw: result.raw,
    })
  }
}

async function copy_tmp_debug_range(dest_dir: string, from_ts: number, to_ts: number) {
  const tmp_root = "/tmp"
  const entries = await readdir(tmp_root, { withFileTypes: true })
  const candidates = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("codex-llm-"))
    .map((entry) => join(tmp_root, entry.name, "debug"))

  for (const debug_dir of candidates) {
    await copy_matching_files(debug_dir, dest_dir, from_ts, to_ts)
  }
}

async function copy_matching_files(source_dir: string, dest_root: string, from_ts: number, to_ts: number) {
  let entries: Awaited<ReturnType<typeof readdir>>
  try {
    entries = await readdir(source_dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const source_path = join(source_dir, entry.name)
    if (entry.isDirectory()) {
      await copy_matching_files(source_path, dest_root, from_ts, to_ts)
      continue
    }
    if (!entry.isFile()) continue

    let info
    try {
      info = await stat(source_path)
    } catch {
      continue
    }

    const mtime = info.mtimeMs
    if (mtime < from_ts || mtime > to_ts) continue

    const relative_from_tmp = source_path.replace(/^\/tmp\//, "")
    const target_path = join(dest_root, relative_from_tmp)
    await mkdir(dirname(target_path), { recursive: true })
    await copyFile(source_path, target_path)
  }
}

async function write_summary(path: string, data: {
  status: RunStatus
  problem_id: string | null
  run_dir: string
  started_at: number
  research_start_ts: number
  research_end_ts: number
  runner_error: string | null
  auto_delete: boolean
}) {
  const lines = [
    `# Adapter Test Run`,
    ``,
    `- Status: **${data.status}**`,
    `- Started: ${new Date(data.started_at).toISOString()}`,
    `- Problem ID: ${data.problem_id ?? "n/a"}`,
    `- Auto cleanup: ${data.auto_delete ? "yes (--auto-delete)" : "no (kept by default)"}`,
    `- Artifacts dir: \`${data.run_dir}\``,
  ]

  if (data.research_start_ts > 0 && data.research_end_ts > 0) {
    lines.push(`- Research duration: ${((data.research_end_ts - data.research_start_ts) / 1000).toFixed(1)}s`)
  }

  if (data.runner_error) {
    lines.push(``, `## Runner Error`, ``, "```text", data.runner_error, "```")
  }

  lines.push(``, `## Files`, ``, `- request.json`, `- timeline.json`, `- overview.json`, `- conversations.json`, `- all_files.json`, `- main_files_history.json`, `- cleanup.json`, `- tmp-debug/`)

  await writeFile(path, lines.join("\n"), "utf8")
}

async function write_json(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data, null, 2), "utf8")
}

function derive_problem_name(problem_path: string) {
  const stem = basename(problem_path, extname(problem_path)).replace(/[-_]+/g, " ").trim()
  const base = stem.length >= 5 ? stem : "adapter test problem"
  return `${base} (${new Date().toISOString().slice(0, 16).replace("T", " ")})`
}

function build_run_slug(options: CliOptions) {
  const now = new Date()
  const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`
  const tag_raw = options.tag ?? basename(options.problem_path, extname(options.problem_path))
  const tag = tag_raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "run"
  return `${stamp}-${tag}`
}

function pad2(v: number) {
  return String(v).padStart(2, "0")
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

await main()
