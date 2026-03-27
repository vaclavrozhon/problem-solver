import { get_model_by_id, type ModelConfig, type ModelID, type ReasoningConfig, type ReasoningEffort, type ReasoningEffortValue } from "@shared/types/research"
import {
  get_available_model_ids_for_role,
  normalize_model_visibility,
  type ModelVisibility,
} from "@shared/admin/models"

interface LegacyResearchUIPreferences {
  default_models: {
    prover: ModelConfig
    verifier: ModelConfig
    summarizer: ModelConfig
  }
}

export interface ResearchUIPreferences {
  default_models: {
    prover: ModelConfig
    verifier: ModelConfig
    summarizer: ModelConfig
  }
}

const STORAGE_KEY_V3 = "bolzano:research-ui-preferences:v3"
const STORAGE_KEY_V2 = "bolzano:research-ui-preferences:v2"
const STORAGE_KEY_V1 = "bolzano:research-ui-preferences:v1"

const HARD_DEFAULTS: ResearchUIPreferences["default_models"] = {
  prover: {
    id: "gpt-5.2",
    config: { reasoning_effort: "xhigh", web_search: false },
    role: "prover",
  },
  verifier: {
    id: "gpt-5.2",
    config: { reasoning_effort: "high", web_search: false },
    role: "verifier",
  },
  summarizer: {
    id: "gpt-5.3-codex",
    config: { reasoning_effort: "low", web_search: false },
    role: "summarizer",
  },
}

export function load_research_ui_preferences(visibility: ModelVisibility): ResearchUIPreferences {
  const v3_raw = read_storage<Partial<ResearchUIPreferences>>(STORAGE_KEY_V3)
  if (v3_raw) return normalize_research_ui_preferences(v3_raw, visibility)

  const v2_raw = read_storage<Partial<ResearchUIPreferences>>(STORAGE_KEY_V2)
  if (v2_raw) {
    const migrated = normalize_research_ui_preferences({
      default_models: v2_raw.default_models,
    }, visibility)
    save_research_ui_preferences(migrated, visibility)
    return migrated
  }

  const v1_raw = read_storage<Partial<LegacyResearchUIPreferences>>(STORAGE_KEY_V1)
  if (v1_raw) {
    const migrated = normalize_research_ui_preferences({
      default_models: v1_raw.default_models,
    }, visibility)
    save_research_ui_preferences(migrated, visibility)
    return migrated
  }

  return normalize_research_ui_preferences(null, visibility)
}

export function normalize_research_ui_preferences(
  raw: Partial<ResearchUIPreferences> | null | undefined,
  visibility_input: ModelVisibility,
): ResearchUIPreferences {
  const visibility = normalize_model_visibility(visibility_input)
  return {
    default_models: {
      prover: sanitize_model_for_role(raw?.default_models?.prover, "prover", visibility),
      verifier: sanitize_model_for_role(raw?.default_models?.verifier, "verifier", visibility),
      summarizer: sanitize_model_for_role(raw?.default_models?.summarizer, "summarizer", visibility),
    },
  }
}

export function save_research_ui_preferences(preferences: ResearchUIPreferences, visibility: ModelVisibility) {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(
    STORAGE_KEY_V3,
    JSON.stringify(normalize_research_ui_preferences(preferences, visibility))
  )
}

function sanitize_model_for_role(
  input: unknown,
  role: "prover" | "verifier" | "summarizer",
  visibility: ModelVisibility,
): ModelConfig {
  const candidate = input as Partial<ModelConfig> | null | undefined
  const available_ids = get_available_model_ids_for_role(role, visibility)

  if (candidate && typeof candidate === "object" && typeof candidate.id === "string") {
    const model_info = get_model_by_id(candidate.id as ModelID)
    if (model_info && available_ids.includes(model_info.id)) {
      const normalized_reasoning = normalize_reasoning(model_info.config.reasoning, candidate.config?.reasoning_effort)
      return {
        id: model_info.id,
        role,
        config: {
          reasoning_effort: normalized_reasoning,
          web_search: false,
        },
      }
    }
  }

  const hard_default = HARD_DEFAULTS[role]
  if (available_ids.includes(hard_default.id)) {
    return {
      ...hard_default,
      role,
      config: {
        ...hard_default.config,
        reasoning_effort: normalize_reasoning(get_model_by_id(hard_default.id)!.config.reasoning, hard_default.config.reasoning_effort),
      },
    }
  }

  if (available_ids.length === 0) {
    const fallback = HARD_DEFAULTS[role]
    return {
      ...fallback,
      role,
      config: {
        ...fallback.config,
        reasoning_effort: normalize_reasoning(get_model_by_id(fallback.id)!.config.reasoning, fallback.config.reasoning_effort),
      },
    }
  }

  const first = get_model_by_id(available_ids[0])!
  return {
    id: first.id,
    role,
    config: {
      reasoning_effort: default_reasoning(first.config.reasoning),
      web_search: false,
    },
  }
}

function default_reasoning(config: ReasoningConfig): ReasoningEffortValue {
  if (config === null) return null
  if (config === "toggle") return true
  if (config.includes("high")) return "high"
  return config[config.length - 1]
}

function normalize_reasoning(
  config: ReasoningConfig,
  value: unknown,
): ReasoningEffortValue {
  if (config === null) return null
  if (config === "toggle") {
    if (typeof value === "boolean") return value
    return true
  }
  if (typeof value === "string") {
    const lowered = value.toLowerCase() as ReasoningEffort
    if (config.includes(lowered)) return lowered
  }
  return default_reasoning(config)
}

function read_storage<T>(key: string): T | null {
  if (typeof localStorage === "undefined") return null
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    return parsed as T
  } catch {
    return null
  }
}
