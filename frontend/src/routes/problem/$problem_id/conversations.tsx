import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import ProblemRounds from "../../../components/problem/Rounds"
import ProblemDetailsLayout, { MainContent } from "../../../components/problem/DetailsLayout"
import { get_problem_conversations } from "../../../api/problems"

export const Route = createFileRoute("/problem/$problem_id/conversations")({
  component: ProblemConversations,
})

// TODO: Implement new feature
// Keep track of selected round & proved in URL
// I tried but failed. It needs to be done in a way that the URL Search params 
// always track the state of prover & round
// needs a bit of refactoring of code (:
function ProblemConversations() {
  const { problem_id } = Route.useParams()
  const { data: problem_rounds, isPending, isError } = useQuery({
    queryKey: ["problem_conversations", problem_id],
    queryFn: () => get_problem_conversations(problem_id)
  })

  if (isPending) return (
    // TODO: here should actually be the layout instead of main content
    <ProblemDetailsLayout problem_id={problem_id}>
      <p>Loading conversations...</p>
    </ProblemDetailsLayout>
  )

  if (isError) return (
    <MainContent>
      <p>Couldn't find problem with id: {problem_id}</p>
    </MainContent>
  )

  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem_rounds.name}>
        {problem_rounds.rounds.length === 0 ? (
          <p>No research has been done for this problem yet.</p>
        ) : (
          <ProblemRounds rounds={problem_rounds.rounds}/>
        )}
    </ProblemDetailsLayout>
  )
}
