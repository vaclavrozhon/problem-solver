import { styled } from "@linaria/react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import * as Breadcrumb from "../../components/ui/Breadcrumb"
import { Table, TableBody, TableHeader, TableRow, TableCell } from "../../components/ui/Table"

import { useAuth } from "../../contexts/AuthContext"
import { get_all_users } from "../../api/admin/users"

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { user: authorized_user } = useAuth()

  const { data, isError, error, isPending } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: get_all_users,
  })

  if (isPending) return (
    <MainContent className="align-center justify-center gap-1">
      <div className="spinner"></div>
      <span>Loading users...</span>
    </MainContent>
  )

  if (isError) return (
    <MainContent className="align-center justify-center gap-1">
      <p>❌ Error loading users: {error.message}</p>
    </MainContent>
  )

  const users = data.users
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    with_key: users.filter(u => u.has_openrouter_key).length,
  }

  return (
    <MainContent>
      <header className="flex space-between pad-1">
        <div>
          <Breadcrumb.default>
            <Breadcrumb.Item to="/admin">Administration</Breadcrumb.Item>
            <Breadcrumb.ChevronRightIcon />
            <Breadcrumb.Current>Users</Breadcrumb.Current>
          </Breadcrumb.default>
          <h1>User Management</h1>
        </div>
      </header>

      <section className="flex-col gap-05 pad-1">
        <h2>Summary</h2>
        <section className="flex gap-1">
          <Statistic>
            <p>{stats.total}</p>
            <p>Total Users</p>
          </Statistic>
          <Statistic>
            <p>{stats.admins}</p>
            <p className="label">Admins</p>
          </Statistic>
          <Statistic>
            <p>{stats.with_key}</p>
            <p className="label">With API Key</p>
          </Statistic>
        </section>
      </section>

      <section className="flex-col flex-1 pad-1 gap-05">
        <h2>All Users</h2>

        <Table $columns="1fr 1.5fr 8rem 6rem 8rem">
          <TableHeader>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell $align="center">Role</TableCell>
            <TableCell $align="center">API Key</TableCell>
            <TableCell $align="center">Key Source</TableCell>
          </TableHeader>

          <TableBody>
            {users.map(user => (
              <TableRow style={{
                background: user.id === authorized_user?.id ? "var(--bg-beta)" : "",
                color: user.id === authorized_user?.id ? "var(--accent-alpha)" : "",
              }}>
                <TableCell className="gap-05">
                  {user.name}
                  {(user.id === authorized_user?.id) && <p className="kode size-09">(you)</p>}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell $align="center">{user.role}</TableCell>
                {/* BUG: This is here only in the case, we allow admin users to specify their API key. */}
                {user.role === "admin" && user.has_openrouter_key === false ? (
                  <TableCell $align="center" $cols={2}>ADMIN API KEY</TableCell>
                ) : (
                  <>
                    <TableCell $align="center">
                      <HasOwnKey className={user.has_openrouter_key ? "has_key" : ""}>
                        {user.has_openrouter_key ? "✓" : "-"}
                      </HasOwnKey>
                    </TableCell>
                    <TableCell $align="center">
                      <KeySource className={user.key_source ?? ""}>
                        {user.key_source === "provisioned"
                        ? "Invite code"
                        : user.key_source === "self" ? "Own key" : "-"}
                      </KeySource>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </MainContent>
  )
}

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-flow: column;
`

const Statistic = styled.div`
  display: flex;
  flex-flow: column;
  gap: 0.2rem;
  background: var(--bg-beta);
  border: var(--border-alpha);
  border-radius: .3rem;
  padding: .5rem 1rem;
  & p:first-child {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-alpha);
    text-align: center;
  }
  & p:last-child {
    font-family: kode;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-gamma);
  }
`

const HasOwnKey = styled.p`
  font-weight: 500;
  &.has_key {
    color: var(--color-finished);
  }
`

const KeySource = styled.p`
  font-family: var(--font-kode);
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
  font-weight: 500;
  &.provisioned {
    background: rgba(100, 150, 230, .15);
    color: var(--accent-alpha);
  }
  &.self {
    background: rgba(197, 34, 186, 0.129);
    color: var(--accent-beta);
  }
`