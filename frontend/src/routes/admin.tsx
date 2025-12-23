import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useAuth } from "../auth/hook"
import BracketLink from "../components/action/BracketLink"

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
})

function AdminLayout() {
  const { is_admin } = useAuth()

  if (!is_admin) return (
    <main className="flex-center flex-col gap-1">
      <h1>Access Denied</h1>
      <p>You don't have permissions to access this page.</p>
      <BracketLink to="/">Go back to My Problems</BracketLink>
    </main>
  )

  return <Outlet/>
}
