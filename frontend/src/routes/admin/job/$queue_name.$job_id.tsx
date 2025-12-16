import { styled } from "@linaria/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { get_job_details } from "../../../api/admin"

import * as Breadcrumb from "../../../components/ui/Breadcrumb"
import UpdatedAt from "@frontend/components/ui/UpdatedAt"
import JSONViewer from "../../../components/JSONViewer"
import LeftArrowSVG from "@frontend/components/svg/LeftArrow"
import { ElapsedTime, format_duration } from "@frontend/components/admin/jobs/ElapsedTime"

import { format_name, JobStatusIcon, Job } from "@shared/admin"


export const Route = createFileRoute("/admin/job/$queue_name/$job_id")({
  component: JobDetailPage,
})


function JobDetailPage() {
  const { queue_name, job_id } = Route.useParams()

  const { data: job, error, isPending, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ["admin", "job", queue_name, job_id],
    queryFn: () => get_job_details(queue_name, job_id),
    refetchInterval: 15000,
  })

  if (isPending) return (
    <MainContent className="flex-center gap-1">
      <div className="spinner"></div>
      <span>Loading job details...</span>
    </MainContent>
  )

  if (error) return (
    <MainContent className="flex-center gap-1">
      <p>Error loading job: {(error as Error).message}</p>
    </MainContent>
  )

  const research_config = extract_research_config(job)

  return (
    <MainContent>
      <header className="flex space-between pad-1">
        <div>
          <Breadcrumb.default>
            <Breadcrumb.Item to="/admin">Administration</Breadcrumb.Item>
            <Breadcrumb.ChevronRightIcon/>
            <Breadcrumb.Item to="/admin/jobs">Jobs</Breadcrumb.Item>
            <Breadcrumb.ChevronRightIcon/>
            <Breadcrumb.Current>{format_name(job.queue_name)}</Breadcrumb.Current>
            <Breadcrumb.ChevronRightIcon/>
            <Breadcrumb.Current>#{job.id}</Breadcrumb.Current>
          </Breadcrumb.default>
          <h1>{format_name(job.name)}</h1>
        </div>

        <div>
          <UpdatedAt updated_at={dataUpdatedAt}
            is_fetching={isFetching}/>
        </div>
      </header>

      <section className="flex">
        <Sidebar>
          <BackButton to="/admin/jobs">
            <LeftArrowSVG/>
            <span>Back to Jobs</span>
          </BackButton>

          <div className="flex-col pad-1 gap-05">
            <DotLeader>
              <p>Job ID</p>
              <p>{job.id}</p>
            </DotLeader>
            <DotLeader>
              <p>Status</p>
              <p className="kode">
                {job.status}
                {" " + JobStatusIcon[job.status]}
              </p>
            </DotLeader>
            <DotLeader>
              <p>Queue</p>
              <p>{job.queue_name}</p>
            </DotLeader>
            <DotLeader>
              <p>Attempts</p>
              <p>{job.attempts}</p>
            </DotLeader>
            {job.started_at && job.ended_at && (
              <DotLeader>
                <p>Duration</p>
                <p>{format_duration(job.ended_at - job.started_at)}</p>
              </DotLeader>
            )}

            <h2>🕰️ Timeline</h2>
            <DotLeader>
              <p>Created</p>
              <p>{new Date(job.created_at).toLocaleString("cs-CZ")}</p>
            </DotLeader>
            {job.started_at && (
              <>
                <TimeDiff>
                  <p>{format_duration(job.started_at - job.created_at)}</p>
                  <span></span>
                </TimeDiff>
                <DotLeader>
                  <p>Started (latest attempt)</p>
                  <p>{new Date(job.started_at).toLocaleTimeString("cs-CZ")}</p>
                </DotLeader>
                {job.ended_at ? (
                  <>
                    <TimeDiff>
                      <p>{format_duration(job.ended_at - job.started_at)}</p>
                      <span></span>
                    </TimeDiff>
                    <DotLeader>
                      <p>Ended</p>
                      <p>{new Date(job.ended_at).toLocaleTimeString("cs-CZ")}</p>
                    </DotLeader>
                  </>
                ) : (
                  <DotLeader>
                    <p>Elapsed</p>
                    <p><ElapsedTime started_at={job.started_at}/></p>
                  </DotLeader>
                )}
                <DotLeader>
                </DotLeader>
              </>
            )}
          </div>
        </Sidebar>

        <section className="flex-col">
          {job.problem && (
            <Detail>
              <h2>Problem</h2>
              <ProblemLink to="/problem/$problem_id" params={{ problem_id: job.problem.id }}>
                <span>{job.problem.name}</span>
                <LeftArrowSVG/>
              </ProblemLink>
            </Detail>
          )}

          {job.user && (
            <Detail>
              <h2>Author</h2>
              <DetailEntry>
                <p>Name</p>
                <p>{job.user.name}</p>
              </DetailEntry>
              <DetailEntry>
                <p>Email</p>
                <p>{job.user.email}</p>
              </DetailEntry>
              <DetailEntry>
                <p>ID</p>
                <p>{job.user.id}</p>
              </DetailEntry>
            </Detail>
          )}

          {research_config && (
            <Detail>
              <h2>Research Config</h2>

              <DetailEntry>
                <p>Total Rounds</p>
                <p>{research_config.rounds}</p>
              </DetailEntry>
              <DetailEntry>
                <p>Current Round</p>
                <p>{research_config.current_round}</p>
              </DetailEntry>

              <DetailEntry>
                <p>Provers [{research_config.provers.length}]</p>
                <div>
                  {research_config.provers?.map((prover, i) => (
                    <p key={prover.model + i}>
                      {prover.model}
                    </p>
                  ))}
                </div>
              </DetailEntry>

              <DetailEntry>
                <p>Verifier Model</p>
                <div>
                  <p>{research_config.verifier_model}</p>
                </div>
              </DetailEntry>

              <DetailEntry>
                <p>Summarizer Model</p>
                <div>
                  <p>{research_config.summarizer_model}</p>
                </div>
              </DetailEntry>
            </Detail>
          )}

          {job.error && (
            <Detail className="no-pad no-gap">
              <h2 className="pad-1">❌ Error Details</h2>
              <HeightScroll className="flex-col gap-05">
                <h3 className="pad-left-1">Latest Error Message</h3>
                <pre className="pad-1">{job.error.message}</pre>
                <h3 className="pad-left-1">Stacktrace</h3>
                <div className="flex-col">
                  {job.error.stacktrace.map((stacktrace, i) => (
                    <>
                      <h4 className="pad-left-1">Failure {i + 1}</h4>
                      <pre className="pad-1">{stacktrace}</pre>
                    </>
                  ))}
                </div>
              </HeightScroll>
            </Detail>
          )}

          <Detail className="no-pad no-gap">
            <h2 className="pad-1">Raw Job Payload</h2>
            <HeightScroll>
              <JSONViewer raw_json={job.data}/>
            </HeightScroll>
          </Detail>
        </section>
      </section>
    </MainContent>
  )
}

interface ResearchConfig {
  rounds: number
  current_round: number
  provers: { model: string; advice?: string }[]
  verifier_model: string
  summarizer_model: string
}

function extract_research_config(job: Job): ResearchConfig | null {
  let config

  // For start_research jobs
  if (job.data?.new_research) config = job.data.new_research

  // For verifier/summarizer jobs
  if (job.data?.ctx?.research_config) config = job.data.ctx.research_config

  if (!config) return null
  return {
    rounds: config.rounds,
    current_round: job.data.ctx.current_relative_round_index,
    provers: config.prover.provers,
    verifier_model: config.verifier.model,
    summarizer_model: config.summarizer.model,
  }
}

const DotLeader = styled.div`
  display: flex;
  align-items: end;
  p:first-child {
    flex: 1;
    position: relative;
    overflow: hidden;
    font-family: SourceSerif;
    font-weight: 600;
    &::after {
    position: absolute;
    content: " . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ";
    margin: 0 .2rem;
    }
  }
  & p:last-child {
    font-family: Kode;
    text-transform: uppercase;
    font-weight: 600;
    font-size: .9rem;
    color: var(--text-beta);
  }
`

const TimeDiff = styled.div`
  position: relative;
  align-items: center;
  display: flex;
  margin: -.25rem 1rem -.25rem auto;
  font-size: .85rem;
  color: var(--accent-alpha);
  & p {
    background: var(--bg-gamma);
    padding: .1rem .2rem;
    border-radius: .2rem;
  }
  & span {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    background: var(--bg-gamma);
    border-radius: 100%;
    width: 1rem;
    height: 1rem;
    position: relative;
    &::before {
      content: "";
      width: .5rem;
      height: 2px;
      position: absolute;
      background: var(--accent-alpha);
    }
    &::after {
      content: "";
      width: 2px;
      height: .5rem;
      position: absolute;
      background: var(--accent-alpha);
    }
  }
  &::after {
    content: "";
    position: absolute;
    bottom: -25%;
    right: calc(.5rem - 1px);
    width: 2px;
    height: 150%;
    background: var(--accent-alpha);
    z-index: -1;
  }
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
`

const Detail = styled.div<{ $error?: boolean }>`
  display: flex;
  flex-flow: column;
  gap: .6rem;
  border-left: var(--border-alpha);
  padding: 1rem;
  &:first-child {
    border-top: var(--border-alpha);
  }
  &:not(:last-of-type) {
    border-bottom: var(--border-alpha);
  }
  & h2 {
    font-size: 1.2rem;
  }
  `

const HeightScroll = styled.div`
  overflow: auto;
  max-height: 80vh;
  & pre {
    word-break: break-word;
  }
`

const DetailEntry = styled.div`
  display: flex;
  flex-flow: column;
  gap: .15rem;
  & > p:first-child {
    font-family: Kode;
    text-transform: uppercase;
    font-weight: 700;
    font-size: .85rem;
  }
  & > p:last-child {
    color: var(--text-beta);
    font-weight: 500;
  }
  & > div {
    display: flex;
    flex-wrap: wrap;
    gap: .4rem;
    & > p {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.35rem;
      border: var(--border-alpha);
      background: var(--bg-beta);
      border-radius: .2rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-beta);
    }
  }
`

const ProblemLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .4rem .6rem;
  border-radius: .3rem;
  background: var(--bg-beta);
  color: var(--text-beta);
  font-weight: 500;
  &:hover {
    background: var(--bg-gamma);
    color: var(--accent-alpha);
  }
  & svg {
    width: 1rem;
    height: 1rem;
    transform: rotate(180deg);
  }
`

const Sidebar = styled.aside`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  max-width: 20rem;
  width: 100%;
  & h2 {
    font-size: 1.1rem;
    margin-top: .3rem;
    margin-bottom: -.3rem;
  }
`

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: .5rem;
  background: var(--bg-beta);
  border: var(--border-alpha);
  border-right: none;
  border-left: none;
  color: var(--text-beta);
  font-weight: 500;
  &:hover {
    background: var(--bg-gamma);
    color: var(--accent-alpha);
  }
  svg {
    width: 1rem;
    height: 1rem;
  }
`
