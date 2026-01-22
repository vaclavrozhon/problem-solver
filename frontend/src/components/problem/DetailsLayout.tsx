import { Link } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { Skeleton, Spinner } from "@heroui/react"

import { useAuthStore } from "@frontend/auth/store"

interface LayoutProps {
  problem_id: string,
  problem_name: string,
  children: any,
  loading?: boolean,
}

export default function ProblemDetailsLayout({
  problem_id,
  problem_name,
  children,
  loading = false,
}: LayoutProps) {
  const { profile } = useAuthStore()
  // TODO[RELEASE]: If user doesn't own problem, hide `Run research` tab

  return (
    <main className="flex-1 flex flex-col">
      <header className="px-4 pb-4">
        {problem_name ? (
          <h1>{problem_name}</h1>
        ) : (
          <Skeleton className="h-12 w-lg"/>
        )}
      </header>

      <ProblemTabs>
        <Link to="/problem/$problem_id"
          params={{ problem_id }}
          activeOptions={{ exact: true }}>Overview</Link>
        {profile && (
          <Link to="/problem/$problem_id/research"
            params={{ problem_id }}>Run research</Link>
        )}
        <Link to="/problem/$problem_id/conversations"
          params={{ problem_id }}>Conversations</Link>
        <Link to="/problem/$problem_id/files"
          params={{ problem_id }}
          search={{
            file_id: undefined,
            main_file: undefined,
            round: undefined,
          }}>Files</Link>
      </ProblemTabs>

      {loading ? (
        <section className="flex-1 flex-center flex-col gap-4">
          <Spinner className="text-brand"/>
          {children}
        </section>
      ) : (
        <>
          {children}
        </>
      )}
    </main>
  )
}

const ProblemTabs = styled.section`
  display: flex;
  border-top: 6px double var(--border-alpha-color);
  border-bottom: 6px double var(--border-alpha-color);
  gap: 2px;
  & > a {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: .6rem 0;
    font-weight: 600;
    &:hover {
      background: var(--bg-beta);
    }
    &:not(:last-child) {
      box-shadow: 2px 0 var(--border-alpha-color);
    }
    &.active {
      color: var(--text-beta);
      pointer-events: none;
      background: var(--border-alpha-color);
    }
  }
`

export const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  & > h1 {
    padding: 1rem;
    line-height: 1;
    height: 4rem;
    &:empty::before {
      content: "";
      display: flex;
      background: var(--bg-gamma);
      width: 30rem;
      border-radius: .2rem;
      height: 100%;
    }
  }
  & > p {
    padding: 1rem;
  }
`
