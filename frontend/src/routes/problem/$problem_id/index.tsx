import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { delete_problem, get_problem_overview } from "../../../api/problems"

import ProblemDetailsLayout, { MainContent } from "../../../components/problem/DetailsLayout"
import RoundTime from "../../../components/problem/utils/RoundTime"
import { useAuthStore } from "@frontend/auth/store"
import { is_admin } from "@shared/auth"
import { Alert, AlertDialog, Button, Spinner } from "@heroui/react"

export const Route = createFileRoute("/problem/$problem_id/")({
  component: ProblemID
})

function ProblemID() {
  const { problem_id } = Route.useParams()
  const navigate = useNavigate()
  const query_client = useQueryClient()
  const { profile } = useAuthStore()

  const { data: problem, isError, isPending } = useQuery({
    queryKey: ["problem", problem_id],
    queryFn: () => get_problem_overview(problem_id),
  })

  const delete_problem_mutation = useMutation({
    mutationFn: () => delete_problem(problem_id),
    onSuccess: async () => {
      await query_client.invalidateQueries({ queryKey: ["my_problems"] })
      await navigate({ to: "/" })
    },
  })
  
  // ---- TEMPORARY v2 research
  const [v2_response, setResponse] = useState("")

  async function send_request() {
    const response = await fetch(`https://bolzano.app/api/problems/v2/${problem_id}`)
    const res = await response.text()
    setResponse(res)
  }
  // -----


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
          {problem.owner.id === profile?.id ? (
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

        {profile && (
          <>
            <div className="text-sm">
              <p>This problem was last updated at {format_date(problem.updated_at)}</p>
              <p>This problem was created at {format_date(problem.created_at)}</p>
            </div>
            
            <div className="text-sm">
              <p>
                To share this problem, simply share the current URL with anyone.
                <br/>
                They must be signed in to view it. Don't worry – no one can run research on your behalf.
              </p>
            </div>
          </>
        )}
        
        {/*-------V2 EPRIEMNTAL -----*/}
        {profile && is_admin(profile.role) && (
          <div className="flex flex-col">
            <p className="font-extrabold bg-yellow-200 text-ink-3">Please only run v2 research on FRESH problems!</p>
            <p>Just press this button and it will start running.</p>
            <p>Something will probably break – let me know!</p>
            <p>The problem will run for 4 rounds, 4 provers (all gpt-5.2), 2 verifiers (both gemini 3 pro)</p>
            <p>Only NOTES, PROOFS, TODO can be preview in Files section. No other files are being saved as of now.</p>
            {problem.phase === "running" ? (
              <p>Research is running!</p>
            ): (  
              <Button onClick={send_request}>Run v2 for this problem</Button>
            )}
            {v2_response && (
              <p>{v2_response}</p>
            )}
          </div>
        )}
        {/*----------*/}

        {problem.owner.id === profile?.id && (
          <DangerZone>
            <p className="title">Danger zone</p>
            <p className="text-sm">Delete this project and all its rounds/files permanently.</p>

            <AlertDialog>
              <Button variant="danger-soft">
                Delete Project
              </Button>
              <AlertDialog.Backdrop isDismissable>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="max-w-lg">
                    <AlertDialog.CloseTrigger/>
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger"/>
                      <AlertDialog.Heading className="font-sans">Delete this project?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body className="flex flex-col gap-4 p-1">
                      <p>This removes the project, all rounds, and all generated files. This cannot be undone.</p>
                      {delete_problem_mutation.isError && (
                        <Alert status="danger">
                          <Alert.Indicator/>
                          <Alert.Content>
                            <Alert.Title>Failed to delete project</Alert.Title>
                            <Alert.Description>{format_error_message(delete_problem_mutation.error)}</Alert.Description>
                          </Alert.Content>
                        </Alert>
                      )}
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button variant="ghost" slot="close">Cancel</Button>
                      <Button variant="danger"
                        onPress={() => delete_problem_mutation.mutate()}
                        isPending={delete_problem_mutation.isPending}
                        className="w-42">
                        {delete_problem_mutation.isPending ? (
                          <>
                            <Spinner color="current" size="sm"/>
                            Deleting...
                          </>
                        ) : (
                          "Yes, delete project"
                        )}
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </DangerZone>
        )}
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

const DangerZone = styled.section`
  display: flex;
  flex-flow: column;
  gap: .75rem;
  align-items: flex-start;
  border: var(--border-alpha);
  border-color: #c63f3f;
  padding: 1rem;
  border-radius: .5rem;
  & .title {
    color: #c63f3f;
    font-weight: 700;
  }
`

function format_date(date: string) {
  return (new Date(date)).toLocaleString("cs-CZ")
}

function format_error_message(error: unknown) {
  if (error instanceof Error && error.message && error.message !== "[object Object]") return error.message
  if (error && typeof error === "object") {
    const maybe_error = error as { message?: string, value?: { message?: string }, cause?: { message?: string } }
    if (typeof maybe_error.value?.message === "string") return maybe_error.value.message
    if (typeof maybe_error.cause?.message === "string") return maybe_error.cause.message
    if (typeof maybe_error.message === "string" && maybe_error.message !== "[object Object]") return maybe_error.message
  }
  return "Unexpected error."
}
