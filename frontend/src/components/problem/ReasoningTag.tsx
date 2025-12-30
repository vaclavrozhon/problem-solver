import { Icon } from "@iconify/react"

import type { ReasoningEffortValue } from "@shared/types/research"

interface ReasoningTagProps {
  reasoning: ReasoningEffortValue,
  size: "xs" | "sm",
}

export default function ReasoningTag({ reasoning, size }: ReasoningTagProps) {
  if (!reasoning) return null

  const a = size === "xs" ? 14 : 18
  const outer_size = size === "xs" ? "w-5 h-5" : "w-6 h-6"
  const py = size === "xs" ? "py-0.5" : "py-1"

  if (reasoning === true) return (
    <div className={`flex-center ${outer_size} rounded-sm bg-amber-100 text-amber-700`}>
      <Icon icon="ph:brain-duotone" width={a} height={a}/>
    </div>
  )

  return (
    <p className={`${py} px-1.5 text-xs rounded-sm ${
      reasoning === "none"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700"
    }`}>
      {reasoning}
    </p>
  )
}