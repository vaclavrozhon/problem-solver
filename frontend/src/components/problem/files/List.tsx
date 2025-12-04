import { useState, useEffect } from "react"
import { styled } from "@linaria/react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import type { File, ProblemFiles } from "@shared/types/problem"

interface Props {
  files: ProblemFiles,
  problem_id: string,
  file_id?: string,
}
export default function FilesList({ files, file_id, problem_id }: Props) {
  const [curr_round, setCurrRound] = useState(0)
  const [curr_prover, setCurrProver] = useState(0)

  useEffect(() => {
    let round_index, prover_index
    for (let i = 0; i < files.rounds.length; i++) {
      for (let j = 0; j < files.rounds[i].provers.length; j++) {
        if (files.rounds[i].provers[j].filter(f => f.id === file_id).length === 1) {
          round_index = i
          prover_index = j
          break
        }
      }
    }
    if (round_index && prover_index) {
      setCurrRound(round_index)
      setCurrProver(prover_index)
    }
  }, [problem_id, files])

  function ShowFiles({ files }: { files: File[] }) {
    return (
      <>
        {files.map(file => (
          <Link to="/problem/$problem_id/files"
            params={{ problem_id }}
            search={{ file_id: file.id }}
            key={file.id}>{file.file_name}</Link>
        ))}
      </>
    )
  }

  const main_files = [
    files.task,
    files.results.notes,
    files.results.proofs,
    files.results.output,
  ]

  return (
    <List>
      <FilesGroup>
        <h3>Main Files</h3>
        <ShowFiles files={main_files}/>
      </FilesGroup>
      {files.rounds.length > 0 && (
        <FilesGroup>
          <div>
            <h3>Round Files</h3>
            <select name="round-picker"
              value={curr_round}
              onChange={e => {
                setCurrProver(0)
                setCurrRound(parseInt(e.target.value))
                }}>
              {files.rounds.map(round => (
                <option value={round.round_index - 1}
                  key={round.round_index}>Round {round.round_index}</option>
              ))}
            </select>
          </div>
          {files.rounds[curr_round].provers.length > 0 && (
            <>
              <div>
                <h4>Provers</h4>
                <select name="prover-picker"
                  value={curr_prover}
                  onChange={e => setCurrProver(parseInt(e.target.value))}>
                    {files.rounds[curr_round].provers.map((_, i) => (
                      <option value={i}
                        key={i}>Prover {i + 1}</option>
                    ))}
                  </select>
              </div>
              <h5>Prover {curr_prover + 1}</h5>
              <ShowFiles files={files.rounds[curr_round].provers[curr_prover]}/>
            </>
          )}
          {files.rounds[curr_round].verifier.length > 0 && (
            <>
              <h4>Verifier</h4>
              <ShowFiles files={files.rounds[curr_round].verifier!}/>
            </>
          )}
          {files.rounds[curr_round].summarizer.length > 0 && (
            <>
              <h4>Summarizer</h4>
              <ShowFiles files={files.rounds[curr_round].summarizer!}/>
            </>
          )}
        </FilesGroup>
      )}
    </List>
  )
}

const FilesGroup = styled.div`
  display: flex;
  flex-flow: column;
  padding: 1rem;
  gap: 1rem;
  &:not(:last-of-type) {
    border-bottom: var(--border-alpha);
  }
  & > div {
    display: flex;
    gap: 1rem;
  }
  & > a {
    border: var(--border-alpha);
    border-radius: .2rem;
    padding: .35rem .5rem;
    &:hover {
      background: var(--bg-beta);
    }
    &.active {
      background: var(--bg-gamma);
      border-style: dashed;
      border-color: var(--text-alpha);
      pointer-events: none;
      font-weight: 500;
    }
  }
  & select {
    background: var(--bg-beta);
    border: var(--border-alpha);
    border-radius: .2rem;
    font-weight: 500;
    cursor: pointer;  
    &:hover {
      background: var(--bg-gamma);
    }
  }
`

const List = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
  min-width: 17.5rem;
  max-width: 17.5rem;
  border-right: var(--border-alpha);
`