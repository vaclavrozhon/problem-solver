import { useState } from "react"
import { styled } from "@linaria/react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  get_my_profile,
  update_my_profile,
  set_openrouter_key,
  delete_openrouter_key,
  redeem_invite,
} from "../api/profile"
import { is_admin } from "@shared/auth"
import type { KeySource, User } from "@shared/auth"
import BracketButton from "@frontend/components/action/BracketButton"

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: profile, error, isError, isPending } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: get_my_profile,
  })

  if (isPending) return (
    <MainContent className="align-center justify-center gap-1">
      <div className="spinner"></div>
      <span>Loading profile...</span>
    </MainContent>
  )

  if (isError) return (
    <MainContent className="align-center justify-center gap-1">
      <p>❌ Error loading profile: {error.message}</p>
    </MainContent>
  )

  return (
    <MainContent className="max-width">
      <header className="pad-1">
        <h1>Settings</h1>
      </header>

      <ProfileSection profile={profile}/>

      <OpenRouterKeySection
        has_key={profile.has_openrouter_key}
        key_source={profile.key_source}
        is_admin={profile.role === "admin"}/>
    </MainContent>
  )
}

interface ProfileSectionProps {
  profile: User,
}

function ProfileSection({ profile }: ProfileSectionProps) {
  const query_client = useQueryClient()
  const [name, setName] = useState(profile.name)
  const [is_editing, setEditing] = useState(false)

  const update_mutation = useMutation({
    mutationFn: (new_name: string) => update_my_profile(new_name),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
      setEditing(false)
    },
  })

  function handle_save() {
    if (name.trim() && name !== profile.name) {
      update_mutation.mutate(name)
    } else {
      setEditing(false)
    }
  }

  return (
    <Section>
      <h2>Profile</h2>
      <SectionContent>
        {/* TODO: migrate to react-hook-form */}
        <FormRow>
          <label>Name</label>
          {is_editing ? (
            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus/>
              <BracketButton onClick={handle_save}
                disabled={update_mutation.isPending}>
                {update_mutation.isPending ? "Saving..." : "Save"}
              </BracketButton>
              <BracketButton onClick={() => {
                setEditing(false)
                setName(profile.name)
              }}>
                Cancel
              </BracketButton>
            </div>
          ) : (
            <div className="value-group">
              <span>{profile.name}</span>
              <BracketButton onClick={() => setEditing(true)}>Edit</BracketButton>
            </div>
          )}
        </FormRow>

        <FormRow>
          <label>Email</label>
          <p>{profile.email}</p>
        </FormRow>

        <FormRow>
          <label>Signed up</label>
          <p>{new Date(profile.created_at).toLocaleString("cs-CZ")}</p>
        </FormRow>

        {is_admin(profile.role) && (
          <FormRow>
            <label>Role</label>
            <p>{profile.role}</p>
          </FormRow>
        )}

        {update_mutation.isError && (
          <ErrorMessage>Failed to update profile. Please try again. Max allowed name length is 50 chars.</ErrorMessage>
        )}
      </SectionContent>
    </Section>
  )
}

interface OpenRouterKeySectionProps {
  has_key: boolean,
  key_source: KeySource,
  is_admin: boolean,
}

function OpenRouterKeySection({ has_key, key_source, is_admin }: OpenRouterKeySectionProps) {
  const query_client = useQueryClient()
  const [mode, set_mode] = useState<"view" | "add" | "redeem">("view")
  const [api_key, set_api_key] = useState("")
  const [invite_code, set_invite_code] = useState("")

  const save_mutation = useMutation({
    mutationFn: set_openrouter_key,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
      reset_form()
    },
  })

  const delete_mutation = useMutation({
    mutationFn: delete_openrouter_key,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
    },
  })

  const redeem_mutation = useMutation({
    mutationFn: redeem_invite,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
      reset_form()
    },
  })

  function reset_form() {
    set_mode("view")
    set_api_key("")
    set_invite_code("")
  }

  function handle_save() {
    save_mutation.mutate(api_key)
  }

  function handle_delete() {
    if (confirm("Are you sure you want to remove your API key? You won't be able to run research without a key.")) {
      delete_mutation.mutate()
    }
  }

  function handle_redeem() {
    if (invite_code.length >= 6) {
      redeem_mutation.mutate(invite_code)
    }
  }

  return (
    <Section>
      <h2>OpenRouter API Key</h2>
      <SectionContent>
        {is_admin && (
          <InfoBox>
            👑 [ADMIN] You use the system API key for research. You don't need to configure your own key.
          </InfoBox>
        )}

        {mode === "view" && (
          <>
            {!is_admin && !has_key && (
              <WarningBox>You need an API key to run research. Either redeem an invite code or add your own OpenRouter key.</WarningBox>
            )}
            
            <StatusRow>
              <label>Status</label>
              {has_key ? (
                <KeyStatus $has_key>
                  ✓ Key configured
                  {key_source === "provisioned" && " (provisioned)"}
                  {key_source === "self" && " (your own)"}
                </KeyStatus>
              ) : (
                <KeyStatus $has_key={false}>⚠ No API key configured</KeyStatus>
              )}
            </StatusRow>

            <ButtonRow>
              {has_key ? (
                <>
                  <button onClick={() => set_mode("add")}>Update Key</button>
                  <button className="danger" onClick={handle_delete} disabled={delete_mutation.isPending}>
                    {delete_mutation.isPending ? "Removing..." : "Remove Key"}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => set_mode("redeem")}>Redeem Invite</button>
                  <button onClick={() => set_mode("add")}>Add My Own Key</button>
                </>
              )}
            </ButtonRow>
          </>
        )}

        {mode === "add" && (
          <KeyForm>
            <FormRow>
              <label>API Key</label>
              <div className="input-group">
                <input
                  type="password"
                  value={api_key}
                  onChange={e => set_api_key(e.target.value)}
                  placeholder="sk-or-v1-..."/>
              </div>
            </FormRow>

            <ButtonRow>
              <button
                onClick={handle_save}
                disabled={save_mutation.isPending}>
                {save_mutation.isPending ? "Saving..." : "Save Key"}
              </button>
              <button onClick={reset_form}>Cancel</button>
            </ButtonRow>

            {save_mutation.isError && (
              <ErrorMessage>
                {(save_mutation.error as any).value.message || "Failed to save API key. Please try again."}
              </ErrorMessage>
            )}
          </KeyForm>
        )}

        {mode === "redeem" && (
          <KeyForm>
            <FormRow>
              <label>Invite Code</label>
              <div className="input-group">
                <input
                  type="text"
                  value={invite_code}
                  onChange={e => set_invite_code(e.target.value.toUpperCase())}
                  placeholder="ABCD1234"
                  // TODO: sync this length
                  maxLength={12}/>
              </div>
            </FormRow>

            <ButtonRow>
              <button onClick={handle_redeem}
                disabled={invite_code.length < 6 || redeem_mutation.isPending}>
                {redeem_mutation.isPending ? "Redeeming..." : "Redeem Invite"}
              </button>
              <button onClick={reset_form}>Cancel</button>
            </ButtonRow>

            {redeem_mutation.isError && (
              <ErrorMessage>
                {/* BUG */}
                {(redeem_mutation.error as any).value.message || "Failed to redeem invite. Please check the code and try again."}
              </ErrorMessage>
            )}
          </KeyForm>
        )}

        {delete_mutation.isError && (
          <ErrorMessage>Failed to remove API key. Please try again.</ErrorMessage>
        )}
      </SectionContent>
    </Section>
  )
}

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-flow: column;
  &.max-width {
    max-width: 50rem;
  }
`

const Section = styled.section`
  display: flex;
  flex-flow: column;
  gap: .5rem;
  padding: 1rem;
  & > h2 {
    font-family: Kode;
    text-transform: uppercase;
    font-size: 0.9rem;
  }
`

const SectionContent = styled.div`
  border: var(--border-alpha);
  display: flex;
  flex-flow: column;
  padding: 1rem;
  gap: 1rem;
  border-radius: 0.4rem;
`

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  & > label {
    width: 6rem;
    font-weight: 500;
    color: var(--text-gamma);
  }
  & .input-group {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    & > input {
      flex: 1;
      padding: 0.4rem 0.6rem;
      border: var(--border-alpha);
      border-radius: 0.25rem;
      background: var(--bg-beta);
      color: var(--text-alpha);
    }
  }
  & .value-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  & > label {
    width: 6rem;
    font-weight: 500;
    color: var(--text-gamma);
  }
`

const KeyStatus = styled.span<{ $has_key: boolean }>`
  color: ${({ $has_key }) => $has_key ? "var(--color-finished)" : "var(--color-failed)"};
  font-weight: 500;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  & button {
    padding: 0.4rem 0.8rem;
    border: var(--border-alpha);
    border-radius: 0.25rem;
    background: var(--bg-beta);
    color: var(--text-alpha);
    cursor: pointer;
    &:hover:not(:disabled) {
      background: var(--bg-gamma);
      color: var(--text-beta);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &.danger {
      color: var(--color-failed);
      &:hover:not(:disabled) {
        background: rgba(224, 37, 37, 0.1);
      }
    }
  }
`

const InfoBox = styled.div`
  padding: 0.6rem 0.8rem;
  background: rgba(100, 149, 237, 0.1);
  border: 1px solid rgba(100, 149, 237, 0.3);
  border-radius: 0.25rem;
  font-size: 0.9rem;
`

const WarningBox = styled.div`
  padding: 0.6rem 0.8rem;
  background: rgba(7, 69, 255, 0.1);
  border-radius: 0.2rem;
  font-size: 0.9rem;
  color: var(--accent-alpha);
`

const KeyForm = styled.div`
  display: flex;
  flex-flow: column;
  gap: 0.75rem;
`

const ErrorMessage = styled.p`
  color: var(--color-failed);
  font-size: 0.9rem;
`
