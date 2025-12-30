import { styled } from "@linaria/react"

import type { RoundPhase, ProblemStatus } from "@shared/types/problem"

export type { ProblemStatus }

const PROBLEM_STATUS_EMOJIS: Record<ProblemStatus, string> = {
  created: "",
  idle: "💤",
  queued: "⏳",
  running: "⚙️",
  failed: "❌",
  completed: "✅",
}

function get_round_phase_emoji(phase: RoundPhase): string {
  if (phase.endsWith("_working")) return "⚙️"
  if (phase.endsWith("_finished") || phase === "finished") return "✅"
  if (phase.endsWith("_failed")) return "❌"
  return "❓"
}

function get_round_phase_label(phase: RoundPhase): string {
  const parts = phase.split("_")
  if (parts.length === 1) {
    return phase.charAt(0).toUpperCase() + phase.slice(1)
  }
  const agent = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  const status = parts[1]
  return `${agent} ${status}`
}

function is_problem_status(status: string): status is ProblemStatus {
  return status in PROBLEM_STATUS_EMOJIS
}

interface StatusBadgeProps {
  status: ProblemStatus | RoundPhase
  show_label?: boolean
}

export default function StatusBadge({ status, show_label = true }: StatusBadgeProps) {
  if (is_problem_status(status)) {
    const emoji = PROBLEM_STATUS_EMOJIS[status]
    const label = status
    return (
      <StatusBadgeStyled title={label}>
        {emoji}{show_label && ` ${label}`}
      </StatusBadgeStyled>
    )
  }

  const emoji = get_round_phase_emoji(status)
  const label = get_round_phase_label(status)
  return (
    <StatusBadgeStyled title={label}>
      {emoji}{show_label && ` ${label}`}
    </StatusBadgeStyled>
  )
}

const StatusBadgeStyled = styled.span`
  font-family: Kode;
  font-size: .85rem;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-ink-2);
`
