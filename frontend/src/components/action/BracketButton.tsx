import React from "react"
import { styled } from "@linaria/react"

const Button = styled.button`
  position: relative;
  display: inline-flex;
  font-weight: 500;
  gap: .05rem;
  color: var(--accent-alpha);
  text-wrap: nowrap;
  &:hover::after {
      content: "";
      position: absolute;
      bottom: .055rem;
      left: .425rem;
      width: calc(100% - .85rem);
      height: 1px;
      background: var(--accent-alpha);
  }
  &[disabled] {
    color: var(--text-alpha);
    pointer-events: none;
    &:hover::after {
      content: unset;
    }
  }
  &.hidden {
    display: none;
  }
  & span {
    font-weight: 600
  }
`

interface Props extends React.PropsWithChildren {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean,
  type?: "button" | "submit",
  hidden?: boolean,
}

export default function BracketButton({ onClick, children, disabled = false, type = "button", hidden = false }: Props) {
  return (
    <Button onClick={onClick}
      disabled={disabled}
      className={hidden ? "hidden" : ""}
      type={type}>
      <span>[</span>
      {children}
      <span>]</span>
    </Button>
  )
}
