import { get_model_transport, models, type ModelID } from "../types/research"

export type ModelVisibility = Record<ModelID, boolean>
export type ModelTransport = ReturnType<typeof get_model_transport>

export interface AdminModelSettings {
  model_visibility: ModelVisibility,
  updated_at: string | null,
}

type ModelEntry = {
  id: ModelID,
  structured_output: boolean,
}

export function all_model_ids() {
  const ids: ModelID[] = []
  for (const provider_models of Object.values(models) as Array<readonly { id: ModelID }[]>) {
    for (const model of provider_models) ids.push(model.id)
  }
  return ids
}

export function normalize_model_visibility(input: unknown): ModelVisibility {
  const candidate = (input && typeof input === "object"
    ? input
    : {}) as Partial<Record<ModelID, unknown>>
  const normalized = {} as ModelVisibility

  for (const id of all_model_ids()) normalized[id] = candidate[id] !== false
  return normalized
}

export function get_available_model_ids_for_role(
  role: "prover" | "verifier" | "summarizer" | "chat",
  visibility: ModelVisibility
): ModelID[] {
  const ids: ModelID[] = []
  for (const provider_models of Object.values(models) as Array<readonly ModelEntry[]>) {
    for (const model of provider_models) {
      if (visibility[model.id] === false) continue
      if (role !== "prover" && role !== "chat" && !model.structured_output) continue
      ids.push(model.id)
    }
  }
  return ids
}

export function get_enabled_transports(visibility: ModelVisibility) {
  const enabled: Record<ModelTransport, boolean> = {
    openrouter: false,
    codex_cli: false,
    gemini_cli: false,
    claude_cli: false,
    metacentrum_openai: false,
  }

  for (const id of all_model_ids()) {
    if (visibility[id] === false) continue
    enabled[get_model_transport(id)] = true
  }

  return enabled
}

export function validate_model_visibility(visibility: ModelVisibility): string | null {
  const prover_models = get_available_model_ids_for_role("prover", visibility)
  if (prover_models.length === 0) {
    return "At least one model must remain enabled."
  }

  const structured_models = get_available_model_ids_for_role("verifier", visibility)
  if (structured_models.length === 0) {
    return "At least one structured-output model must remain enabled for verifier and summarizer roles."
  }

  return null
}
