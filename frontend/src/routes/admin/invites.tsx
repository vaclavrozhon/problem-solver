import { useRef, useState, useEffect } from "react"
import { styled } from "@linaria/react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get_all_invites, create_invite, revoke_invite } from "../../api/admin/invites"
import type { CreateInviteParams } from "@shared/admin/invites"

import * as Breadcrumb from "../../components/ui/Breadcrumb"
import { Table, TableBody, TableHeader, TableRow, TableCell } from "../../components/ui/Table"
import { Form, FormField, FormInput, FormLabel } from "../../styles/Form"

export const Route = createFileRoute("/admin/invites")({
  component: AdminInvitesPage,
})

function AdminInvitesPage() {
  const query_client = useQueryClient()
  const [show_create_modal, setShowCreateModal] = useState(false)
  const [created_invite, setCreatedInvite] = useState<{
    code: string,
    recipient_name: string
  } | null>(null)

  const { data, isError, isPending, error } = useQuery({
    queryKey: ["admin", "invites"],
    queryFn: get_all_invites,
  })

  const create_mutation = useMutation({
    mutationFn: create_invite,
    onSuccess: (result) => {
      if (result.invite) {
        setCreatedInvite({ code: result.invite.code, recipient_name: result.invite.recipient_name })
      }
      query_client.invalidateQueries({ queryKey: ["admin", "invites"] })
    },
  })

  const revoke_mutation = useMutation({
    mutationFn: revoke_invite,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["admin", "invites"] })
    },
  })

  if (isPending) return (
    <MainContent className="align-center justify-center gap-1">
      <div className="spinner"></div>
      <span>Loading invites...</span>
    </MainContent>
  )

  if (isError) return (
    <MainContent className="align-center justify-center gap-1">
      <p>❌ Error loading invites: {error.message}</p>
    </MainContent>
  )

  const invites = data.invites
  const stats = {
    total: invites.length,
    pending: invites.filter(i => i.status === "pending").length,
    redeemed: invites.filter(i => i.status === "redeemed").length,
  }

  function handle_create(params: CreateInviteParams) {
    create_mutation.mutate(params)
  }

  function handle_revoke(invite_id: string) {
    if (confirm("Are you sure you want to revoke this invite? The provisioned API key will be deleted.")) {
      revoke_mutation.mutate(invite_id)
    }
  }

  function close_modals() {
    setShowCreateModal(false)
    setCreatedInvite(null)
  }

  return (
    <MainContent>
      <header className="flex space-between pad-1">
        <div>
          <Breadcrumb.default>
            <Breadcrumb.Item to="/admin">Administration</Breadcrumb.Item>
            <Breadcrumb.ChevronRightIcon />
            <Breadcrumb.Current>Invites</Breadcrumb.Current>
          </Breadcrumb.default>
          <h1>Invite Management</h1>
        </div>
        <div>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            + Create Invite
          </CreateButton>
        </div>
      </header>

      <section className="flex-col gap-1 pad-1">
        <h2>Summary</h2>
        <section className="flex gap-1">
          <Statistic>
            <p>{stats.total}</p>
            <p>Total</p>
          </Statistic>
          <Statistic>
            <p className="pending">{stats.pending}</p>
            <p>Pending</p>
            </Statistic>
          <Statistic>
            <p className="redeemed">{stats.redeemed}</p>
            <p>Redeemed</p>
            </Statistic>
        </section>
      </section>

      <section className="flex-col flex-1 pad-1 gap-05">
        <h2>All Invites</h2>

        <Table $columns="1fr 8rem 8rem 6rem 6rem 7rem 10rem 6rem">
          <TableHeader>
            <TableCell>Recipient</TableCell>
            <TableCell $align="center">Status</TableCell>
            <TableCell>Code</TableCell>
            <TableCell $align="right">Usage</TableCell>
            <TableCell $align="right">Limit</TableCell>
            <TableCell $align="center">Own Key?</TableCell>
            <TableCell>Invited By</TableCell>
            <TableCell $align="center">Actions</TableCell>
          </TableHeader>

          <TableBody>
            {invites.length === 0 ? (
              <TableRow>
                <TableCell>No invites yet. Click "Create Invite" to get started.</TableCell>
              </TableRow>
            ) : invites.map(invite => (
              <TableRow>
                <TableCell>
                  <div className="flex-col">
                    <p className="text-beta w-500">{invite.recipient_name}</p>
                    {invite.redeemed_by && (
                      <p className="size-09">{invite.redeemed_by.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell $align="center"
                  $cols={invite.status !== "pending" ? 2 : undefined}>
                  <Badge className={invite.status}>
                    {invite.status === "pending" && "⏳ Pending"}
                    {invite.status === "redeemed" && "✓ Redeemed"}
                  </Badge>
                </TableCell>
                {invite.status === "pending" && (
                  <TableCell>
                    <Badge>{invite.code}</Badge>
                  </TableCell>
                )}
                <TableCell $align="right">
                  {invite.usage ? (
                    <p><span className="kode">{invite.usage.usage.toFixed(2)}</span>$</p>
                  ) :  "-"}
                </TableCell>
                <TableCell $align="right">
                  <p><span className="kode">{invite.credit_limit.toFixed(2)}</span>$</p>
                </TableCell>
                <TableCell $align="center">
                  {invite.status === "redeemed" ? (
                    invite.user_switched_to_own_key ? (
                      <Badge className="redeemed">✓ Switched</Badge>
                    ) : (
                      <Badge>No</Badge>
                    )
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <p style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    display: "block"
                  }}>
                    {invite.created_by}
                  </p>
                </TableCell>
                <TableCell $align="center">
                  {invite.status === "pending" ? (
                    <RevokeButton onClick={() => handle_revoke(invite.id)}
                      disabled={revoke_mutation.isPending}>
                      {revoke_mutation.isPending ? "..." : "Revoke"}
                    </RevokeButton>
                  ) : (
                    <p>-</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* TODO: Make this below the ROW */}
        {revoke_mutation.isError && (
          <ErrorMessage>
            Failed to revoke: {revoke_mutation.error?.message || "Unknown error"}
          </ErrorMessage>
        )}
      </section>

      {show_create_modal && !created_invite && (
        <Modal>
          <section>
            <CreateInviteForm
              onSubmit={handle_create}
              onCancel={close_modals}
              is_submitting={create_mutation.isPending}
              error={create_mutation.isError ? create_mutation.error.message : null}/>
          </section>
        </Modal>
      )}

      {created_invite && (
        <Modal>
          <section>
            <SuccessModal
              code={created_invite.code}
              recipient_name={created_invite.recipient_name}
              on_close={close_modals}/>
          </section>
        </Modal>
      )}
    </MainContent>
  )
}

interface CreateInviteFormProps {
  onSubmit: (params: CreateInviteParams) => void
  onCancel: () => void
  is_submitting: boolean
  error: string | null
}

function CreateInviteForm({ onSubmit, onCancel, is_submitting, error }: CreateInviteFormProps) {
  const [name, setName] = useState("")
  const [limit, setLimit] = useState(10)

  function handle_submit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      recipient_name: name,
      credit_limit: limit,
    })
  }

  return (
    <Form onSubmit={handle_submit}>
      <h2>Create New Invite</h2>
      {/* TODO: Remake this to react-form-hook */}
      <FormField style={{
        marginLeft: "-1rem"
      }}>
        <FormLabel>Recipient Name</FormLabel>
        <FormInput
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Jára Cimrman"
          required
          minLength={2}/>
      </FormField>

      <FormField style={{
        marginLeft: "-1rem"
      }}>
        <FormLabel>Credit Limit [$]</FormLabel>
        <FormInput
          type="number"
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          min={1}
          max={100}/>
      </FormField>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ButtonRow>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary" disabled={!name || is_submitting}>
          {is_submitting ? "Creating..." : "Create Invite"}
        </button>
      </ButtonRow>
    </Form>
  )
}

interface SuccessModalProps {
  code: string
  recipient_name: string
  on_close: () => void
}

function SuccessModal({ code, recipient_name, on_close }: SuccessModalProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  function copy_code() {
    navigator.clipboard.writeText(code)
    setCopied(true)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = window.setTimeout(() => {
      setCopied(false)
      timeoutRef.current = null
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <SuccessModalContent>
      <h2>Invite Created!</h2>
      <p>Share this code with <strong>{recipient_name}</strong>:</p>

      <InviteCodeDisplay>
        <span>{code}</span>
        <button onClick={copy_code}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </InviteCodeDisplay>

      <p>They can redeem it in Settings after signing up.</p>

      <ButtonRow>
        <button onClick={on_close} className="primary">Done</button>
      </ButtonRow>
    </SuccessModalContent>
  )
}

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-flow: column;
`

const CreateButton = styled.button`
  padding: 0.5rem .75rem;
  background: var(--accent-alpha);
  color: var(--bg-alpha);
  border-radius: .3rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`

const Statistic = styled.div<{ $color?: string }>`
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
    &.pending {
      color: var(--color-queued);
    }
    &.redeemed {
      color: var(--color-finished);
    }
  }
  & p:last-child {
    font-family: kode;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-gamma);
  }
`

const Badge = styled.p`
  font-family: var(--font-kode);
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
  font-weight: 500;
  background: var(--bg-gamma);
  &.pending {
    background: rgba(250, 150, 10, .1);
    color: var(--color-queued);
  }
  &.redeemed {
    background: rgba(30, 190, 100, .1);
    color: var(--color-finished);
  }
`

const RevokeButton = styled.button`
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
  background: transparent;
  background: rgba(220, 30, 30, .15);
  font-weight: 500;
  border-radius: 0.2rem;
  color: var(--color-failed);
  cursor: pointer;
  &:hover:not(:disabled) {
    background: rgba(220, 30, 30, 0.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  & > section {
    background: var(--bg-alpha);
    border: var(--border-alpha);
    border-radius: 0.5rem;
    padding: 1.5rem;
    min-width: 400px;
    max-width: 500px;
  }
`

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  width: 100%;
  margin-top: 0.5rem;
  & button {
    padding: 0.5rem 1rem;
    border: var(--border-alpha);
    border-radius: 0.25rem;
    background: var(--bg-beta);
    color: var(--text-alpha);
    cursor: pointer;
    &:hover:not(:disabled):not(.primary) {
      background: var(--bg-gamma);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &.primary {
      background: var(--accent-alpha);
      color: var(--bg-alpha);
      border: none;
      &:hover {
        opacity: .9;
      }
    }
  }
`

const SuccessModalContent = styled.div`
  display: flex;
  flex-flow: column;
  gap: 1rem;
  text-align: center;
  & h2 {
    color: var(--color-finished);
  }
`

const InviteCodeDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-beta);
  border-radius: 0.2rem;
  & span {
    font-family: var(--font-kode);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.1em;
  }
  & button {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    border: var(--border-alpha);
    border-radius: 0.2rem;
    background: var(--bg-gamma);
    cursor: pointer;
  }
`

const ErrorMessage = styled.p`
  color: var(--color-failed);
  font-size: 0.9rem;
`