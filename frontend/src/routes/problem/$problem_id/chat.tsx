import { useEffect, useRef, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"
import { Button, Spinner } from "@heroui/react"
import { z } from "zod"

import { get_model_visibility } from "@frontend/api/profile"
import { chat_about_problem, get_problem_overview } from "@frontend/api/problems"
import ModelSelect from "@frontend/components/form/ModelSelect"
import Markdown from "@frontend/components/Markdown"
import ProblemDetailsLayout, { MainContent } from "@frontend/components/problem/DetailsLayout"
import { get_available_model_ids_for_role, type ModelVisibility } from "@shared/admin/models"
import type { ProblemChatMessage, ProblemChatResponse } from "@shared/types/chat"
import { ModelConfigSchema, get_model_by_id, type ModelConfig, type ReasoningConfig, type ReasoningEffortValue } from "@shared/types/research"

export const Route = createFileRoute("/problem/$problem_id/chat")({
  component: ProblemChatPage,
  validateSearch: (search) => z.object({
    round: z.coerce.number().int().min(1).optional().catch(undefined),
  }).parse(search),
})

type StoredChatMessage = ProblemChatMessage & {
  context?: ProblemChatResponse["context"],
}

function ProblemChatPage() {
  const { problem_id } = Route.useParams()
  const { round } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data: overview, isPending: overview_pending, isError: overview_error } = useQuery({
    queryKey: ["problem_overview", problem_id],
    queryFn: () => get_problem_overview(problem_id),
  })
  const { data: model_settings, isPending: model_pending, isError: model_error } = useQuery({
    queryKey: ["profile", "model-visibility"],
    queryFn: get_model_visibility,
  })

  const [messages, setMessages] = useState<StoredChatMessage[]>([])
  const [selected_model, setSelectedModel] = useState<ModelConfig | null>(null)
  const [input, setInput] = useState("")
  const [is_sending, setIsSending] = useState(false)
  const scroll_ref = useRef<HTMLDivElement | null>(null)

  const total_rounds = overview?.round_summaries.length ?? 0
  const selected_round = total_rounds === 0
    ? null
    : Math.min(round ?? total_rounds, total_rounds)

  useEffect(() => {
    if (total_rounds > 0 && round && round > total_rounds) {
      navigate({
        search: (prev) => ({ ...prev, round: total_rounds }),
        replace: true,
      })
    }
  }, [navigate, round, total_rounds])

  useEffect(() => {
    setMessages(load_chat_messages(problem_id))
  }, [problem_id])

  useEffect(() => {
    if (!model_settings) return
    setSelectedModel(load_chat_model(problem_id, model_settings.model_visibility))
  }, [problem_id, model_settings])

  useEffect(() => {
    if (!scroll_ref.current) return
    scroll_ref.current.scrollTop = scroll_ref.current.scrollHeight
  }, [messages, is_sending])

  if (overview_pending || model_pending) return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name="" loading>
      <p>Loading chat...</p>
    </ProblemDetailsLayout>
  )

  if (overview_error || model_error || !overview || !model_settings) return (
    <MainContent>
      <p>Failed to load problem chat for problem with id: {problem_id}</p>
    </MainContent>
  )

  const available_models = get_available_model_ids_for_role("chat", model_settings.model_visibility)
  if (available_models.length === 0) return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name={overview.name}>
      <EmptyState>
        <p>No chat-capable models are enabled in admin settings.</p>
      </EmptyState>
    </ProblemDetailsLayout>
  )

  const active_model = selected_model ?? load_chat_model(problem_id, model_settings.model_visibility)
  const focus_round_label = selected_round ? `round ${selected_round}` : "latest research state"
  const context_note = total_rounds > 0
    ? `Context packs the task, current notes/proofs/output, all round summaries, and raw artifacts for ${focus_round_label}.`
    : "Context packs the task and current main files. No completed research rounds yet."

  async function send_message() {
    const user_message = input.trim()
    if (!user_message || !active_model || is_sending) return

    const next_user_message: StoredChatMessage = {
      role: "user",
      content: user_message,
    }
    const history = messages.map(({ role, content }) => ({ role, content }))
    const optimistic_messages = [...messages, next_user_message]
    setMessages(optimistic_messages)
    save_chat_messages(problem_id, optimistic_messages)
    setInput("")
    setIsSending(true)

    try {
      const response = await chat_about_problem(problem_id, {
        message: user_message,
        history,
        model: active_model,
        selected_round,
      })
      const assistant_message: StoredChatMessage = {
        role: "assistant",
        content: response.reply,
        context: response.context,
      }
      const updated = [...optimistic_messages, assistant_message]
      setMessages(updated)
      save_chat_messages(problem_id, updated)
    } catch (error) {
      const failure: StoredChatMessage = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error."}`,
      }
      const updated = [...optimistic_messages, failure]
      setMessages(updated)
      save_chat_messages(problem_id, updated)
    } finally {
      setIsSending(false)
    }
  }

  function clear_chat() {
    setMessages([])
    save_chat_messages(problem_id, [])
  }

  return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name={overview.name}>
      <ChatLayout>
        <Toolbar>
          <ToolbarGroup>
            <ModelSelect
              selected={active_model}
              onChange={(model) => {
                setSelectedModel(model)
                save_chat_model(problem_id, model, model_settings.model_visibility)
              }}
              role="chat"
              model_visibility={model_settings.model_visibility}
              trigger_style="min-w-[17rem]"/>

            <RoundSelect
              value={selected_round ?? "latest"}
              onChange={(event) => {
                const value = event.target.value
                navigate({
                  search: (prev) => ({
                    ...prev,
                    round: value === "latest" ? undefined : Number(value),
                  }),
                  replace: true,
                })
              }}>
              <option value="latest">Latest Round Context</option>
              {Array.from({ length: total_rounds }, (_, index) => index + 1).map((round_option) => (
                <option key={round_option} value={round_option}>Round {round_option}</option>
              ))}
            </RoundSelect>
          </ToolbarGroup>

          <ToolbarGroup>
            <Button size="sm" variant="light" onPress={clear_chat} isDisabled={is_sending || messages.length === 0}>
              Clear
            </Button>
          </ToolbarGroup>
        </Toolbar>

        <ContextNote>{context_note}</ContextNote>

        <Messages ref={scroll_ref}>
          {messages.length === 0 && !is_sending && (
            <EmptyState>
              <p>Ask about the current state of the research, a particular round, or whether the proofs look complete.</p>
            </EmptyState>
          )}

          {messages.map((message, index) => (
            <MessageCard key={`${message.role}-${index}`} data-role={message.role}>
              <MessageHeader>
                <strong>{message.role === "user" ? "You" : "Bolzano Chat"}</strong>
                {message.context && (
                  <span>
                    {get_model_by_id(message.context.used_model)?.name ?? message.context.used_model}
                    {message.context.selected_round ? ` · round ${message.context.selected_round}` : " · latest state"}
                  </span>
                )}
              </MessageHeader>
              <Markdown md={message.content} render_math/>
            </MessageCard>
          ))}

          {is_sending && (
            <MessageCard data-role="assistant">
              <MessageHeader>
                <strong>Bolzano Chat</strong>
                <span>thinking</span>
              </MessageHeader>
              <ThinkingRow>
                <Spinner size="sm"/>
                Packing context and generating a reply...
              </ThinkingRow>
            </MessageCard>
          )}
        </Messages>

        <Composer>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void send_message()
              }
            }}
            placeholder="Ask about the research. Enter sends; Shift+Enter inserts a newline."
            disabled={is_sending}/>
          <Button color="primary" onPress={() => void send_message()} isDisabled={is_sending || input.trim().length === 0}>
            Send
          </Button>
        </Composer>
      </ChatLayout>
    </ProblemDetailsLayout>
  )
}

function load_chat_messages(problem_id: string): StoredChatMessage[] {
  if (typeof localStorage === "undefined") return []
  try {
    const parsed = JSON.parse(localStorage.getItem(chat_messages_key(problem_id)) ?? "[]")
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is StoredChatMessage => Boolean(entry && typeof entry === "object" && "role" in entry && "content" in entry))
      : []
  } catch {
    return []
  }
}

function save_chat_messages(problem_id: string, messages: StoredChatMessage[]) {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(chat_messages_key(problem_id), JSON.stringify(messages))
}

function load_chat_model(problem_id: string, visibility: ModelVisibility) {
  if (typeof localStorage === "undefined") return default_chat_model(visibility)
  try {
    const raw = JSON.parse(localStorage.getItem(chat_model_key(problem_id)) ?? "null")
    return sanitize_chat_model(raw, visibility)
  } catch {
    return default_chat_model(visibility)
  }
}

function save_chat_model(problem_id: string, model: ModelConfig, visibility: ModelVisibility) {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(chat_model_key(problem_id), JSON.stringify(sanitize_chat_model(model, visibility)))
}

function sanitize_chat_model(raw: unknown, visibility: ModelVisibility) {
  const fallback = default_chat_model(visibility)
  const parsed = ModelConfigSchema("chat").safeParse(raw)
  if (!parsed.success) return fallback
  const available_models = new Set(get_available_model_ids_for_role("chat", visibility))
  if (!available_models.has(parsed.data.id)) return fallback
  return parsed.data
}

function default_chat_model(visibility: ModelVisibility): ModelConfig {
  const available_models = get_available_model_ids_for_role("chat", visibility)
  const preferred_model_id = available_models.includes("metacentrum/kimi-k2.5")
    ? "metacentrum/kimi-k2.5"
    : available_models[0]
  const model = preferred_model_id ? get_model_by_id(preferred_model_id) : null
  if (!model) {
    return {
      id: "gpt-5.2",
      config: {
        reasoning_effort: "high",
        web_search: false,
      },
      role: "chat",
    }
  }
  return {
    id: model.id,
    config: {
      reasoning_effort: default_reasoning(model.config.reasoning),
      web_search: false,
    },
    role: "chat",
  }
}

function default_reasoning(config: ReasoningConfig): ReasoningEffortValue {
  if (config === null) return null
  if (config === "toggle") return true
  if (config.includes("xhigh")) return "high"
  return config[config.length - 1]
}

function chat_messages_key(problem_id: string) {
  return `bolzano:problem-chat:${problem_id}:messages`
}

function chat_model_key(problem_id: string) {
  return `bolzano:problem-chat:${problem_id}:model`
}

const ChatLayout = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: .75rem;
  padding: 1rem;
  border-bottom: var(--border-alpha);
  flex-wrap: wrap;
`

const ToolbarGroup = styled.div`
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
  align-items: center;
`

const RoundSelect = styled.select`
  border: var(--border-alpha);
  border-radius: .75rem;
  padding: .7rem .85rem;
  background: var(--bg-beta);
  color: var(--text-alpha);
`

const ContextNote = styled.p`
  margin: 0;
  padding: .85rem 1rem;
  border-bottom: var(--border-alpha);
  color: var(--text-gamma);
  font-size: .92rem;
`

const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: .9rem;
`

const MessageCard = styled.article`
  border: var(--border-alpha);
  border-radius: 1rem;
  padding: .9rem 1rem;
  background: var(--bg-beta);

  &[data-role="user"] {
    background: color-mix(in srgb, var(--bg-beta) 72%, var(--brand) 28%);
  }

  & :global(.markdown) {
    font-size: .96rem;
  }

  & :global(.markdown > *:first-child) {
    margin-top: 0;
  }

  & :global(.markdown > *:last-child) {
    margin-bottom: 0;
  }
`

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: .6rem;
  font-size: .83rem;
  color: var(--text-gamma);
`

const Composer = styled.div`
  display: flex;
  gap: .75rem;
  align-items: flex-end;
  padding: 1rem;
  border-top: var(--border-alpha);

  & > textarea {
    flex: 1;
    min-height: 6rem;
    resize: vertical;
    border: var(--border-alpha);
    border-radius: 1rem;
    padding: .9rem 1rem;
    background: var(--bg-beta);
    color: var(--text-alpha);
    font: inherit;
  }
`

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: var(--text-gamma);
  text-align: center;
`

const ThinkingRow = styled.div`
  display: flex;
  align-items: center;
  gap: .6rem;
  color: var(--text-gamma);
`
