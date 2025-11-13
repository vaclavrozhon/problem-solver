import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"

import { useAuth } from "../../../contexts/AuthContext"
import { getStatus } from "../../../api"

import ProblemDetailsLayout from "../../../components/problem/DetailsLayout"
import RoundTime from "../../../components/problem/utils/RoundTime"

export const Route = createFileRoute("/problem/$problem_id/")({
  component: ProblemID
})

function ProblemID() {
  const { problem_id } = Route.useParams()
  const { user } = useAuth()
  const [initial_load, setInitialLoad] = useState(true)
  // TODO: make this any type safe
  const [problem_overview, setProblemOverview] = useState<any>({})
  const [problem_author, setProblemAuthor] = useState("loading...")

  async function loadStatus() {
    const status = await getStatus(problem_id)
    console.log("Overview.tsx: loadStatus()", status)
    setProblemAuthor(status.user.user.user_metadata.name || status.user.user.user_metadata.email)
    setProblemOverview(status)
    setInitialLoad(false)
  }

  if (initial_load) {
    loadStatus()
    return (
      <ProblemDetailsLayout problem_id={problem_id}>
        <p>Loading problem status...</p>
      </ProblemDetailsLayout>
    )
  }

  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem_overview.problem.name}>
      <Overview>
        <ProblemStatus>
          <div className={problem_overview.overall.phase}>
            <p>Status</p>
            <p className="value">{problem_overview.overall.phase}</p>
          </div>
          <div>
            <p>Total rounds</p>
            <p className="value">{problem_overview.overall.total_rounds}</p>
          </div>
          {problem_overview.problem.owner_id === user?.id ? (
            <div>
              <p className="value">You are the author of this problem</p>
            </div>
          ) : (
            <div>
              <p>Author</p>
              <p className="value">{problem_author}</p>
            </div>
          )}
        </ProblemStatus>

        <div>
          <RoundTime problem_id={problem_id}/>
        </div>

        <div>
          <p>This problem was last updated at {format_date(problem_overview.problem.updated_at)}</p>
          <p>This problem was created at {format_date(problem_overview.problem.created_at)}</p>
        </div>

        {/* <div>
          new run config
          should add estimate how much the run is gonna cost
        </div> */}

        {/* <div>
          TODO: danger zone (actions like remove the problem etc. or stop the research for now if running)
        </div> */}
      </Overview>
    </ProblemDetailsLayout>
  )
}

const ProblemStatus = styled.div`
  align-self: flex-start;
  display: flex;
  gap: 1rem;
  & > div {
    display: flex;
    align-items: center;
    border: var(--border-alpha);
    font-weight: 600;
    &:has(:only-child) {
      border-style: dashed;
    }
    & p {
      padding: .3rem .6rem;
      &.value {
        font-weight: 400;
        &:not(:only-child) {
          border-left: var(--border-alpha);
        }
      }
    }
    &.completed, &.running {
      color: var(--special-color);
      border-color: var(--special-color);
      & p.value {
        border-color: var(--special-color);
      }
    }
    &.completed {
      --special-color: #5ad653;
    }
    &.running {
      --special-color: #e0853b;
    }
  }
`

const Overview = styled.section`
  display: flex;
  flex-flow: column;
  gap: 1rem;
  padding: 1rem;
`

function format_date(date: string) {
  return (new Date(date)).toLocaleString("cs-CZ")
}