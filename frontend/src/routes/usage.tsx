import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Spinner } from "@heroui/react"
import BracketLink from "../components/action/BracketLink"

import { useAuthStore } from "@frontend/auth/store"
import { is_admin } from "@shared/auth"
import { get_all_invites } from "@frontend/api/admin/invites"
import { get_openrouter_usage } from "../api/account"
import { calculate_allocated_money_for_invites, calculate_spent_allocated_money_in_invites } from "@frontend/utils/admin"

export const Route = createFileRoute("/usage")({
  component: UsagePage,
})

function UsagePage() {
  const { profile } = useAuthStore()
  const admin_authorized = is_admin(profile?.role ?? "default")
  const { data: invites, isError: invitesError } = useQuery({
    queryKey: ["admin", "invites"],
    queryFn: get_all_invites,
    enabled: admin_authorized,
  })
  
  const { data: balance, isError, isPending } = useQuery({
    queryKey: ["openrouter-usage-api"],
    queryFn: get_openrouter_usage,
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
          <h2>OpenRouter key</h2>
          <div className="flex gap-4">
            <MoneyBlock title="Balance remaining"
              money={balance.balance}/>
            <MoneyBlock title="Money spent"
              money={balance.usage}/>
          </div>
        </section>
      )}
      
      {admin_authorized && invites && (
        <section className="flex-col gap-4">
          <h2>Invites</h2>
          <div className="flex gap-4">
            <MoneyBlock title="Currently allocated"
            money={calculate_allocated_money_for_invites(invites.invites)}/>
            <MoneyBlock title="Spent"
            money={calculate_spent_allocated_money_in_invites(invites.invites)}/>
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
