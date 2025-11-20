import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"
import { uuidv4} from "zod"

import ProblemDetailsLayout from "../../../components/problem/DetailsLayout"
import FilesList from "../../../components/problem/files/List"
import FileViewer from "../../../components/problem/files/Viewer"

import { get_all_files_for_problem } from "../../../api/problems"

export const Route = createFileRoute("/problem/$problem_id/files")({
  component: ProblemFilesInitial,
  validateSearch: (search: Record<string, string>) => {
    try {
      let file_id = uuidv4().parse(search.file_id)
      return { file_id }
    } catch (e) {
      return {}
    }
  }  
})

function ProblemFilesInitial() {
  const { problem_id } = Route.useParams()
  const { file_id } = Route.useSearch()

  const { data, isError, isPending } = useQuery({
    queryKey: ["get_all_files_for_problem", problem_id],
    queryFn: () => get_all_files_for_problem(problem_id),
  })

  if (isPending) return (
    <ProblemDetailsLayout problem_id={problem_id}>
      <p>Loading files...</p>
    </ProblemDetailsLayout>
  )

  if (isError) return (
    <ProblemDetailsLayout problem_id={problem_id}>
      <p>Failed to retrieve files for problem with id: {problem_id}</p>
    </ProblemDetailsLayout>
  )

  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={data.problem_name}>
      <MainContent>
        <FilesList files={data.files}
          problem_id={problem_id}
          file_id={file_id}/>

        {file_id === undefined ? (
          <p className="initial_guide">Select a file on the left to view it.</p>
        ) : (
          <FileViewer file_id={file_id}/>
        )}

      </MainContent>
    </ProblemDetailsLayout>
  )
}

const MainContent = styled.section`
  flex: 1;
  display: flex;
  & p.initial_guide {
    margin-left: auto;
    margin-right: auto;
    padding: 1rem;
  }
`