import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"
import { uuidv4} from "zod"

import ProblemDetailsLayout, { MainContent } from "../../../components/problem/DetailsLayout"
import FilesList from "../../../components/problem/files/List"
import FileViewer from "../../../components/problem/files/Viewer"
import FileContentViewer from "../../../components/problem/files/ContentViewer"

import { get_all_files_for_problem, get_main_files_history } from "../../../api/problems"

export const Route = createFileRoute("/problem/$problem_id/files")({
  component: ProblemFilesInitial,
  validateSearch: (search: Record<string, unknown>) => {
    let file_id: string | undefined
    let round: number | undefined
    let main_file: string | undefined
    try {
      file_id = uuidv4().parse(search.file_id)
    } catch {}
    if (typeof search.round === "number") round = search.round
    if (typeof search.main_file === "string") main_file = search.main_file
    return { file_id, round, main_file }
  }
})

function ProblemFilesInitial() {
  const { problem_id } = Route.useParams()
  const { file_id, round, main_file } = Route.useSearch()

  const { data, isError, isPending } = useQuery({
    queryKey: ["get_all_files_for_problem", problem_id],
    queryFn: () => get_all_files_for_problem(problem_id),
  })

  const { data: history } = useQuery({
    queryKey: ["get_main_files_history", problem_id],
    queryFn: () => get_main_files_history(problem_id),
  })

  if (isPending) return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name="" loading>
      <p>Loading files...</p>
    </ProblemDetailsLayout>
  )

  if (isError) return (
    <MainContent>
      <p>Failed to retrieve files for problem with id: {problem_id}</p>
    </MainContent>
  )

  const total_rounds = data.files.rounds.length
  const selected_round = round ?? total_rounds

  // For failed rounds (no verifier output), fall back to nearest previous round's content
  const history_entry = history?.find(h => h.round_index === selected_round)
    ?? history?.filter(h => h.round_index <= selected_round)
      .sort((a, b) => b.round_index - a.round_index)[0]

  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={data.problem_name}>
      <FileExplorer>
        <FilesList files={data.files}
          problem_id={problem_id}
          file_id={file_id}
          selected_round={selected_round}
          selected_main_file={main_file}/>

        {main_file && history_entry ? (
          <FileContentViewer
            key={`${main_file}-${selected_round}`}
            name={`${main_file}.md`}
            content={history_entry[main_file as keyof typeof history_entry] as string}
            subtitle={`Round ${selected_round}`}
          />
        ) : file_id ? (
          <FileViewer file_id={file_id}/>
        ) : (
          <p className="initial_guide">Select a file on the left to view it.</p>
        )}

      </FileExplorer>
    </ProblemDetailsLayout>
  )
}

const FileExplorer = styled.section`
  flex: 1;
  display: flex;
  & p.initial_guide {
    align-self: center;
    margin-left: auto;
    margin-right: auto;
    padding: 1rem;
  }
`