import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { useEffect } from "react"

import ProblemRounds from "../../../components/problem/Rounds"
import ProblemDetailsLayout, { MainContent }  from "../../../components/problem/DetailsLayout"
import { get_problem_conversations } from "../../../api/problems"

export const Route = createFileRoute("/problem/$problem_id/conversations")({
  component: ProblemConversations,
  // TODO: Also keep track of prover index but only after we
  // possibly add multiple verifiers?
  validateSearch: (search) => z.object({
    round: z.int().min(1).catch(1).optional()
  }).parse(search),
})

function ProblemConversations() {
  const { problem_id } = Route.useParams()
  const { round } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data: problem_rounds, isPending, isError } = useQuery({
    queryKey: ["problem_conversations", problem_id],
    queryFn: () => get_problem_conversations(problem_id)
  })

  // round is 1-based from URL or undefined
  const current_round_index = round !== undefined
    ? round - 1
    : (problem_rounds?.rounds.length ? problem_rounds.rounds.length - 1 : 0);

  // Redirect if round is out of bounds
  useEffect(() => {
    if (problem_rounds
      && round
      && problem_rounds.rounds.length > 0
      && round > problem_rounds.rounds.length) {
      navigate({
        search: (prev) => ({ ...prev, round: problem_rounds.rounds.length }),
        replace: true
      })
    }
  }, [problem_rounds, round, navigate])

  if (isPending) return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name="" loading>
      <p>Loading conversations...</p>
    </ProblemDetailsLayout>
  )

  if (isError) return (
    <MainContent>
      <p>Couldn't find problem with id: {problem_id}</p>
    </MainContent>
  )

  const handle_round_change = (new_round: number) => {
    navigate({
      search: (prev) => ({ ...prev, round: new_round + 1 }),
      replace: true, // replace history entry to avoid cluttering
    })
  }

  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem_rounds.name}>
      {problem_rounds.rounds.length === 0 ? (
        <div className="flex-1 flex-center">
          <p>No research has been done for this problem yet.</p>
        </div>
      ) : (
        <ProblemRounds
          rounds={problem_rounds.rounds}
          curr_round={current_round_index}
          onRoundChange={handle_round_change}
        />
      )}
    </ProblemDetailsLayout>
  )
}