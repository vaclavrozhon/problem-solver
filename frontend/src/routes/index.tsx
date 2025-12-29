import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { useQuery } from "@tanstack/react-query"

import BracketLink from "../components/action/BracketLink"
import { Spinner } from "@heroui/react"
import { Table, TableBody, TableHeader, TableRow, TableCell, SortButton, ClickableTableCell, SortSelect } from "../components/ui/Table"
import StatusBadge from "../components/ui/StatusBadge"
import { get_users_problems } from "../api/problems"

type SortField = "updated_at" | "created_at"
type SortDirection = "asc" | "desc"

export const Route = createFileRoute("/")({ component: OverviewPage })

function OverviewPage() {
  const [sort_field, set_sort_field] = useState<SortField>("updated_at")
  const [sort_direction, set_sort_direction] = useState<SortDirection>("desc")

  let { data: problems, error, isPending, isError } = useQuery({
    queryKey: ["my_problems"],
    queryFn: get_users_problems,
  })

  if (isPending) return (
    <main className="flex-1 flex-center flex-col gap-4">
      <Spinner/>
      <p>Loading problems...</p>
    </main>
  )

  if (isError || !problems) return (
    <main className="flex-1 flex-center">
      <p>Error occurred: {error?.message}</p>
    </main>
  )

  if (problems === 204) return (
    <main className="flex-1 p-4 pt-2">
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
    </main>
  )

  const sorted_problems = [...problems].sort((a, b) => {
    const a_time = new Date(a[sort_field]).getTime()
    const b_time = new Date(b[sort_field]).getTime()
    return sort_direction === "desc" ? b_time - a_time : a_time - b_time
  })

  return (
    <main className="flex-1 flex flex-col p-4 pt-0 gap-4">
      <h1>My Problems</h1>

      <Table $columns="3fr minmax(5rem, .4fr) .8fr minmax(14rem, .9fr)">
        <TableHeader>
          <TableCell>Problem Name</TableCell>
          <TableCell $align="right">Rounds</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>
            <SortSelect
              value={sort_field}
              onChange={e => set_sort_field(e.target.value as SortField)}>
              <option value="updated_at">Last Activity</option>
              <option value="created_at">Created</option>
            </SortSelect>
            <SortButton
              onClick={() => set_sort_direction(d => d === "asc" ? "desc" : "asc")}
              title={sort_direction === "desc" ? "Newest first" : "Oldest first"}>
              {sort_direction === "desc" ? "↓" : "↑"}
            </SortButton>
          </TableCell>
        </TableHeader>
        <TableBody>
          {sorted_problems.map(problem => (
            <TableRow key={problem.id}>
              <ClickableTableCell>
                <Link to="/problem/$problem_id" params={{ problem_id: problem.id }}>{problem.name}</Link>
              </ClickableTableCell>
              <TableCell $align="right">{problem.total_rounds}</TableCell>
              <TableCell>
                <StatusBadge status={problem.phase} />
              </TableCell>
              <TableCell>
                {sort_field === "updated_at"
                  ? new Date(problem.updated_at).toLocaleString("cs-CZ")
                  : new Date(problem.created_at).toLocaleDateString("cs-CZ")
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}