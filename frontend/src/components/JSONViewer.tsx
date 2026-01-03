import ShikiHighlighter from "react-shiki"

interface Props {
  raw_json: any,
}

export default function JSONViewer({ raw_json }: Props) {
  const formatted_json = JSON.stringify(raw_json, null, 2)
  return (
    <ShikiHighlighter language="json"
      theme="aurora-x"
      showLineNumbers
      className="[&_pre]:rounded-none! [&_code]:whitespace-pre-wrap [&_code]:wrap-break-word text-xs">
      {formatted_json}
    </ShikiHighlighter>
  )
}