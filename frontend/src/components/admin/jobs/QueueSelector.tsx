import { styled } from "@linaria/react"

import { type QueueState, format_name } from "@shared/admin/jobs"
import type { QueueName } from "@backend/jobs"

interface QueueSelectorProps {
  queues: Record<QueueName, QueueState>,
  selected_queue: QueueName,
  onChangeQueue: (new_queue: QueueName) => void,
}

export default function QueueSelector({
  queues,
  onChangeQueue,
  selected_queue,
}: QueueSelectorProps) {
  return (
    <QueueSelectionList>
      {(Object.keys(queues) as QueueName[]).map(name => {
        return (
          <QueueButton
            key={name}
            onClick={() => onChangeQueue(name)}
            className={selected_queue === name ? "selected_queue" : ""}>
            {format_name(name)}
            {queues[name].counts.running > 0 && (
              <span>{queues[name].counts.running}</span>
            )}
          </QueueButton>
        )
      })}
    </QueueSelectionList>
  )
}

const QueueSelectionList = styled.div`
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--bg-gamma);
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  border-top: var(--border-beta);
  border-bottom: var(--border-beta);
  &::-webkit-scrollbar {
    display: none;
  }
`

const QueueButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem .8rem;
  border-radius: .5rem;
  font-weight: 500;
  font-size: 0.9rem;
  &:hover {
    color: var(--text-beta);
  }
  &.selected_queue {
    box-shadow: 0 .05rem .1rem rgba(0,0,0,0.2);
    color: var(--text-beta);
    background: var(--bg-alpha);
    &:hover {
      pointer-events: none;
    }
    & span {
      background: var(--accent-alpha);
      color: var(--bg-alpha);
    }
  }
  & span {
    font-family: Kode;
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
    border-radius: .2rem;
    font-weight: 600;
    background: var(--bg-beta);
  }
`