import { useState } from "react"
import { styled } from "@linaria/react"
import { Link, useNavigate } from "@tanstack/react-router"
import { Dropdown, Header as DropdownHeader, Separator, Label } from "@heroui/react"
import { Icon } from "@iconify/react"

import type { File, ProblemFiles } from "@shared/types/problem"
import BracketButton from "../../../components/action/BracketButton"
import { is_admin } from "@shared/auth"
import { useAuthStore } from "@frontend/auth/store"

interface Props {
  files: ProblemFiles
  problem_id: string
  file_id?: string
  selected_round: number
  selected_main_file?: string
}

export default function FilesList({
  files,
  file_id,
  problem_id,
  selected_round,
  selected_main_file,
}: Props) {
  const navigate = useNavigate()
  const [curr_prover, setCurrProver] = useState(0)
  
  // V2 Expeirmental------
  const { profile } = useAuthStore()
  // -----

  const total_rounds = files.rounds.length

  function handle_round_change(new_round: number) {
    const preserve_selected_task_file = file_id === files.task.id ? file_id : undefined
    navigate({
      to: "/problem/$problem_id/files",
      params: { problem_id },
      search: {
        file_id: preserve_selected_task_file,
        round: new_round,
        main_file: selected_main_file
      },
    })
  }

  function get_file_sort_order(file_name: string): number {
    if (file_name.includes("prompt")) return 0
    if (file_name.includes("output")) return 1
    if (file_name.includes("reasoning")) return 2
    return 3
  }

  function get_short_file_name(file_name: string): string {
    return file_name
      .replace(/^(prover-\d+|verifier|summarizer)\./, "")
  }

  function ShowFiles({ files }: { files: File[] }) {
    const sorted_files = [...files].sort((a, b) =>
      get_file_sort_order(a.file_name) - get_file_sort_order(b.file_name)
    )
    return (
      <FileButtons>
        {sorted_files.map(file => (
          <Link to="/problem/$problem_id/files"
            params={{ problem_id }}
            search={{
              file_id: file.id,
              round: selected_round,
              main_file: undefined
            }}
            key={file.id}>
            {get_short_file_name(file.file_name)}
          </Link>
        ))}
      </FileButtons>
    )
  }

  function MainFileLink({ file_type, label }: { file_type: string; label: string }) {
    return (
      <Link to="/problem/$problem_id/files"
        params={{ problem_id }}
        search={{ file_id: undefined, round: selected_round, main_file: file_type }}>
        {label}
      </Link>
    )
  }

  const round_files_index = selected_round > 0 ? selected_round - 1 : 0
  const has_round_files = files.rounds.length > 0 && files.rounds[round_files_index]

  return (
    <List>
      <section className="flex flex-col sticky top-0">
        
        {/* Round Selector at top */}
        {total_rounds > 0 && (
          <RoundSelector>
            <span>Round</span>
            <div className="controls">
              <button
                onClick={() => handle_round_change(selected_round - 1)}
                disabled={selected_round <= 0}>
                &lt;
              </button>
              <select
                value={selected_round}
                onChange={e => handle_round_change(parseInt(e.target.value))}>
                {Array.from({ length: total_rounds + 1 }, (_, i) => (
                  <option value={i} key={i}>
                    {i}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handle_round_change(selected_round + 1)}
                disabled={selected_round >= total_rounds}>
                &gt;
              </button>
            </div>
            <span className="total">/ {total_rounds}</span>

            <div className="ml-auto">
              <Dropdown>
                <Dropdown.Trigger className={`
                  rounded-full p-2 bg-gamma
                `}>
                  <Icon icon="gravity-ui:gear"/>
                </Dropdown.Trigger>
                <Dropdown.Popover className="min-w-40">
                  <Dropdown.Menu>
                    <Dropdown.SubmenuTrigger>
                      <Dropdown.Item>
                        <Label>Export</Label>
                        <Dropdown.SubmenuIndicator/>
                      </Dropdown.Item>
                      <Dropdown.Popover>
                        <Dropdown.Menu>
                          <DropdownHeader>Export</DropdownHeader>
                          {selected_round > 0 && (
                            <Dropdown.Item href={`/api/problems/download/round/${problem_id}/${selected_round}`}
                              download>
                              <Label>Current round files</Label>
                              <Icon icon="gravity-ui:abbr-zip"
                                className="ml-auto"/>
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item href={`/api/problems/download/all/${problem_id}`}
                            download>
                            <Label>All problem files</Label>
                            <Icon icon="gravity-ui:abbr-zip"
                              className="ml-auto"/>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown.SubmenuTrigger>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </RoundSelector>
        )}
  
        {/* Task - always at top, never changes */}
        <FilesGroup>
          <Link
            to="/problem/$problem_id/files"
            params={{ problem_id }}
            search={{ file_id: files.task.id, round: undefined, main_file: undefined }}
            className={`task-file ${file_id === files.task.id ? "active" : ""}`}>
            problem task
          </Link>
        </FilesGroup>
  
        {/* Main Files - content varies by round */}
        <FilesGroup>
          <h3>Main Files</h3>
          <FileButtons>
            <MainFileLink file_type="notes" label="notes"/>
            <MainFileLink file_type="proofs" label="proofs"/>
            <MainFileLink file_type="output" label="output"/>
          </FileButtons>
        </FilesGroup>
        
        {/* ------- V2 Experimental ------*/}
        {profile && is_admin(profile.role) && (files.rounds[round_files_index]?.todo.length > 0 || files.rounds[round_files_index]?.notes.length > 0 || files.rounds[round_files_index]?.proofs.length > 0) && (
          <div className="bg-cyan-100 flex flex-col py-2 px-4 font-bold gap-2">
            <p>V2 FILES ONLY HERE</p>
            <Link to="/problem/$problem_id/files"
              params={{ problem_id }}
              search={{
                file_id: files.rounds[round_files_index].todo[0].id,
                round: selected_round,
                main_file: undefined
              }}
              className="border-2 border-ink-2 px-2 py-1">
              TODO
            </Link>
            <Link to="/problem/$problem_id/files"
              params={{ problem_id }}
              search={{
                file_id: files.rounds[round_files_index].notes[0].id,
                round: selected_round,
                main_file: undefined
              }}
              className="border-2 border-ink-2 px-2 py-1">
              NOTES
            </Link>
            <Link to="/problem/$problem_id/files"
              params={{ problem_id }}
              search={{
                file_id: files.rounds[round_files_index].proofs[0]?.id,
                round: selected_round,
                main_file: undefined
              }}
              className="border-2 border-ink-2 px-2 py-1">
              PROOFS
            </Link>
          </div>
        )}
        {/*-----------*/}
  
        {/* Round Files - round_instructions/prover/verifier/summarizer */}
        {has_round_files && selected_round > 0 && (
          <FilesGroup>
            {files.rounds[round_files_index].round_instructions && (
              <AgentGroup className="round-instructions">
                <FileButtons>
                  <Link to="/problem/$problem_id/files"
                    params={{ problem_id }}
                    search={{
                      file_id: files.rounds[round_files_index].round_instructions.id,
                      round: selected_round,
                      main_file: undefined
                    }}
                    className="border-t-0!">
                    Additional Instructions
                  </Link>
                </FileButtons>
              </AgentGroup>
            )}
  
            {files.rounds[round_files_index].provers.length > 0 && (
              <AgentGroup className="prover">
                <div className="flex-col">
                  <h3>Prover {curr_prover + 1}</h3>
                  {files.rounds[round_files_index].provers.length > 1 && (
                    <ProverSwitcher>
                      <span>switch to:</span>
                      {files.rounds[round_files_index].provers.map((_, i) => (
                        <BracketButton
                          key={i}
                          disabled={i === curr_prover}
                          onClick={() => setCurrProver(i)}>
                          {i + 1}
                        </BracketButton>
                      ))}
                    </ProverSwitcher>
                  )}
                </div>
                <ShowFiles files={files.rounds[round_files_index].provers[curr_prover]}/>
              </AgentGroup>
            )}
  
            {files.rounds[round_files_index].verifier.length > 0 && (
              <AgentGroup className="verifier">
                <h3>Verifier</h3>
                <ShowFiles files={files.rounds[round_files_index].verifier}/>
              </AgentGroup>
            )}
  
            {files.rounds[round_files_index].summarizer.length > 0 && (
              <AgentGroup className="summarizer">
                <h3>Summarizer</h3>
                <ShowFiles files={files.rounds[round_files_index].summarizer}/>
              </AgentGroup>
            )}
          </FilesGroup>
        )}
      </section>
    </List>
  )
}

const RoundSelector = styled.div`
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1rem;
  border-bottom: var(--border-alpha);
  background: var(--bg-beta);
  height: 3.5rem;
  & > span {
    font-weight: 500;
  }
  & > span.total {
    color: var(--text-gamma);
  }
  & > .controls {
    display: flex;
    align-items: center;
    & > button {
      width: 1.75rem;
      height: 1.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Kode;
      font-size: .9rem;
      font-weight: 700;
      background: var(--bg-alpha);
      border: var(--border-alpha);
      color: var(--accent-alpha);
      transition: all .1s ease;
      &:first-child {
        border-radius: .25rem 0 0 .25rem;
        border-right: none;
      }
      &:last-child {
        border-radius: 0 .25rem .25rem 0;
        border-left: none;
      }
      &:hover:not(:disabled) {
        background: var(--bg-gamma);
        color: var(--text-alpha);
      }
      &:disabled {
        color: var(--border-alpha-color);
        cursor: not-allowed;
      }
    }
    & > select {
      height: 1.75rem;
      background: var(--bg-alpha);
      border: var(--border-alpha);
      padding: 0 .5rem;
      font-size: .95rem;
      font-weight: 600;
      cursor: pointer;
      &:hover {
        background: var(--bg-beta);
      }
    }
  }
`

const AgentGroup = styled.div`
  display: flex;
  flex-flow: column;
  border-bottom: var(--border-beta);
  &.prover {
    & h3:not(:only-child) {
      border-bottom: 2px dashed var(--border-alpha-color);
    }
  }
`

const ProverSwitcher = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: .3rem;
  padding: .3rem;
  background: var(--bg-beta);
  & > span {
    font-family: Kode;
    font-weight: 600;
    text-transform: uppercase;
    font-size: .8rem;
  }
`

const FileButtons = styled.div`
  display: flex;
  /* gap: .5rem; */
  & > a {
    flex: 1;
    font-family: Kode;
    text-transform: uppercase;
    font-weight: 600;
    padding: .3rem .5rem;
    text-align: center;
    font-size: .9rem;
    border-top: 2px dashed var(--border-alpha-color);
    &:hover {
      background: var(--bg-beta);
    }
    &.active {
      /* outline: 1px dashed var(--text-alpha); */
      /* outline-offset: 1px; */
      pointer-events: none;
      background: var(--bg-gamma);
      color: var(--text-beta);
      font-weight: 700;
      border-top-style: solid;
    }
    &:not(:last-child) {
      border-right: var(--border-alpha);
    }
  }
`

const FilesGroup = styled.div`
  display: flex;
  flex-flow: column;
  /* padding: 1rem; */
  /* gap: .75rem; */
  &:not(:last-of-type) {
    border-bottom: 6px double var(--border-alpha-color);
  }
  & h3 {
    /* text-align: center; */
    padding: .25rem .5rem;
    font-size: 1.1rem;
  }
  & > a.task-file {
    font-family: Kode;
    text-transform: uppercase;
    font-weight: 700;
    padding: .35rem .5rem;
    text-align: center;
    &:hover {
      background: var(--bg-beta);
    }
    &.active {
      background: var(--bg-gamma);
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
