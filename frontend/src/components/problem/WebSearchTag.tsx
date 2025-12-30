import { Icon } from "@iconify/react"

interface WebSearchTag {
  enabled: boolean,
  size: "xs" | "sm",
}

export default function WebSearchTag({ enabled, size }: WebSearchTag) {
  if (!enabled) return

  const a = size === "xs" ? 14 : 18
  const outer_size = size === "xs" ? 5 : 6

  return (
    <div className={`flex-center w-${outer_size} h-${outer_size} rounded-sm bg-sky-100 text-sky-900`}>
      <Icon icon="ph:globe-duotone" width={a} height={a}/>
    </div>
  )
}