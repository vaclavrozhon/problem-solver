import { useRef, useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  AlertDialog,
  TextField,
  NumberField,
  Label,
  Input,
  FieldError,
  Form,
  Spinner,
  Alert,
  Description,
  Tooltip,
  Link
} from "@heroui/react"

import { get_all_invites, create_invite, revoke_invite } from "../../api/admin/invites"
import type { Invite, CreateInviteParams } from "@shared/admin/invites"
import { invite_schema, INVITE_CREDIT_MIN, INVITE_CREDIT_MAX } from "@shared/admin/invites"

import * as Breadcrumb from "../../components/ui/Breadcrumb"
import { Table, TableBody, TableHeader, TableRow, TableCell } from "../../components/ui/Table"
import { Icon } from "@iconify/react"
import { calculate_allocated_money_for_invites } from "@frontend/utils/admin"

export const Route = createFileRoute("/admin/invites")({
  component: AdminInvitesPage,
})

function AdminInvitesPage() {
  const query_client = useQueryClient()

  const [show_create, setShowCreate] = useState(false)
  const [created_invite, setCreatedInvite] = useState<{
    code: string,
    recipient_name: string
  } | null>(null)

  const [revoke_target, setRevokeTarget] = useState<string | null>(null)

  const { data, isError, isPending, error, isRefetching } = useQuery({
    queryKey: ["admin", "invites"],
    queryFn: get_all_invites,
  })

  const create_mutation = useMutation({
    mutationFn: create_invite,
    onSuccess: (result) => {
      if (result.invite) {
        setCreatedInvite({
          code: result.invite.code,
          recipient_name: result.invite.recipient_name
        })
      }
      query_client.invalidateQueries({ queryKey: ["admin", "invites"] })
    },
  })

  const revoke_mutation = useMutation({
    mutationFn: revoke_invite,
    onSuccess: () => {
      setRevokeTarget(null)
      query_client.invalidateQueries({ queryKey: ["admin", "invites"] })
    },
  })

  function handle_revoke_click(invite_id: string) {
    setRevokeTarget(invite_id)
    revoke_mutation.reset()
  }

  function confirm_revoke() {
    if (revoke_target) {
      revoke_mutation.mutate(revoke_target)
    }
  }

  function close_create_dialog() {
    setShowCreate(false)
    setCreatedInvite(null)
    create_mutation.reset()
  }

  if (isPending) return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4">
      <Spinner/>
      <span>Loading invites...</span>
    </main>
  )

  if (isError) return (
    <main className="flex-1 flex-center">
      <p>Error loading invites: {error.message}</p>
    </main>
  )

  const invites = data.invites
  const stats = {
    total: invites.length,
    pending: invites.filter(i => i.status === "pending").length,
    redeemed: invites.filter(i => i.status === "redeemed").length,
  }

  const invite_stat__block = "flex flex-col justify-between items-center py-3 px-4 bg-beta rounded-lg min-w-25"
  const invite_stat__value = "text-2xl font-bold"
  const invite_stat__label = "kode uppercase font-semibold text-sm"

  const total_allocated_credits = calculate_allocated_money_for_invites(invites)
  const missing_credits = data.admin_balance - total_allocated_credits

  return (
    <main className="flex-1 flex flex-col p-4 pt-2 gap-4">
      <header className="flex justify-between">
        <div>
          <Breadcrumb.default>
            <Breadcrumb.Item to="/admin">Administration</Breadcrumb.Item>
            <Breadcrumb.ChevronRightIcon />
            <Breadcrumb.Current>Invites</Breadcrumb.Current>
          </Breadcrumb.default>
          <h1>Invite Management</h1>
        </div>

        <Button onPress={() => setShowCreate(true)}>
          <Icon icon="gravity-ui:person-plus"/>
          New Invite
        </Button>

        <AlertDialog isOpen={show_create}
          onOpenChange={(open) => !open && close_create_dialog()}>
          <AlertDialog.Backdrop isDismissable>
            <AlertDialog.Container>
              <AlertDialog.Dialog className="max-w-sm">
                <AlertDialog.CloseTrigger/>
                {created_invite ? (
                  <NewInviteCreated
                    code={created_invite.code}
                    recipient_name={created_invite.recipient_name}/>
                ) : (
                  <CreateInviteForm
                    onSubmit={new_invite => create_mutation.mutate(new_invite)}
                    is_submitting={create_mutation.isPending}
                    mutation_error={create_mutation.isError
                      ? create_mutation.error.message
                      : null}
                    admin_balance={data.admin_balance}/>
                )}
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </header>

      <section className="flex flex-col gap-2">
        <h2>Summary</h2>
        <div className="flex gap-4">
          <div className={invite_stat__block}>
            <p className={invite_stat__value}>{stats.total}</p>
            <p className={invite_stat__label}>Total</p>
          </div>
          <div className={invite_stat__block}>
            <p className={`${invite_stat__value} text-warn`}>{stats.pending}</p>
            <p className={invite_stat__label}>Pending</p>
          </div>
          <div className={invite_stat__block}>
            <p className={`${invite_stat__value} text-ok`}>{stats.redeemed}</p>
            <p className={invite_stat__label}>Redeemed</p>
          </div>
          <div className={invite_stat__block}>
            <p className={`${invite_stat__value} text-brand`}>${total_allocated_credits.toFixed(1)}</p>
            <p className={invite_stat__label + " after:content-['*'] after:font-sans"}>Allocated</p>
          </div>
        </div>
        <p className="text-sm before:content-['*'] before:align-top">
          To provide for all invites, {" "}
          <Link href="https://openrouter.ai/settings/credits"
            target="_blank">
            OpenRouter balance
            <Link.Icon/>
          </Link>
          {" "}needs to be at least ${total_allocated_credits.toFixed(1)}.
          <br/>
          Current balance is ${data.admin_balance.toFixed(1)} -&gt;{" "}
          {missing_credits >= 0 ? (
            <span className="font-medium text-ink-2">You're all set!</span>
          ) : (
            <>
              <span className="text-error font-medium underline">Please add more credits!</span>{" "}
              Missing credits ${Math.abs(missing_credits).toFixed(3)}
            </>
          )}
        </p>
      </section>

      <section className="flex-1 flex flex-col gap-2">
        <h2>All Invites</h2>
        <InviteTable
          invites={invites}
          onRevoke={handle_revoke_click}
          is_revoking={revoke_mutation.isPending || isRefetching}/>
      </section>

      <AlertDialog isOpen={!!revoke_target}
        onOpenChange={open => !open && setRevokeTarget(null)}>
        <AlertDialog.Backdrop isDismissable>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="max-w-sm">
              <AlertDialog.CloseTrigger/>
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger"/>
                <AlertDialog.Heading className="font-sans">Revoke Invite?</AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body className="flex flex-col gap-4 p-1">
                <p>
                  This action will remove the invite created for{" "}
                  <span className="font-medium text-ink-2">
                    {invites.find(invite => invite.id === revoke_target)?.recipient_name}
                  </span>
                </p>

                {revoke_mutation.isError && (
                  <Alert status="danger">
                    <Alert.Indicator/>
                    <Alert.Content>
                      {/* BUG/TODO: proper error */}
                      <Alert.Title>Failed to revoke invite</Alert.Title>
                    </Alert.Content>
                  </Alert>
                )}
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button variant="ghost"
                  slot="close">No, keep it</Button>
                <Button variant="danger"
                  onPress={confirm_revoke}
                  isPending={revoke_mutation.isPending}
                  className="w-34">
                  {revoke_mutation.isPending ? (
                    <>
                      <Spinner color="current" size="sm"/>
                      Removing&hellip;
                    </>
                  ) : "Yes, remove"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </main>
  )
}

interface InviteTableProps {
  invites: Invite[],
  is_revoking: boolean,
  onRevoke: (id: string) => void,
}

function InviteTable({ invites, is_revoking, onRevoke }: InviteTableProps) {
  const badge = "kode text-xs px-1.5 py-0.5 rounded-sm font-semibold"
  return (
    <Table $columns="1fr 8rem 8rem 6rem 6rem 7rem 10rem 6rem">
      <TableHeader>
        <TableCell>Recipient</TableCell>
        <TableCell $align="center">Status</TableCell>
        <TableCell $align="center">Code</TableCell>
        <TableCell $align="right">Usage</TableCell>
        <TableCell $align="right">Limit</TableCell>
        <TableCell $align="center">Own Key?</TableCell>
        <TableCell>Invited By</TableCell>
        <TableCell $align="center">Actions</TableCell>
      </TableHeader>

      <TableBody>
        {invites.length === 0 ? (
          <TableRow>
            <TableCell>
              <p>No invites yet.</p>
            </TableCell>
          </TableRow>
        ) : invites.map(invite => (
          <TableRow key={invite.id}>
            <TableCell>
              <div className="flex flex-col">
                <p className="text-beta font-medium"
                  // TODO: better tooltip? link to profile? 
                  title={invite.redeemed_by?.email}>{invite.recipient_name}</p>
              </div>
            </TableCell>

            <TableCell $align="center"
              $cols={invite.status !== "pending" ? 2 : undefined}>
              <p className={` flex gap-[4px] items-center
                  ${badge} ${invite.status === "pending" ? "bg-warn/20 " : "bg-ok/20 text-ok" }
                `}>
                {invite.status === "pending" ? "Pending" : (
                  <>
                    <Icon icon="gravity-ui:check"/>
                    Redeemed
                  </>
                  )}
              </p>
            </TableCell>
            {invite.status === "pending" && (
              <TableCell $align="center">
                <p className={badge + " bg-beta normal-case!"}>{invite.code}</p>
              </TableCell>
            )}

            <TableCell $align="space-between">
              {invite.usage ? (
                <>
                  <span>$</span>
                  <p className="text-ink-2">{invite.usage.usage.toFixed(2)}</p>
                </>
              ) : (
                <p className="ml-auto">-</p>
              )}
            </TableCell>

            <TableCell $align="space-between">
              <span>$</span>
              <p className="text-ink-2">{invite.credit_limit}</p>
            </TableCell>

            <TableCell $align="center">
              {invite.status === "redeemed" ? (
                invite.user_switched_to_own_key ? (
                  <p className={badge + " flex items-center gap-[4px] bg-ok/20 text-ok"}>
                    <Icon icon="gravity-ui:check"/>
                    Switched
                  </p>
                ) : (
                  <p className={badge + " bg-beta"}>No</p>
                )
              ) : "-"}
            </TableCell>

            <TableCell>
              <p className="truncate">{invite.created_by}</p>
            </TableCell>

            <TableCell $align="center">
              {invite.status === "pending" ? (
                <Button size="sm"
                  variant="danger-soft"
                  onPress={() => onRevoke(invite.id)}
                  isDisabled={is_revoking}
                  className="h-6 px-2 text-xs">
                  <Icon icon="gravity-ui:trash-bin"/>
                  Revoke
                </Button>
              ) : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface CreateInviteFormProps {
  onSubmit: (params: CreateInviteParams) => void
  is_submitting: boolean,
  admin_balance: number,
  mutation_error: string | null,
}

function CreateInviteForm({ onSubmit, is_submitting, mutation_error, admin_balance }: CreateInviteFormProps) {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: { recipient_name: "", credit_limit: 10 },
    resolver: zodResolver(invite_schema),
  })

  return (
    <>
      <AlertDialog.Header>
        <AlertDialog.Heading className="font-sans">Create New Invite</AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body className="p-1">
        <Form onSubmit={handleSubmit(onSubmit)}
          id="create-invite-form"
          className="flex flex-col gap-4">
          <TextField isInvalid={!!errors.recipient_name}>
            <Label>Recipient Name</Label>
            <Input {...register("recipient_name")}
              placeholder="Jára Cimrman"/>
            <FieldError>{errors.recipient_name?.message}</FieldError>
          </TextField>

          <Controller name="credit_limit"
            control={control}
            render={({ field }) => (
              <NumberField value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                minValue={INVITE_CREDIT_MIN}
                maxValue={INVITE_CREDIT_MAX}
                isInvalid={!!errors.credit_limit}
                formatOptions={{ maximumFractionDigits: 0 }}>
                <Label>Credit Limit</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton/>
                  <p className="pl-3 text-ink-1 -mr-2">$</p>
                  <NumberField.Input/>
                  <NumberField.IncrementButton/>
                </NumberField.Group>
                <Description>
                  Ensure sufficient balance on OpenRouter account to cover user usage.
                </Description>
                <Description>
                  Current balance: $
                  <span className="text-ink-2">{admin_balance.toFixed(3)}</span>
                </Description>
                <FieldError>{errors.credit_limit?.message}</FieldError>
              </NumberField>
            )}/>

          {/* BUG/TODO: proper error handling */}
          {mutation_error && (
            <Alert status="danger">
              <Alert.Indicator/>
              <Alert.Content>
                <Alert.Title>{mutation_error}</Alert.Title>
              </Alert.Content>
            </Alert>
          )}
        </Form>
      </AlertDialog.Body>

      <AlertDialog.Footer>
        <Button variant="tertiary"
          slot="close">Cancel</Button>
        <Button form="create-invite-form"
          type="submit"
          isPending={is_submitting}
          className="w-32">
          {is_submitting ? (
            <>
              <Spinner color="current" size="sm"/>
              Creating&hellip;
            </>
          ) : "Create Invite"}
        </Button>
      </AlertDialog.Footer>
    </>
  )
}

interface NewInviteCreatedProps {
  code: string,
  recipient_name: string,
}

function NewInviteCreated({ code, recipient_name }: NewInviteCreatedProps) {
  const [copied, setCopied] = useState(false)
  const timeout_ref = useRef<number | null>(null)

  function copy_code() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    if (timeout_ref.current) clearTimeout(timeout_ref.current)
    timeout_ref.current = window.setTimeout(() => {
      setCopied(false)
      timeout_ref.current = null
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (timeout_ref.current) clearTimeout(timeout_ref.current)
    }
  }, [])

  return (
    <>
      <AlertDialog.CloseTrigger/>
      <AlertDialog.Header>
        <AlertDialog.Icon status="success"/>
        <AlertDialog.Heading className="font-sans">Invite Created!</AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body className="p-1 flex flex-col gap-3">
        <p>Share this code with <span className="font-medium text-ink-2">{recipient_name}</span>:</p>

        <div className="flex justify-center relative p-4 bg-beta rounded-full">
          <span className="font-kode text-2xl font-bold tracking-widest">{code}</span>
          <Tooltip delay={0}
            closeDelay={0}
            shouldCloseOnPress={false}>
            <Button isIconOnly
              variant="tertiary"
              size="sm"
              onPress={copy_code}
              className="bg-gamma absolute right-4">
              <Icon icon="gravity-ui:copy"/>
            </Button>
            <Tooltip.Content>
              <p className="font-medium">{copied ? "Copied!" : "Copy"}</p>
            </Tooltip.Content>

          </Tooltip>
        </div>

        <p>They can redeem it in Settings after signing up.</p>
      </AlertDialog.Body>

      <AlertDialog.Footer>
        <Button slot="close">Done</Button>
      </AlertDialog.Footer>
    </>
  )
}
