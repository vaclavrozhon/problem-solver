import { styled } from "@linaria/react"

import type { ProblemRoundSumary } from "@shared/types/problem"
import { Table, TableBody, TableHeader, TableRow, TableCell, TableErrorSection } from "../../ui/Table"
import StatusBadge from "../../ui/StatusBadge"

interface Props {
  round_summaries: ProblemRoundSumary[]
}

const VERDICTS: Record<string, string> = {
  promising: "✅ Promising",
  uncertain: "⚠️ Unclear",
  unlikely: "❌ Unlikely"
}

export default function RoundTime({ round_summaries }: Props) {
  const total_time = ({ duration }: ProblemRoundSumary) => (
    (duration.provers_total ?? 0) + (duration.summarizer ?? 0) + (duration.verifier ?? 0)
  )

  if (round_summaries.length === 0) return null

  const sorted_rounds = [...round_summaries].sort((a, b) => a.round_index - b.round_index)

  return (
    <TimeTableSection>
      <h2>⏱ Round times and summaries</h2>
      <Table $columns="minmax(5rem, .4fr) 2fr minmax(7.5rem, 1fr) 1fr 1fr 1fr 1fr 1fr">
        <TableHeader>
          <TableCell>Round</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Verdict</TableCell>
          <TableCell $align="right">Cost</TableCell>
          <TableCell $align="right">Total</TableCell>
          <TableCell $align="right">Provers</TableCell>
          <TableCell $align="right">Verifier</TableCell>
          <TableCell $align="right">Summarizer</TableCell>
        </TableHeader>
        <TableBody>
          {sorted_rounds.map(round => (
            <RoundRow key={round.round_index}>
              <TableRow $noBorder>
                <TableCell>{round.round_index}</TableCell>
                <TableCell>
                  <StatusBadge status={round.phase} />
                </TableCell>
                <TableCell>
                  {round.verdict ? (
                    <VerdictBadge>
                      {VERDICTS[round.verdict]}
                    </VerdictBadge>
                  ) : "-"}
                </TableCell>
                <TableCell $align="space-between">
                  <span>$</span>
                  <p className="text-ink-2">{round.usage.toFixed(3)}</p>
                </TableCell>
                <TableCell $align="right">
                  {total_time(round) !== 0 ? `${total_time(round).toFixed(1)} s` : "-"}
                </TableCell>
                <TableCell $align="right">
                  {round.duration.provers_total ? `${round.duration.provers_total.toFixed(1)} s` : "-"}
                </TableCell>
                <TableCell $align="right">
                  {round.duration.verifier ? `${round.duration.verifier.toFixed(1)} s` : "-"}
                </TableCell>
                <TableCell $align="right">
                  {round.duration.summarizer ? `${round.duration.summarizer.toFixed(1)} s` : "-"}
                </TableCell>
              </TableRow>
              {round.error && (
                <TableErrorSection>
                  {round.error.failed_provers && round.error.failed_provers.length > 0 && (
                    <div>
                      <p>❌ Failed Provers:</p>
                      {round.error.failed_provers.map((prover, i) => (
                        <span key={i}>{prover}</span>
                      ))}
                    </div>
                  )}
                  {round.error.message && (
                    <p>
                      ❌ Error:
                      <span className="error-message">{round.error.message}</span>
                    </p>
                  )}
                </TableErrorSection>
              )}
            </RoundRow>
          ))}
        </TableBody>
      </Table>
    </TimeTableSection>
  )
}

const TimeTableSection = styled.section`
  display: flex;
  flex-flow: column;
  gap: .5rem;
  & > h2 {
    font-size: 1.1rem;
  }
`

const RoundRow = styled.div`
  &:not(:last-child) {
    border-bottom: var(--border-alpha);
  }
`
// TODO: possibly make this universal badge since its the same as the status badge
const VerdictBadge = styled.p`
  font-family: Kode;
  font-size: .85rem;
  text-transform: uppercase;
  font-weight: 600;
`
