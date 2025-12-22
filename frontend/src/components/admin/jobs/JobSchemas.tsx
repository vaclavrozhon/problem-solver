import { useState } from "react"
import { styled } from "@linaria/react"

import BracketButton from "../../action/BracketButton"
import { JobInputSchema } from "@shared/admin/jobs"

interface JobSchemasProps {
  schemas: Record<string, JobInputSchema>
}

export default function JobSchemas({ schemas }: JobSchemasProps) {
  const [show_details, setShowDetails] = useState(false)
  const jobs_count = Object.keys(schemas).length
  return (
    <section className="flex-col">
      <DefinedJobs>
        <p>
          There {jobs_count === 1 ? "is" : "are"}
          <span>{jobs_count}</span>
          job{jobs_count !== 1 && "s"} defined on this queue{show_details ? ":" : "."}
        </p>
        <BracketButton onClick={() => setShowDetails(prev => !prev)}>
          Show Job{jobs_count !== 1 && "s"}
        </BracketButton>
      </DefinedJobs>

      {/* TODO: Show pretty job input. Data is already being transferred. */}
      {show_details && (
        <DefinedJobsList>
          {Object.entries(schemas).map(([job_name, job_schema]) => (
            <div>
              <p className="highlighted_text">{job_name}</p>
            </div>
          ))}
          <p>TODO: Show pretty job input schema for each job.</p>
        </DefinedJobsList>
      )}
    </section>
  )
}

const DefinedJobs = styled.div`
  display: flex;
  justify-content: space-between;
  padding: .5rem 1rem;
  & > p {
    display: flex;
    align-items: center;
    gap: .3rem;
    font-weight: 500;
    & span {
      color: var(--text-beta);
    }
  }
`

const DefinedJobsList = styled.div`
  display: flex;
  flex-flow: column;
  padding: .5rem 1rem;
  gap: .5rem;
  border-top: 2px dashed var(--border-alpha-color);
  & > div {
    display: flex;
    & p {
      padding: .2rem .4rem;
      background: var(--bg-gamma);
      font-family: Kode;
      text-transform: uppercase;
      font-weight: 600;
      border: var(--border-alpha);
      border-radius: .2rem;
      font-size: .9rem;
      color: var(--text-beta);
    }
  }
`