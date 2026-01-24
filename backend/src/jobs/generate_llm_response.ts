import { z } from "zod"
import { get_model_by_id } from "@shared/types/research"
import type { ModelConfig, ModelID } from "@shared/types/research"
import { save_llm_log } from "./research_utils"
import type { DbOrTx } from "./research_utils"
import type { OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider"
import { get_user_openrouter_key } from "@backend/openrouter/provider"

interface OpenRouterContentBlock {
  type: string,
  text?: string,
}

interface OpenRouterOutputBlock {
  type: string,
  status?: string,
  content?: OpenRouterContentBlock[],
}

interface OpenRouterAPIResponse {
  output: OpenRouterOutputBlock[],
  usage: OpenRouterUsageAccounting,
  status?: string,
}

interface LLMSuccessResponse {
  success: true,
  usage: OpenRouterUsageAccounting,
  time: number,
  model_id: ModelID,
}

/** Success response for text output (no schema provided) */
interface LLMTextSuccessResponse extends LLMSuccessResponse{
  output: string
}

/** Success response for structured output (schema provided) */
interface LLMStructuredSuccessResponse<T> extends LLMSuccessResponse {
  output: T,
}

/** Error response (same for schema & no schema modes) */
type LLMErrorResponse = {
  success: false,
  error: Error,
  model_id: ModelID,
}

/** Response type when schema is provided */
export type LLMStructuredResponse<T> = LLMStructuredSuccessResponse<T> | LLMErrorResponse

/** Response type when no schema is provided */
export type LLMTextResponse = LLMTextSuccessResponse | LLMErrorResponse

export type LLMResponse<T> = LLMStructuredResponse<T> | LLMTextResponse

interface LLMMessages {
  role: "system" | "user" | "assistant",
  content: string,
}

/** Base parameters (common to both modes) */
interface GenerateLLMBaseParams {
  db: DbOrTx,
  /** model configuration */
  model: ModelConfig,
  /** 
   * user_id` for OpenRouter tracking/usage/stats
   * 
   * FUNFACT: leaks internal user ids to OpenRouter
   * */
  user_id: string,
  messages: LLMMessages[],
  /** UUID of the file that stores the prompt contained in `messages` */
  prompt_file_id: string,
  /** [dev helper] context for error messages: [prover], [verifier], ... */
  context: string,
  max_retries?: number,
  /** save LLM response to DB (default: `true`) */
  save_to_db?: boolean,
  /** OpenRouter supporst values `0-2` with default being `1` */
  temperature?: number,
}

/** Parameters with schema (structured output) */
interface GenerateLLMParamsWithSchema<T> extends GenerateLLMBaseParams {
  /** zod schema for validating and typing the structured output */
  schema: z.ZodType<T>
}

/** Parameters without schema (text output) */
interface GenerateLLMParamsWithoutSchema extends GenerateLLMBaseParams {
  schema?: undefined
}

export type GenerateLLMParams<T> = GenerateLLMParamsWithSchema<T> | GenerateLLMParamsWithoutSchema

interface OpenRouterRequestBody {
  model: ModelID,
  input: (LLMMessages & { type: "message" })[],
  temperature: number,
  reasoning: any,
  provider: {
    only: string[],
  },
  user: string,
  text: {
    verbosity: "high",
    format: {
      type: "text"
    } | {
      type: "json_schema",
      strict: true,
      name: string,
      schema: any,
    }
  },
  max_output_tokens?: number,
}

/**
 * Extract text output from OpenRouter API response
 */
function extract_text_output(data: OpenRouterAPIResponse) {
  const message = data.output?.find((o) => o.type === "message")
  const content = message?.content?.find((c) => c.type === "output_text" || c.type === "text")
  if (!content?.text) return null
  return {
    text: content.text
      .normalize("NFC")
      .replace(/\u0000/g, "")
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, ""),
    content_block: content,
  }
}

/**
 * Parse JSON text and validate against Zod schema
 */
function parse_json_output<T>(text: string, schema: z.ZodType<T>, log_prefix: string): T {
  let parsed_json: unknown
  try {
    parsed_json = JSON.parse(text)
    console.log(`${log_prefix} JSON parsed successfully`)
  } catch (err) {
    console.error(`${log_prefix} JSON parse error:`, err)
    throw new Error(`Invalid JSON in response`)
  }

  try {
    const result = schema.parse(parsed_json) as T
    console.log(`${log_prefix} Zod validation passed`)
    return result
  } catch (err) {
    console.error(`${log_prefix} Zod validation error:`, err)
    throw new Error(`Response doesn't match expected schema`)
  }
}

/**
 * @returns valid reasoning request config for OpenRouter API based on model config
 */
function get_reasoning_config(model: ModelConfig) {
  const reasoning = model.config.reasoning_effort

  if (reasoning === null) return undefined

  if (typeof reasoning === "boolean") return {
    "enabled": reasoning,
  }

  // This check is for models that support both effort values & turning thinking on/off
  // and don't support `none` -> instead must be turned off through `enabled`
  // TODO: make a note somewhere that when adding model, to always also add them here
  if (reasoning === "none") {
    if (model.id === "google/gemini-3-flash-preview") return {
      "enabled": false,
    }
  }

  return {
    "effort": reasoning,
  }
}

// Overloads for correct types
export async function generate_llm_response(params: GenerateLLMParamsWithoutSchema): Promise<LLMTextResponse>
export async function generate_llm_response<T>(params: GenerateLLMParamsWithSchema<T>): Promise<LLMStructuredResponse<T>>

/**
 * Generate LLM response with optional structured output
 * 
 * - If `schema` is provided: parses response as JSON, validates with Zod, returns typed output
 * - If `schema` is omitted: returns raw text output
 */
export async function generate_llm_response<T>(
  params: GenerateLLMParams<T>
): Promise<LLMStructuredResponse<T> | LLMTextResponse> {
  const {
    db,
    model,
    user_id,
    messages,
    prompt_file_id,
    context,
    max_retries = 3,
    save_to_db = true,
    temperature = 1,
  } = params

  const schema = "schema" in params ? params.schema : undefined
  const is_structured = schema !== undefined

  const log_prefix = `[OpenRouter][${model.id}][${context}]`
  const model_id = model.id
  const model_info = get_model_by_id(model_id)!

  const api_key = await get_user_openrouter_key(db, user_id)

  console.log(`${log_prefix} Starting ${is_structured ? "structured" : "text"} request.`)

  // Transform messages to OpenRouter Responses API format
  const openrouter_input = messages.map((msg) => ({
    type: "message" as const,
    role: msg.role,
    content: msg.content,
  }))

  let request_body: OpenRouterRequestBody = {
    model: model_id,
    input: openrouter_input,
    temperature,
    reasoning: get_reasoning_config(model),
    provider: {
      only: [model_info.provider],
    },
    user: user_id,
    text: {
      verbosity: "high",
      format: {
        type: "text"
      }
    }
    // plugins: [{ id: "response-healing" }],
  }
  if (schema) {
    request_body["text"].format = {
      type: "json_schema",
      strict: true,
      name: `${context}-schema`,
      schema: schema.toJSONSchema(),
    }
  }
  if (model_info.max_output_tokens) {
    request_body["max_output_tokens"] = model_info.max_output_tokens
  }

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    const start_time = performance.now()
    console.log(`${log_prefix} attempt ${attempt}/${max_retries}`)

    try {
      const response = await fetch("https://openrouter.ai/api/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://bolzano.app",
          "X-Title": "Bolzano",
        },
        body: JSON.stringify(request_body),
      })

      const elapsed = (performance.now() - start_time) / 1000
      console.log(`${log_prefix} Response: status=${response.status}, time=${elapsed.toFixed(2)}s`)

      if (!response.ok) {
        const error_text = await response.text()
        console.error(`${log_prefix} API error:`, error_text.slice(0, 1000))
        throw new Error(`API error ${response.status}`)
      }
      
      const data = (await response.json()) as OpenRouterAPIResponse
      const time = (performance.now() - start_time) / 1000

      const extracted = extract_text_output(data)
      if (!extracted) {
        console.error(`${log_prefix} No text output.`)
        throw new Error("No text output in response")
      }
      console.log(`${log_prefix} Text output: ${extracted.text.length} chars`)

      const usage = data.usage

      let output: T | string
      if (is_structured && schema) {
        output = parse_json_output(extracted.text, schema, log_prefix)
      } else {
        output = extracted.text
      }

      if (save_to_db) {
        await save_llm_log(db, prompt_file_id, { output, request_body }, usage, model_id)
      }

      if (is_structured) {
        return {
          success: true,
          output: output as T,
          usage,
          time,
          model_id,
        } as LLMStructuredSuccessResponse<T>
      } else {
        return {
          success: true,
          output: output as string,
          usage,
          time,
          model_id,
        } as LLMTextSuccessResponse
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      console.warn(`${log_prefix} [${attempt}/${max_retries}] Failed: ${error.message}`)

      if (attempt === max_retries) {
        console.error(`${log_prefix} All retries exhausted`)
        return { success: false, error, model_id }
      }
      console.log(`${log_prefix} Retrying...`)
    }
  }

  return { success: false, error: new Error("Unexpected error"), model_id }
}
