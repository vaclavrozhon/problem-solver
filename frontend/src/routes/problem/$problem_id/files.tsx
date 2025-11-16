import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"

import { req } from "../../../api"

import ProblemDetailsLayout from "../../../components/problem/DetailsLayout"
import FilesList from "../../../components/problem/files/List"
import JSONViewer from "../../../components/JSONViewer"
import BracketButton from "../../../components/action/BracketButton"
import Markdown from "../../../components/Markdown"

export const Route = createFileRoute("/problem/$problem_id/files")({
  component: ProblemFilesInitial,
  validateSearch: (search: Record<string, string>) => {
    // can't have file_id set to 0 in db
    let field_id =  Number(search.file_id) || -1
    // TODO: implement this after we write new backend
    // both provers and rounds needs to be at least 1
    // if it's higher than number of rounds/provers, then we replace current url to the highest num in the FilesList compoents
    // when the value is equal to 0, it means we want the latest prover/round
    // let round_num = Number(search.round) || 0
    // let prover_num = Number(search.prover) || 0
    return {
      file_id: field_id >= -1 ? field_id : -1,
      // round: round_num >= 1 ? round_num : 0,
      // prover: prover_num >= 1 ? prover_num : 0,
    }
  }  
})

function ProblemFilesInitial() {
  const { problem_id } = Route.useParams()
  // TODO: Three cases:
  // (1) file_id is nonsense and turned into '-1' by tanstack -> show empty
  // (2) valid file_id -> show file content
  // (3) invalid file_id -> show error
  const { file_id } = Route.useSearch()

  // TODO: types for 'data'
  const { isFetching, isError, error, data } = useQuery({
    queryKey: ["problem_file_content", problem_id, file_id],
    queryFn: async () => {
      if (file_id === -1) {
        // TODO: solve this better
        // when we don't have any file selected, we don't need to get anything from the DB except for the file list
        return []
      } else {
        const response = await req(`/problems/${problem_id}/file_by_id/${file_id}`)
        return await response.json()
      }
    }
  })

  const [curr_view, setCurrView] = useState<"formatted" | "raw" | "db_entry">("raw")

  let FileContentViewer = <p>placeholder for now</p>
  if (!isFetching && !isError) {
    switch (curr_view) {
      case "db_entry":
        FileContentViewer = <JSONViewer raw_json={data}/>
        break
      case "raw":
        FileContentViewer = <pre>{data.content}</pre>
        break
      case "formatted":
        // TODO: this is broken, i need to fix this quickly
        if (data["file_name"].includes("json")) {
          let content = data.content.replace(/\s/g, "")
          let raw_json = JSON.stringify(JSON.parse(content), null, 2)
          FileContentViewer = <JSONViewer raw_json={raw_json}/>
        }
        else FileContentViewer = <Markdown md={data.content}/>
        break
    }
  }

  return (
    <ProblemDetailsLayout problem_id={problem_id}>
      <FilesViewer>
        <FilesList problem_id={problem_id}/>
        {file_id === -1 ? (
          <FileContent className="center">
            <p>Select a file on the left to view it.</p>
          </FileContent>
        ) : (
          <>
            {isFetching ? (
              <FileContent className="center">
                <p>Fetching file...</p>
              </FileContent>
            ) : isError ? (
              <FileContent className="center">
                <p>Something went wrong: {JSON.stringify(error)}</p>
              </FileContent>
            ) : (
              <FileContent>
                <h2>{data["file_name"]}</h2>
                <div>
                  <BracketButton onClick={() => setCurrView("formatted")}
                    disabled={curr_view === "formatted"}>File Content Formatted</BracketButton>
                  <BracketButton onClick={() => setCurrView("raw")}
                    disabled={curr_view === "raw"}>RAW</BracketButton>
                  <BracketButton onClick={() => setCurrView("db_entry")}
                    disabled={curr_view === "db_entry"}>DB Entry</BracketButton>
                </div>
                {FileContentViewer}
              </FileContent>
            )}
          </>
        )}
      </FilesViewer>
    </ProblemDetailsLayout>
  )
}

const FileContent = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
  padding: 1rem;
  gap: 1rem;
  &.center {
    align-items: center;
  }
  & > h2 {
    align-self: flex-start;
    background: var(--bg-beta);
    padding: .2rem .4rem;
    border-radius: .2rem;
  } 
  & > div {
    display: flex;
    gap: 1rem;
  }
`

const FilesViewer = styled.section`
  flex: 1;
  display: flex;
`