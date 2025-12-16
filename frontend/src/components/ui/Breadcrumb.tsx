import { styled } from "@linaria/react"
import { Link } from "@tanstack/react-router"

export default styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: .3rem;
  svg {
    width: 1rem;
    opacity: .5;
  }
`

export const Item = styled(Link)`
  color: var(--text-alpha);
  padding: .2rem .3rem;
  margin: -.2rem -.3rem;
  border-radius: .2rem;
  font-weight: 500;
  &:hover {
    background: var(--bg-gamma);
    color: var(--accent-alpha);
  }
`

export const Current = styled.p`
  color: var(--text-beta);
  font-weight: 500;
`

export const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
