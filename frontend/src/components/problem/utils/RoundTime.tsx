import { useState } from "react"
import { styled } from "@linaria/react"

import RawMarkdown from "../../RawMarkdown"
import { getProblemFilesRaw } from "../../../api"

interface Props {
  problem_id: string,
}

export default function RoundTime({ problem_id }: Props) {
  const [roundMeta, setRoundMeta] = useState<Array<{ round: number, one_line_summary?: string, durations: { provers_total?: number, per_prover?: Record<string, number>, verifier?: number, summarizer?: number } }>>([])
  const [initial_load, setInitialLoad] = useState(true)

  const loadRoundMeta = async () => {
    try {
      const files = await getProblemFilesRaw(problem_id, { file_type: 'round_meta' })
      console.log("RoundTime.tsx: getProblemFilesRaw()", files)
      const metas: Array<{ round: number, one_line_summary?: string, durations: { provers_total?: number, per_prover?: Record<string, number>, verifier?: number, summarizer?: number } }> = []
      for (const f of (files || [])) {
        try {
          const data = JSON.parse(f.content || '{}')
          const r = Number(data.round || 0)
          if (!r || r <= 0) continue
          const stages = data.stages || {}
          const provers = stages.provers || {}
          const perProver: Record<string, number> = {}
          let proversTotal = 0
          Object.keys(provers).forEach(k => {
            const d = Number((provers[k]?.duration_s) || 0)
            perProver[k] = d
            proversTotal += d
          })
          const meta = {
            round: r,
            one_line_summary: data.one_line_summary,
            durations: {
              provers_total: proversTotal > 0 ? proversTotal : undefined,
              per_prover: perProver,
              verifier: Number(stages.verifier?.duration_s || 0) || undefined,
              summarizer: Number(stages.summarizer?.duration_s || 0) || undefined,
            }
          }
          metas.push(meta)
        } catch (e) {
          // ignore malformed meta
        }
      }
      metas.sort((a,b) => b.round - a.round)
      setRoundMeta(metas)
      console.log("metas", metas)
    } catch (e) {
      setRoundMeta([])
    } finally {
      setInitialLoad(false)
    }
  }

  if (initial_load) {
    loadRoundMeta()
    return (
      <p>Loading times...</p>
    )
  }


  return (
    <>
      {roundMeta.length > 0 && (
        <>
          <TimeTable>
            <h2>⏱ Round times and summaries</h2>
            <div>
              {roundMeta.map(meta => (
                <Round key={meta.round}>
                  <div className="round-num">Round {meta.round}</div>
                  <div className="round-times">
                    <div>
                      {(meta.durations.provers_total && meta.durations.verifier && meta.durations.summarizer) ? (
                        <p>Total: {(meta.durations.provers_total + meta.durations.verifier + meta.durations.summarizer).toFixed(1)} s</p>
                      ) : (
                        <p>Round not finished.</p>
                      )}
                      <p>Provers: {meta.durations.provers_total ? `${meta.durations.provers_total.toFixed(1)} s` : '—'}</p>
                      <p>Verifier: {meta.durations.verifier ? `${meta.durations.verifier.toFixed(1)} s` : '—'}</p>
                      <p>Summarizer: {meta.durations.summarizer ? `${meta.durations.summarizer.toFixed(1)} s` : '—'}</p>
                    </div>
                    {meta.one_line_summary && (
                      <RawMarkdown md={meta.one_line_summary}/>
                    )}
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

