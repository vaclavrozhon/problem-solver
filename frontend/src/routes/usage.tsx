import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"

import { get_openrouter_usage } from "../api/account"

export const Route = createFileRoute("/usage")({
  component: UsagePage,
})

function UsagePage() {
  const { data: balance, isError, isPending } = useQuery({
    queryKey: ["openrouter-usage-api"],
    queryFn: () => get_openrouter_usage()
  })

  if (isError) return (
    <MainContent>
      <p>An error occurred whilst fetching OpenRouter usage data.</p>
    </MainContent>
  )

  return (
    <MainContent className="flex-col gap-1">
      <h1>LLM Paid Usage</h1>
      <section className="flex-col gap-1">
        <h2>OpenRouter</h2>
        <p>Since 23rd November 2025.</p>
        <div className="flex gap-1">
          <div className="block">
            <h3>Balance remaining</h3>
            {isPending ? (
              <div className="spinner"></div>
            ) : (
              <p><span>$</span>{(balance.total_credits - balance.total_usage).toFixed(3)}</p>
            )}
          </div>
          <div className="block">
            <h3>Money spent</h3>
            {isPending ? (
              <div className="spinner"></div>
            ) : (
              <p><span>$</span>{balance.total_usage.toFixed(3)}</p>
            )}
          </div>
        </div>
      </section>
    </MainContent>
  )
}

const MainContent = styled.main`
  padding: 1rem;
  & > section {
    & div.block {
      display: flex;
      flex-flow: column;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1rem;
      border: var(--border-alpha);
      border-radius: .8rem;
      width: 20em;
      height: 10rem;
      background: var(--text-gamma);
      color: var(--bg-alpha);
      & *::selection {
        color: var(--text-gamma);
        background: var(--bg-alpha);
      }
      & h3 {
        font-family: Kode;
        text-transform: uppercase;
        color: var(--bg-alpha);
        font-size: 1.5rem;
      }
      & p {
        font-size: 3rem;
        font-weight: 600;
        & span {
          font-family: Kode;
          color: var(--accent-beta);
          user-select: none;
          margin-right: .15rem;
        }
      }
    }
  }
`