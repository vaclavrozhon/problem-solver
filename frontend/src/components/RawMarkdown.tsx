import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

interface Props {
  md: string,
}
export default function MathMarkdown({ md }: Props) {
  return (
    <ReactMarkdown
      children={md}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    />
  )
}