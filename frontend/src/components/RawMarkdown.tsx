import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

interface Props {
  md: string,
}
export default function MathMarkdown({ md }: Props) {
  return (
    <ReactMarkdown
      children={md}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
    />
  )
}
