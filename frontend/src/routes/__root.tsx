import { createRootRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router"
import { useAuth } from "../auth/hook"
import { auth_ready, useAuthStore, select_is_authenticated } from "../auth/store"

import PageNotFound from "../pages/404"
import Header from "../components/app/Header"
import Footer from "../components/app/Footer"

/**
 * Routes that are public and are related to the auth flow
 * therefore it makes no sense for already authorized users to access them.
*/
const LOGIN_ROUTES = new Set(["/login", "/signup", "/auth/callback"])

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: PageNotFound,
  beforeLoad: async ({ location }) => {
    // Wait for initial auth load to complete, then get current state
    await auth_ready
    const state = useAuthStore.getState()
    const is_authenticated = select_is_authenticated(state)

    const is_login_route = LOGIN_ROUTES.has(location.pathname)

    if (is_login_route && is_authenticated) throw redirect({ to: "/" })

    if (!is_login_route && !is_authenticated) throw redirect({
      to: "/login",
      search: { error: undefined, message: undefined }
    })
  },
})

function RootLayout() {
  const { user, sign_out, is_authenticated, is_admin } = useAuth()
  const navigate = useNavigate()

  async function handle_sign_out() {
    const { error } = await sign_out()
    if (error) {
      console.error("Sign out failed:", error)
      return
    }
    navigate({ to: "/login", search: { error: undefined, message: undefined } })
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header is_authenticated={is_authenticated}
        is_admin={is_admin}/>
      <Outlet/>
      <Footer/>
    </div>
  )
}