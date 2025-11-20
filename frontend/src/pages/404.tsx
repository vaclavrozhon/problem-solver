import { useLocation } from "@tanstack/react-router"
import { styled } from "@linaria/react"

export default function PageNotFound() {
  const pathname = useLocation().pathname
  return (
    <MainContent>
      <p>Page <span>{pathname}</span> was not found!</p>
    </MainContent>
  )
}

const MainContent = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  gap: 1rem;
  & p {
    font-weight: 500;
    & span {
      font-style: italic;
      font-weight: 400;
    }
  }
`