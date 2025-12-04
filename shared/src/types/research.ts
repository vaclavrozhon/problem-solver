import { z } from "zod"

// TODO: Add model pricing to the app
export const LLMModelsMap = {
  smart: {
    "GPT 5 mini": "openai/gpt-5-mini",
    "Gemini 3 Pro": "google/gemini-3-pro-preview",
    "GPT 5.1": "openai/gpt-5.1",
    "GPT 5": "openai/gpt-5",
    "Claude Opus 4.5": "anthropic/claude-opus-4.5",
    "Grok 4": "x-ai/grok-4",
    "Kimi K2": "moonshotai/kimi-k2-thinking",
    "DeepSeek V3.2 Speciale": "deepseek/deepseek-v3.2-speciale",
  },
  summarizer: {
    "GPT 5 mini": "openai/gpt-5-mini",
    "DeepSeek V3.2": "deepseek/deepseek-v3.2",
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

export const MaxProversPerRound = 10
export const MaxRoundsPerResearch = 5
export const ProversPerRound = z.coerce.number<string>().min(1).max(MaxProversPerRound)
export const RoundsPerResearch = z.coerce.number<string>().min(1).max(MaxRoundsPerResearch)

// TODO: Set universal minimun prompt length or something

export const VerifierConfigSchema = z.object({
  advice: z.string(),
  model: SmartModels,
  prompt: z.string().min(20),
})
export type VerifierConfig = z.infer<typeof VerifierConfigSchema>

export const SummarizerConfigSchema = z.object({
  prompt: z.string().min(20),
  model: SummarizerModels,
})
export type SummarizerConfig = z.infer<typeof SummarizerConfigSchema>

export const NewStandardResearch = z.object({
  problem_id: z.uuid(),
  rounds: RoundsPerResearch,
  prover: z.object({
    count: ProversPerRound,
    general_advice: z.string().optional(),
    provers: z.array(
      z.object({
        advice: z.string().optional(),
        model: SmartModels,
      })
    ).min(1).max(MaxProversPerRound),
    prompt: z.string().min(20),
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