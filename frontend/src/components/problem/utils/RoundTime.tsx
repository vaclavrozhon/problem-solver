import { useState } from "react"
import { styled } from "@linaria/react"

import type { ProblemRoundTimes } from "@shared/types/problem"

import RawMarkdown from "../../RawMarkdown"

interface Props {
  times: ProblemRoundTimes[]
}

export default function RoundTime({ times }: Props) {
  return (
    <>
      {times.length > 0 && (
        <>
          <TimeTable>
            <h2>⏱ Round times and summaries</h2>
            <div>
              {times.map(meta => (
                <Round key={meta.round}>
                  <div className="round-num">Round {meta.round}</div>
                  <div className="round-times">
                    <div>
                      <p>Total: {meta.durations.provers_total.toFixed(1)} s</p>
                      <p>Provers: {meta.durations.provers_total.toFixed(1)} s</p>
                      <p>Verifier: {meta.durations.verifier.toFixed(1)} s</p>
                      <p>Summarizer: {meta.durations.summarizer.toFixed(1)} s</p>
                    </div>
                    <RawMarkdown md={meta.one_line_summary}/>
                  </div>
                </Round>
              ))}
            </div>
          </TimeTable>
          <p>A round's time shows here only after the round is completely finished.</p>
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
      border-bottom: var(--border-alpha);
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

