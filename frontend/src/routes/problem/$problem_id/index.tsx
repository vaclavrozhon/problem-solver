import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { useQuery } from "@tanstack/react-query"

import { useAuth } from "../../../auth/hook"
import { get_problem_overview } from "../../../api/problems"

import ProblemDetailsLayout, { MainContent } from "../../../components/problem/DetailsLayout"
import RoundTime from "../../../components/problem/utils/RoundTime"

export const Route = createFileRoute("/problem/$problem_id/")({
  component: ProblemID
})

function ProblemID() {
  const { problem_id } = Route.useParams()
  const { user } = useAuth()

  const { data: problem, error, isError, isPending } = useQuery({
    queryKey: ["problem", problem_id],
    queryFn: () => get_problem_overview(problem_id),
  })


  if (isPending) return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name="" loading>
      <p>Loading problem status...</p>
    </ProblemDetailsLayout>
  )

  if (isError) return (
    <MainContent>
      <p>Couldn't find a problem by id: {problem_id}</p>
    </MainContent>
  )

  const total_cost = problem.round_summaries.reduce((acc, round) => acc + round.usage, 0)

  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem.name}>
      <Overview>
        <ProblemStatus>
          <div className={problem.phase}>
            <p>Status</p>
            <p className="value">{problem.phase}</p>
          </div>
          <div>
            <p>Total rounds</p>
            <p className="value">{problem.total_rounds}</p>
          </div>
          <div>
            <p>Total price</p>
            <p className="value">${total_cost.toFixed(3)}</p>
          </div>
          {problem.owner.id === user?.id ? (
            <div>
              <p className="value">You are the author of this problem</p>
            </div>
          ) : (
            <div>
              <p>Author</p>
              <p className="value">{problem.owner.name}</p>
            </div>
          )}
        </ProblemStatus>

        <div>
          <RoundTime round_summaries={problem.round_summaries}/>
        </div>

        <div>
          <p>This problem was last updated at {format_date(problem.updated_at)}</p>
          <p>This problem was created at {format_date(problem.created_at)}</p>
        </div>

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
    &.completed, &.running, &.failed {
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
    &.failed {
      --special-color: #e02525;
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