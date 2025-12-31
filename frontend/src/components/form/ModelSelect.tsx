import { useState, useRef } from "react"
import { Select, ListBox, Header, Switch, Button, Separator, Tooltip } from "@heroui/react"
import { Icon } from "@iconify/react"
import { z } from "zod"

import { models, get_model_by_id, provider_details } from "@shared/types/research"
import type { ModelID, ReasoningEffort, ReasoningConfig, ReasoningEffortValue, Provider, ModelConfig } from "@shared/types/research"
import ProviderLogo from "@frontend/components/svg/ProviderLogo"
import ReasoningTag from "@frontend/components/problem/ReasoningTag"
import WebSearchTag from "@frontend/components/problem/WebSearchTag"

interface ModelSelectProps {
  selected?: ModelConfig,
  onChange: (value: ModelConfig) => void,
  trigger_style?: string,
}

export default function ModelSelect({ selected, onChange, trigger_style }: ModelSelectProps) {
  const [is_open, setIsOpen] = useState(false)
  const new_model_selected = useRef(false)

  const selected_model = selected?.id ? get_model_by_id(selected.id) : null
  const selected_reasoning = selected ? selected.config.reasoning_effort : null
  const selected_web_search = selected ? selected.config.web_search : false

  const reasoning_config = selected_model? selected_model.config.reasoning : null
  const is_toggle_reasoning = reasoning_config === "toggle"
  const is_effort_reasoning = Array.isArray(reasoning_config)
  const supports_reasoning = is_toggle_reasoning || is_effort_reasoning

  const supports_web_search = !!selected_model?.config.web_search

  function handle_model_change(new_id: ModelID) {
    new_model_selected.current = true
    const new_model = get_model_by_id(new_id)!
    const new_reasoning_config = new_model.config.reasoning as ReasoningConfig
    onChange({
      id: new_id,
      config: {
        reasoning_effort: get_default_reasoning(new_reasoning_config),
        web_search: false,
      },
    })
  }

  function handle_reasoning_change(new_value: ReasoningEffortValue) {
    if (!selected) return
    onChange({
      ...selected,
      config: {
        ...selected.config,
        reasoning_effort: new_value
      }
    })
  }

  function handle_web_search_change(new_value: boolean) {
    if (!selected) return
    onChange({
      ...selected,
      config: {
        ...selected.config,
        web_search: new_value
      }
    })
  }

  function handle_open_change(open: boolean) {
    if (new_model_selected.current) new_model_selected.current = false
    else setIsOpen(open)
  }

  return (
    <Select
      className="w-3xs"
      placeholder="Select a model"
      value={selected?.id ?? null}
      onChange={model_id => handle_model_change(model_id as ModelID)}
      aria-label="Model"
      isOpen={is_open}
      onOpenChange={handle_open_change}>
      <Select.Trigger className={trigger_style}>
        <Select.Value className="flex justify-between min-w-0">
          <p className="truncate block!">
            {selected_model
              ? selected_model.name
              : "Select model"}
          </p>
          <div className="flex gap-1.5 align-center -my-1">
            {/* TODO: also check for those that are reasoning by default but cant be disabled */}
            {selected_reasoning && (
              <Tooltip delay={0} closeDelay={0}>
                <Tooltip.Trigger>
                  <ReasoningTag reasoning={selected_reasoning}
                    size="sm"/>
                </Tooltip.Trigger>
              <Tooltip.Content showArrow
                  className={
                    selected_reasoning === "none"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }>
                  <Tooltip.Arrow className={
                    selected_reasoning === "none"
                      ? "[&_svg]:fill-rose-100"
                      : "[&_svg]:fill-amber-100"
                  }/>
                  <p>
                    {selected_reasoning === true
                      ? "Reasoning Enabled"
                      : selected_reasoning === "none"
                        ? "Reasoning Disabled"
                        : "Reasoning Enabled with Effort Level"}
                  </p>
                </Tooltip.Content>
              </Tooltip>
            )}
            {/* TODO: it's production ready but web_search not implemented in backend */}
            {/* {selected_web_search && (
              <Tooltip delay={0} closeDelay={0}>
                <Tooltip.Trigger>
                  <WebSearchTag enabled={selected_web_search}
                    size="sm"/>
                </Tooltip.Trigger>
                <Tooltip.Content showArrow
                  className="bg-sky-100 text-sky-900">
                  <Tooltip.Arrow className="[&_svg]:fill-sky-100"/>
                  <p>Web Search Enabled</p>
                </Tooltip.Content>
              </Tooltip>
            )} */}
          </div>
        </Select.Value>
        <Select.Indicator/>
      </Select.Trigger>

      <Select.Popover className="flex flex-col w-xs">
        <ListBox className="overflow-y-auto">
          {Object.entries(models).map(([provider, provider_models], idx) => (
            <ListBox.Section key={provider}>
              {idx > 0 && <Separator className="my-1"/>}
              <Header className="flex gap-1.5 align-center font-semibold">
                <ProviderLogo model_id={provider}/>
                {provider_details[provider as Provider].name}
              </Header>

              {provider_models.map(model => {
                const is_selected = selected?.id === model.id
                return (
                  <ListBox.Item
                    key={model.id}
                    id={model.id}
                    textValue={model.name}
                    className={`flex justify-between ${
                      is_selected ? "bg-(--accent-alpha)/10" : ""
                    }`}
                    >
                    <div className="flex flex-col">
                      <p className={`font-medium ${
                          is_selected ? "text-(--accent-alpha)" : ""
                        }`}
                      >
                      {model.name}
                      </p>
                      <p className="flex gap-1.5 text-xs">
                        in <span className="font-medium">${model.price.input}</span>
                        <span>–</span>
                        out <span className="font-medium">${model.price.output}</span>
                        {/* TODO: it's production ready but web_search not implemented in backend */}
                        {/* {"search" in model.price && (
                          <>
                            <span>–</span>
                            search <span className="font-medium">${model.price.search}</span>
                          </>
                        )} */}
                      </p>
                    </div>
                    {is_selected && (
                      <Icon icon="ph:check-bold" className="text-(--accent-alpha)"/>
                    )}
                  </ListBox.Item>
                )
              })}
            </ListBox.Section>
          ))}
        </ListBox>
        
        {selected && (
          <div className="px-3 py-2.5 flex flex-col gap-2.5 bg-beta">
            {(supports_reasoning || supports_web_search) && (
              <div className="flex justify-between">
                {is_toggle_reasoning && (
                  <div className="flex items-center gap-2">
                    <Switch
                      size="sm"
                      isSelected={selected_reasoning === true}
                      onChange={handle_reasoning_change}>
                      <p className="text-xs uppercase kode font-semibold">Reasoning</p>
                      <Switch.Control>
                        <Switch.Thumb/>
                      </Switch.Control>
                    </Switch>
                  </div>
                )}

                {is_effort_reasoning && (
                  <div className="flex align-center gap-2">
                    <p className="text-xs kode uppercase font-semibold">Reasoning</p>
                    <select
                      className="px-2 py-1 text-xs border-alpha rounded-md cursor-pointer bg-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                      value={selected_reasoning as ReasoningEffort}
                      onChange={e => handle_reasoning_change(e.target.value as ReasoningEffort)}>
                      {(reasoning_config as ReasoningEffort[]).toReversed().map(effort => (
                        <option key={effort} value={effort}>{effort}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* TODO: it's production ready but web_search not implemented in backend */}
                {/* {supports_web_search && (
                  <div className="flex items-center gap-2">
                    <Switch size="sm"
                      isSelected={selected_web_search}
                      onChange={handle_web_search_change}>
                      <p className="text-xs uppercase kode font-semibold">Web search</p>
                      <Switch.Control>
                        <Switch.Thumb/>
                      </Switch.Control>
                    </Switch>
                  </div>
                )} */}
              </div>
            )}

            <Button size="sm"
              className="w-full"
              onPress={() => setIsOpen(false)}>
              <Icon icon="ph:check-bold"/>
              Select
            </Button>
          </div>
        )}
      </Select.Popover>
    </Select>
  )
}

/**
 * Get the default reasoning value based on model config
 * @param config - the model's reasoning configuration
 * @returns `true` for toggle, `null` for no control, highest effort level
 */
function get_default_reasoning(config: ReasoningConfig): ReasoningEffortValue {
  if (config === null) return null
  if (config === "toggle") return true
  return config[config.length - 1]
}