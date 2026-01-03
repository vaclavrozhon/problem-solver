import { z } from "zod"

// OpenRouter reasoning effort levels (% of max_tokens for reasoning):
// NOTE: must be ordered from none to high for UI (ModelSelect) to work properly
export const reasoning_efforts = ["none", "minimal", "low", "medium", "high", "xhigh"] as const
export type ReasoningEffort = typeof reasoning_efforts[number]

/**
 * Reasoning configuration for a model:
 * - `null` – no control possible – model either reasons or doesn't reason
 * - `"toggle"` – simple on/off switch
 * - `ReasoningEffort[] – effort levels, if `none` then that turns off reasoning
 */
export type ReasoningConfig = null | "toggle" | readonly ReasoningEffort[]

interface Model {
  id: string,
  name: string,
  provider: string,
  price: {
    input: number,
    output: number,
    search?: number,
  },
  config: {
    /** `true` if the model supports searching the web, else `false` */
    web_search: boolean,
    reasoning: ReasoningConfig,
  },
  context: number,
  max_output: number,
  stream_cancel: boolean,
  byok: boolean,
}

interface ProviderDetails {
  name: string,
  logo: string | null,
}

// TODO: Not all icons are available on Iconify, add these manually somehow
export const provider_details = {
  anthropic: {
    name: "Anthropic",
    logo: "simple-icons:anthropic",
  },
  deepseek: {
    name: "DeepSeek",
    logo: "ri:deepseek-fill",
  },
  moonshotai: {
    name: "Moonshot AI",
    logo: null,
  },
  nvidia: {
    name: "NVIDIA",
    logo: "simple-icons:nvidia",
  },
  google: {
    name: "Google",
    logo: "devicon-plain:google",
  },
  openai: {
    name: "OpenAI",
    logo: "bi:openai",
  },
  xai: {
    name: "xAI",
    logo: null,
  },
  zai: {
    name: "Z.ai",
    logo: null,
  },
} satisfies Record<string, ProviderDetails>

export type Provider = keyof typeof provider_details

// TODO should write checker function whether all these endpoints are still active
// https://openrouter.ai/docs/api/api-reference/endpoints/list-endpoints
export const models = {
  anthropic: [
    {
      //final
      id: "anthropic/claude-opus-4.5",
      name: "Claude Opus 4.5",
      provider: "anthropic",
      price: { input: 5, output: 25, search: 10 },
      config: {
        web_search: true,
        // reasponds to "enabled" toggle
        // according to api should support "low", "medium", "high" effort levels
        // with "high" as default when you dont specify anything
        // but it looks like you need to give them some beta header else it doesnt seem to work
        reasoning: "toggle",
      },
      context: 200_000,
      max_output: 64_000,
      stream_cancel: true,
      byok: true,
    }
  ],
  deepseek: [
    {
      // final
      id: "deepseek/deepseek-v3.2-speciale",
      name: "DeepSeek V3.2 Speciale",
      provider: "parasail/fp8",
      price: { input: 0.4, output: 0.5 },
      config: {
        web_search: false,
        // thinking by default, cant be turned off
        // ofc doesnt react to effort
        reasoning: null,
      },
      context: 163_840,
      max_output: 163_840,
      stream_cancel: true,
      // BYOK for Parasail!
      byok: true
    },
    {
      // final
      id: "deepseek/deepseek-v3.2",
      name: "DeepSeek V3.2",
      provider: "siliconflow/fp8",
      price: { input: 0.27, output: 0.42 },
      config: {
        web_search: false,
        // Correct, only toggle, doesnt react to effort
        // only "enabled": true/false
        reasoning: "toggle",
      },
      context: 163_840,
      max_output: 163_840,
      stream_cancel: false,
      byok: false,
    }
  ],
  google: [
    {
      // final
      id: "google/gemini-3-pro-preview",
      name: "Gemini 3 Pro Preview",
      provider: "google-vertex",
      price: { input: 2, output: 12 },
      config: {
        web_search: false,
        // REASONING CAN'T BE DISABLED
        reasoning: ["low", "high"],
      },
      /**
       * NOTE: Context is actually 1_048_576 but after 200K tokens
       * the pricing gets higher. Our app shouldn't really get to 200k tokens
       * therefore I feel like there's no need to mention the higher pricing.
       */
      context: 200_000,
      max_output: 65_536,
      byok: true,
      stream_cancel: false,
    },
    {
      // final
      id: "google/gemini-3-flash-preview",
      name: "Gemini 3 Flash Preview",
      provider: "google-vertex",
      price: { input: 0.5, output: 3 },
      config: {
        web_search: false,
        // REASONING CAN BE DISABLED BY `enabled: false`
        // doesnt actually support none, but if user chooses none,
        // then i should map it in the backend to set "enabled": false instead 
        // but only for specific endpoints
        reasoning: ["none", "minimal", "low", "medium", "high"],
      },
      context: 1_048_576,
      max_output: 65_536,
      stream_cancel: false,
      byok: true,
    },
  ],
  moonshotai: [
    {
      // final
      id: "moonshotai/kimi-k2-thinking",
      name: "Kimi K2 Thinking",
      provider: "siliconflow/fp8",
      price: { input: 0.55, output: 2.5 },
      config: {
        web_search: false,
        // I feel like it doesnt react to effort levels and cant be turned off, is on by default
        // https://platform.moonshot.ai/docs/guide/use-kimi-k2-thinking-model#usage-notes
        // have a look here, supposedly it reacts to max_tokens
        // also proposes to stream the response?
        reasoning: null,
      },
      context: 262_144,
      max_output: 262_144,
      stream_cancel: false,
      byok: false,
    },
  ],
  nvidia: [
    {
      // final
      id: "nvidia/nemotron-3-nano-30b-a3b",
      name: "Nemotron 3 Nano 30B",
      provider: "chutes/bf16",
      price: { input: 0.06, output: 0.24 },
      config: {
        web_search: false,
        reasoning: "toggle",
      },
      context: 262_144,
      max_output: 262_144,
      stream_cancel: true,
      // for chutes
      byok: true,
    }
  ],
  openai: [
    {
      // final except for todo
      id: "openai/gpt-5.2-pro",
      name: "GPT-5.2 Pro",
      provider: "openai",
      price: { input: 21, output: 168, search: 10 },
      config: {
        web_search: true,
        // TODO
        reasoning: null,
      },
      byok: true,
      stream_cancel: true,
      context: 400_000,
      max_output: 128_000,
    },
    {
      // final
      id: "openai/gpt-5.2",
      name: "GPT-5.2",
      provider: "openai",
      price: { input: 1.75, output: 14, search: 10 },
      config: {
        web_search: true,
        /** can be disabled only with the "none" value */
        reasoning: ["none", "low", "medium", "high", "xhigh"],
      },
      byok: true,
      stream_cancel: true,
      context: 400_000,
      max_output: 128_000,
    },
    {
      // final
      id: "openai/gpt-5.1",
      name: "GPT-5.1",
      provider: "openai",
      price: { input: 1.25, output: 10, search: 10 },
      config: {
        web_search: true,
        /** reasoning can be disabled only by giving the `none` effort */
        reasoning: ["none", "low", "medium", "high"],
      },
      byok: true,
      stream_cancel: true,
      context: 400_000,
      max_output: 128_000,
    },
    {
      // final except for todo
      id: "openai/gpt-5-pro",
      name: "GPT-5 Pro",
      provider: "openai",
      price: { input: 15, output: 120, search: 10 },
      config: {
        web_search: true,
        // TODO
        reasoning: null,
      },
      byok: true,
      stream_cancel: true,
      context: 400_000,
      max_output: 272_000,
    },
    {
      // final
      id: "openai/gpt-5",
      name: "GPT-5",
      provider: "openai",
      price: { input: 1.25, output: 10, search: 10 },
      config: {
        web_search: true,
        // cant be disabled, only set to minimal
        reasoning: ["minimal", "low", "medium", "high"],
      },
      byok: true,
      stream_cancel: true,
      context: 400_000,
      max_output: 128_000,
    },
    {
      // final
      id: "openai/gpt-5-mini",
      name: "GPT-5 Mini",
      provider: "openai",
      price: { input: 0.25, output: 2, search: 10 },
      config: {
        web_search: true,
        /** reasoning cannot be turned off */
        reasoning: ["minimal", "low", "medium", "high"],
      },
      byok: true,
      stream_cancel: true,
      context: 400_000,
      max_output: 128_000,
    },
    {
      // final
      id: "openai/gpt-oss-120b",
      name: "gpt-oss-120b",
      provider: "nebius/fp4",
      price: { input: 0.15, output: 0.6 },
      config: {
        web_search: false,
        // Cant be turned off
        reasoning: ["low", "medium", "high"]
      },
      context: 131_072,
      max_output: 131_072,
      stream_cancel: false,
      byok: true
    },
  ],
  xai: [
    // BUG: The models can do web search but only via tools.
    // Should be easy to add.
    // https://docs.x.ai/docs/guides/tools/search-tools
    {
      // final
      id: "x-ai/grok-4",
      name: "Grok 4",
      provider: "xai",
      price: { input: 3, output: 15 },
      config: {
        web_search: false,
        // indidcate in the UI that it is thiking by default
        // TODO: could make a list with models that think by default and check if the model falls in that list and just render the icon
        /** reasoning is not exposed, reasoning cannot be disabled, and the reasoning effort cannot be specified */
        reasoning: null,
      },
      // NOTE: Actually up to 2_000_000 but then the pricing is higher.
      context: 128_000,
      max_output: 256_000,
      stream_cancel: true,
      byok: true,
    },
    {
      // final
      id: "x-ai/grok-4.1-fast",
      name: "Grok 4.1 Fast",
      price: { input: 0.2, output: 0.5 },
      provider: "xai",
      config: {
        web_search: false,
        // only toggle via enabled true/false, cant set effort
        reasoning: "toggle"
      },
      // NOTE: Actually up to 2_000_000 but then the pricing is higher.
      context: 128_000,
      max_output: 30_000,
      stream_cancel: true,
      byok: true,
    },
  ],
  zai: [
    // final
    {
      id: "z-ai/glm-4.7",
      name: "GLM 4.7",
      provider: "parasail/fp8",
      price: { input: 0.45, output: 2.1 },
      config: {
        web_search: false,
        reasoning: "toggle",
      },
      context: 128_000,
      max_output: 128_000,
      stream_cancel: true,
      byok: true,
    }
  ]
} as const satisfies Record<Provider, readonly Model[]>

type Models = typeof models[keyof typeof models][number]

/** Maps model `id` to its `reasoning_effort` config */
type ModelReasoningMap = {
  [Model in Models as Model["id"]]: Model["config"]["reasoning"]
}
/** Maps model `id` to its `web_search` config */
type ModelWebSearchMap = {
  [Model in Models as Model["id"]]: Model["config"]["web_search"]
}

/** Type of all defined OpenRouter model ids */
export type ModelID = Models["id"]

/**
 * The value type for reasoning_effort in config
 * - effort levels – `ReasoningEffort`
 * - toggle – `boolean`
 * - no-control – `null`
 */
export type ReasoningEffortValue = ReasoningEffort | boolean | null

/**
 * Creates a type-safe model with validated reasoning and web search options.
 * @param config - configuration options constrained by model definition
 * @returns object containing model id and its configuration
 */
export function choose_model<ID extends ModelID>(
  id: ID,
  config: {
    reasoning_effort: ModelReasoningMap[ID] extends readonly (infer Effort)[]
      ? Effort
      : ModelReasoningMap[ID] extends "toggle"
        ? boolean
        : null,
    web_search: ModelWebSearchMap[ID] extends true ? boolean : false,
  }
) {
  return { id, config }
}

/**
 * @param id of model to get
 * @returns model details if model exists, else `null`
 */
export function get_model_by_id(id: ModelID) {
  for (const provider_models of Object.values(models)) {
    const found = provider_models.find(m => m.id === id)
    if (found) return found
  }
  return null
}

export const ModelConfigSchema = z.object({
  id: z.enum(
    Object.values(models)
      .flat()
      .map(model => model.id)
  ),
  config: z.object({
    reasoning_effort: z.enum(reasoning_efforts).or(z.boolean()).or(z.null()),
    web_search: z.boolean(),
  }),
}).superRefine((data, ctx) => {
  const model = get_model_by_id(data.id)
  if (model) {
    const { reasoning_effort, web_search } = data.config

    const supports_web_search = model.config.web_search

    const reasoning_config = model.config.reasoning
    const model_is_no_control = reasoning_config === null
    const model_is_toggle = reasoning_config === "toggle"
    const model_is_effort = Array.isArray(reasoning_config)

    if (model_is_no_control) {
      // no control -> only `null` is valid
      if (reasoning_effort !== null) {
        ctx.addIssue({
          code: "custom",
          message: `Model "${data.id}" does not support reasoning configuration. Set reasoning to null.`,
          // TODO: rename reasoning_effort to simply reasoning
          path: ["config", "reasoning_effort"],
        })
      }
    } else if (model_is_toggle) {
      // toggle -> only `boolean` is valid
      if (typeof reasoning_effort !== "boolean") {
        ctx.addIssue({
          code: "custom",
          message: `For model "${data.id}" you must either enable (true) or disable (false) reasoning.`,
          path: ["config", "reasoning_effort"],
        })
      }
    } else if (model_is_effort) {
      // effort -> must be a valid effort level
      if (!(reasoning_config).includes(reasoning_effort)) {
        ctx.addIssue({
          code: "custom",
          message: `Model "${data.id}" only supports effort levels: [${(reasoning_config).join(", ")}]`,
          path: ["config", "reasoning_effort"],
        })
      }
    } else {
      ctx.addIssue({
        code: "custom",
        message: "Unhandled model reasoning config. Please contact a human.",
        path: ["config", "reasoning_effort"],
      })
    }

    if (!supports_web_search && web_search) {
      ctx.addIssue({
        code: "custom",
        message: `Model "${data.id}" does not support web search.`,
        path: ["config", "web_search"],
      })
    }
  } else {
    ctx.addIssue({
      code: "custom",
      message: `Model "${data.id}" doesn't exist.`,
      path: ["id"],
    })
  }
})

export type ModelConfig = z.infer<typeof ModelConfigSchema>

export const MaxProversPerRound = 10
export const MaxRoundsPerResearch = 10
export const ProversPerRound = z.coerce.number<string>().min(1).max(MaxProversPerRound)
export const RoundsPerResearch = z.coerce.number<string>().min(1).max(MaxRoundsPerResearch)

// TODO: Set universal minimun prompt length or something

export const VerifierConfigSchema = z.object({
  model: ModelConfigSchema,
  system_prompt: z.string().trim().min(10),
  prompt: z.string().trim().min(20),
})
export type VerifierConfig = z.infer<typeof VerifierConfigSchema>

export const SummarizerConfigSchema = z.object({
  prompt: z.string().min(20),
  system_prompt: z.string().trim().min(10),
  model: ModelConfigSchema,
})
export type SummarizerConfig = z.infer<typeof SummarizerConfigSchema>

export const NewStandardResearch = z.object({
  problem_id: z.uuid(),
  rounds: RoundsPerResearch,
  round_instructions: z.string().trim().optional(),
  prover: z.object({
    count: ProversPerRound,
    provers: z.array(
      z.object({
        instructions: z.string().optional(),
        model: ModelConfigSchema,
      })
    ).min(1).max(MaxProversPerRound),
    system_prompt: z.string().trim().min(10),
    prompt: z.string().trim().min(20),
  }),
  verifier: VerifierConfigSchema,
  summarizer: SummarizerConfigSchema
})

// Output Schemas

export const ProverOutputSchema = z.object({
  content: z.string().describe("Your complete analysis in Markdown (KaTeX allowed, all KaTeX code needs to be enclosed in single '$' from each side). Include reasoning, examples, proofs, failed attempts, intuitions - everything for the verifier to review.")
})
export type ProverOutput = z.infer<typeof ProverOutputSchema>

export const VerifierOutputSchema = z.object({
  feedback_md: z.string().describe("Detailed critique of prover outputs (≥200 words). Include concrete next-step suggestions. Use Markdown (GFM enabled) & KaTeX for better readability. All KaTeX code needs to be enclosed in single '$' from each side."),
  summary_md: z.string().describe("Concise summary of this round's work for summarizer. Use Markdown (GFM enabled) & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for better readability."),
  // TODO: is the describe necessary here?
  verdict: z.enum(["promising", "uncertain", "unlikely"]).describe("promising|uncertain|unlikely"),
  // TODO: correct? blocking issues?
  blocking_issues: z.array(z.string()).describe(`List of issues preventing progress.`),
  per_prover: z.array(z.object({
    prover_id: z.string().describe("ID of the evaluated prover."),
    brief_feedback: z.string().describe("Feedback for given prover."),
    score: z.enum(["promising", "uncertain", "unlikely"]),
  })).describe("List of prover-specific feedback."),
  notes_update: z.object({
    // TODO: Add "noaction" action option
    action: z.enum(["append", "replace"]).describe("Action to edit current file with new contents."),
    content: z.string().describe("Markdown & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for notes.md"),
  }).describe("How should the `notes.md` file be edited?"),
  proofs_update: z.object({
    action: z.enum(["append", "replace"]).describe("Action to edit current file with new contents."),
    content: z.string().describe("Markdown & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for proofs.md"),
  }).describe("How should the `proofs.md` file be edited?"),
  output_update: z.object({
    action: z.enum(["append", "replace"]).describe("Action to edit current file with new contents."),
    content: z.string().describe("Markdown & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for output.md"),
  }).describe("How should the `output.md` file be edited?"),
})
export type VerifierOutput = z.infer<typeof VerifierOutputSchema>

export const SummarizerOutputSchema = z.object({
  summary: z.string().describe("Readable summary of the round (≤200 words). Use Markdown (GFM enabled) & KaTeX for better readability. All KaTeX code needs to be enclosed in single '$' from each side."),
  one_line_summary: z.string().describe("Brief one-line summary for UI display (≤100 chars). Use Markdown (GFM enabled) & KaTeX for better readability. All KaTeX code needs to be enclosed in single '$' from each side."),
  // TODO
  /**
   * TODO: In the original prompt there we also fields
   * "highlights": [] & "next_questions": []
   * seems interesting
   */
})
export type SummarizerOutput = z.infer<typeof SummarizerOutputSchema>