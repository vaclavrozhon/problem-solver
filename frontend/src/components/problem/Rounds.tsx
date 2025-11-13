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

// NOTE: Switching to different round/prover is slow because Markdown rendering is slow
export default function ProblemRounds({ rounds }: Props) {
  const [curr_round, setCurrRound] = useState(rounds.length - 1)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [setup, setSetup] = useState<{title: string, content: string | {name: string, content: string}[], verdict?: string }[]>([])

  console.log("rounds", rounds)

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
          verdict: rounds[curr_round].verdict,
        }
    ])
  }, [curr_round])

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
            {setup.map((conversation, i) => (
              <Conversation conversation={conversation}
                onExpand={() => setExpanded(i)}
                key={conversation.title}/>
            ))}
          </>
        ) : (
          <Conversation conversation={setup[expanded]}
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
  conversation: {
    title: string,
    content: string | { name: string, content: string }[],
    verdict?: string,
  },
  onExpand?: () => void,
  onShrink?: () => void,
  expanded?: boolean,
}

function Conversation({ conversation: { title, content, verdict }, expanded, onExpand, onShrink }: ConversationProps) {
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
              <Markdown md={content[curr_prover]?.content}/>
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
              <Markdown md={content}/>
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
`

const ConversationHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border-alpha);
  padding: .3rem .6rem;
`