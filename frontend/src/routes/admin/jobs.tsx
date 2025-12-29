import { useState } from "react"
import { styled } from "@linaria/react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { get_jobs_overview } from "../../api/admin/jobs"
import { QueueOverview } from "../../components/admin/jobs/QueueOverview"
import QueueSelector from "../../components/admin/jobs/QueueSelector"
import UpdatedAt from "@frontend/components/ui/UpdatedAt"

import * as Breadcrumb from "../../components/ui/Breadcrumb"
import { JobStatusValues, JobStatusIcon } from "@shared/admin/jobs"
import type { JobStatus } from "@shared/admin/jobs"
import type { QueueName } from "@backend/jobs"

export const Route = createFileRoute("/admin/jobs")({
  component: JobManagerDashboardPage,
})

function JobManagerDashboardPage() {
  const [selected_queue, selectQueue] = useState<QueueName | null>(null)

  const { data: job_states, isError, error, isPending, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: get_jobs_overview,
    refetchInterval: 10000,
  })

  if (isPending) return (
    <MainContent className="items-center justify-center gap-4">
      <div className="spinner"></div>
      <span>Initializing Dashboard...</span>
    </MainContent>
  )

  if (isError) return (
    <MainContent className="items-center justify-center gap-4">
      <p>Error loading Job Dashboard: {error.message}</p>
    </MainContent>
  )

  const queue_names = Object.keys(job_states) as QueueName[]
  const total_stats = Object.values(job_states).reduce(
    (total, { counts }) => ({
      running: total.running + counts.running,
      finished: total.finished + counts.finished,
      failed: total.failed + counts.failed,
      queued: total.queued + counts.queued,
      delayed: total.delayed + counts.delayed,
    }),
    { running: 0, finished: 0, failed: 0, delayed: 0, queued: 0 }
  )

  const active_queue = selected_queue && queue_names.includes(selected_queue)
    ? selected_queue
    : queue_names[0]

  return (
    <MainContent>
      <header className="flex justify-between p-4">
        <div>
          <Breadcrumb.default>
            <Breadcrumb.Item to="/admin">Administration</Breadcrumb.Item>
            <Breadcrumb.ChevronRightIcon />
            <Breadcrumb.Current>Jobs</Breadcrumb.Current>
          </Breadcrumb.default>
          <h1>Job Manager Dashboard</h1>
        </div>

        <div>
          <UpdatedAt updated_at={dataUpdatedAt}
            is_fetching={isFetching}/>
        </div>
      </header>

      <section className="flex-col gap-4">
        <h2 className="px-4">Summary Across Queues</h2>

        <JobsSummary>
          <JobStatistic>
            <div className="icon flex-center">🧮</div>
            <div className="count">
              <p className="count">{queue_names.length}</p>
              <p className="status kode">Number of Queues</p>
            </div>
          </JobStatistic>
          {JobStatusValues.map(status => (
            <JobStatistic $status={status}>
              <div className="icon flex-center">
                {JobStatusIcon[status]}
              </div>
              <div className="count">
                <p className="count">{total_stats[status]}</p>
                <p className="status kode">{status} jobs</p>
              </div>
            </JobStatistic>
          ))}
        </JobsSummary>
      </section>

      <section className="flex-col flex-1">
        <div className="p-4">
          <h2>Queues</h2>
        </div>
        {queue_names.length > 0 ? (
          <section className="flex-col flex-1">
            <QueueSelector queues={job_states}
              onChangeQueue={new_queue => selectQueue(new_queue)}
              selected_queue={active_queue}/>
            <QueueOverview
              key={active_queue}
              name={active_queue}
              state={job_states[active_queue]}/>
          </section>
        ) : (
          <p>No queues are defined.</p>
        )}
      </section>
    </MainContent>
  )
}

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-flow: column;
`

const JobsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 55rem;
  padding: 0 1rem;
`

const JobStatistic = styled.div<{ $status?: JobStatus }>`
  display: flex;
  border-bottom: var(--border-alpha);
  border-left: var(--border-alpha);
  &:nth-child(4n + 2) {
    border-right: var(--border-alpha);
  }
  &:nth-child(1), &:nth-child(2) {
    grid-column: span 2;
    border-top: var(--border-alpha);
  }
  & div.icon {
    padding: 1rem;
    border-right: 2px dashed var(--border-alpha-color);
    font-size: 1.2rem;
    background: var(--bg-beta);
  }
  & div.count {
    flex: 1;
    padding: .5rem 1rem;
    display: flex;
    flex-flow: column;
    gap: .2rem;
    align-items: flex-end;
    & p.count {
      font-weight: 700;
      font-size: 1.4rem;
      color: ${props => props.$status ? `var(--color-${props.$status})` : "var(--accent-alpha)" };
    }
    & p.status {
      font-weight: 600;
    }
  }
`