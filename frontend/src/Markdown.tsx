import React, { useMemo } from 'react'
import { marked } from 'marked'

type Props = { text: string }

export default function Markdown({ text }: Props) {
  const html = useMemo(() => marked.parse(text || ''), [text])
  return (
    <div 
      className="markdown-content"
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      dangerouslySetInnerHTML={{ __html: html as string }} 
    />
  )
}

