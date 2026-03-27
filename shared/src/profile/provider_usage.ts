export interface UsageWindow {
  used_percent: number | null,
  remaining_percent: number | null,
  resets_at: number | null,
}

export interface CodexUsageSnapshot {
  available: boolean,
  captured_at: number | null,
  weekly: UsageWindow | null,
  five_hour: (UsageWindow & { window_minutes?: number | null }) | null,
  limit_id: string | null,
  limit_name: string | null,
  plan_type: string | null,
  error: string | null,
}

export interface GeminiProfileUsage {
  used_percent: number | null,
  remaining_percent: number | null,
  resets_at: number | null,
  remaining_amount: number | string | null,
  limit_amount: number | string | null,
  matched_model_id: string | null,
}

export interface GeminiUsageSnapshot {
  available: boolean,
  captured_at: number | null,
  profiles: {
    pro: GeminiProfileUsage | null,
    flash: GeminiProfileUsage | null,
  },
  pooled: GeminiProfileUsage | null,
  error: string | null,
}

export interface ClaudeUsageSnapshot {
  available: boolean,
  refreshed: boolean,
  captured_at: number | null,
  weekly: UsageWindow | null,
  session: UsageWindow | null,
  overage: UsageWindow | null,
  error: string | null,
}

export interface ProviderUsagePayload {
  enabled_transports: {
    codex_cli: boolean,
    gemini_cli: boolean,
    claude_cli: boolean,
  },
  codex: CodexUsageSnapshot,
  gemini: GeminiUsageSnapshot,
  claude: ClaudeUsageSnapshot,
}
