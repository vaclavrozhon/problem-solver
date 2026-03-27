import { z } from "zod"
import { mkdirSync, existsSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { get_model_by_id, get_model_transport } from "@shared/types/research"
import type { ModelConfig, ModelID } from "@shared/types/research"
import { save_llm_log } from "./research_utils"
import type { DbOrTx } from "./research_utils"
import { get_user_openrouter_key } from "@backend/openrouter/provider"
import { get_metacentrum_api_base_url, get_metacentrum_model_id, get_user_metacentrum_key } from "@backend/metacentrum/provider"

export interface LLMUsage {
  cost: number | null,
  transport: "openrouter" | "codex_cli" | "gemini_cli" | "claude_cli" | "metacentrum_openai",
  [key: string]: unknown,
}

interface OpenRouterContentBlock {
  type: string,
  text?: string,
}

interface OpenRouterOutputBlock {
  type: string,
  status?: string,
  content?: OpenRouterContentBlock[],
}

interface OpenRouterAPIResponse {
  output: OpenRouterOutputBlock[],
  usage?: Record<string, unknown>,
  status?: string,
}

interface OpenAIChatCompletionsResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string, text?: string }>,
    },
  }>,
  usage?: Record<string, unknown>,
}

interface LLMSuccessResponse {
  success: true,
  usage: LLMUsage,
  time: number,
  model_id: ModelID,
  warnings?: string[],
}

export interface LLMTextSuccessResponse extends LLMSuccessResponse{
  output: string
}

export interface LLMStructuredSuccessResponse<T> extends LLMSuccessResponse {
  output: T,
}

type LLMErrorResponse = {
  success: false,
  error: Error,
  model_id: ModelID,
}

export type LLMStructuredResponse<T> = LLMStructuredSuccessResponse<T> | LLMErrorResponse
export type LLMTextResponse = LLMTextSuccessResponse | LLMErrorResponse
export type LLMResponse<T> = LLMStructuredResponse<T> | LLMTextResponse

interface LLMMessages {
  role: "system" | "user" | "assistant",
  content: string,
}

interface GenerateLLMBaseParams {
  db: DbOrTx,
  model: ModelConfig,
  user_id: string,
  messages: LLMMessages[],
  prompt_file_id: string,
  context: string,
  max_retries?: number,
  save_to_db?: boolean,
  temperature?: number,
}

interface GenerateLLMParamsWithSchema<T> extends GenerateLLMBaseParams {
  schema: z.ZodType<T>
}

interface GenerateLLMParamsWithoutSchema extends GenerateLLMBaseParams {
  schema?: undefined
}

export type GenerateLLMParams<T> = GenerateLLMParamsWithSchema<T> | GenerateLLMParamsWithoutSchema

interface OpenRouterRequestBody {
  model: string,
  input: (LLMMessages & { type: "message" })[],
  temperature: number,
  reasoning: any,
  provider: {
    only: string[],
  },
  user: string,
  text: {
    verbosity: "high",
    format: {
      type: "text"
    } | {
      type: "json_schema",
      strict: true,
      name: string,
      schema: any,
    }
  },
  max_output_tokens?: number,
}

function extract_text_output(data: OpenRouterAPIResponse) {
  const message = data.output?.find((o) => o.type === "message")
  const content = message?.content?.find((c) => c.type === "output_text" || c.type === "text")
  if (!content?.text) return null
  return {
    text: content.text
      .normalize("NFC")
      .replace(/\u0000/g, "")
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, ""),
  }
}

function extract_openai_choice_text(data: OpenAIChatCompletionsResponse) {
  const content = data.choices?.[0]?.message?.content
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    const text = content
      .map((item) => (item && typeof item.text === "string" ? item.text : ""))
      .join("")
      .trim()
    return text || null
  }
  return null
}

function parse_json_output<T>(text: string, schema: z.ZodType<T>, log_prefix: string): T {
  const candidates = extract_json_candidates(text)
  let parsed_json: unknown

  let parsed = false
  for (const candidate of candidates) {
    try {
      parsed_json = parse_json_with_repairs(candidate)
      parsed = true
      console.log(`${log_prefix} JSON parsed successfully`)
      break
    } catch {
      // try next candidate
    }
  }

  if (!parsed) {
    console.error(`${log_prefix} JSON parse error: no valid JSON candidate found`)
    throw new Error("Invalid JSON in response")
  }

  try {
    const normalized = normalize_common_structured_output(parsed_json)
    const result = schema.parse(normalized) as T
    console.log(`${log_prefix} Zod validation passed`)
    return result
  } catch (err) {
    console.error(`${log_prefix} Zod validation error:`, err)
    throw new Error("Response doesn't match expected schema")
  }
}

function extract_json_candidates(text: string) {
  const candidates: string[] = []
  const trimmed = text.trim()
  if (trimmed) candidates.push(trimmed)

  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i)
  if (fenced?.[1]) candidates.push(fenced[1].trim())

  const first_object = extract_first_balanced_json(trimmed)
  if (first_object) candidates.push(first_object)

  // de-duplicate while preserving order
  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    if (seen.has(candidate)) return false
    seen.add(candidate)
    return true
  })
}

function repair_common_json_escaping_issues(text: string) {
  let output = ""
  let in_string = false
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (!in_string) {
      output += ch
      if (ch === "\"") in_string = true
      continue
    }

    if (escaped) {
      output += ch
      escaped = false
      continue
    }

    if (ch === "\\") {
      const next = text[i + 1] ?? ""
      const valid_escape = next === "\"" ||
        next === "\\" ||
        next === "/" ||
        next === "b" ||
        next === "f" ||
        next === "n" ||
        next === "r" ||
        next === "t" ||
        next === "u"

      if (valid_escape) {
        output += ch
        escaped = true
      } else {
        // Preserve literal backslashes commonly used in markdown/LaTeX
        // by converting invalid JSON escapes like \subset into \\subset.
        output += "\\\\"
      }
      continue
    }

    if (ch === "\n") {
      output += "\\n"
      continue
    }
    if (ch === "\r") {
      output += "\\r"
      continue
    }
    if (ch === "\t") {
      output += "\\t"
      continue
    }

    output += ch
    if (ch === "\"") in_string = false
  }

  return output
}

function parse_json_with_repairs(text: string) {
  try {
    return JSON.parse(text) as unknown
  } catch {
    const repaired = repair_common_json_escaping_issues(text)
    return JSON.parse(repaired) as unknown
  }
}

function extract_first_balanced_json(text: string) {
  const start = text.indexOf("{")
  if (start < 0) return null

  let depth = 0
  let in_string = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]

    if (in_string) {
      if (escaped) escaped = false
      else if (ch === "\\") escaped = true
      else if (ch === "\"") in_string = false
      continue
    }

    if (ch === "\"") {
      in_string = true
      continue
    }

    if (ch === "{") depth++
    if (ch === "}") {
      depth--
      if (depth === 0) {
        return text.slice(start, i + 1).trim()
      }
    }
  }

  return null
}

function get_reasoning_config(model: ModelConfig) {
  const reasoning = model.config.reasoning_effort

  if (reasoning === null) return undefined
  if (typeof reasoning === "boolean") return { enabled: reasoning }

  if (reasoning === "none") {
    if (model.id === "google/gemini-3-flash-preview") return { enabled: false }
  }

  return { effort: reasoning }
}

function get_codex_reasoning_effort(model: ModelConfig): "low" | "medium" | "high" | "xhigh" {
  const value = model.config.reasoning_effort
  if (value === "low" || value === "medium" || value === "high" || value === "xhigh") return value
  if (value === "none" || value === false || value === null) return "low"
  return "medium"
}

function build_gemini_prompt(messages: LLMMessages[]) {
  return build_codex_prompt(messages)
}

function build_gemini_json_prompt(messages: LLMMessages[], schema: Record<string, unknown>) {
  return (
    build_gemini_prompt(messages)
    + "\n\nIMPORTANT STRUCTURED OUTPUT REQUIREMENT:\n"
    + "- Return only a valid JSON object matching the requested shape.\n"
    + "- Do not wrap the JSON in markdown fences.\n"
    + "- Do not return explanations before or after the JSON.\n\n"
    + JSON.stringify(schema, null, 2)
  )
}

function build_json_recovery_prompt(schema: Record<string, unknown>, raw_response: string) {
  return (
    "You are repairing a previous model response into strict JSON.\n"
    + "Return only one valid JSON object matching the schema below.\n"
    + "Do not wrap the JSON in markdown fences.\n"
    + "Do not include explanations before or after the JSON.\n"
    + "If the previous response is plain prose rather than an explicit structured action,\n"
    + "map it into the schema as faithfully as possible instead of copying the prose verbatim.\n\n"
    + "Required schema:\n"
    + JSON.stringify(schema, null, 2)
    + "\n\nPrevious response to repair:\n"
    + raw_response
  )
}

function build_codex_prompt(messages: LLMMessages[]) {
  const prefix = [
    "IMPORTANT RUNTIME CONSTRAINTS:",
    "- This is a non-interactive one-shot run.",
    "- Do NOT ask follow-up questions.",
    "- Do NOT run tools or commands.",
    "- Do NOT attempt command execution, shell calls, file edits, or environment inspection.",
    "- Return exactly one final assistant message as the answer.",
    "- Follow the task instructions as written.",
    "- Partial, rigorous progress is acceptable when full resolution is not possible.",
    "",
  ].join("\n")

  return prefix + messages.map((message) =>
    `### ${message.role.toUpperCase()}\n${message.content}`.trim()
  ).join("\n\n")
}

function get_codex_cli_model_id(model_id: string) {
  if (model_id === "chatgpt-5.2") return "gpt-5.2"
  if (model_id === "chatgpt-5.3-codex") return "gpt-5.3-codex"
  return model_id
}

const GEMINI_PRO_MODEL_ID = "gemini/gemini-3-pro-preview" as const
const GEMINI_FLASH_MODEL_ID = "gemini/gemini-3-flash-preview" as const

function get_gemini_cli_model_id(model_id: string) {
  if (model_id === GEMINI_PRO_MODEL_ID) return "gemini-3-pro-preview"
  if (model_id === GEMINI_FLASH_MODEL_ID) return "gemini-3-flash-preview"
  return model_id
}

function get_claude_cli_model_id(model_id: string) {
  if (model_id === "claude/claude-opus-4-6") return "claude-opus-4-6"
  if (model_id === "claude/claude-sonnet-4-6") return "claude-sonnet-4-6"
  if (model_id === "claude/claude-haiku-4-5") return "claude-haiku-4-5"
  return model_id
}

function get_claude_reasoning_effort(model: ModelConfig): "low" | "medium" | "high" {
  const value = model.config.reasoning_effort
  if (value === "low" || value === "medium" || value === "high") return value
  return "medium"
}

function get_gemini_thinking_budget(model: ModelConfig) {
  const value = model.config.reasoning_effort
  if (value === "medium") return 512
  if (value === "high") return 8192
  if (value === "xhigh") return -1
  return 0
}

function ensure_local_temp_dir() {
  const dir = `/tmp/codex-llm-${process.pid}`
  mkdirSync(dir, { recursive: true })
  if (!existsSync(dir)) {
    throw new Error(`Failed to create temp dir for Codex: ${dir}`)
  }
  return dir
}

function get_debug_dir(base_dir: string) {
  const debug_dir = `${base_dir}/debug`
  mkdirSync(debug_dir, { recursive: true })
  return debug_dir
}

function should_debug_codex() {
  return Bun.env.CODEX_DEBUG === "1" || Bun.env.CODEX_DEBUG === "true"
}

function should_debug_gemini() {
  return Bun.env.GEMINI_DEBUG === "1" || Bun.env.GEMINI_DEBUG === "true"
}

function should_debug_claude() {
  return Bun.env.CLAUDE_DEBUG === "1" || Bun.env.CLAUDE_DEBUG === "true"
}

async function run_codex_exec(command: string[], timeout_ms: number, input?: string) {
  const proc = Bun.spawn(command, {
    stdout: "pipe",
    stderr: "pipe",
    stdin: input !== undefined ? "pipe" : "ignore",
  })

  if (input !== undefined && proc.stdin) {
    proc.stdin.write(input)
    proc.stdin.end()
  }

  let timed_out = false
  const timer = setTimeout(() => {
    timed_out = true
    try {
      proc.kill()
    } catch {
      // noop
    }
  }, timeout_ms)

  const exit_code = await proc.exited
  clearTimeout(timer)

  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()

  return { exit_code, stdout, stderr, timed_out }
}

async function run_simple_exec(command: string[], timeout_ms: number, cwd?: string) {
  const proc = Bun.spawn(command, {
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
    cwd,
  })

  let timed_out = false
  const timer = setTimeout(() => {
    timed_out = true
    try {
      proc.kill()
    } catch {
      // noop
    }
  }, timeout_ms)

  const exit_code = await proc.exited
  clearTimeout(timer)

  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()

  return { exit_code, stdout, stderr, timed_out }
}

async function run_claude_exec(command: string[], timeout_ms: number) {
  const timeout_seconds = Math.max(1, Math.ceil(timeout_ms / 1000))
  const wrapped_command = [
    "timeout",
    "--foreground",
    `${timeout_seconds}s`,
    ...command,
  ]

  const result = await run_simple_exec(wrapped_command, timeout_ms + 5000)
  const timed_out = result.timed_out || result.exit_code === 124
  return {
    ...result,
    timed_out,
    wrapped_command,
  }
}

function summarize_codex_jsonl(stdout: string) {
  const lines = stdout.split("\n").map(line => line.trim()).filter(Boolean)
  const event_types: Record<string, number> = {}
  const errors: string[] = []
  let turn_completed = false
  let turn_failed = false

  for (const line of lines) {
    if (!line.startsWith("{")) continue
    try {
      const event = JSON.parse(line) as Record<string, unknown>
      const type = typeof event.type === "string" ? event.type : "unknown"
      event_types[type] = (event_types[type] ?? 0) + 1
      if (type === "turn.completed") turn_completed = true
      if (type === "turn.failed") turn_failed = true
      if (type === "error" && typeof event.message === "string") errors.push(event.message)
    } catch {
      // ignore malformed line
    }
  }

  return {
    turn_completed,
    turn_failed,
    errors,
    event_types,
    line_count: lines.length,
  }
}

function extract_codex_output_from_jsonl(stdout: string) {
  const chunks: string[] = []
  const lines = stdout.split("\n").map(line => line.trim()).filter(Boolean)

  const collect_text_blocks = (content: unknown): string[] => {
    if (!Array.isArray(content)) return []
    const text_chunks: string[] = []
    for (const block of content) {
      if (!block || typeof block !== "object") continue
      const typed = block as Record<string, unknown>
      const block_type = typeof typed.type === "string" ? typed.type : ""
      if (block_type !== "output_text" && block_type !== "text") continue
      if (typeof typed.text === "string") text_chunks.push(typed.text)
    }
    return text_chunks
  }

  for (const line of lines) {
    if (!line.startsWith("{")) continue
    try {
      const event = JSON.parse(line) as Record<string, unknown>
      const type = typeof event.type === "string" ? event.type : ""

      if (type === "agent_message" || type === "assistant_message") {
        const payload = event.payload
        if (payload && typeof payload === "object") {
          const p = payload as Record<string, unknown>
          if (typeof p.text === "string") chunks.push(p.text)
          if (typeof p.message === "string") chunks.push(p.message)
        }
        continue
      }

      if (type === "item.completed") {
        const item = event.item
        if (!item || typeof item !== "object") continue
        const i = item as Record<string, unknown>
        const item_type = typeof i.type === "string" ? i.type : ""
        if (item_type !== "agent_message" && item_type !== "assistant_message") continue
        if (typeof i.text === "string") chunks.push(i.text)
        if (typeof i.message === "string") chunks.push(i.message)
        continue
      }

      if (type === "response_item") {
        const payload = event.payload
        if (!payload || typeof payload !== "object") continue
        const p = payload as Record<string, unknown>
        const payload_type = typeof p.type === "string" ? p.type : ""

        if (payload_type === "message") {
          chunks.push(...collect_text_blocks(p.content))
          continue
        }

        if ((payload_type === "output_text" || payload_type === "text") && typeof p.text === "string") {
          chunks.push(p.text)
          continue
        }
      }
    } catch {
      // noop
    }
  }

  const text = chunks.join("").trim()
  return text || null
}

function extract_codex_output_from_stdout_fallback(stdout: string) {
  const candidates: string[] = []

  const push_candidate = (value: string) => {
    const cleaned = value
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, "\"")
      .replace(/\\\\/g, "\\")
      .trim()
    if (!cleaned) return
    if (cleaned.length < 40) return
    if (/^item\./i.test(cleaned)) return
    candidates.push(cleaned)
  }

  // 1) Try to parse each JSONL line and collect explicit text/message fields.
  const lines = stdout.split("\n").map(line => line.trim()).filter(Boolean)
  for (const line of lines) {
    if (!line.startsWith("{")) continue
    try {
      const event = JSON.parse(line) as Record<string, unknown>
      const walk = (value: unknown): void => {
        if (!value || typeof value !== "object") return
        if (Array.isArray(value)) {
          for (const item of value) walk(item)
          return
        }
        const obj = value as Record<string, unknown>
        if (typeof obj.text === "string") push_candidate(obj.text)
        if (typeof obj.message === "string") push_candidate(obj.message)
        if (typeof obj.delta === "string") push_candidate(obj.delta)
        for (const nested of Object.values(obj)) walk(nested)
      }
      walk(event)
    } catch {
      // noop
    }
  }

  // 2) Regex fallback for JSON-like fragments in stdout.
  const regexes = [
    /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    /"message"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
  ]
  for (const regex of regexes) {
    let match: RegExpExecArray | null = null
    while ((match = regex.exec(stdout)) !== null) {
      if (match[1]) push_candidate(match[1])
    }
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.length - a.length)
  return candidates[0]
}

function get_gemini_alias_name(model_id: string, reasoning_effort: ModelConfig["config"]["reasoning_effort"]) {
  const model_slug = model_id.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase()
  const effort_slug = String(reasoning_effort ?? "default").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()
  return `bolzano-${model_slug}-${effort_slug}`
}

function parse_json_output_candidates<T>(candidates: string[], schema: z.ZodType<T>): T | null {
  const parsed_objects: unknown[] = []

  for (const candidate of candidates) {
    const json_candidates = extract_json_candidates(candidate)
    for (const json_candidate of json_candidates) {
      try {
        const parsed = parse_json_with_repairs(json_candidate)
        parsed_objects.push(parsed)
        const validated = schema.safeParse(parsed)
        if (validated.success) return validated.data
      } catch {
        // try next candidate
      }
    }
  }

  for (const parsed of parsed_objects) {
    const normalized = normalize_common_structured_output(parsed)
    const validated = schema.safeParse(normalized)
    if (validated.success) return validated.data
  }

  return null
}

function parse_json_output_candidates_strict<T>(candidates: string[], schema: z.ZodType<T>): T | null {
  for (const candidate of candidates) {
    const json_candidates = extract_json_candidates(candidate)
    for (const json_candidate of json_candidates) {
      try {
        const parsed = parse_json_with_repairs(json_candidate)
        const normalized = normalize_common_structured_output(parsed)
        const validated = schema.safeParse(normalized)
        if (validated.success) return validated.data
      } catch {
        // try next candidate
      }
    }
  }
  return null
}

function parse_markdown_structured_fallback<T>(candidates: string[], schema: z.ZodType<T>): T | null {
  const text = candidates.find((candidate) => candidate.trim().length > 0)
  if (!text) return null

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const first_line = lines[0]?.replace(/^[-*#\s`]+/, "").trim() ?? ""
  const one_line_summary = first_line.slice(0, 100)

  const payload = {
    summary: text,
    one_line_summary,
  }

  const validated = schema.safeParse(payload)
  if (validated.success) return validated.data
  return null
}

async function prepare_gemini_workspace(model: ModelConfig) {
  const temp_dir = mkdtempSync(`${tmpdir()}/gemini-llm-`)
  const settings_dir = `${temp_dir}/.gemini`
  mkdirSync(settings_dir, { recursive: true })

  const alias_name = get_gemini_alias_name(model.id, model.config.reasoning_effort)
  const settings_payload = {
    modelConfigs: {
      customAliases: {
        [alias_name]: {
          extends: "base",
          modelConfig: {
            model: get_gemini_cli_model_id(model.id),
            generateContentConfig: {
              thinkingConfig: {
                thinkingBudget: get_gemini_thinking_budget(model),
              },
            },
          },
        },
      },
    },
  }

  await Bun.write(`${settings_dir}/settings.json`, JSON.stringify(settings_payload, null, 2))
  return { temp_dir, alias_name }
}

function extract_gemini_output_payload(stdout: string) {
  const text = stdout.trim()
  if (!text) throw new Error("gemini returned empty stdout")

  const candidates = [text]
  candidates.push(...text.split("\n").map(line => line.trim()).filter(line => line.startsWith("{")))

  for (const candidate of [...candidates].reverse()) {
    try {
      const parsed = JSON.parse(candidate) as unknown
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      // try next candidate
    }
  }

  throw new Error("gemini returned invalid JSON output")
}

function normalize_common_structured_output(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const obj = { ...(value as Record<string, unknown>) }

  // Common verifier shape issue on Gemini/Codex/Claude local transports:
  // notes/proofs/output updates returned as plain strings instead of { action, content }.
  for (const key of ["notes_update", "proofs_update", "output_update"] as const) {
    const update = obj[key]
    if (typeof update === "string") {
      obj[key] = { action: "append", content: update }
      continue
    }
    if (update && typeof update === "object" && !Array.isArray(update)) {
      const u = update as Record<string, unknown>
      const action = u.action === "replace" ? "replace" : "append"
      const content = typeof u.content === "string"
        ? u.content
        : typeof u.text === "string"
          ? u.text
          : ""
      obj[key] = { action, content }
      continue
    }
    if (update == null) {
      obj[key] = { action: "append", content: "" }
    }
  }

  if (typeof obj.verdict !== "string" || !["promising", "uncertain", "unlikely"].includes(obj.verdict)) {
    obj.verdict = "uncertain"
  }

  if (!Array.isArray(obj.blocking_issues)) obj.blocking_issues = []

  if (!Array.isArray(obj.per_prover)) {
    if (obj.per_prover && typeof obj.per_prover === "object" && !Array.isArray(obj.per_prover)) {
      const entries = Object.entries(obj.per_prover as Record<string, unknown>)
      obj.per_prover = entries.map(([prover_id, value]) => {
        if (typeof value === "string") {
          const lowered = value.toLowerCase()
          const score = (["promising", "uncertain", "unlikely"] as const).find((s) => lowered.includes(s)) ?? "uncertain"
          return { prover_id, brief_feedback: value, score }
        }
        if (value && typeof value === "object") {
          const v = value as Record<string, unknown>
          const score = v.score === "promising" || v.score === "uncertain" || v.score === "unlikely"
            ? v.score
            : "uncertain"
          const brief_feedback = typeof v.brief_feedback === "string"
            ? v.brief_feedback
            : typeof v.feedback === "string"
              ? v.feedback
              : ""
          return { prover_id, brief_feedback, score }
        }
        return { prover_id, brief_feedback: "", score: "uncertain" }
      })
    } else {
      obj.per_prover = []
    }
  } else {
    obj.per_prover = obj.per_prover.map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return { prover_id: "unknown", brief_feedback: "", score: "uncertain" as const }
      }
      const e = entry as Record<string, unknown>

      if (!("prover_id" in e) && Object.keys(e).length === 1) {
        const [key, value] = Object.entries(e)[0]
        if (typeof value === "string") {
          const lowered = value.toLowerCase()
          const score = (["promising", "uncertain", "unlikely"] as const).find((s) => lowered.includes(s)) ?? "uncertain"
          return { prover_id: key, brief_feedback: value, score }
        }
      }

      const prover_id = typeof e.prover_id === "string" ? e.prover_id : "unknown"
      const brief_feedback = typeof e.brief_feedback === "string"
        ? e.brief_feedback
        : typeof e.feedback === "string"
          ? e.feedback
          : ""
      const score = e.score === "promising" || e.score === "uncertain" || e.score === "unlikely"
        ? e.score
        : "uncertain"
      return { prover_id, brief_feedback, score }
    })
  }

  if (typeof obj.feedback_md !== "string") {
    if (typeof obj.feedback === "string") obj.feedback_md = obj.feedback
    else if (typeof obj.analysis === "string") obj.feedback_md = obj.analysis
  }

  if (typeof obj.summary_md !== "string") {
    if (typeof obj.summary === "string") obj.summary_md = obj.summary
  }

  return obj
}
function get_claude_output_candidates(stdout: string) {
  const trimmed = stdout.trim()
  const candidates: string[] = []

  const push_candidate = (value: unknown) => {
    if (value == null) return
    let cleaned = ""
    if (typeof value === "string") cleaned = value.trim()
    else if (typeof value === "object") cleaned = JSON.stringify(value)
    else return
    if (!cleaned) return
    candidates.push(cleaned)
  }

  const collect_strings_deep = (value: unknown): void => {
    if (!value || typeof value !== "object") return
    if (Array.isArray(value)) {
      for (const item of value) collect_strings_deep(item)
      return
    }

    const obj = value as Record<string, unknown>
    for (const key of ["result", "text", "message", "content", "output", "completion"] as const) {
      push_candidate(obj[key])
    }

    if (Array.isArray(obj.content)) {
      for (const block of obj.content) {
        if (!block || typeof block !== "object") continue
        const typed = block as Record<string, unknown>
        push_candidate(typed.text)
        push_candidate(typed.content)
      }
    }

    for (const nested of Object.values(obj)) {
      collect_strings_deep(nested)
    }
  }

  if (trimmed) candidates.push(trimmed)

  const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean)
  for (const line of lines) {
    if (!line.startsWith("{")) continue
    try {
      const parsed = JSON.parse(line) as unknown
      collect_strings_deep(parsed)
    } catch {
      // noop
    }
  }

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      collect_strings_deep(parsed)
    } catch {
      // noop
    }
  }

  const deduped: string[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue
    seen.add(candidate)
    deduped.push(candidate)
  }
  return deduped
}

async function generate_via_openrouter<T>(
  params: GenerateLLMParams<T>,
  schema: z.ZodType<T> | undefined,
  is_structured: boolean
): Promise<LLMStructuredResponse<T> | LLMTextResponse> {
  const {
    db,
    model,
    user_id,
    messages,
    prompt_file_id,
    context,
    max_retries = 3,
    save_to_db = true,
    temperature = 1,
  } = params

  const log_prefix = `[OpenRouter][${model.id}][${context}]`
  const model_id = model.id
  const model_info = get_model_by_id(model_id)!
  const api_key = await get_user_openrouter_key(db, user_id)

  const openrouter_input = messages.map((msg) => ({
    type: "message" as const,
    role: msg.role,
    content: msg.content,
  }))

  let request_body: OpenRouterRequestBody = {
    model: model_id,
    input: openrouter_input,
    temperature,
    reasoning: get_reasoning_config(model),
    provider: {
      only: [model_info.provider],
    },
    user: user_id,
    text: {
      verbosity: "high",
      format: { type: "text" }
    }
  }

  if (schema) {
    request_body.text.format = {
      type: "json_schema",
      strict: true,
      name: `${context}-schema`,
      schema: schema.toJSONSchema(),
    }
  }

  if (model_info.max_output_tokens) {
    request_body.max_output_tokens = model_info.max_output_tokens
  }

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    const start_time = performance.now()
    console.log(`${log_prefix} attempt ${attempt}/${max_retries}`)

    try {
      const response = await fetch("https://openrouter.ai/api/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://bolzano.app",
          "X-Title": "Bolzano",
        },
        body: JSON.stringify(request_body),
      })

      if (!response.ok) {
        const error_text = await response.text()
        console.error(`${log_prefix} API error:`, error_text.slice(0, 1000))
        throw new Error(`API error ${response.status}`)
      }

      const data = (await response.json()) as OpenRouterAPIResponse
      const time = (performance.now() - start_time) / 1000
      const extracted = extract_text_output(data)
      if (!extracted) throw new Error("No text output in response")

      let output: T | string
      if (is_structured && schema) output = parse_json_output(extracted.text, schema, log_prefix)
      else output = extracted.text

      const usage: LLMUsage = {
        transport: "openrouter",
        cost: typeof data.usage?.cost === "number" ? data.usage.cost : null,
        ...(data.usage ?? {})
      }

      if (save_to_db) {
        await save_llm_log(db, prompt_file_id, { output, request_body }, usage, model_id)
      }

      if (is_structured) {
        return { success: true, output: output as T, usage, time, model_id } as LLMStructuredSuccessResponse<T>
      }
      return { success: true, output: output as string, usage, time, model_id } as LLMTextSuccessResponse
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      console.warn(`${log_prefix} [${attempt}/${max_retries}] Failed: ${error.message}`)
      if (attempt === max_retries) return { success: false, error, model_id }
    }
  }

  return { success: false, error: new Error("Unexpected error"), model_id }
}

async function generate_via_metacentrum_openai<T>(
  params: GenerateLLMParams<T>,
  schema: z.ZodType<T> | undefined,
  is_structured: boolean
): Promise<LLMStructuredResponse<T> | LLMTextResponse> {
  const {
    db,
    model,
    user_id,
    messages,
    prompt_file_id,
    context,
    max_retries = 3,
    save_to_db = true,
    temperature = 1,
  } = params

  const log_prefix = `[MetaCentrum][${model.id}][${context}]`
  const model_id = model.id
  const provider_model_id = get_metacentrum_model_id(model.id)
  const model_info = get_model_by_id(model_id)!
  const api_key = await get_user_metacentrum_key(db, user_id)
  const api_base = get_metacentrum_api_base_url()

  const request_body: Record<string, unknown> = {
    model: provider_model_id,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature,
  }

  if (model_info.max_output_tokens) {
    request_body.max_tokens = model_info.max_output_tokens
  }

  if (schema) {
    request_body.response_format = {
      type: "json_schema",
      json_schema: {
        name: `${context}-schema`.replace(/\s+/g, "-").toLowerCase(),
        strict: true,
        schema: schema.toJSONSchema(),
      },
    }
  }

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    const start_time = performance.now()
    console.log(`${log_prefix} attempt ${attempt}/${max_retries}`)

    try {
      const response = await fetch(`${api_base}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request_body),
      })

      if (!response.ok) {
        const error_text = await response.text()
        const lower = error_text.toLowerCase()
        if (is_structured && (
          lower.includes("response_format")
          || lower.includes("json_schema")
          || lower.includes("structured")
          || lower.includes("schema")
        )) {
          throw new Error(
            "MetaCentrum rejected strict JSON schema mode for structured output. " +
            "This transport is configured to fail hard for verifier/summarizer in that case."
          )
        }
        console.error(`${log_prefix} API error:`, error_text.slice(0, 1000))
        throw new Error(`API error ${response.status}`)
      }

      const data = (await response.json()) as OpenAIChatCompletionsResponse
      const time = (performance.now() - start_time) / 1000
      const output_text = extract_openai_choice_text(data)
      if (!output_text) throw new Error("No text output in response")

      let output: T | string
      if (is_structured && schema) output = parse_json_output(output_text, schema, log_prefix)
      else output = output_text

      const usage: LLMUsage = {
        transport: "metacentrum_openai",
        cost: null,
        ...(data.usage ?? {}),
      }

      if (save_to_db) {
        await save_llm_log(db, prompt_file_id, { output, request_body }, usage, model_id)
      }

      if (is_structured) {
        return { success: true, output: output as T, usage, time, model_id } as LLMStructuredSuccessResponse<T>
      }
      return { success: true, output: output as string, usage, time, model_id } as LLMTextSuccessResponse
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      console.warn(`${log_prefix} [${attempt}/${max_retries}] Failed: ${error.message}`)
      if (attempt === max_retries) return { success: false, error, model_id }
    }
  }

  return { success: false, error: new Error("Unexpected error"), model_id }
}

async function generate_via_codex_cli<T>(
  params: GenerateLLMParams<T>,
  schema: z.ZodType<T> | undefined,
  is_structured: boolean
): Promise<LLMStructuredResponse<T> | LLMTextResponse> {
  const {
    db,
    model,
    prompt_file_id,
    context,
    max_retries = 3,
    save_to_db = true,
    messages,
  } = params

  const model_id = model.id
  const log_prefix = `[Codex][${model_id}][${context}]`
  const codex_bin = Bun.env.CODEX_BIN ?? "codex"
  const timeout_ms = Number(Bun.env.CODEX_TIMEOUT_MS ?? "1800000")
  const prompt = build_codex_prompt(messages)
  console.log(`${log_prefix} config: timeout_ms=${timeout_ms} env_CODEX_TIMEOUT_MS=${Bun.env.CODEX_TIMEOUT_MS ?? "<unset>"}`)

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    const start_time = performance.now()
    const temp_dir = ensure_local_temp_dir()
    const output_file_name = `codex-last-message-${crypto.randomUUID()}.txt`
    const schema_file_name = is_structured ? `codex-schema-${crypto.randomUUID()}.json` : null
    const output_file = `${temp_dir}/${output_file_name}`
    const schema_file = schema_file_name ? `${temp_dir}/${schema_file_name}` : null

    try {
      if (schema && schema_file) {
        await Bun.write(schema_file, JSON.stringify(schema.toJSONSchema(), null, 2))
      }

      const command = [
        codex_bin, "exec",
        "--json",
        "-m", get_codex_cli_model_id(model_id),
        "--cd", temp_dir,
        "--skip-git-repo-check",
        "--sandbox", "read-only",
        "--disable", "apps",
        "-c", `model_reasoning_effort=\"${get_codex_reasoning_effort(model)}\"`,
        "--output-last-message", output_file_name,
      ]
      if (schema && schema_file) {
        // Codex resolves this before applying --cd in some paths; absolute path is robust.
        command.push("--output-schema", schema_file)
      }
      command.push("-")

      const result = await run_codex_exec(command, timeout_ms, prompt)
      const diagnostics = summarize_codex_jsonl(result.stdout)
      const debug_enabled = should_debug_codex()
      if (debug_enabled) {
        const debug_dir = get_debug_dir(temp_dir)
        const attempt_prefix = `${debug_dir}/attempt-${attempt}-${crypto.randomUUID()}`
        await Bun.write(`${attempt_prefix}.command.txt`, command.join(" "))
        await Bun.write(`${attempt_prefix}.prompt.txt`, prompt)
        await Bun.write(`${attempt_prefix}.stdout.jsonl`, result.stdout)
        await Bun.write(`${attempt_prefix}.stderr.log`, result.stderr)
        await Bun.write(`${attempt_prefix}.summary.json`, JSON.stringify({
          diagnostics,
          exit_code: result.exit_code,
          timed_out: result.timed_out,
          output_file,
          output_exists: await Bun.file(output_file).exists(),
          schema_file,
          schema_exists: schema_file ? await Bun.file(schema_file).exists() : null,
        }, null, 2))
      }

      if (result.timed_out) {
        throw new Error(
          `codex exec timed out after ${timeout_ms}ms ` +
          `codex_events=${JSON.stringify(diagnostics.event_types)} ` +
          `turn_completed=${diagnostics.turn_completed} turn_failed=${diagnostics.turn_failed} ` +
          `errors=${JSON.stringify(diagnostics.errors.slice(-3))}`
        )
      }

      if (result.exit_code !== 0) {
        const stderr = result.stderr ?? ""
        const head = stderr.slice(0, 2000)
        const tail = stderr.length > 2000 ? stderr.slice(-2000) : ""
        const rendered = tail
          ? `${head}\n...\n${tail}`
          : head
        throw new Error(
          `codex exec failed (${result.exit_code}): ${rendered}\n` +
          `codex_events=${JSON.stringify(diagnostics.event_types)} ` +
          `turn_completed=${diagnostics.turn_completed} turn_failed=${diagnostics.turn_failed} ` +
          `errors=${JSON.stringify(diagnostics.errors.slice(-3))}`
        )
      }

      const output_handle = Bun.file(output_file)
      if (!(await output_handle.exists())) {
        const json_text = extract_codex_output_from_jsonl(result.stdout)
        const stdout_fallback_text = json_text ?? extract_codex_output_from_stdout_fallback(result.stdout)

        if (stdout_fallback_text) {
          const output = is_structured && schema
            ? parse_json_output(stdout_fallback_text, schema, log_prefix)
            : stdout_fallback_text

          const time = (performance.now() - start_time) / 1000
          const usage: LLMUsage = { transport: "codex_cli", cost: 0 }
          if (save_to_db) {
            await save_llm_log(db, prompt_file_id, { output, command, fallback: "json_stdout_or_regex" }, usage, model_id)
          }
          if (is_structured) return {
            success: true,
            output: output as T,
            usage,
            time,
            model_id,
          } as LLMStructuredSuccessResponse<T>
          return {
            success: true,
            output: output as string,
            usage,
            time,
            model_id,
          } as LLMTextSuccessResponse
        }

        const stderr = result.stderr ?? ""
        const stdout = result.stdout ?? ""
        throw new Error(
          `codex exec did not produce output file (${output_file}). ` +
          `turn_completed=${diagnostics.turn_completed} turn_failed=${diagnostics.turn_failed} ` +
          `events=${JSON.stringify(diagnostics.event_types)} ` +
          `errors=${JSON.stringify(diagnostics.errors.slice(-3))} ` +
          `stderr=${stderr.slice(-1200)} stdout=${stdout.slice(-600)}`
        )
      }

      const text = (await output_handle.text()).trim()
      if (!text) throw new Error("Codex returned empty output")

      let output: T | string
      if (is_structured && schema) output = parse_json_output(text, schema, log_prefix)
      else output = text

      const time = (performance.now() - start_time) / 1000
      const usage: LLMUsage = { transport: "codex_cli", cost: 0 }

      if (save_to_db) {
        await save_llm_log(db, prompt_file_id, { output, command }, usage, model_id)
      }

      if (is_structured) return {
        success: true,
        output: output as T,
        usage,
        time,
        model_id,
      } as LLMStructuredSuccessResponse<T>

      return {
        success: true,
        output: output as string,
        usage,
        time,
        model_id,
      } as LLMTextSuccessResponse
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      console.warn(`${log_prefix} [${attempt}/${max_retries}] Failed: ${error.message}`)
      if (attempt === max_retries) return { success: false, error, model_id }
    }
  }

  return { success: false, error: new Error("Unexpected error"), model_id }
}

async function generate_via_gemini_cli<T>(
  params: GenerateLLMParams<T>,
  schema: z.ZodType<T> | undefined,
  is_structured: boolean
): Promise<LLMStructuredResponse<T> | LLMTextResponse> {
  const {
    db,
    model,
    prompt_file_id,
    context,
    max_retries = 3,
    save_to_db = true,
    messages,
  } = params

  const model_id = model.id
  const log_prefix = `[Gemini][${model_id}][${context}]`
  const gemini_bin = Bun.env.GEMINI_BIN ?? "gemini"
  const timeout_ms = Number(Bun.env.GEMINI_TIMEOUT_MS ?? "1800000")
  const schema_json = schema ? schema.toJSONSchema() : null

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    const start_time = performance.now()
    let temp_dir = ""
    let command: string[] = []
    let last_stdout = ""
    let last_stderr = ""
    let recovery_used = false

    try {
      const run_gemini = async (prompt: string, label: string) => {
        const workspace = await prepare_gemini_workspace(model)
        temp_dir = workspace.temp_dir
        command = [
          gemini_bin,
          "-p",
          prompt,
          "-m",
          workspace.alias_name,
          "-o",
          "json",
          "--approval-mode=plan",
        ]

        const result = await run_simple_exec(command, timeout_ms, workspace.temp_dir)
        last_stdout = result.stdout
        last_stderr = result.stderr

        if (should_debug_gemini()) {
          const debug_dir = get_debug_dir(workspace.temp_dir)
          const attempt_prefix = `${debug_dir}/gemini-${label}-attempt-${attempt}-${crypto.randomUUID()}`
          await Bun.write(`${attempt_prefix}.command.txt`, command.join(" "))
          await Bun.write(`${attempt_prefix}.prompt.txt`, prompt)
          await Bun.write(`${attempt_prefix}.stdout.json`, result.stdout)
          await Bun.write(`${attempt_prefix}.stderr.log`, result.stderr)
          await Bun.write(`${attempt_prefix}.summary.json`, JSON.stringify({
            exit_code: result.exit_code,
            timed_out: result.timed_out,
            alias_name: workspace.alias_name,
            model_id,
          }, null, 2))
        }

        if (result.timed_out) {
          throw new Error(`gemini timed out after ${timeout_ms}ms`)
        }
        if (result.exit_code !== 0) {
          throw new Error(
            `gemini failed (${result.exit_code}): ` +
            `${(result.stderr || result.stdout || "unknown gemini CLI failure").slice(0, 2000)}`
          )
        }

        const payload = extract_gemini_output_payload(result.stdout)
        if (payload.error) {
          throw new Error(String(payload.error))
        }

        const response = payload.response
        if (typeof response === "string" && response.trim()) {
          return response.trim()
        }
        if (response && typeof response === "object") {
          return JSON.stringify(response)
        }
        throw new Error("gemini returned no assistant response")
      }

      const prompt = is_structured && schema_json
        ? build_gemini_json_prompt(messages, schema_json)
        : build_gemini_prompt(messages)

      let raw_output = await run_gemini(prompt, "primary")
      let output: T | string

      if (is_structured && schema && schema_json) {
        try {
          output = parse_json_output(raw_output, schema, log_prefix)
        } catch {
          recovery_used = true
          const repaired_output = await run_gemini(build_json_recovery_prompt(schema_json, raw_output), "recovery")
          output = parse_json_output(repaired_output, schema, log_prefix)
          raw_output = repaired_output
        }
      } else {
        output = raw_output
      }

      const time = (performance.now() - start_time) / 1000
      const usage: LLMUsage = { transport: "gemini_cli", cost: 0 }
      const warnings = recovery_used
        ? ["Gemini response needed a JSON repair pass before validation."]
        : undefined

      if (save_to_db) {
        await save_llm_log(db, prompt_file_id, { output, command, warnings, temp_dir }, usage, model_id)
      }

      if (is_structured) return {
        success: true,
        output: output as T,
        usage,
        time,
        model_id,
        warnings,
      } as LLMStructuredSuccessResponse<T>

      return {
        success: true,
        output: output as string,
        usage,
        time,
        model_id,
        warnings,
      } as LLMTextSuccessResponse
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      console.warn(`${log_prefix} [${attempt}/${max_retries}] Failed: ${error.message}`)
      if (!should_debug_gemini() && temp_dir) {
        const debug_dir = get_debug_dir(temp_dir)
        const attempt_prefix = `${debug_dir}/gemini-failure-attempt-${attempt}-${crypto.randomUUID()}`
        await Bun.write(`${attempt_prefix}.command.txt`, command.join(" "))
        await Bun.write(`${attempt_prefix}.stderr.log`, last_stderr)
        await Bun.write(`${attempt_prefix}.stdout.json`, last_stdout)
        await Bun.write(`${attempt_prefix}.summary.json`, JSON.stringify({
          model_id,
          error: error.message,
        }, null, 2))
      }
      if (attempt === max_retries) return { success: false, error, model_id }
    }
  }

  return { success: false, error: new Error("Unexpected error"), model_id }
}

async function generate_via_claude_cli<T>(
  params: GenerateLLMParams<T>,
  schema: z.ZodType<T> | undefined,
  is_structured: boolean
): Promise<LLMStructuredResponse<T> | LLMTextResponse> {
  const {
    db,
    model,
    prompt_file_id,
    context,
    max_retries = 3,
    save_to_db = true,
    messages,
  } = params

  const model_id = model.id
  const log_prefix = `[Claude][${model_id}][${context}]`
  const claude_bin = Bun.env.CLAUDE_BIN ?? "claude"
  const timeout_ms = Number(Bun.env.CLAUDE_TIMEOUT_MS ?? "1800000")
  const prompt = build_codex_prompt(messages)

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    const start_time = performance.now()
    const temp_dir = ensure_local_temp_dir()
    let last_result: Awaited<ReturnType<typeof run_claude_exec>> | null = null

    const command = [
      claude_bin,
      "-p",
      "--output-format",
      "json",
      "--model",
      get_claude_cli_model_id(model_id),
      "--tools",
      "",
      "--permission-mode",
      "dontAsk",
      "--effort",
      get_claude_reasoning_effort(model),
    ]
    if (schema) {
      command.push("--json-schema", JSON.stringify(schema.toJSONSchema()))
    }
    command.push(prompt)

    try {
      const result = await run_claude_exec(command, timeout_ms)
      last_result = result

      const debug_enabled = should_debug_claude()
      if (debug_enabled) {
        const debug_dir = get_debug_dir(temp_dir)
        const attempt_prefix = `${debug_dir}/claude-attempt-${attempt}-${crypto.randomUUID()}`
        await Bun.write(`${attempt_prefix}.command.txt`, result.wrapped_command.join(" "))
        await Bun.write(`${attempt_prefix}.prompt.txt`, prompt)
        await Bun.write(`${attempt_prefix}.stdout.json`, result.stdout)
        await Bun.write(`${attempt_prefix}.stderr.log`, result.stderr)
        await Bun.write(`${attempt_prefix}.summary.json`, JSON.stringify({
          exit_code: result.exit_code,
          timed_out: result.timed_out,
          model_id,
        }, null, 2))
      }

      if (result.timed_out) {
        throw new Error(`claude run timed out after ${timeout_ms}ms`)
      }

      if (result.exit_code !== 0) {
        throw new Error(
          `claude run failed (${result.exit_code}): ` +
          `${(result.stderr || result.stdout).slice(0, 2000)}`
        )
      }

      const output_candidates = get_claude_output_candidates(result.stdout)
      if (output_candidates.length === 0) {
        throw new Error(
          `claude run produced no parseable output. ` +
          `stdout=${result.stdout.slice(-600)} stderr=${result.stderr.slice(-600)}`
        )
      }

      let output: T | string
      if (is_structured && schema) {
        const parsed = parse_json_output_candidates_strict(output_candidates, schema)
        if (!parsed) {
          throw new Error("Response doesn't match expected schema")
        }
        output = parsed
      } else {
        output = output_candidates[output_candidates.length - 1]
      }

      const time = (performance.now() - start_time) / 1000
      const usage: LLMUsage = { transport: "claude_cli", cost: 0 }

      if (save_to_db) {
        await save_llm_log(db, prompt_file_id, { output, command }, usage, model_id)
      }

      if (is_structured) return {
        success: true,
        output: output as T,
        usage,
        time,
        model_id,
      } as LLMStructuredSuccessResponse<T>

      return {
        success: true,
        output: output as string,
        usage,
        time,
        model_id,
      } as LLMTextSuccessResponse
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      if (!should_debug_claude()) {
        const debug_dir = get_debug_dir(temp_dir)
        const attempt_prefix = `${debug_dir}/claude-failure-attempt-${attempt}-${crypto.randomUUID()}`
        await Bun.write(`${attempt_prefix}.command.txt`, command.join(" "))
        await Bun.write(`${attempt_prefix}.prompt.txt`, prompt)
        await Bun.write(`${attempt_prefix}.stderr.log`, last_result?.stderr ?? "")
        await Bun.write(`${attempt_prefix}.stdout.json`, last_result?.stdout ?? "")
        await Bun.write(`${attempt_prefix}.summary.json`, JSON.stringify({
          exit_code: last_result?.exit_code ?? null,
          timed_out: last_result?.timed_out ?? null,
          model_id,
          error: error.message,
        }, null, 2))
      }
      console.warn(`${log_prefix} [${attempt}/${max_retries}] Failed: ${error.message}`)
      if (attempt === max_retries) return { success: false, error, model_id }
    }
  }

  return { success: false, error: new Error("Unexpected error"), model_id }
}

export async function generate_llm_response(params: GenerateLLMParamsWithoutSchema): Promise<LLMTextResponse>
export async function generate_llm_response<T>(params: GenerateLLMParamsWithSchema<T>): Promise<LLMStructuredResponse<T>>

export async function generate_llm_response<T>(
  params: GenerateLLMParams<T>
): Promise<LLMStructuredResponse<T> | LLMTextResponse> {
  const schema = "schema" in params ? params.schema : undefined
  const is_structured = schema !== undefined
  const transport = get_model_transport(params.model.id)

  if (transport === "codex_cli") return generate_via_codex_cli(params, schema, is_structured)
  if (transport === "gemini_cli") return generate_via_gemini_cli(params, schema, is_structured)
  if (transport === "claude_cli") return generate_via_claude_cli(params, schema, is_structured)
  if (transport === "metacentrum_openai") return generate_via_metacentrum_openai(params, schema, is_structured)
  return generate_via_openrouter(params, schema, is_structured)
}
