import React, { useMemo } from 'react'
import { marked } from 'marked'

type Props = { text: string }

export default function Markdown({ text }: Props) {
  const html = useMemo(() => marked.parse(text || ''), [text])
  return <div dangerouslySetInnerHTML={{ __html: html as string }} />
}

