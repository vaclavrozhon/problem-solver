import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

export default function MathMarkdown({ md }: { md: string}) {
  return (
    <ReactMarkdown
      children={md}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    />
  )
}