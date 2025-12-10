import { useMemo, useState } from "react"
import { styled } from "@linaria/react"

import Markdown from "../../../components/Markdown"
import JSONViewer from "../../../components/JSONViewer"

interface Props {
  name: string
  content: string
  subtitle?: string
  model_id?: string
  cost?: number
}

function try_parse_json(content: string): { is_json: boolean, parsed: unknown } {
  if (!content) return { is_json: false, parsed: null }
  const trimmed = content.trim()
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { is_json: false, parsed: null }
  }
  try {
    const parsed = JSON.parse(trimmed)
    return { is_json: true, parsed }
  } catch {
    return { is_json: false, parsed: null }
  }
}

export default function FileContentViewer({ name, content, subtitle, model_id, cost }: Props) {
  const [curr_view, setCurrView] = useState<"formatted" | "raw">("formatted")

  const { is_json, parsed } = useMemo(() => try_parse_json(content), [content])

  return (
    <Viewer>
      <Header>
        <h2>{name}</h2>

        {!is_json && (
          <ViewToggle>
            <button
              className={curr_view === "formatted" ? "active" : ""}
              onClick={() => setCurrView("formatted")}>
              Formatted
            </button>
            <button
              className={curr_view === "raw" ? "active" : ""}
              onClick={() => setCurrView("raw")}>
              Raw
            </button>
          </ViewToggle>
        )}

        {(model_id || cost !== undefined) && (
          <>
            {model_id && <span>{model_id}</span>}
            {cost !== undefined && <span>${cost.toFixed(3)}</span>}
          </>
        )}
      </Header>
      <Content>
        {is_json
          ? <JSONViewer raw_json={parsed}/>
          : curr_view === "formatted"
            ? <Markdown md={content || "--THIS FILE IS EMPTY--"}/>
            : <pre className="raw">{content || "--THIS FILE IS EMPTY--"}</pre>
        }
      </Content>
    </Viewer>
  )
}

const ViewToggle = styled.div`
  display: flex;
  border: var(--border-alpha);
  border-radius: .25rem;
  overflow: hidden;
  & > button {
    padding: .3rem .6rem;
    font-size: .85rem;
    font-weight: 500;
    background: transparent;
    color: var(--text-gamma);
    transition: all .15s ease;
    text-transform: uppercase;
    &:not(:last-child) {
      border-right: var(--border-alpha);
    }
    &:hover:not(.active) {
      background: var(--bg-alpha);
      color: var(--text-beta);
    }
    &.active {
      background: var(--bg-gamma);
      color: var(--text-alpha);
      pointer-events: none;
    }
  }
`

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .75rem;
  padding: .6rem 1rem;
  background: var(--bg-beta);
  border-bottom: var(--border-alpha);
  height: 3.5rem;
  & > h2 {
    font-family: Kode;
    font-size: 1rem;
    text-transform: uppercase;
    color: var(--accent-alpha);
    margin-right: auto;
  }
  & > span {
    font-family: Kode;
    font-size: .8rem;
    color: var(--text-gamma);
    padding: .2rem .5rem;
    border-radius: .2rem;
    background: var(--bg-alpha);
    border: var(--border-alpha);
    & > span.currency {
      color: var(--accent-alpha);
    }
  }
`

const Content = styled.div`
  flex: 1;
  & > pre.raw {
    padding: 1rem;
    font-size: .8rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    background: var(--bg-alpha);
  }
`

export const Viewer = styled.section`
  flex: 1;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  &.center {
    align-items: center;
    justify-content: center;
  }
`
