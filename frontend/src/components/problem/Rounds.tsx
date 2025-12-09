import { useState, useMemo } from "react"
import { styled } from "@linaria/react"
import BracketButton from "../action/BracketButton"
import { ResearchRound } from "@shared/types/problem"
import Conversation, { ConversationConfig } from "./Conversation"

interface Props {
  rounds: ResearchRound[],
  curr_round: number,
  onRoundChange: (round: number) => void
}

export default function ProblemRounds({ rounds, curr_round, onRoundChange }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const conversation_config = useMemo<ConversationConfig[]>(() => {
    const round_index = Math.min(Math.max(0, curr_round), rounds.length - 1)
    const round = rounds[round_index]

    if (!round) return []

    return [
      {
        title: "🤖 Prover",
        content: round.provers,
        raw: false,
        math_renderer: "KaTeX",
      },
      {
        title: "🔍 Verifier",
        content: round.verifier,
        raw: false,
        math_renderer: "KaTeX",
      },
      {
        title: "📝 Summary",
        content: round.summarizer,
        verdict: round.verdict,
        raw: false,
        math_renderer: "KaTeX",
      }
    ]
  }, [rounds, curr_round])

  const [conversation_state, setConversationState] = useState<ConversationConfig[]>(conversation_config)

  useMemo(() => {
    setConversationState(conversation_config)
  }, [conversation_config])

  function switchFormatting(cnv_index: number) {
    setConversationState(cnvs => cnvs.map((col, i) => {
      if (i === cnv_index) return { ...col, raw: !col.raw }
      return col
    }))
  }

  function switchMathRendering(cnv_index: number) {
    setConversationState(cnvs => cnvs.map((col, i) => {
      if (i === cnv_index) return {
        ...col,
        math_renderer: col.math_renderer === "KaTeX" ? "MathJax" : "KaTeX"
      }
      return col
    }))
  }

  return (
    <RoundsSection>
      {rounds.length > 1 && (
        <RoundSwitcher>
          <p>Switch to round:</p>
          {rounds.map((_, i) => (
            <BracketButton disabled={i === curr_round}
              onClick={() => onRoundChange(i)}
              key={i}>
              {i + 1}
            </BracketButton>
          ))}
        </RoundSwitcher>
      )}
      <Conversations>
        {expanded === null ? (
          <>
            {conversation_state.map((config, i) => (
              <Conversation
                key={config.title}
                conversation={config}
                onExpand={() => setExpanded(i)}
                onSwitchFormatting={() => switchFormatting(i)}
                onSwitchMathRendering={() => switchMathRendering(i)}
              />
            ))}
          </>
        ) : (
          <Conversation
            key={conversation_state[expanded].title}
            conversation={conversation_state[expanded]}
            expanded
            onSwitchFormatting={() => switchFormatting(expanded)}
            onSwitchMathRendering={() => switchMathRendering(expanded)}
            onShrink={() => setExpanded(null)}
          />
        )}
      </Conversations>
    </RoundsSection>
  )
}

const RoundSwitcher = styled.div`
  display: flex;
  align-items: flex-end;
  gap: .4rem;
  padding: .5rem .75rem;
  background: var(--bg-beta);
  border-bottom: var(--border-alpha);
  & p {
    font-family: Kode;
    font-weight: 600;
    text-transform: uppercase;
    font-size: .8rem;
    color: var(--text-alpha);
  }
`

const Conversations = styled.div`
  flex: 1;
  display: flex;
  max-width: 100%;
`

const RoundsSection = styled.section`
  flex: 1;
  display: flex;
  flex-flow: column;
  width: 100%;
`