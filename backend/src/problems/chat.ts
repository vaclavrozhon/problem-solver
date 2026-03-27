import { eq } from "drizzle-orm"

import { problems, problem_files } from "../../drizzle/schema"
import { get_admin_model_visibility } from "@backend/app_settings"
import type { Database } from "@backend/db"
import { generate_llm_response } from "@backend/jobs/generate_llm_response"
import { reconstruct_main_files_history } from "@backend/problems/index.utils"
import { get_available_model_ids_for_role } from "@shared/admin/models"
import type { ProblemChatMessage, ProblemChatRequest, ProblemChatResponse } from "@shared/types/chat"
import { SummarizerOutputSchema, VerifierOutputSchema, get_model_by_id } from "@shared/types/research"

type ChatRoundData = {
  round_index: number,
  phase: string | null,
  warning_message: string | null,
  error_message: string | null,
  round_instructions: string | null,
  prover_outputs: Array<{
    title: string,
    model_id: string | null,
    content: string,
  }>,
  verifier: {
    model_id: string | null,
    feedback_md: string,
    summary_md: string,
    verdict: string,
  } | null,
  summarizer: {
    model_id: string | null,
    summary: string,
  } | null,
}

type ChatContextBundle = {
  prompt: string,
  current_round: number,
  selected_round: number | null,
  packed_rounds: number[],
  packed_sections: string[],
  estimated_chars: number,
}

const CHAT_CONTEXT_BUDGETS = {
  task: 16_000,
  notes: 18_000,
  proofs: 22_000,
  output: 18_000,
  todo: 8_000,
  round_instructions: 6_000,
  verifier_feedback: 12_000,
  verifier_summary: 4_000,
  summarizer_summary: 5_000,
  timeline_round_summary: 1_800,
  total_prover_outputs: 42_000,
  history_chars: 18_000,
}

function clean_text(text: string | null | undefined) {
  return (text ?? "").replace(/\u0000/g, "").trim()
}

function clip_text(text: string | null | undefined, max_chars: number) {
  const cleaned = clean_text(text)
  if (!cleaned) return "(empty)"
  if (cleaned.length <= max_chars) return cleaned
  return `${cleaned.slice(0, max_chars).trimEnd()}\n\n... [truncated ${cleaned.length - max_chars} chars]`
}

function compact_history(history: ProblemChatMessage[]) {
  const selected: ProblemChatMessage[] = []
  let used_chars = 0

  for (const message of [...history].reverse()) {
    const content = clean_text(message.content)
    if (!content) continue
    const entry_cost = content.length + 32
    if (selected.length >= 12 || used_chars + entry_cost > CHAT_CONTEXT_BUDGETS.history_chars) break
    selected.push({ role: message.role, content })
    used_chars += entry_cost
  }

  return selected.reverse()
}

function parse_round_number_from_message(message: string, max_round: number) {
  const match = message.match(/\bround\s+(\d{1,2})\b/i)
  if (!match) return null
  const round = Number(match[1])
  if (!Number.isInteger(round) || round < 1 || round > max_round) return null
  return round
}

function parse_verifier_output(content: string) {
  const parsed = VerifierOutputSchema.safeParse(JSON.parse(content))
  if (!parsed.success) return null
  return parsed.data
}

function parse_summarizer_output(content: string) {
  const parsed = SummarizerOutputSchema.safeParse(JSON.parse(content))
  if (!parsed.success) return null
  return parsed.data
}

function format_round_timeline(rounds: ChatRoundData[]) {
  if (rounds.length === 0) return "No completed research rounds yet."

  return rounds.map((round) => {
    const parts = [`### Round ${round.round_index}`]
    const tags: string[] = []
    if (round.phase) tags.push(`phase: ${round.phase}`)
    if (round.verifier?.verdict) tags.push(`verdict: ${round.verifier.verdict}`)
    if (round.warning_message) tags.push(`warning: ${round.warning_message}`)
    if (round.error_message) tags.push(`error: ${round.error_message}`)
    if (tags.length > 0) parts.push(tags.join(" | "))

    const summary = round.summarizer?.summary
      || round.verifier?.summary_md
      || round.verifier?.feedback_md
      || "No round summary available."
    parts.push(clip_text(summary, CHAT_CONTEXT_BUDGETS.timeline_round_summary))
    return parts.join("\n")
  }).join("\n\n")
}

function build_selected_round_section(round: ChatRoundData | null) {
  if (!round) return "No round-local artifacts are packed because the problem has no completed rounds yet."

  const sections: string[] = []
  sections.push(`## Focus Round ${round.round_index}`)

  if (clean_text(round.round_instructions)) {
    sections.push("### Round Instructions")
    sections.push(clip_text(round.round_instructions, CHAT_CONTEXT_BUDGETS.round_instructions))
  }

  if (round.prover_outputs.length > 0) {
    const per_prover_budget = Math.min(
      10_000,
      Math.max(2_500, Math.floor(CHAT_CONTEXT_BUDGETS.total_prover_outputs / round.prover_outputs.length))
    )
    sections.push("### Prover Outputs")
    for (const prover of round.prover_outputs) {
      const model_name = prover.model_id ? get_model_by_id(prover.model_id)?.name ?? prover.model_id : "Unknown model"
      sections.push(`#### ${prover.title} (${model_name})`)
      sections.push(clip_text(prover.content, per_prover_budget))
    }
  }

  if (round.verifier) {
    sections.push("### Verifier")
    sections.push(`Verdict: ${round.verifier.verdict}`)
    sections.push("#### Feedback")
    sections.push(clip_text(round.verifier.feedback_md, CHAT_CONTEXT_BUDGETS.verifier_feedback))
    sections.push("#### Summary")
    sections.push(clip_text(round.verifier.summary_md, CHAT_CONTEXT_BUDGETS.verifier_summary))
  }

  if (round.summarizer) {
    sections.push("### Summarizer")
    sections.push(clip_text(round.summarizer.summary, CHAT_CONTEXT_BUDGETS.summarizer_summary))
  }

  return sections.join("\n\n")
}

async function load_chat_rounds(db: Database, problem_id: string) {
  const files = await db.query.problem_files.findMany({
    where: eq(problem_files.problem_id, problem_id),
    columns: {
      file_type: true,
      file_name: true,
      content: true,
      model_id: true,
    },
    with: {
      round: {
        columns: {
          index: true,
          phase: true,
          warning_message: true,
          error_message: true,
        },
      },
    },
  })

  const rounds = new Map<number, ChatRoundData>()
  let task = ""
  let todo = ""

  for (const file of files) {
    if (file.round.index === 0 && file.file_type === "task") {
      task = file.content
      continue
    }
    if (file.round.index === 0 && file.file_type === "todo") {
      todo = file.content
      continue
    }
    if (file.round.index === 0) continue

    const round = rounds.get(file.round.index) ?? {
      round_index: file.round.index,
      phase: file.round.phase,
      warning_message: file.round.warning_message,
      error_message: file.round.error_message,
      round_instructions: null,
      prover_outputs: [],
      verifier: null,
      summarizer: null,
    }

    if (file.file_type === "round_instructions") {
      round.round_instructions = file.content
    } else if (file.file_type === "prover_output") {
      const prover_number = file.file_name.match(/(\d+)/)?.[1]
      round.prover_outputs.push({
        title: prover_number ? `Prover ${prover_number}` : file.file_name,
        model_id: file.model_id,
        content: file.content,
      })
    } else if (file.file_type === "verifier_output") {
      try {
        const parsed = parse_verifier_output(file.content)
        if (parsed) {
          round.verifier = {
            model_id: file.model_id,
            feedback_md: parsed.feedback_md,
            summary_md: parsed.summary_md,
            verdict: parsed.verdict,
          }
        }
      } catch {
        // ignore malformed verifier output
      }
    } else if (file.file_type === "summarizer_output") {
      try {
        const parsed = parse_summarizer_output(file.content)
        if (parsed) {
          round.summarizer = {
            model_id: file.model_id,
            summary: parsed.summary,
          }
        }
      } catch {
        // ignore malformed summarizer output
      }
    }

    rounds.set(file.round.index, round)
  }

  const round_list = [...rounds.values()]
    .sort((left, right) => left.round_index - right.round_index)
    .map((round) => ({
      ...round,
      prover_outputs: [...round.prover_outputs].sort((left, right) => left.title.localeCompare(right.title)),
    }))

  return { task, todo, rounds: round_list }
}

export async function build_problem_chat_context(
  db: Database,
  problem_id: string,
  request: ProblemChatRequest,
) : Promise<ChatContextBundle | null> {
  const problem = await db.query.problems.findFirst({
    columns: {
      id: true,
      name: true,
      current_round: true,
    },
    where: eq(problems.id, problem_id),
  })

  if (!problem) return null

  const { task, todo, rounds } = await load_chat_rounds(db, problem_id)
  const main_files_history = await reconstruct_main_files_history(db, problem_id)
  const latest_main = main_files_history[main_files_history.length - 1] ?? {
    round_index: 0,
    notes: "No notes yet.",
    proofs: "No proofs yet.",
    output: "No main output yet.",
  }

  const max_round = Math.max(problem.current_round, latest_main.round_index, rounds[rounds.length - 1]?.round_index ?? 0)
  const selected_round = request.selected_round
    ?? parse_round_number_from_message(request.message, max_round)
    ?? (max_round > 0 ? max_round : null)

  const focus_round = selected_round
    ? rounds.find((round) => round.round_index === selected_round) ?? null
    : null

  const packed_sections = [
    "task",
    "current-notes",
    "current-proofs",
    "current-output",
    "round-timeline",
    ...(clean_text(todo) && clean_text(todo) !== "No TODO yet." ? ["todo"] : []),
    ...(focus_round ? [`focus-round-${focus_round.round_index}`] : []),
  ]

  const prompt = [
    `You are Bolzano Chat, a read-only mathematical research assistant helping analyze the project \"${problem.name}\".`,
    "You do not have tools or file access beyond the context packed into this prompt.",
    "Base your answer only on the provided project context and the visible chat history.",
    "If the packed context is insufficient, say exactly what is missing.",
    "Prefer concrete references to rounds, provers, verifier feedback, proofs, and current main files.",
    "Use Markdown and LaTeX where helpful.",
    "",
    `Current round: ${max_round}`,
    `Focus round packed with raw artifacts: ${focus_round?.round_index ?? "none"}`,
    "All round summaries are packed; raw round artifacts are packed only for the focus round.",
    "",
    "## Problem Task",
    clip_text(task || "No task available.", CHAT_CONTEXT_BUDGETS.task),
    "",
    "## Current Notes",
    clip_text(latest_main.notes, CHAT_CONTEXT_BUDGETS.notes),
    "",
    "## Current Proofs",
    clip_text(latest_main.proofs, CHAT_CONTEXT_BUDGETS.proofs),
    "",
    "## Current Output",
    clip_text(latest_main.output, CHAT_CONTEXT_BUDGETS.output),
    clean_text(todo) && clean_text(todo) !== "No TODO yet."
      ? `\n## TODO\n${clip_text(todo, CHAT_CONTEXT_BUDGETS.todo)}`
      : "",
    "",
    "## Round Timeline",
    format_round_timeline(rounds),
    "",
    build_selected_round_section(focus_round),
  ].filter(Boolean).join("\n")

  return {
    prompt,
    current_round: max_round,
    selected_round,
    packed_rounds: focus_round ? [focus_round.round_index] : [],
    packed_sections,
    estimated_chars: prompt.length,
  }
}

export async function generate_problem_chat_reply(
  db: Database,
  user_id: string,
  problem_id: string,
  request: ProblemChatRequest,
): Promise<ProblemChatResponse | null> {
  const model_visibility = await get_admin_model_visibility(db)
  const available_model_ids = new Set(get_available_model_ids_for_role("chat", model_visibility))
  if (!available_model_ids.has(request.model.id)) {
    throw new Error("Selected model is disabled in admin settings.")
  }

  const context_bundle = await build_problem_chat_context(db, problem_id, request)
  if (!context_bundle) return null

  const history = compact_history(request.history)
  const response = await generate_llm_response({
    db,
    context: `Problem Chat ${problem_id}`,
    model: request.model,
    user_id,
    messages: [
      {
        role: "system",
        content: context_bundle.prompt,
      },
      ...history,
      {
        role: "user",
        content: request.message.trim(),
      },
    ],
    max_retries: 2,
    save_to_db: false,
    prompt_file_id: "problem-chat",
  })

  if (!response.success) {
    throw response.error
  }

  return {
    reply: response.output,
    context: {
      current_round: context_bundle.current_round,
      selected_round: context_bundle.selected_round,
      packed_rounds: context_bundle.packed_rounds,
      packed_sections: context_bundle.packed_sections,
      estimated_chars: context_bundle.estimated_chars,
      used_model: response.model_id,
    },
  }
}
