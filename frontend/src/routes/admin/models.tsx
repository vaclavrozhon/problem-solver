import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, Spinner, Switch } from "@heroui/react"

import * as Breadcrumb from "../../components/ui/Breadcrumb"
import { get_admin_model_settings, update_admin_model_settings } from "../../api/admin/models"
import {
  get_enabled_transports,
  normalize_model_visibility,
  validate_model_visibility,
  type ModelVisibility,
} from "@shared/admin/models"
import { models, provider_details, type ModelID, type Provider } from "@shared/types/research"

export const Route = createFileRoute("/admin/models")({
  component: AdminModelsPage,
})

type VisibleModelEntry = {
  id: ModelID,
  name: string,
  transport?: string,
  structured_output: boolean,
}

function AdminModelsPage() {
  const query_client = useQueryClient()
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin", "models", "settings"],
    queryFn: get_admin_model_settings,
  })

  const [draft, setDraft] = useState<ModelVisibility | null>(null)
  const [local_error, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!data) return
    setDraft(data.model_visibility)
    setLocalError(null)
  }, [data])

  const save_mutation = useMutation({
    mutationFn: update_admin_model_settings,
    onSuccess: (updated) => {
      query_client.setQueryData(["admin", "models", "settings"], updated)
      query_client.setQueryData(["profile", "model-visibility"], updated)
      query_client.invalidateQueries({ queryKey: ["profile", "provider-usage"] })
      setDraft(updated.model_visibility)
      setLocalError(null)
    },
  })

  const model_entries = useMemo(
    () => (Object.entries(models) as [Provider, readonly VisibleModelEntry[]][])
      .map(([provider, provider_models]) => ({ provider, models: provider_models })),
    []
  )

  if (isPending) return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4">
      <Spinner/>
      <span>Loading model visibility...</span>
    </main>
  )

  if (isError) return (
    <main className="flex-1 flex-center">
      <p>Error loading model visibility: {error.message}</p>
    </main>
  )

  if (!data || !draft) return null

  const normalized_draft = normalize_model_visibility(draft)
  const draft_key = JSON.stringify(normalized_draft)
  const saved_key = JSON.stringify(data.model_visibility)
  const is_dirty = draft_key !== saved_key
  const enabled_transports = get_enabled_transports(normalized_draft)

  function apply_visibility(next: ModelVisibility) {
    const normalized = normalize_model_visibility(next)
    const validation_error = validate_model_visibility(normalized)
    if (validation_error) {
      setLocalError(validation_error)
      return
    }
    setDraft(normalized)
    setLocalError(null)
  }

  return (
    <main className="flex-1 flex flex-col p-4 pt-2 gap-4">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <Breadcrumb.default>
            <Breadcrumb.Item to="/admin">Administration</Breadcrumb.Item>
            <Breadcrumb.ChevronRightIcon />
            <Breadcrumb.Current>Models</Breadcrumb.Current>
          </Breadcrumb.default>
          <h1>Model Visibility</h1>
          <p className="text-sm text-ink-2">
            These switches control which models appear in user pickers and which transport usage cards appear in the top bar.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <Button size="sm" variant="secondary" onPress={() => apply_visibility(normalize_model_visibility({}))}>
            Enable All
          </Button>
          <Button size="sm" variant="ghost" isDisabled={!is_dirty || save_mutation.isPending}
            onPress={() => {
              setDraft(data.model_visibility)
              setLocalError(null)
              save_mutation.reset()
            }}>
            Reset
          </Button>
          <Button size="sm" isDisabled={!is_dirty || save_mutation.isPending}
            isPending={save_mutation.isPending}
            onPress={() => save_mutation.mutate(normalized_draft)}>
            Save Changes
          </Button>
        </div>
      </header>

      <section className="flex flex-wrap gap-3 text-sm">
        <TransportStatus label="Codex" enabled={enabled_transports.codex_cli}/>
        <TransportStatus label="Gemini" enabled={enabled_transports.gemini_cli}/>
        <TransportStatus label="Claude" enabled={enabled_transports.claude_cli}/>
        <TransportStatus label="OpenRouter" enabled={enabled_transports.openrouter}/>
        <TransportStatus label="MetaCentrum" enabled={enabled_transports.metacentrum_openai}/>
      </section>

      {local_error && (
        <Alert status="warning">
          <Alert.Indicator/>
          <Alert.Content>
            <Alert.Title>{local_error}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      {save_mutation.isError && (
        <Alert status="danger">
          <Alert.Indicator/>
          <Alert.Content>
            <Alert.Title>
              {(save_mutation.error as { value?: { message?: string }, message?: string })?.value?.message
                ?? save_mutation.error.message
                ?? "Failed to save model visibility."}
            </Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      <section className="flex flex-col gap-4 max-w-4xl">
        {model_entries.map(group => (
          <section key={group.provider} className="flex flex-col gap-2 rounded-2xl border-alpha bg-beta p-4">
            <div>
              <h2>{provider_details[group.provider].name}</h2>
              <p className="text-sm text-ink-2">Toggle individual models for all users.</p>
            </div>

            <div className="flex flex-col gap-2">
              {group.models.map(model => {
                const is_visible = normalized_draft[model.id] !== false
                const transport = model.transport ?? "openrouter"
                return (
                  <Switch
                    key={model.id}
                    isSelected={is_visible}
                    onChange={(value) => apply_visibility({
                      ...normalized_draft,
                      [model.id]: value,
                    })}
                    className="flex justify-between items-center w-full gap-4">
                    <div className="min-w-0">
                      <p className="text-sm truncate text-ink-2">{model.name}</p>
                      <p className="text-xs text-ink-1">
                        {transport}{model.structured_output ? " - structured" : " - text-only"}
                      </p>
                    </div>
                    <Switch.Control>
                      <Switch.Thumb/>
                    </Switch.Control>
                  </Switch>
                )
              })}
            </div>
          </section>
        ))}
      </section>
    </main>
  )
}

function TransportStatus({ label, enabled }: { label: string, enabled: boolean }) {
  return (
    <div className={`rounded-full px-3 py-1 border-alpha ${enabled ? "bg-brand/10 text-ink-2" : "bg-alpha text-ink-1"}`}>
      {label}: {enabled ? "enabled" : "disabled"}
    </div>
  )
}
