import { useState, useEffect } from "react"
import { styled } from "@linaria/react"
import Markdown from "../Markdown"
import BracketButton from "../action/BracketButton"
import { useMathJax } from "../../utils/hooks"

interface Props {
  rounds: ResearchRound[],
}

interface ResearchRound {
  name: string,
  // number of round for given research problem
  number: number,
  one_line_summary: string,
  provers: {
    name: string,
    content: string,
  }[],
  summary: string,
  verifier: string,
  // TODO: status & verdict type could be narrowed down
  status: string,
  verdict: string,
}

interface ConversationConfig {
  title: string,
  content: string | {
    name: string,
    content: string
  }[],
  verdict?: string,
  raw: boolean,
  math_renderer: "KaTeX" | "MathJax"
}

// NOTE: Switching to different round/prover is slow because Markdown rendering is slow
export default function ProblemRounds({ rounds }: Props) {
  const [curr_round, setCurrRound] = useState(rounds.length - 1)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [conversation, setConversation] = useState<ConversationConfig[]>([
    {
      title: "🤖 Prover",
      content: rounds[curr_round].provers,
      raw: false,
      math_renderer: "KaTeX",
    },
    {
      title: "🔍 Verifier",
      content: rounds[curr_round].verifier,
      raw: false,
      math_renderer: "KaTeX",
    },
    {
      title: "📝 Summary",
      content: rounds[curr_round].summary,
      verdict: rounds[curr_round].verdict,
      raw: false,
      math_renderer: "KaTeX",
    }
  ])

  useEffect(() => {
    setConversation(cnvs => {
      cnvs[0].content = rounds[curr_round].provers
      cnvs[1].content = rounds[curr_round].verifier
      cnvs[2].content = rounds[curr_round].summary
      cnvs[2].verdict = rounds[curr_round].verdict
      return [...cnvs]
    })
  }, [curr_round])

  function switchFormatting(cnv_index: number) {
    setConversation(cnv => cnv.map((col, i) => {
      if (i === cnv_index) return { ...col, raw: !col.raw }
      return col
    }))
  }

  function switchMathRendering(cnv_index: number) {
    setConversation(cnv => cnv.map((col, i) => {
      if (i === cnv_index) return { ...col, math_renderer: col.math_renderer === "KaTeX" ? "MathJax" : "KaTeX" }
      return col
    }))
  }

  return (
    <RoundsSection>
      <RoundSwitcher>
        {rounds.length > 1 && (
          <div>
            <p>Switch to round:</p>
            {rounds.map((_, i) => (
              <BracketButton disabled={i == curr_round}
                onClick={() => setCurrRound(i)}
                key={i}>
                {i + 1}
              </BracketButton>
            ))}
          </div>
        )}
      </RoundSwitcher>
      <Conversations>
        {expanded === null ? (
          <>
            {conversation.map((conversation, i) => (
              <Conversation conversation={conversation}
                onExpand={() => setExpanded(i)}
                onSwitchFormatting={() => switchFormatting(i)}
                onSwitchMathRendering={() => switchMathRendering(i)}
                key={conversation.title}/>
            ))}
          </>
        ) : (
          <Conversation conversation={conversation[expanded]}
            expanded
            onSwitchFormatting={() => switchFormatting(expanded)}
            onSwitchMathRendering={() => switchMathRendering(expanded)}
            onShrink={() => setExpanded(null)}/>
        )}
      </Conversations>
    </RoundsSection>
  )
}

const RoundSwitcher = styled.div`
  display: flex;
  flex-flow: column;
  gap: 1rem;
  padding: 1rem;
  & h2 {
    & span {
      color: var(--text-alpha);
      margin-left: .2rem;
    }
  }
  & div {
    display: flex;
    gap: .5rem;
  }
`

const Conversations = styled.div`
  flex: 1;
  display: flex;
  max-width: 100%;
  /* flex-wrap: wrap; */
  border-top: var(--border-alpha);
`

const RoundsSection = styled.section`
  flex: 1;
  display: flex;
  flex-flow: column;
  width: 100%;
`

interface ConversationProps {
  conversation: ConversationConfig,
  onExpand?: () => void,
  onShrink?: () => void,
  expanded?: boolean,
  onSwitchFormatting?: () => void,
  onSwitchMathRendering?: () => void,
}

function Conversation({ conversation, conversation: { content, verdict }, expanded, onExpand, onShrink, onSwitchFormatting, onSwitchMathRendering }: ConversationProps) {
  const [curr_prover, setCurrProver] = useState(0)

  // NOTE: possible verdicts are specified in prompt verifier.md
  const verdicts: { [index: string]: string } = {
    promising: "✅ Promising progress",
    uncertain: "⚠️  Unclear direction",
    unlikely: "❌ Approach unlikely"
  }

  // If you switch from round with multiple provers to round with less provers, you index array out of bounds
  useEffect(() => {
    setCurrProver(0)
  }, [content])

  // const { scriptLoaded: mathjaxLoaded, typeset } = useMathJax(conversation.math_renderer === "MathJax")
  // TODO: possibly make the mathjax hook work
  useEffect(() => {
    // if (mathjaxLoaded) typeset();
    MathJax.typesetPromise()
  }, [conversation.math_renderer, conversation.raw]);
  // }, [mathjaxLoaded, typeset, conversation.math_renderer, conversation.raw]);

  return (
    <ConversationCol>
      <ConversationHeader>
        <h3>{conversation.title}</h3>
        {expanded === true ? (
          <BracketButton onClick={onShrink}>Shrink</BracketButton>
        ) : (
          <BracketButton onClick={onExpand}>Expand</BracketButton>
        )}
      </ConversationHeader>
      {content.length === 0 ? (
        <p className="not_available">Not available.</p>
      ) : (
        <>
          <ConversationHeader>
            <h4>⚙️ Settings</h4>
            <BracketButton>Show Prompt</BracketButton>
            <BracketButton onClick={onSwitchFormatting}>
              {conversation.raw ? "Formatted" : "RAW"}
            </BracketButton>
            <BracketButton onClick={onSwitchMathRendering}
              disabled={conversation.raw}>
              Switch to {conversation.math_renderer === "KaTeX" ? "MathJax" : "KaTeX"}
            </BracketButton>
          </ConversationHeader>
          {Array.isArray(content) ? (
            <>
              {content.length > 1 && (
                <ConversationDetails>
                  Switch prover to:
                  {content.map((_, i) => (
                    <BracketButton disabled={i == curr_prover}
                      onClick={() => setCurrProver(i)}>
                      {i + 1}
                    </BracketButton>
                  ))}
                </ConversationDetails>
              )}
              {conversation.raw ? (
                <pre>{content[curr_prover].content}</pre>
              ) : (
                <Markdown md={content[curr_prover].content}
                  render_math={conversation.math_renderer === "KaTeX"}/>
              )}
            </>
          ) : (
            <>
              {verdict && (
                <ConversationDetails>
                  <p className={verdict}>
                    {verdicts[verdict] || verdict}
                  </p>
                </ConversationDetails>
              )}
              {conversation.raw ? (
                <pre>{content}</pre>
              ) : (
                <Markdown md={content}
                  render_math={conversation.math_renderer === "KaTeX"}/>
              )}
            </>
          )}
        </>
      )}
    </ConversationCol>
  )
}

const ConversationDetails = styled.div`
  display: flex;
  padding: .5rem 1rem;
  gap: .5rem;
  border-bottom: var(--border-alpha);
  & > p {
    font-weight: 600;
    &.promising {
      color: #28a745;
    }
    &.uncertain {
      color: #856404;
    }
    &.unlikely {
      color: #6c757d;
    }
  }
`

const ConversationCol = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  min-width: 0;
  display: flex;
  flex-flow: column;
  &:not(:last-of-type) {
    border-right: var(--border-alpha);
  }
  &.expanded {
    color: red;
  }
  & p.not_available {
    padding: .6rem;
  }
  & pre {
    padding: 1rem;
  }
`

const ConversationHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .2rem .4rem;
  border-bottom: var(--border-alpha);
  padding: .3rem .6rem;
  & h3, h4 {
    margin-right: auto;
  }
`