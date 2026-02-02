import { useEffect, useMemo, useState } from "react"
import { Tabs, Tooltip } from "@heroui/react"
import { Icon } from "@iconify/react"

import Markdown from "../../../components/Markdown"
import JSONViewer from "../../../components/JSONViewer"
import { is_versioned_prompt, type PromptFileContent } from "@shared/types/problem"

type ParseResult =
  | { type: "versioned_prompt", data: PromptFileContent }
  | { type: "json", data: unknown }
  | { type: "plaintext" }

function parse_content(content: string): ParseResult {
  if (!content) return { type: "plaintext" }
  const trimmed = content.trim()
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { type: "plaintext" }
  }
  try {
    const parsed = JSON.parse(trimmed)
    if (is_versioned_prompt(parsed)) {
      return { type: "versioned_prompt", data: parsed }
    }
    return { type: "json", data: parsed }
  } catch {
    return { type: "plaintext" }
  }
}

interface ToggleOption<T extends string> {
  value: T,
  label: string,
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[],
  value: T,
  onChange: (value: T) => void,
  aria_label: string,
}

function ToggleGroup<T extends string>({ options, value, onChange, aria_label }: ToggleGroupProps<T>) {
  return (
    <Tabs
      selectedKey={value}
      onSelectionChange={(key) => onChange(key as T)}>
      <Tabs.ListContainer>
        <Tabs.List aria-label={aria_label}
          className="*:w-fit *:h-6 *:px-3 *:py-1.5 py-0.75 *:text-xs *:font-semibold bg-gamma *:data-[selected=true]:text-brand *:data-[selected=true]:pointer-events-none">
          {options.map(opt => (
            <Tabs.Tab key={opt.value} id={opt.value}>
              {opt.label}
              <Tabs.Indicator className="bg-brand/20"/>  
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}

type ContentViewFormat = "formatted" | "raw"

function TextContent({ text, view, empty_msg = "--EMPTY--" }: {
  text: string,
  view: ContentViewFormat,
  empty_msg?: string,
}) {
  const display = text || empty_msg
  return view === "formatted"
    ? <Markdown md={display}/>
    : <pre className="p-4 text-sm whitespace-pre-wrap wrap-break-word">{display}</pre>
}

interface FileContentViewerProps {
  file_id: string,
  name: string,
  content: string,
  subtitle?: string,
  model_id?: string,
  cost?: number,
}

export default function FileContentViewer({ name, content, model_id, cost, file_id }: FileContentViewerProps) {
  const default_view = name.includes(".prompt") ? "raw" : "formatted"
  const [view, setView] = useState<ContentViewFormat>(default_view)
  const [prompt_tab, setPromptTab] = useState<"system" | "user">("user")

  useEffect(() => setView(default_view), [default_view])

  const parsed = useMemo(() => parse_content(content), [content])
  const is_versioned = parsed.type === "versioned_prompt"
  const show_content_view_toggle = parsed.type !== "json"

  const display_content = parsed.type === "versioned_prompt"
    ? prompt_tab === "system"
      ? parsed.data.system_prompt
      : parsed.data.user_prompt
    : content

  return (
    <section key={name}
      className="flex-1 flex flex-col overflow-x-hidden">
      <header className="flex items-center gap-2 px-4 h-14 border-b-2 border-edge bg-beta">
        <h2 className="kode text-base text-brand mr-auto">{name}</h2>

        {is_versioned && (
          <ToggleGroup aria_label="Prompt type toggle"
            options={[
              { value: "user", label: "User prompt" },
              { value: "system", label: "System prompt" },
            ]}
            value={prompt_tab}
            onChange={setPromptTab}/>
        )}

        {show_content_view_toggle && (
          <ToggleGroup aria_label="Formatting toggle"
            options={[
              { value: "formatted", label: "Formatted" },
              { value: "raw", label: "Raw" },
            ]}
            value={view}
            onChange={setView}/>
        )}

        {model_id && (
          <p className="text-xs px-2 py-1 rounded-full bg-gamma">
            {model_id}
          </p>
        )}
        {cost !== undefined && (
          <p className="text-xs px-2 py-1 rounded-full bg-gamma">
            ${cost.toFixed(3)}
          </p>
        )}
        
        <Tooltip delay={0} closeDelay={0}>
          <Tooltip.Trigger className="bg-gamma p-2 rounded-full">
            <a href={`/api/problems/download/file/${file_id}`}
              download>
              <Icon icon="gravity-ui:arrow-down-to-square"/>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Arrow/>
            <p>Download current file</p>
          </Tooltip.Content>
        </Tooltip>
      </header>

      {parsed.type === "json"
        ? <JSONViewer raw_json={parsed.data}/>
        : <TextContent text={display_content} view={view}/>
      }
    </section>
  )
}
