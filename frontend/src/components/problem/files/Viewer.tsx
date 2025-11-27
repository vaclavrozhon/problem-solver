import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"

import JSONViewer from "../../../components/JSONViewer"
import Markdown from "../../../components/Markdown"
import BracketButton from "../../../components/action/BracketButton"

import { get_file_by_id } from "../../../api/problems"


interface Props {
  file_id: string
}
export default function FileViewer({ file_id }: Props) {
  const [curr_view, setCurrView] = useState<"formatted" | "raw" | "db_entry">("raw")

  const { data: file, isError, isPending,  } = useQuery({
    queryKey: ["viewer-get_file_by_id", file_id],
    queryFn: () => get_file_by_id(file_id)
  })

  if (isPending) return (
    <Viewer>
      <p>Loading file...</p>
    </Viewer>
  )

  if (isError) return (
    <Viewer>
      <p>Failed to get file with id: {file_id}</p>
    </Viewer>
  )

  if (!file) return (
    <Viewer className="center">
      <p>This file doesn't exist.</p>
      <p>Given file id: {file_id}</p>
    </Viewer>
  )

  let FileContentViewer = <p>placeholder for now</p>
  switch (curr_view) {
    case "db_entry":
      FileContentViewer = <JSONViewer raw_json={file}/>
      break
    case "raw":
      FileContentViewer = <pre>{file.content || "--THIS FILE IS EMPTY--"}</pre>
      break
    case "formatted":
      // TODO: this is broken, i need to fix this quickly
      // if (file["file_name"].includes("json")) {
      //   let content = file.content.replace(/\s/g, "")
      //   let raw_json = JSON.stringify(JSON.parse(content), null, 2)
      //   FileContentViewer = <JSONViewer raw_json={raw_json}/>
      // }
      // else
      FileContentViewer = <Markdown md={file.content}/>
      break
  }

  return (
    <Viewer>
      <h2>{file["file_name"]}</h2>
      <div>
        <BracketButton onClick={() => setCurrView("formatted")}
          disabled={curr_view === "formatted"}>FORMATTED</BracketButton>
        <BracketButton onClick={() => setCurrView("raw")}
          disabled={curr_view === "raw"}>RAW</BracketButton>
        {/* <BracketButton onClick={() => setCurrView("db_entry")}
          disabled={curr_view === "db_entry"}>DB Entry</BracketButton> */}
      </div>
      {FileContentViewer}
    </Viewer>
  )
}

const Viewer = styled.section`
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
