import { createRootRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router"
import { useAuth } from "../auth/hook"
import PageNotFound from "../pages/404"

import { styled } from "@linaria/react"
import BracketButton from "../components/action/BracketButton"
import { BracketLink } from "../components/action/BracketLink"
import { auth_ready, useAuthStore, select_is_authenticated } from "../auth/store"

import Logo from "../components/svg/Logo"
import TextLogo from "../components/svg/TextLogo"
import ThemeSelector from "../components/app/ThemeSelector"

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

  if (!is_authenticated) return (
    <PageContent>
      <Header>
        <p className="project_name">
          <Logo/>
          <TextLogo lowercase/>
        </p>
      </Header>

      <Outlet/>

      <Footer>
        <div><ThemeSelector/></div>
        <p>
          <BracketLink href="https://github.com/vaclavrozhon/problem-solver/tree/dev" target="_blank">Code-&gt;GitHub</BracketLink>
        </p>
        <p>
          Errors, feedback, help? -&gt;
          <Email href="mailto:human@bolzano.app">human@bolzano.app</Email>
        </p>
      </Footer>
    </PageContent>
  )

  return (
    <PageContent>
      <Header>
        <Link to="/" className="project_name">
          <Logo/>
          <TextLogo lowercase/>
        </Link>
        <Nav>
          <Link to="/" preload="intent">My Problems</Link>
          <Link to="/create" preload="intent">Create Problem</Link>
          <Link to="/usage" preload="intent">Usage</Link>
          <Link to="/settings" preload="intent">Settings</Link>
          {is_admin && <Link to="/admin" preload="intent">Administration</Link>}
        </Nav>
      </Header>

      <Outlet/>

      <Footer>
        <div><ThemeSelector/></div>
        <p>
          <BracketLink href="https://github.com/vaclavrozhon/problem-solver/tree/dev" target="_blank">Code-&gt;GitHub</BracketLink>
        </p>
        <p>
          Errors, feedback, help? -&gt;
          <Email href="mailto:human@bolzano.app">human@bolzano.app</Email>
        </p>
        <p style={{ marginLeft: "auto" }}>
          <BracketButton onClick={handle_sign_out}>Sign Out</BracketButton>
        </p>
        <p>Logged in as {user?.email}</p>
      </Footer>
    </PageContent>
  )
}

const PageContent = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: .6rem 1rem;
  border-bottom: var(--border-alpha);
  & .project_name {
    display: flex;
    align-items: center;
    gap: .5rem;
  }
`

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
  & a {
    &:hover:not(.active) {
      text-decoration: underline;
    }
    &.active {
      color: var(--text-beta);
      font-weight: 600;
    }
  }
`

const Footer = styled.footer`
  display: flex;
  border-top: var(--border-alpha);
  & div {
    padding: 0 .2rem;
  }
  & p {
    padding: .4rem .6rem;
  }
  & div, p {
    display: flex;
    align-items: center;
    justify-content: center;
    &:not(:last-child) {
      border-right: var(--border-alpha);
    }
  }
`

const Email = styled.a`
  margin-left: .3rem;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`