import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Icon } from "@iconify/react"

import { get_provider_usage, refresh_claude_usage } from "@frontend/api/profile"
import type { ClaudeUsageSnapshot, GeminiProfileUsage, ProviderUsagePayload, UsageWindow } from "@shared/profile/provider_usage"

type CardTone = "codex" | "gemini" | "claude"

interface UsageCardProps {
  label: string,
  tone: CardTone,
  window: UsageWindow | GeminiProfileUsage | null,
  available: boolean,
  title: string,
  manual?: boolean,
  refreshable?: boolean,
  refreshing?: boolean,
  onRefresh?: () => void,
}

export default function ProviderUsageBar() {
  const query_client = useQueryClient()
  const { data, isPending, isError } = useQuery({
    queryKey: ["profile", "provider-usage"],
    queryFn: get_provider_usage,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const refresh_mutation = useMutation({
    mutationFn: refresh_claude_usage,
    onSuccess: (claude) => {
      query_client.setQueryData<ProviderUsagePayload | undefined>(["profile", "provider-usage"], current => {
        if (!current) return current
        return {
          ...current,
          claude,
        }
      })
    },
  })

  if (isPending) return null
  if (isError || !data) return null

  const cards: UsageCardProps[] = []

  if (data.enabled_transports.codex_cli) {
    cards.push({
      label: "Codex Week",
      tone: "codex",
      window: data.codex.weekly,
      available: data.codex.available,
      title: build_window_title("Codex weekly", data.codex.weekly, data.codex.error),
    })
    cards.push({
      label: "Codex 5h",
      tone: "codex",
      window: data.codex.five_hour,
      available: data.codex.available,
      title: build_window_title("Codex 5-hour", data.codex.five_hour, data.codex.error),
    })
  }

  if (data.enabled_transports.gemini_cli) {
    cards.push({
      label: "Gemini Pro",
      tone: "gemini",
      window: data.gemini.profiles.pro,
      available: data.gemini.available,
      title: build_window_title("Gemini Pro", data.gemini.profiles.pro, data.gemini.error),
    })
    cards.push({
      label: "Gemini Flash",
      tone: "gemini",
      window: data.gemini.profiles.flash,
      available: data.gemini.available,
      title: build_window_title("Gemini Flash", data.gemini.profiles.flash, data.gemini.error),
    })
  }

  if (data.enabled_transports.claude_cli) {
    const claude_manual = !data.claude.refreshed && !refresh_mutation.isPending
    cards.push({
      label: "Claude Week",
      tone: "claude",
      window: data.claude.weekly,
      available: data.claude.available,
      manual: claude_manual,
      title: build_claude_title(data.claude, "weekly"),
      refreshable: true,
      refreshing: refresh_mutation.isPending,
      onRefresh: () => refresh_mutation.mutate(),
    })
    cards.push({
      label: "Claude Session",
      tone: "claude",
      window: data.claude.session,
      available: data.claude.available,
      manual: claude_manual,
      title: build_claude_title(data.claude, "session"),
      refreshable: true,
      refreshing: refresh_mutation.isPending,
      onRefresh: () => refresh_mutation.mutate(),
    })
  }

  if (cards.length === 0) return null

  return (
    <section className="px-3 pb-1.5">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-6">
        {cards.map(card => <UsageCard key={card.label} {...card}/>) }
      </div>
    </section>
  )
}

function UsageCard({
  label,
  tone,
  window,
  available,
  title,
  manual = false,
  refreshable = false,
  refreshing = false,
  onRefresh,
}: UsageCardProps) {
  const used_percent = typeof window?.used_percent === "number"
    ? window.used_percent
    : null
  const remaining_percent = typeof window?.remaining_percent === "number"
    ? window.remaining_percent
    : used_percent === null
      ? null
      : Math.max(0, 100 - used_percent)

  const tone_class = {
    codex: "from-brand/35 to-brand/5",
    gemini: "from-sky-500/25 to-sky-500/5",
    claude: "from-amber-400/25 to-amber-400/5",
  }[tone]

  const value = manual
    ? "manual"
    : available && used_percent !== null
      ? `${used_percent}%`
      : available
        ? "active"
        : "--"

  return (
    <div title={title}
      className={`relative overflow-hidden rounded-xl border-alpha bg-gradient-to-br ${tone_class} px-2 py-1 min-h-[2.9rem]`}>
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-[0.1em] uppercase kode text-ink-1 truncate">{label}</p>
        </div>

        {refreshable && onRefresh && (
          <button type="button"
            className="-mr-0.5 -mt-0.5 shrink-0 rounded-full p-0.5 text-ink-1/90 hover:text-ink-2 disabled:opacity-40"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={`Refresh ${label}`}>
            <Icon icon={refreshing ? "line-md:loading-twotone-loop" : "gravity-ui:arrows-rotate-right"} />
          </button>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <p className="shrink-0 text-sm font-semibold text-ink-2 leading-none">{value}</p>
        <div className="flex h-1 min-w-0 flex-1 justify-end rounded-full bg-alpha/75 overflow-hidden">
          {manual ? (
            <div className="h-full w-full bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.08),rgba(255,255,255,0.08)_6px,transparent_6px,transparent_12px)]"/>
          ) : remaining_percent !== null ? (
            <div className="h-full rounded-full bg-ink-3/80 transition-[width] duration-300"
              style={{ width: `${remaining_percent}%` }}/>
          ) : (
            <div className="h-full w-full bg-ink-1/30"/>
          )}
        </div>
      </div>
    </div>
  )
}

function build_window_title(label: string, window: UsageWindow | GeminiProfileUsage | null, error: string | null) {
  if (error) return `${label}: ${error}`
  if (!window) return `${label}: unavailable`
  const parts = [`${label}: ${format_percent(window.used_percent)} used`]
  if (window.resets_at) parts.push(`resets ${format_reset(window.resets_at)}`)
  return parts.join(" - ")
}

function build_claude_title(snapshot: ClaudeUsageSnapshot, key: "weekly" | "session") {
  if (!snapshot.refreshed) return "Claude usage is manual-only. Click refresh to probe /usage."
  return build_window_title(
    key === "weekly" ? "Claude weekly" : "Claude session",
    snapshot[key],
    snapshot.error,
  )
}

function format_percent(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)}%` : "unknown"
}

function format_reset(value: number) {
  return new Date(value * 1000).toLocaleString("cs-CZ", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
