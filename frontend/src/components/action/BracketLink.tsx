import React from "react"
import { createLink } from "@tanstack/react-router"
import type { LinkComponent } from "@tanstack/react-router"
import { bracket_base_styles } from "./bracket-styles"

interface LinkProps extends
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  React.PropsWithChildren {}

export const BracketLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const { className, children, ...rest } = props
    return (
      <a ref={ref}
        className={`${bracket_base_styles} ${className ?? ""}`} {...rest}>
        <span className="font-semibold">[</span>
        {children}
        <span className="font-semibold">]</span>
      </a>
    )
  },
)

const BracketLinkComponent = createLink(BracketLink)

const CustomLink: LinkComponent<typeof BracketLink> = (props) => {
  return <BracketLinkComponent preload={"intent"} {...props}/>
}

export default CustomLink