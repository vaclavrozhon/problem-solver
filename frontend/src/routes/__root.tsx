import { createRootRouteWithContext, Link, Outlet, redirect, useNavigate, RootRoute } from "@tanstack/react-router"
import { useAuth } from "../contexts/AuthContext"
import PageNotFound from "../pages/404"

import { styled } from "@linaria/react"
import BracketButton from "../components/action/BracketButton"
import type { AuthContextType } from "../contexts/AuthContext"

import Logo from "../components/svg/Logo"
import TextLogo from "../components/svg/TextLogo"
import ThemeSelector from "../components/app/ThemeSelector"

export interface MyRouterContext {
  auth: AuthContextType,
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  notFoundComponent: PageNotFound,
  /* For simplicity of this app, we require login on all pages. */
  beforeLoad: async ({ context, location }) => {
    let auth
    // i know this check isn't ideal but it works for us rn
    // proper implementation should add new property 'firstLoad'
    // which we would need to update and check and i dont want
    // to make it more complex than currently needed
    if (context.auth.user === null) {
      // This promise workaround is for first log in while the page is loading and the auth is fetching from supabase. Any other time auth updates, we launch redirects manually already at the time when the auth is updated and the data in promise is old
      auth = await context.auth.loadAuth.promise
    } else {
      auth = context.auth
    }
    const public_routes = ["/login", "/signup", "/auth/callback"]
    if (public_routes.includes(location.pathname)) {
      if (auth.isAuthenticated) throw redirect({ to: "/" })
    } else {
      if (!auth.isAuthenticated) throw redirect({ to: "/login", search: { error: undefined, message: undefined } })
    }
  }
})

function RootLayout() {
  const { user, signOut, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  async function signOutAndRedirect() {
    const result = await signOut()
    if (result === "error") throw "error happened"
    navigate({ to: "/login", search: { error: undefined, message: undefined } })
  }

  return isAuthenticated ? (
    <PageContent>
      <Header>
        {/* <Link to="/" className="project_name">🔬 Bolzano</Link> */}
        <Link to="/" className="project_name">
          <Logo/>
          <TextLogo lowercase/>
        </Link>
        <Nav>
          <Link to="/">Overview</Link>
          <Link to="/usage" preload="intent">Usage</Link>
          <Link to="/settings" preload="intent">Settings</Link>
          <Link to="/create">Create Problem</Link>
          <Link to="/admin">Administration</Link>
        </Nav>
      </Header>

      <Outlet/>

      <Footer>
        <div><ThemeSelector/></div>
        <p>Page was loaded at {(new Date()).toLocaleTimeString()}</p>
        <p>Logged in as {user?.email}</p>
        <p>
          <BracketButton onClick={signOutAndRedirect}>Sign Out</BracketButton>
        </p>
      </Footer>
    </PageContent>
  ) : (
    <PageContent>
      <Header>
        <p className="project_name">
          <Logo/>
          <TextLogo lowercase/>
        </p>
      </Header>

      <Outlet/>

      {/* TODO: If we decide to publish this project, we should add some basic info here like who made it etc. */}
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
  /* justify-content: center; */
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
