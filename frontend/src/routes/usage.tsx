import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Spinner } from "@heroui/react"
import BracketLink from "../components/action/BracketLink"

import { get_openrouter_usage } from "../api/account"

export const Route = createFileRoute("/usage")({
  component: UsagePage,
})

function UsagePage() {
  const { data: balance, isError, isPending } = useQuery({
    queryKey: ["openrouter-usage-api"],
    queryFn: () => get_openrouter_usage()
  })

  if (isPending) return (
    <main className="flex-1 flex-center flex-col gap-4">
      <Spinner/>
      <p>Loading usage...</p>
    </main>
  )

  if (isError) return (
    <main className="flex-1 flex-center">
      <p>An error occurred whilst fetching OpenRouter usage data.</p>
    </main>
  )

  return (
    <main className="flex-1 flex-col gap-4 p-4 pt-0">
      <h1>LLM Usage</h1>
      {balance === null ? (
        <p>
          Add an OpenRouter API key in{" "}
          <BracketLink to="/settings">Settings</BracketLink>
          {" "}to see your balance & usage
        </p>
      ) : (
        <section className="flex-col gap-4">
          <h2>OpenRouter</h2>
          <div className="flex gap-4">
            <MoneyBlock title="Balance remaining"
              money={balance.balance}/>
            <MoneyBlock title="Money spent"
              money={balance.usage}/>
          </div>
        </section>
      )}
    </main>
  )
}
interface MoneyBlockProps {
  title: string,
  money: number | null,
}

const MoneyBlock = ({ title, money }: MoneyBlockProps) => (
  <div className="flex flex-col justify-between p-4 rounded-xl w-xs h-40 bg-brand/20">
    <h3 className="kode uppercase text-2xl font-bold">{title}</h3>
    <p className="text-5xl font-bold text-ink-2">
      <span className="kode text-brand mr-0.5 select-none">$</span>
      {money?.toFixed(3)}
    </p>
  </div>
)