import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { createFileRoute } from "@tanstack/react-router"

import { useAuth } from "../contexts/AuthContext"
import { get_problems_archive } from "../api/problems"

export const Route = createFileRoute("/archive")({
  component: ProblemsArchive,
})
function ProblemsArchive() {
  const { user } = useAuth()
  const { data: problems, error, isPending, isError } = useQuery({
    queryKey: ["problems_archive"],
    queryFn: get_problems_archive,
  })

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

  return (
    <MainContent>
      <h1>Archive of All Problems</h1>
      <p>So far, a total of <strong>{problems.length} problems</strong> have been researched.</p>
      <p><span>Colored problems</span> were created by you. You are in full control of these problems. You can only view problems created by others.</p>
      <ul>
        {problems.map(problem => (
          <li key={problem.id}
            className={user?.id === problem.owner_id ? "own" : ""}>
            <Link to={"/problem/" + problem.id}>{problem.name}</Link>
          </li>
        ))}
      </ul>
    </MainContent>
  )
}

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  padding: 1rem;
  gap: 1rem;
  & p span {
    color: var(--accent-alpha);
  }
  & ul {
    padding-left: 2rem;
    & li {
      line-height: 1.5;
      &.own {
        color: var(--accent-alpha);
      }
      & a:hover {
        text-decoration: underline;
      }
    }
  }
`