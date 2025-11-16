import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { getRounds } from "../../../api"
import ProblemRounds from "../../../components/problem/Rounds"
import ProblemDetailsLayout from "../../../components/problem/DetailsLayout"

export const Route = createFileRoute("/problem/$problem_id/conversations")({
  component: ProblemConversations,
})

// TODO: Implement new feature
// Keep track of selected round & proved in URL
function ProblemConversations() {
  const { problem_id } = Route.useParams()
  const [rounds, setRounds] = useState([])
  const [initial_load, setInitialLoad] = useState(true)

  // TODO: should probably be made with isLoading etc
  async function loadRounds() {
    const rounds_data = await getRounds(problem_id)
    console.log("loadRounds()", rounds_data)
    setRounds(rounds_data)
    setInitialLoad(false)
  }

  if (initial_load) loadRounds()

  return (
    <ProblemDetailsLayout problem_id={problem_id}>
      {initial_load ? (
          <p>Loading research...</p>
        ) : (
          <>
            {rounds.length === 0 ? (
              <p>No research has been done for this problem yet.</p>
            ) : (
              <ProblemRounds rounds={rounds}/>
            )}
          </>
        )}
    </ProblemDetailsLayout>
  )
}
