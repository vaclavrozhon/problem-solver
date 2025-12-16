import { createFileRoute, Link } from "@tanstack/react-router"
import { styled } from "@linaria/react"

export const Route = createFileRoute("/admin/")({
  component: AdminIndexPage,
})

function AdminIndexPage() {
  return (
    <MainContent>
      <h1>Admin Dashboard</h1>
      <Nav>
        <Link to="/admin/jobs">Job Queue Monitor</Link>
        <a href="https://docs.google.com/document/d/1WS9RQYO7gGlbYph6ZW0xk-Nr6NcUz78mzzjY_l0ulAo/edit?usp=sharing"
          target="_blank">Shared Notes</a>
      </Nav>
    </MainContent>
  )
}

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  padding: 1rem;
`

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  & a {
    padding: 1rem;
    border-radius: .4rem;
    background: var(--text-gamma);
    /* height: 5rem; */
    width: 20rem;
    font-family: Kode;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--bg-alpha);
    border: 6px double var(--bg-alpha);
    &:hover {
      background: var(--text-beta);
    }
  }
`
