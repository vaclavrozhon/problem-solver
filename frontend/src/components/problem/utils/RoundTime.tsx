import { styled } from "@linaria/react"

import type { ProblemRoundSumary } from "@shared/types/problem"

import RawMarkdown from "../../RawMarkdown"

interface Props {
  round_summaries: ProblemRoundSumary[]
}

export default function RoundTime({ round_summaries }: Props) {
  const total_time = ({ duration }: ProblemRoundSumary) => (
    (duration.provers_total ?? 0) + (duration.summarizer ?? 0) + (duration.verifier ?? 0)
  )
  return (
    <>
      {round_summaries.length > 0 && (
        <>
          <TimeTable>
            <h2>⏱ Round times and summaries</h2>
            <div>
              {round_summaries.sort((a, b) => a.round_index - b.round_index)
                .map(round => (
                <Round key={round.round_index}>
                  <div className="round-num">Round {round.round_index}</div>
                  <div className="round-times">
                    <div>
                      <p>{round.phase}</p>
                      <p>${round.usage.toFixed(3)}</p>
                      {total_time(round) !== 0 && (
                        <p>Total: {total_time(round).toFixed(1)} s</p>
                      )}
                      {round.duration.provers_total && (
                        <p>Provers: {round.duration.provers_total?.toFixed(1)} s</p>
                      )}
                      {round.duration.verifier && (
                        <p>Verifier: {round.duration.verifier?.toFixed(1)} s</p>
                      )}
                      {round.duration.summarizer && (
                        <p>Summarizer: {round.duration.summarizer?.toFixed(1)} s</p>
                      )}
                    </div>
                    {round.error && (
                      <div>
                        <p>{round.error.failed_provers}</p>
                        <p>{round.error.message}</p>
                      </div>
                    )}
                    {/* <RawMarkdown md={round.one_line_summary}/> */}
                  </div>
                </Round>
              ))}
            </div>
          </TimeTable>
        </>
      )}
    </>
  )
}

const Round = styled.div`
  display: flex;
  border-top: var(--border-alpha);
  & div.round-num {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 5.5rem;
    padding: 0 .5rem;
  }
  & > div.round-times {
    display: flex;
    flex-flow: column;
    border-left: var(--border-alpha);
    width: 100%;
    & > div {
      display: flex;
      &:not(:has(*)) {
        border-bottom: var(--border-alpha);
      }
      & > p:not(:last-child) {
        border-right: var(--border-alpha);
      }
    }
    & p {
      padding: .3rem .6rem;
    }
  }
`

const TimeTable = styled.section`
  display: flex;
  flex-flow: column;
  gap: 2px;
  border: var(--border-alpha);
  & > h2 {
    font-size: 1.1rem;
    border-bottom: var(--border-alpha);
    padding: .3rem .6rem;
  }
`

