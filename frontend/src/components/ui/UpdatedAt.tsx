import { styled } from "@linaria/react"

const CircleArrowIcon = () => (
  <svg viewBox="0 0 25 25"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

interface UpdatedAtProps {
  is_fetching: boolean,
  updated_at: number,
}

export default function UpdatedAt({ is_fetching, updated_at }: UpdatedAtProps) {
  const last_update = new Date(updated_at).toLocaleTimeString("cs-CZ")
  return (
    <LastUpdate className={is_fetching ? "fetching" : ""}>
      <CircleArrowIcon/>
      <p className="kode">Updated {last_update}</p>
    </LastUpdate>
  )
}

const LastUpdate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-alpha);
  &.fetching svg {
    display: unset;
    animation: spin 1s linear infinite;
    fill: var(--bg-alpha);
  }
  & svg {
    display: none;
    width: .8rem;
    height: .8rem;
  }
  & p {
    font-weight: 500;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`