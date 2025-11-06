import { useState, useEffect } from "react"
import { styled } from "@linaria/react"
import Markdown from "../Markdown"
import BracketButton from "../action/BracketButton"

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

export default function ProblemRounds({ rounds }: Props) {
  const [curr_round, setCurrRound] = useState(rounds.length - 1)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [setup, setSetup] = useState<{title: string, content: string | {name: string, content: string}[] }[]>([])

  useEffect(() => {
    setSetup([
        {
          title: "🤖 Prover",
          content: rounds[curr_round].provers,
        },
        {
          title: "🔍 Verifier",
          content: rounds[curr_round].verifier,
        },
        {
          title: "📝 Summary",
          content: rounds[curr_round].summary,
        }
    ])
  }, [curr_round])

  return (
    <RoundsSection>
      <RoundSwitcher>
        <h2>Showing Round <span>#</span>{curr_round + 1}</h2>
        {rounds.length > 1 && (
          <div>
            <p>Switch to round:</p>
            {rounds.map((_, i) => (
              <BracketButton disabled={i == curr_round}
                onClick={() => setCurrRound(i)}>
                {i + 1}
              </BracketButton>
            ))}
          </div>
        )}
      </RoundSwitcher>
      <Conversations>
        {expanded === null ? (
          <>
            {setup.map((conversation, i) => (
              <Conversation title={conversation.title}
                content={conversation.content}
                onExpand={() => setExpanded(i)}/>
            ))}
          </>
        ) : (
          <Conversation title={setup[expanded].title}
            content={setup[expanded].content}
            expanded
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
  title: string,
  content: string | { name: string, content: string }[],
  onExpand?: () => void,
  onShrink?: () => void,
  expanded?: boolean,
}

function Conversation({ title, content, expanded, onExpand, onShrink }: ConversationProps) {
  const [curr_prover, setCurrProver] = useState(0)

  return (
    <ConversationCol>
      <ConversationHeader>
        <h3>{title}</h3>
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
          {Array.isArray(content) ? (
            <>
              {content.length > 1 && (
                <SwitchProver>
                  Switch prover to:
                  {content.map((_, i) => (
                    <BracketButton disabled={i == curr_prover}
                      onClick={() => setCurrProver(i)}>
                      {i + 1}
                    </BracketButton>
                  ))}
                </SwitchProver>
              )}
              <Markdown md={content[curr_prover].content}/>
            </>
          ) : (
            <Markdown md={content}/>
          )}
        </>
      )}
    </ConversationCol>
  )
}

const SwitchProver = styled.div`
  display: flex;
  padding: .5rem 1rem;
  gap: .5rem;
  border-bottom: var(--border-alpha);
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
  `

const ConversationHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border-alpha);
  padding: .3rem .6rem;
`