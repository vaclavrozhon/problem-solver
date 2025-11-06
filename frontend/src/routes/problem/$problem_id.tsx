import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"

import ProblemRounds from "../../components/problem/Rounds"

import { getRounds } from "../../api"

export const Route = createFileRoute("/problem/$problem_id")({
  component: ProblemID
})

function ProblemID() {
  const { problem_id } = Route.useParams()
  const [rounds, setRounds] = useState([])
  const [initial_load, setInitialLoad] = useState(true)

  // should probably be made with isLoading etc
  async function loadRounds() {
    const rounds_data = await getRounds(problem_id)
    console.log(rounds_data)
    setRounds(rounds_data)
    setInitialLoad(false)
  }

  if (initial_load) loadRounds()

  return (
    <MainContent>
      <h1>Problem Name (id: {problem_id})</h1>
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
    </MainContent>
  )
}

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  & > h1 {
    padding-top: 1rem;
    padding-left: 1rem;
  }
  & > p {
    padding: 1rem;
  }
`