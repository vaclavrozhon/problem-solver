import ShikiHighlighter from "react-shiki"
import { css } from "@linaria/core"

interface Props {
  raw_json: any,
}
export default function JSONViewer({ raw_json }: Props) {
  const formatted_json = JSON.stringify(raw_json, null, 2)
  return (
    <ShikiHighlighter language="json" theme="aurora-x"
      showLineNumbers
      className={JSONStyle}>
      {formatted_json}
    </ShikiHighlighter>
  );
}

const JSONStyle = css`
  font-size: .8rem;
  & pre {
    border-radius: 0 !important;
  }
  & code {
    white-space: pre-wrap;
  }
`

