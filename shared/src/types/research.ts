import { z } from "zod"

// TODO: Add model pricing to the app
export const LLMModelsMap = {
  smart: {
    "Gemini 3 Pro": "google/gemini-3-pro-preview",
    "GPT 5.1": "openai/gpt-5.1",
    "GPT 5": "openai/gpt-5",
    // BUG: see if kimi k2 works or is broekn
    // "Kimi K2": "moonshotai/kimi-k2-thinking",
    "Claude Opus 4.5": "anthropic/claude-opus-4.5",
    "Grok 4": "x-ai/grok-4",
  },
  summarizer: {
    "GPT 5 mini": "openai/gpt-5-mini",
  }
} as const

const FlatModelMap = {
  ...LLMModelsMap.smart,
  ...LLMModelsMap.summarizer,
} as const

export function get_model_id(model_name: AllowedModelsName): AllowedModelsID {
  return FlatModelMap[model_name]
}

export type SmartModelName = keyof typeof LLMModelsMap.smart
export type SummarizerModelName = keyof typeof LLMModelsMap.summarizer

export type AllowedModelsName = SmartModelName | SummarizerModelName
export const AllowedModelsNames = [
  ...Object.keys(LLMModelsMap.smart),
  ...Object.keys(LLMModelsMap.summarizer),
] as AllowedModelsName[]

export const AllowedModelsIDs = [
  ...Object.values(LLMModelsMap.smart),
  ...Object.values(LLMModelsMap.summarizer),
] as const

export type AllowedModelsID = typeof AllowedModelsIDs[number]

// TODO Refactor this Models thing a bit

const keys = <T extends Record<string, any>>(obj: T) =>
  Object.keys(obj) as (keyof T)[]

export const SmartModels = z.enum(keys(LLMModelsMap.smart));
export const SummarizerModels = z.enum(keys(LLMModelsMap.summarizer));

// BUG: Cant be higher than 9 or breaks conversations retrieval by regex for digits
export const MaxProversPerRound = 9
export const MaxRoundsPerResearch = 1
export const ProversPerRound = z.coerce.number<string>().min(1).max(MaxProversPerRound)
export const RoundsPerResearch = z.coerce.number<string>().min(1).max(MaxRoundsPerResearch)

// TODO: Set universal minimun prompt length or something

export const NewStandardResearch = z.object({
  problem_id: z.uuid(),
  rounds: RoundsPerResearch,
  prover: z.object({
    count: ProversPerRound,
    general_advice: z.string().optional(),
    provers: z.array(
        z.object({
          // TODO/BUG: `order` should be renamed to `index` to make more sense
          // also, this property is completely omitted in the implementation, should revisit
          // order si given by index in array rn
          order: ProversPerRound,
          advice: z.string().optional(),
          model: SmartModels,
      })
    ).min(1).max(MaxProversPerRound),
    prompt: z.string().min(20),
  }),
  verifier: z.object({
    advice: z.string(),
    model: SmartModels,
    prompt: z.string().min(20),
  }),
  summarizer: z.object({
    prompt: z.string().min(20),
    model: SummarizerModels,
  })
})