import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  get_my_profile,
  get_model_visibility,
  update_my_profile,
  set_openrouter_key,
  delete_openrouter_key,
  set_metacentrum_key,
  delete_metacentrum_key,
  redeem_invite,
} from "../api/profile"
import { is_admin, user_name_schema, openrouter_api_key_schema, metacentrum_api_key_schema, INVITE_CODE_LENGTH } from "@shared/auth"
import type { KeySource, User } from "@shared/auth"
import type { ModelVisibility } from "@shared/admin/models"
import {
  Form,
  TextField,
  Input,
  FieldError,
  Label,
  Alert,
  Spinner,
  Button,
  AlertDialog,
  InputOTP,
  Separator,
  Description,
  Link,
  Switch,
} from "@heroui/react"
import { Icon } from "@iconify/react"
import { SignOut } from "../components/auth/SignOut"
import BracketLink from "@frontend/components/action/BracketLink"
import ModelSelect from "@frontend/components/form/ModelSelect"
import {
  load_research_ui_preferences,
  normalize_research_ui_preferences,
  save_research_ui_preferences,
  type ResearchUIPreferences,
} from "@frontend/utils/research_preferences"

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: profile, error, isError, isPending } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: get_my_profile,
  })
  const {
    data: model_settings,
    error: model_settings_error,
    isError: model_settings_is_error,
    isPending: model_settings_is_pending,
  } = useQuery({
    queryKey: ["profile", "model-visibility"],
    queryFn: get_model_visibility,
  })

  if (isPending || model_settings_is_pending) return (
    <main className="flex-1 flex-center flex-col gap-4">
      <Spinner/>
      <span>Loading settings...</span>
    </main>
  )

  if (isError || model_settings_is_error || !model_settings) return (
    <main className="flex-1 flex-center">
      <p>Error loading settings: {error?.message ?? model_settings_error?.message}</p>
    </main>
  )

  return (
    <main className="flex-1 flex flex-col gap-10 p-4 pt-0">
      <h1 className="-mb-6">Settings</h1>

      <ProfileSection profile={profile}/>

      <OpenRouterKeySection
        has_key={profile.has_openrouter_key}
        key_source={profile.key_source}
        is_admin={profile.role === "admin"}/>

      <MetaCentrumKeySection
        has_key={profile.has_metacentrum_key}/>

      <ResearchDefaultsSection
        model_visibility={model_settings.model_visibility}
        is_admin_user={profile.role === "admin"}/>

      <section className="flex flex-col gap-4 max-w-lg">
        <h2>Account</h2>
        <SignOut/>
      </section>
    </main>
  )
}

function get_api_error_message(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown, value?: { message?: unknown } }
    if (typeof maybe.message === "string" && maybe.message.length > 0) return maybe.message
    if (typeof maybe.value?.message === "string" && maybe.value.message.length > 0) return maybe.value.message
  }
  return fallback
}

interface ProfileSectionProps {
  profile: User,
}

function ProfileSection({ profile }: ProfileSectionProps) {
  const query_client = useQueryClient()

  const { control, handleSubmit, reset, formState: { errors, isDirty, dirtyFields, isValid } } = useForm({
    defaultValues: { name: profile.name },
    mode: "onChange",
    resolver: zodResolver(z.object({
      name: user_name_schema
    })),
  })

  const update_mutation = useMutation({
    mutationFn: (new_name: string) => update_my_profile(new_name),
    onSuccess: (_, new_name) => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
      reset({ name: new_name })
    },
  })

  return (
    <section className="flex flex-col gap-4 max-w-lg">
      <h2>Profile</h2>

      <section className="grid grid-cols-[4rem_1fr] gap-y-2 text-sm">
        <p className="font-medium text-ink-2 kode uppercase">Email</p>
        <p>{profile.email}</p>

        <p className="font-medium text-ink-2 kode uppercase">Joined</p>
        <p>{new Date(profile.created_at).toLocaleString("cs-CZ")}</p>

        {is_admin(profile.role) && (
          <>
            <p className="font-medium text-ink-2 kode uppercase">Role</p>
            <p>{profile.role}</p>
          </>
        )}
      </section>

      <Separator/>

      <section>
        <Form onSubmit={handleSubmit(data => update_mutation.mutate(data.name))}
          className="flex flex-col gap-4">
          <Controller name="name"
            control={control}
            render={({ field }) => (
              <TextField isInvalid={!!errors.name}>
                <Label>
                  Name
                  {dirtyFields.name && !errors.name && (
                    <span className="text-warn">{" "}(unsaved)</span>
                  )}
                </Label>
                <Input type="text"
                  {...field}/>
                <FieldError>{errors.name?.message}</FieldError>
              </TextField>
            )}/>

          {update_mutation.isError && (
            <Alert status="danger">
              <Alert.Indicator/>
              <Alert.Content>
                <Alert.Title>{update_mutation.error.name}</Alert.Title>
                <Alert.Description>{update_mutation.error.message}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit"
              isDisabled={!isDirty || !isValid || update_mutation.isPending}
              isPending={update_mutation.isPending}
              className="w-34">
              {update_mutation.isPending ? (
                <>
                  <Spinner color="current" size="sm"/>
                  Updating&hellip;
                </>
              ) : "Update Profile"}
            </Button>
            {isDirty && (
              <Button variant="ghost"
                onPress={() => reset()}>
                Reset
              </Button>
            )}
          </div>
        </Form>
      </section>
    </section>
  )
}

interface OpenRouterKeySectionProps {
  has_key: boolean,
  key_source: KeySource,
  is_admin: boolean,
}

function MetaCentrumKeySection({ has_key }: { has_key: boolean }) {
  const query_client = useQueryClient()
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { api_key: "" },
    resolver: zodResolver(z.object({
      api_key: metacentrum_api_key_schema
    })),
  })

  const save_mutation = useMutation({
    mutationFn: set_metacentrum_key,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
      reset()
    },
  })

  const delete_mutation = useMutation({
    mutationFn: delete_metacentrum_key,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
    },
  })

  return (
    <section className="flex flex-col gap-4 max-w-lg">
      <h2>MetaCentrum API Key</h2>

      <section className="flex flex-col gap-4">
        {has_key ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-beta text-sm">
              <Icon icon="gravity-ui:circle-check-fill" className="text-success"/>
              <span className="text-success font-medium">API key configured</span>
            </div>

            <AlertDialog>
              <Button variant="danger-soft">Remove Key</Button>
              <AlertDialog.Backdrop isDismissable>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="max-w-sm">
                    <AlertDialog.CloseTrigger/>
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger"/>
                      <AlertDialog.Heading className="font-sans">Remove MetaCentrum key?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body className="flex flex-col gap-4 p-1">
                      <p>This will disable MetaCentrum models in new runs.</p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button variant="ghost" slot="close" isDisabled={delete_mutation.isPending}>
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        isDisabled={delete_mutation.isPending}
                        isPending={delete_mutation.isPending}
                        onPress={() => delete_mutation.mutate()}>
                        Remove
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </>
        ) : (
          <Form onSubmit={handleSubmit(data => save_mutation.mutate(data.api_key))}
            className="flex flex-col gap-4">
            <TextField isInvalid={!!errors.api_key}>
              <Label>MetaCentrum API Key</Label>
              <Input type="password" {...register("api_key")} />
              <FieldError>{errors.api_key?.message}</FieldError>
            </TextField>

            {save_mutation.isError && (
              <Alert status="danger">
                <Alert.Indicator/>
                <Alert.Content>
                  <Alert.Title>Failed to save MetaCentrum API key</Alert.Title>
                  <Alert.Description>
                    {get_api_error_message(save_mutation.error, "Failed to save MetaCentrum API key.")}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            )}

            <Button type="submit"
              isPending={save_mutation.isPending}
              isDisabled={save_mutation.isPending}>
              Save Key
            </Button>
          </Form>
        )}
      </section>
    </section>
  )
}

function OpenRouterKeySection({ has_key, key_source, is_admin }: OpenRouterKeySectionProps) {
  const query_client = useQueryClient()
  const [invite_code, setInviteCode] = useState("")

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { api_key: "" },
    resolver: zodResolver(z.object({
      api_key: openrouter_api_key_schema
    })),
  })

  const save_mutation = useMutation({
    mutationFn: set_openrouter_key,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["profile", "me"] })
      reset()
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
      setInviteCode("")
    },
  })

  async function handle_paste() {
    try {
      const text = await navigator.clipboard.readText()
      setInviteCode(text.slice(0, INVITE_CODE_LENGTH).trim())
    } catch (e) {
      // BUG: better handling?
      console.error("Failed to paste invite code:", e)
    }
  }

  return (
    <section className="flex flex-col gap-4 max-w-lg">
      <h2>OpenRouter API Key</h2>

      {is_admin && (
        <p className="text-sm">
          <span className="text-brand font-medium">[ADMIN]</span>{" "}
          Admin can use a system OpenRouter key when one is configured on the backend.
        </p>
      )}

      <section className="flex flex-col gap-4">
        {has_key ? (
          <>
            <div className="flex justify-between w-full gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 rounded-full bg-beta text-sm">
                <Icon icon="gravity-ui:circle-check-fill" className="text-success"/>
                <span className="text-success font-medium">
                  API key configured
                  {key_source === "provisioned" && " (provisioned)"}
                </span>
              </div>

              <AlertDialog>
                <Button variant="danger-soft">
                  Remove Key
                </Button>
                <AlertDialog.Backdrop isDismissable>
                  <AlertDialog.Container>
                    <AlertDialog.Dialog className="max-w-sm">
                      <AlertDialog.CloseTrigger/>
                      <AlertDialog.Header>
                        <AlertDialog.Icon status="danger"/>
                        <AlertDialog.Heading className="font-sans">Remove API Key?</AlertDialog.Heading>
                      </AlertDialog.Header>

                      <AlertDialog.Body className="flex flex-col gap-4 p-1">
                        <p>This will remove the API key from your account. You won't be able to run research without a key.</p>

                        {delete_mutation.isError && (
                          <Alert status="danger">
                            <Alert.Indicator/>
                            <Alert.Content>
                              <Alert.Title>Failed to remove API key</Alert.Title>
                              <Alert.Description>{delete_mutation.error.message}</Alert.Description>
                            </Alert.Content>
                          </Alert>
                        )}
                      </AlertDialog.Body>

                      <AlertDialog.Footer>
                        <Button variant="ghost" slot="close">No, keep it</Button>
                        <Button variant="danger"
                          onPress={() => delete_mutation.mutate()}
                          isPending={delete_mutation.isPending}
                          className="w-34">
                          {delete_mutation.isPending ? (
                            <>
                              <Spinner color="current" size="sm"/>
                              Removing&hellip;
                            </>
                          ) : (
                            <>
                              <Icon icon="gravity-ui:trash-bin"/>
                              Remove key
                            </>
                          )}
                        </Button>
                      </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                  </AlertDialog.Container>
                </AlertDialog.Backdrop>
              </AlertDialog>
            </div>

            <p className="text-xs">
              <APIKeyEncryptionNote/>
            </p>
          </>

        ) : (
          <>
            <Form onSubmit={handleSubmit(data => save_mutation.mutate(data.api_key))}
              className="flex flex-col gap-4">
              <TextField isInvalid={!!errors.api_key}>
                <Label>OpenRouter API Key</Label>
                <Input type="password"
                  placeholder="sk-or-v1-..."
                  aria-describedby="openrouter-api-key-description"
                  {...register("api_key")}/>
                <FieldError>{errors.api_key?.message}</FieldError>
                <Description id="openrouter-api-key-description">
                  <APIKeyEncryptionNote/>
                </Description>
              </TextField>

              <div className="flex items-center gap-4">
                <Button type="submit"
                  isPending={save_mutation.isPending}
                  isDisabled={save_mutation.isPending}
                  className="w-30">
                  {save_mutation.isPending ? (
                    <>
                      <Spinner color="current" size="sm"/>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon icon="gravity-ui:floppy-disk"/>
                      Save Key
                    </>
                  )}
                </Button>

                <AlertDialog>
                  <Button variant="secondary">Have an invite code?</Button>
                  <AlertDialog.Backdrop isDismissable>
                    <AlertDialog.Container>
                      <AlertDialog.Dialog className="w-fit gap-2">
                        <AlertDialog.CloseTrigger/>
                        <AlertDialog.Header>
                          <AlertDialog.Heading className="font-sans">Redeem Invite Code</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body className="flex flex-col items-center gap-4 overflow-hidden p-1">
                          <p className="text-sm text-center">Enter your invite code</p>

                          <InputOTP maxLength={INVITE_CODE_LENGTH}
                            value={invite_code}
                            onChange={setInviteCode}>
                            <InputOTP.Group>
                              {[...Array(INVITE_CODE_LENGTH)].map((_, i) => (
                                <InputOTP.Slot key={i} index={i}/>
                              ))}
                            </InputOTP.Group>
                          </InputOTP>

                          <Button variant="tertiary"
                            size="sm"
                            onPress={handle_paste}>
                            <Icon icon="ic:round-content-paste"/>
                            Paste Code
                          </Button>

                          {redeem_mutation.isError && (
                            <Alert status="danger">
                              <Alert.Indicator/>
                              <Alert.Content>
                                {/* BUG/TODO: Figure out how to properly display errors from our API */}
                                <Alert.Title>{(redeem_mutation.error as any)?.value?.message ||  "Invalid invite code"}</Alert.Title>
                              </Alert.Content>
                            </Alert>
                          )}
                        </AlertDialog.Body>

                        <AlertDialog.Footer>
                          <Button variant="tertiary" slot="close">
                            Cancel
                          </Button>
                          <Button onPress={() => redeem_mutation.mutate(invite_code)}
                            isDisabled={invite_code.length !== INVITE_CODE_LENGTH
                              || redeem_mutation.isPending}
                            isPending={redeem_mutation.isPending}
                            className="w-36">
                            {redeem_mutation.isPending ? (
                              <>
                                <Spinner color="current" size="sm"/>
                                Redeeming...
                              </>
                            ) : "Redeem"}
                          </Button>
                        </AlertDialog.Footer>
                      </AlertDialog.Dialog>
                    </AlertDialog.Container>
                  </AlertDialog.Backdrop>
                </AlertDialog>
              </div>

              {save_mutation.isError && (
                <Alert status="danger">
                  <Alert.Indicator/>
                  <Alert.Content>
                    <Alert.Title>
                      {/* BUG: proper handling */}
                      {(save_mutation.error as any)?.value?.message || "Failed to save API key. Please try again."}
                    </Alert.Title>
                  </Alert.Content>
                </Alert>
              )}
            </Form>
          </>
        )}
      </section>
    </section>
  )
}

const APIKeyEncryptionNote = () => (
  <>
    Your API key is encrypted{" "}
    <Link href="https://github.com/vaclavrozhon/problem-solver/blob/main/backend/src/profile/index.ts#L72"
      target="_blank"
      className="text-xs">
      at rest
      <Link.Icon/>
    </Link>{" "}
    . We decrypt it only when needed to run research on your behalf. You can set spending limits on your{" "}
    <Link href="https://openrouter.ai/settings/keys"
      target="_blank"
      className="text-xs">
      OpenRouter account
      <Link.Icon/>
    </Link>.
  </>
)

interface ResearchDefaultsSectionProps {
  model_visibility: ModelVisibility,
  is_admin_user: boolean,
}

function ResearchDefaultsSection({ model_visibility, is_admin_user }: ResearchDefaultsSectionProps) {
  const [preferences, setPreferences] = useState<ResearchUIPreferences>(() => load_research_ui_preferences(model_visibility))

  useEffect(() => {
    setPreferences(load_research_ui_preferences(model_visibility))
  }, [model_visibility])

  const update_preferences = (next: ResearchUIPreferences) => {
    const normalized = normalize_research_ui_preferences(next, model_visibility)
    setPreferences(normalized)
    save_research_ui_preferences(normalized, model_visibility)
  }

  return (
    <section className="flex flex-col gap-4 max-w-2xl">
      <h2>Research Defaults</h2>

      <div className="flex flex-col gap-2">
        <p className="text-sm">Default models for new research runs</p>
        {is_admin_user && (
          <p className="text-sm text-ink-2">
            Model availability is managed globally in <BracketLink to="/admin/models">Admin Models</BracketLink>.
          </p>
        )}
      </div>

      <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
        <Label>Prover</Label>
        <ModelSelect
          role="prover"
          selected={preferences.default_models.prover}
          model_visibility={model_visibility}
          onChange={(model) => update_preferences({
            ...preferences,
            default_models: { ...preferences.default_models, prover: model },
          })}/>
      </div>

      <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
        <Label>Verifier</Label>
        <ModelSelect
          role="verifier"
          selected={preferences.default_models.verifier}
          model_visibility={model_visibility}
          onChange={(model) => update_preferences({
            ...preferences,
            default_models: { ...preferences.default_models, verifier: model },
          })}/>
      </div>

      <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
        <Label>Summarizer</Label>
        <ModelSelect
          role="summarizer"
          selected={preferences.default_models.summarizer}
          model_visibility={model_visibility}
          onChange={(model) => update_preferences({
            ...preferences,
            default_models: { ...preferences.default_models, summarizer: model },
          })}/>
      </div>
    </section>
  )
}
