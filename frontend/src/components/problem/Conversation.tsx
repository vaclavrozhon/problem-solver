import { useState, useMemo, useEffect } from "react"
import { styled } from "@linaria/react"
import Markdown from "../Markdown"
import BracketButton from "../action/BracketButton"

export interface FileContent {
  output: string,
  reasoning?: string,
  usage: number | null,
  model: string | null
}

export interface ConversationConfig {
  title: string,
  content?: FileContent | FileContent[],
  verdict?: string,
  raw: boolean,
  math_renderer: "KaTeX" | "MathJax"
}

interface ConversationProps {
  conversation: ConversationConfig,
  onExpand?: () => void,
  onShrink?: () => void,
  expanded?: boolean,
  onSwitchFormatting?: () => void,
  onSwitchMathRendering?: () => void,
}

const VERDICTS: Record<string, string> = {
  promising: "✅ Promising progress",
  uncertain: "⚠️ Unclear direction",
  unlikely: "❌ Approach unlikely"
}

export default function Conversation({
  conversation,
  expanded,
  onExpand,
  onShrink,
  onSwitchFormatting,
  onSwitchMathRendering
}: ConversationProps) {
  const { content, verdict, title, raw, math_renderer } = conversation;
  const [current_prover_index, setCurrProver] = useState(0)
  const [show_reasoning, setShowReasoning] = useState(false)

  // Reset current prover when content changes to avoid out-of-bounds
  useEffect(() => {
    setCurrProver(0)
  }, [content])

  // MathJax integration
  useEffect(() => {
    if (window.MathJax?.typesetPromise && math_renderer === "MathJax") {
      console.log("MathJax typesetting")
      window.MathJax.typesetPromise()
    }
  }, [math_renderer, raw, content, current_prover_index, show_reasoning]);

  const activeContent = Array.isArray(content) ? content[current_prover_index] : content;

  if (!content) {
    return (
      <ConversationCol className={expanded ? "expanded" : ""}>
        <Header title={title} expanded={expanded} onExpand={onExpand} onShrink={onShrink} />
        <p className="not_available">Not available.</p>
      </ConversationCol>
    )
  }

  return (
    <ConversationCol className={expanded ? "expanded" : ""}>
      <Header title={title} expanded={expanded} onExpand={onExpand} onShrink={onShrink} />

      {Array.isArray(content) && content.length > 1 && (
        <ProverSwitcher
          count={content.length}
          current={current_prover_index}
          onChange={setCurrProver}
        />
      )}

      {activeContent && (
        <>
          <ModelUsage content={activeContent} />
          <SettingsHeader
            raw={raw}
            math_renderer={math_renderer}
            onSwitchFormatting={onSwitchFormatting}
            onSwitchMathRendering={onSwitchMathRendering}
            />
          <ReasoningSection
            content={activeContent}
            show_reasoning={show_reasoning}
            onToggle={() => setShowReasoning(prev => !prev)}
            math_renderer={math_renderer}
            />
          {verdict && !Array.isArray(content) && (
            <VerdictDisplay verdict={verdict} />
          )}

          <ContentOutput
            content={activeContent.output}
            raw={raw}
            math_renderer={math_renderer}
          />
        </>
      )}
    </ConversationCol>
  )
}

function Header({ title, expanded, onExpand, onShrink }: { title: string, expanded?: boolean, onExpand?: () => void, onShrink?: () => void }) {
  return (
    <ConversationRow className="header">
      <h3>{title}</h3>
      <BracketButton onClick={expanded ? onShrink : onExpand}>
        {expanded ? "Shrink" : "Expand"}
      </BracketButton>
    </ConversationRow>
  )
}

function SettingsHeader({ raw, math_renderer, onSwitchFormatting, onSwitchMathRendering }: {
  raw: boolean,
  math_renderer: string,
  onSwitchFormatting?: () => void,
  onSwitchMathRendering?: () => void
}) {
  return (
    <ConversationRow className="space-between">
      <span>⚙️ Settings</span>
      {!raw && (
        <BracketButton onClick={onSwitchMathRendering}>
          Switch to {math_renderer === "KaTeX" ? "MathJax" : "KaTeX"}
        </BracketButton>
      )}
      <BracketButton onClick={onSwitchFormatting}>
        {raw ? "Formatted" : "RAW"}
      </BracketButton>
    </ConversationRow>
  )
}

function ProverSwitcher({ count, current, onChange }: { count: number, current: number, onChange: (i: number) => void }) {
  return (
    <ConversationRow className="prover-selection">
      <span>Switch to prover:</span>
      {Array.from({ length: count }).map((_, i) => (
        <BracketButton
          key={i}
          disabled={i === current}
          onClick={() => onChange(i)}>
          {i + 1}
        </BracketButton>
      ))}
    </ConversationRow>
  )
}

function VerdictDisplay({ verdict }: { verdict: string }) {
  return (
    <ConversationRow>
      <p className={`verdict ${verdict}`}>
        {VERDICTS[verdict] || verdict}
      </p>
    </ConversationRow>
  )
}

function ModelUsage({ content }: { content: FileContent }) {
  return (
    <div className="model-usage">
      {content.model && (
        <p className="model-id">{content.model}</p>
      )}
      {content.usage !== null && (
        <p className="usage-cost">${content.usage.toFixed(3)}</p>
      )}
    </div>
  )
}

function ReasoningSection({ content, show_reasoning, onToggle, math_renderer }: {
  content: FileContent,
  show_reasoning: boolean,
  onToggle: () => void,
  math_renderer: "KaTeX" | "MathJax"
}) {
  const parsed_reasoning = useMemo(() => {
    if (!content.reasoning) return null
    try {
      const parsed = JSON.parse(content.reasoning)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch (e) {
      console.error("Failed to parse reasoning JSON", e)
      return null
    }
  }, [content.reasoning])

  if (!parsed_reasoning) return null

  return (
    <div className={`reasoning${show_reasoning ? " expanded" : ""}`}>
      <ConversationRow className="space-between">
        <span>🧠 Reasoning</span>
        <BracketButton onClick={onToggle}>
          {show_reasoning ? "Hide" : "Show"}
        </BracketButton>
      </ConversationRow>
      {show_reasoning && (
        <>
          {parsed_reasoning.map((step: any, idx: number) => (
            <div key={idx} className="reasoning-step">
              {(step.summary || step.text) && (
                <Markdown md={step.summary || step.text}
                  render_math={math_renderer === "KaTeX"}/>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function ContentOutput({ content, raw, math_renderer }: {
  content: string,
  raw: boolean,
  math_renderer: "KaTeX" | "MathJax"
}) {
  if (raw) return <RawContent>{content}</RawContent>;
  return <Markdown md={content} render_math={math_renderer === "KaTeX"} />;
}

const RawContent = styled.pre`
  padding: .75rem 1rem;
  line-height: 1.5;
  overflow-x: auto;
  flex: 1;
  overflow-y: auto;
  margin: 0;
  font-size: .8rem;
  color: var(--text-alpha);
`

const ConversationRow = styled.div`
  display: flex;
  align-items: center;
  padding: .4rem .75rem;
  gap: .4rem;
  border-bottom: var(--border-alpha);
  &.header {
    border-bottom: 2px dashed var(--border-alpha-color);
  }
  &.prover-selection {
    align-items: flex-end;
    background: var(--bg-beta);
  }
  &.space-between {
    & span {
      margin-right: auto;
    }
  }
  & > span {
    font-size: .8rem;
    color: var(--text-alpha);
    font-weight: 600;
    text-transform: uppercase;
    font-family: Kode;
  }
  & > p.verdict {
    font-weight: 600;
    font-size: .75rem;
    padding: .15rem .5rem;
    border-radius: 100rem;
    &.promising {
      color: #296b41;
      background: rgba(74, 222, 128, 0.12);
    }
    &.uncertain {
      color: #fbbf24;
      background: rgba(251, 191, 36, 0.12);
    }
    &.unlikely {
      color: #94a3b8;
      background: rgba(148, 163, 184, 0.12);
    }
  }
`

const ConversationCol = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  min-width: 0;
  display: flex;
  flex-flow: column;
  background: var(--bg-alpha);
  transition: flex-grow 0.2s ease;
  overflow: hidden;
  &:not(:last-of-type) {
    border-right: var(--border-alpha);
  }
  & p.not_available {
    padding: 1.5rem 1rem;
    color: var(--text-alpha);
    font-style: italic;
    text-align: center;
    font-size: .8rem;
  }
  & div.model-usage {
    font-family: Kode;
    display: flex;
    padding: .4rem .75rem;
    align-items: center;
    justify-content: space-between;
    border-bottom: var(--border-alpha);
    font-size: .8rem;
    font-weight: 600;
    background: var(--bg-beta);
    & p.model-id {
      color: var(--text-alpha);
    }
    & p.usage-cost {
      color: var(--accent-alpha);
      background: var(--bg-gamma);
      padding: .15rem .3rem;
      border-radius: .2rem;
      margin: -.1rem 0;
    }
  }
  & div.reasoning {
    display: flex;
    flex-flow: column;
    &.expanded {
      & div:first-child {
        border-bottom: 2px dashed var(--border-alpha-color);
      }
      & div.reasoning-step {
        background: var(--bg-beta);
        & article {
          gap: .3rem;
        }
        & p, a ,li {
          font-size: .8rem !important;
        }
        &:last-child {
          border-bottom: var(--border-alpha);
        }
      }
    }
  }
`

