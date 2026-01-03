import React from "react"
import { bracket_base_styles } from "./bracket-styles"

interface Props extends React.PropsWithChildren {
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  disabled?: boolean,
  type?: "button" | "submit",
  hidden?: boolean,
  className?: string,
}

export default function BracketButton({ onClick, children, disabled = false, type = "button", hidden = false, className }: Props) {
  return (
    <button onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        ${bracket_base_styles}
        whitespace-nowrap cursor-pointer
        disabled:text-(--text-alpha) disabled:pointer-events-none disabled:hover:after:content-none
        ${hidden ? "hidden" : ""} ${className ?? ""}
      `}>
      <span className="font-semibold">[</span>
      {children}
      <span className="font-semibold">]</span>
    </button>
  )
}
