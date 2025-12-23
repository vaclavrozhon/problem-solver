import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { useAuth } from "../../auth/hook"
import { get_problems_archive } from "../../api/problems"
import { Table, TableBody, TableHeader, TableRow, TableCell, SortButton, SortSelect, ClickableTableCell } from "../../components/ui/Table"
import StatusBadge from "../../components/ui/StatusBadge"

type SortField = "updated_at" | "created_at"
type SortDirection = "asc" | "desc"

export const Route = createFileRoute("/admin/archive")({
  component: ProblemsArchive,
})

function ProblemsArchive() {
  const { user } = useAuth()
  const [sort_field, set_sort_field] = useState<SortField>("created_at")
  const [sort_direction, set_sort_direction] = useState<SortDirection>("desc")
  const [author_filter, set_author_filter] = useState<string>("all")

  const { data: problems, error, isPending, isError } = useQuery({
    queryKey: ["problems_archive"],
    queryFn: get_problems_archive,
  })

  // Get unique authors for the filter dropdown
  const unique_authors = useMemo(() => {
    if (!problems) return []
    const authors = [...new Set(problems.map(p => p.owner_name))].sort()
    return authors
  }, [problems])

  if (isPending) return (
    <MainContent>
      <p>Loading problems...</p>
    </MainContent>
  )

  if (isError) return (
    <MainContent>
      <p>Error occurred: {JSON.stringify(error)}</p>
    </MainContent>
  )

  // Filter by author first, then sort
  const filtered_problems = author_filter === "all"
    ? problems
    : problems.filter(p => p.owner_name === author_filter)

  const sorted_problems = [...filtered_problems].sort((a, b) => {
    const a_val = new Date(a[sort_field]).getTime()
    const b_val = new Date(b[sort_field]).getTime()
    return sort_direction === "desc" ? b_val - a_val : a_val - b_val
  })

  if (problems.length === 0) return (
    <MainContent>
      <p>So far, no problems have been researched.</p>
    </MainContent>
  )

  return (
    <MainContent>
      <h1>Archive of All Problems</h1>
      <p>So far, a total of <strong>{problems.length} problems</strong> have been researched.</p>
      <p><span className="highlight">Highlighted problems</span> were created by you. You are in full control of these problems. You can only view problems created by others.</p>

      <Table $columns="3fr 1fr minmax(5rem, .4fr) 1.5fr minmax(14rem, .9fr)">
        <TableHeader>
          <TableCell>Problem Name</TableCell>
          <TableCell>Status</TableCell>
          <TableCell $align="right">Rounds</TableCell>
          <TableCell>
            <AuthorSelect
              value={author_filter}
              onChange={e => set_author_filter(e.target.value)}
              title={author_filter === "all" ? "All Authors" : author_filter}
            >
              <option value="all">All Authors</option>
              {unique_authors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </AuthorSelect>
          </TableCell>
          <TableCell>
            <SortSelect
              value={sort_field}
              onChange={e => set_sort_field(e.target.value as SortField)}
            >
              <option value="updated_at">Last Activity</option>
              <option value="created_at">Created</option>
            </SortSelect>
            <SortButton
              onClick={() => set_sort_direction(d => d === "asc" ? "desc" : "asc")}
              title={sort_direction === "desc" ? "Newest first" : "Oldest first"}
            >
              {sort_direction === "desc" ? "↓" : "↑"}
            </SortButton>
          </TableCell>
        </TableHeader>
        <TableBody>
          {sorted_problems.map(problem => (
            <TableRow key={problem.id}>
              <ClickableTableCell>
                <Link
                  to={"/problem/" + problem.id}
                  className={user?.id === problem.owner_id ? "own" : ""}
                >
                  {problem.name}
                </Link>
              </ClickableTableCell>
              <TableCell>
                <StatusBadge status={problem.phase} />
              </TableCell>
              <TableCell $align="right">{problem.total_rounds}</TableCell>
              <TableCell title={problem.owner_name}>
                <span>{problem.owner_name}</span>
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
    </MainContent>
  )
}

const AuthorSelect = styled.select`
  background: transparent;
  border: 1px solid var(--border-alpha-color);
  border-radius: .25rem;
  padding: .2rem .4rem;
  color: var(--text-beta);
  cursor: pointer;
  font-size: .85rem;
  max-width: 100%;
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  &:hover {
    background: var(--bg-gamma);
  }
  & option {
    background: var(--bg-beta);
    color: var(--text-beta);
  }
`

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  padding: 1rem;
  gap: 1rem;
  & .highlight {
    color: var(--accent-alpha);
  }
  & a.own {
    color: var(--accent-alpha);
  }
`