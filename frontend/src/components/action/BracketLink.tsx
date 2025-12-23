import React from "react"
import { createLink, LinkComponent } from "@tanstack/react-router"
import { styled } from "@linaria/react"

const Link = styled.a`
  position: relative;
  display: inline-flex;
  font-weight: 500;
  gap: .05rem;
  color: var(--accent-alpha);
  &:hover::after {
      content: "";
      position: absolute;
      bottom: .055rem;
      left: .425rem;
      width: calc(100% - .85rem);
      height: 1px;
      background: var(--accent-alpha);
  }
  & span {
    font-weight: 600;
  }
`

interface LinkProps extends
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  React.PropsWithChildren {}

export const BracketLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    return (
      <Link ref={ref} {...props}>
        <span>[</span>
        {props.children}
        <span>]</span>
      </Link>
    )
  },
)

const BracketLinkComponent = createLink(BracketLink)

const CustomLink: LinkComponent<typeof BracketLink> = (props) => {
  return <BracketLinkComponent preload={"intent"} {...props} />
}

export default CustomLink