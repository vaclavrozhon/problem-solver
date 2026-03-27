import { z } from "zod"

import { ModelConfigSchema } from "./research"

export const ProblemChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})

export const ProblemChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(20_000),
  history: z.array(ProblemChatMessageSchema).max(40).default([]),
  model: ModelConfigSchema("chat"),
  selected_round: z.number().int().min(1).nullable().optional(),
})

export const ProblemChatResponseSchema = z.object({
  reply: z.string(),
  context: z.object({
    current_round: z.number().int().min(0),
    selected_round: z.number().int().min(1).nullable(),
    packed_rounds: z.array(z.number().int().min(1)),
    packed_sections: z.array(z.string()),
    estimated_chars: z.number().int().min(0),
    used_model: z.string(),
  }),
})

export type ProblemChatMessage = z.infer<typeof ProblemChatMessageSchema>
export type ProblemChatRequest = z.infer<typeof ProblemChatRequestSchema>
export type ProblemChatResponse = z.infer<typeof ProblemChatResponseSchema>
