import { styled } from "@linaria/react"

import { Table, TableCell, TableBody, TableErrorSection, TableHeader, PossibleErrorRow, ClickableRow } from "../../ui/Table"
import { QueueState, JobSummary, JobStatus, JobStatusValues, format_name, JobStatusIcon } from "@shared/admin/jobs"
import JobSchemas from "./JobSchemas"
import { ElapsedTime } from "@frontend/components/admin/jobs/ElapsedTime"

interface QueueProps {
  name: string,
  state: QueueState,
}

export function QueueOverview({ name, state }: QueueProps) {
  const { counts, jobs, schemas } = state

  const status_types: readonly JobStatus[] = JobStatusValues

  return (
    <Overview>
      <header>
        <h3>{format_name(name)}</h3>
      </header>

      <JobSchemas schemas={schemas}/>

      {Object.values(jobs).flat().length === 0 ? (
        <div className="pad-1 border-top">
          No jobs have been queued yet.
        </div>
      ) : (
        <>
          <StatusSummary>
            {status_types.map(status => (
              <StatusType $status={status}>
                <span></span>
                <p className="label">{status}</p>
                <p className="value">{counts[status]}</p>
              </StatusType>
            ))}
          </StatusSummary>

          {status_types.map(status => (
            <>
              {jobs[status].length > 0 && (
                <JobsWithStatusTable queue_name={name}
                  jobs={jobs[status]}
                  status={status}
                  running={status === "running"}/>
              )}
            </>
          ))}
        </>
      )}
    </Overview>
  )
}

const Overview = styled.section`
  flex: 1;
  background: var(--bg-beta);
  & header {
    padding: 1rem;
    padding-bottom: .5rem;
    & h3 {
      font-size: 1.25rem;
      color: var(--text-beta);
    }
  }
`

const StatusSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-top: var(--border-alpha);
  border-bottom: var(--border-alpha);
`

const StatusType = styled.div<{ $status: JobStatus }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  &:not(last-child) {
    border-right: var(--border-alpha);
  }
  & p.label {
    font-size: 0.9rem;
    color: var(--text-alpha);
    font-family: Kode;
    text-transform: uppercase;
    font-weight: 600;
  }
  & p.value {
    margin-left: auto;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-beta);
  }
  & span {
    width: .6rem;
    height: .6rem;
    border-radius: 100%;
    background: ${props => `var(--color-${props.$status})`};
    box-shadow: 0 0 8px ${props => `var(--color-${props.$status}-glow)`};
  }
`

interface JobsStatusTableProps {
  jobs: JobSummary[],
  queue_name: string,
  status: JobStatus,
  running?: boolean,
} 

export function JobsWithStatusTable({
  queue_name,
  jobs,
  status,
  running = false,
}: JobsStatusTableProps) {
  return (
    <JobsWithStatus $status={status}
      className="flex-col gap-1">
      <div>
        <h4 className="flex align-center kode">
          <span>
            {JobStatusIcon[status]}
          </span>
          {status}
        </h4>
      </div>
      <Table $columns={`.75fr 2fr .5fr 1fr${running ? " 1fr" : ""}`}>
        <TableHeader>
          <TableCell>ID</TableCell>
          <TableCell>Job Name</TableCell>
          <TableCell>Attempts</TableCell>
          <TableCell>Date</TableCell>
          {running && <TableCell>Running for</TableCell>}
        </TableHeader>
        <TableBody>
          {jobs.map(job => (
            <PossibleErrorRow>
              <ClickableRow
                to={`/admin/job/$queue_name/$job_id`}
                params={{ job_id: job.id, queue_name }}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{format_name(job.name)}</TableCell>
                <TableCell>{job.attempts}</TableCell>
                <TableCell className="kode size-09">{new Date(job.created_at).toLocaleString("cs-CZ", {
                  day: "2-digit", month: "2-digit",
                  hour: "2-digit", minute: "2-digit", second: "2-digit"
                })}</TableCell>
                {running && (
                  // TODO!!
                  <TableCell><ElapsedTime started_at={job.started_at!}/></TableCell>
                )}
              </ClickableRow>
              {status === "failed" && job.error && (
                <TableErrorSection>
                  <p>
                    ❌ Error:
                    <span>
                      {job.error.message.length > 150
                        ? job.error.message.slice(0, 150) + "..."
                        : job.error.message}
                    </span>
                  </p>
                </TableErrorSection>
              )}
            </PossibleErrorRow>
          ))}
        </TableBody>
      </Table>
    </JobsWithStatus>
  )
}

const JobsWithStatus = styled.section<{ $status: JobStatus }>`
  padding: 1rem 1.5rem;
  &:not(:last-of-type) {
    border-bottom: var(--border-alpha);
  }
  & h4 {
    gap: .3rem;
    color: ${props => `var(--color-${props.$status})`};
    & span {
      font-size: .9rem;
    }
  }
`