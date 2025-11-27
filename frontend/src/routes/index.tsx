import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { useQuery } from "@tanstack/react-query"
import BracketLink from "../components/action/BracketLink"

import { get_users_problems } from "../api/problems"

// TODO: add like 30s refresh for checking on the problems
export const Route = createFileRoute("/")({ component: OverviewPage })
function OverviewPage() {
  let { data: problems, error, isPending, isError } = useQuery({
    queryKey: ["my_problems"],
    queryFn: get_users_problems
  })

  
  if (isPending) return <MainContent><p>Loading problems...</p></MainContent>
  if (isError || !problems) return <MainContent><p>Error occurred: {JSON.stringify(error)}</p></MainContent>
  
  problems.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))

  const currently_running_problems_count = problems.filter(p => p.is_running && p.phase !== "idle").length
  const total_rounds_count = problems.reduce((sum, p) => sum + (p.current_round ?? 0), 0)

  return (
    <MainContent>
      <h1>My Problems</h1>


      {problems.length > 0 ? (
        <>
          <MetricDashboard>
            <MetricCard>
              <p className="title">Total Problems</p>
              <p className="num">{problems.length}</p>
            </MetricCard>
            <MetricCard>
              <p className="title">Currently Running</p>
              <p className="num">{currently_running_problems_count}</p>
            </MetricCard>
            <MetricCard>
              <p className="title">Total Rounds</p>
              <p className="num">{total_rounds_count}</p>
            </MetricCard>
          </MetricDashboard>

          <ProblemsSection>
            <ProblemRow className="header">
              <div>Problem Name</div>
              <div>Status</div>
              <div>Rounds</div>
              <div>Last Activity</div>
              <div>Actions</div>
            </ProblemRow>
            <ProblemsTable>
              {problems.map(p => (
                <ProblemRow key={p.id}>
                  <div className="problem_name">{p.name}</div>
                  <div>{p.phase}</div>
                  <div>{p.total_rounds}</div>
                  <div>{(new Date(p.updated_at)).toLocaleString("cs-CZ")}</div>
                  <div>
                    <BracketLink to="/problem/$problem_id"
                    params={{ problem_id: p.id }}>
                      View
                    </BracketLink>
                    </div>
                </ProblemRow>
              ))}
            </ProblemsTable>
          </ProblemsSection>
        </>
      ) : (
        <div>
          <p>No research problems were found.</p>
          <p>
            To get started,&nbsp;
            <BracketLink to="/create">
              create
            </BracketLink>
            &nbsp;your first research problem!
          </p>
        </div>
      )}
    </MainContent>
  )
}



const ProblemRow = styled.div`
  display: flex;
  &:not(:last-of-type):not(.header) {
    border-bottom: var(--border-alpha);
  }
  &.header {
    font-weight: 600;
    color: var(--text-beta);
  }
  &:not(.header) div:not(:last-of-type) {
    border-right: var(--border-alpha);
  }
  & div {
    flex: 1;
    padding: .3rem .6rem;
    &.problem_name {
      color: var(--text-beta);
      font-weight: 500;
    }
  }
`

const ProblemsTable = styled.div`
  display: flex;
  flex-flow: column;
  border: var(--border-alpha);
  border-radius: .4rem;
`

const ProblemsSection = styled.section`
  display: flex;
  flex-flow: column;
`

const MetricCard = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
  gap: .4rem;
  padding: 1rem 1.4rem;
  /* background: var(--bg-gamma); */
  border-radius: .5rem;
  border: var(--border-alpha);
  & p.title {
    text-transform: uppercase;
    font-size: .8rem;
  }
  & p.num {
    color: var(--text-beta);
    font-weight: 600;
    font-size: 1.1rem;
  }
`

const MetricDashboard = styled.section`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  gap: 1rem;
  padding: 1rem;
`