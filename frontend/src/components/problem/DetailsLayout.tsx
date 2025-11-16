
import { Link } from "@tanstack/react-router"
import { styled } from "@linaria/react"

interface LayoutProps {
  problem_id: string,
  problem_name?: string,
  children: any,
}

export default function ProblemDetailsLayout({ problem_id, problem_name, children }: LayoutProps) {
  const tabs = [
    { name: "Overview", link: "/problem/$problem_id", index: true },
    { name: "Run research", link: "/problem/$problem_id/research" },
    { name: "Conversations", link: "/problem/$problem_id/conversations" },
    { name: "Files", link: "/problem/$problem_id/files" },
  ]

  return (
    <MainContent>
      {problem_name ? (
        <h1>{problem_name}</h1>
      ) : (
        <h1>Problem ID: {problem_id}</h1>
      )}

      <ProblemTabs>
        {tabs.map(tab => (
          <Link to={tab.link}
            params={{ problem_id }}
            activeOptions={{ exact: !!tab.index }}
            key={tab.link}>{tab.name}</Link>
        ))}
      </ProblemTabs>

      {children}

    </MainContent>
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

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  & > h1 {
    padding: 1rem;
    line-height: 1;
  }
  & > p {
    padding: 1rem;
  }
`