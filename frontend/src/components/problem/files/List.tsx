import { useState, useEffect } from "react"
import { styled } from "@linaria/react"
import { Link } from "@tanstack/react-router"

import { listFiles } from "../../../api"

import type { File, ProblemFiles } from "./utils"
import { format_raw_files_data } from "./utils"

interface Props {
  problem_id: string,
}
export default function FilesList({ problem_id }: Props) {
  const [files, setFiles] = useState<ProblemFiles | null>(null)
  const [curr_round, setCurrRound] = useState(0)
  const [curr_prover, setCurrProver] = useState(1)

  const [initial_load, setInitialLoad] = useState(true)

  async function loadFiles() {
    // TODO: this returns content of all files
    //  but we don't need that... in the future it should just return everything
    /// excepet for the content and then get the required content per request from db
    const raw_files: File[] = await listFiles(problem_id)
    let formatted_files = format_raw_files_data(raw_files)
    setFiles(formatted_files)
    setCurrRound(formatted_files.rounds.length)
    setInitialLoad(false)
  }

  if (initial_load || !files) {
  loadFiles()
    return (
      <List>
        <p>Loading files...</p>
      </List>
    )
  }

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
                setCurrProver(1)
                setCurrRound(parseInt(e.target.value))
                }}>
              {files.rounds.map(round => (
                <option value={round.round}
                  key={round.round}>Round {round.round}</option>
              ))}
            </select>
          </div>
          {files.rounds[curr_round - 1].provers &&
            files.rounds[curr_round - 1].provers!.length > 0 && (
            <>
              <div>
                <h4>Provers</h4>
                <select name="prover-picker"
                  value={curr_prover}
                  onChange={e => setCurrProver(parseInt(e.target.value))}>
                    {files.rounds[curr_round - 1].provers!.map((_, i) => (
                      <option value={i + 1}
                        key={i + 1}>Prover {i + 1}</option>
                    ))}
                  </select>
              </div>
              <h5>Prover {curr_prover}</h5>
              <ShowFiles files={files.rounds[curr_round - 1].provers!  [curr_prover - 1]}/>
            </>
          )}
          {files.rounds[curr_round - 1].verifier && (
            <>
              <h4>Verifier</h4>
              <ShowFiles files={files.rounds[curr_round - 1].verifier!}/>
            </>
          )}
          {files.rounds[curr_round - 1].summarizer && (
            <>
              <h4>Summarizer</h4>
              <ShowFiles files={files.rounds[curr_round - 1].summarizer!}/>
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
    padding: .5rem;
    &:hover {
      background: var(--bg-beta);
    }
    &.active {
      background: var(--bg-gamma);
      border-style: dashed;
      pointer-events: none;
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