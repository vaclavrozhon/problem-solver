import { useState, useEffect } from "react"
import { styled } from "@linaria/react"

import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@uiw/react-codemirror"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import Markdown from "../Markdown"

interface Props {
  md?: string,
  placeholder?: string,
  onChange?: (new_value: string) => void,
}
const code_mirror_extension = [markdown({ base: markdownLanguage }), EditorView.lineWrapping]
export default function SplitViewEditor({ md = "", onChange, placeholder = "" }: Props) {
  const [editor_content, setEditorContent] = useState(md)

  useEffect(() => {
    setEditorContent(md)
  }, [md])

  return (
    <SplitViewSection>
      <div className="half">
        <p>Raw Markdown & KaTeX</p>
        {/* TODO: Make KaTeX $ ... $ highlighting */}
        <CodeMirror
          onChange={val => {
            if (onChange) onChange(val)
            else setEditorContent(val)
          }}
          theme={tokyoNight}
          value={editor_content}
          extensions={code_mirror_extension}
          placeholder={placeholder || `Please write your Markdown & KaTeX here.

To use inline math, just write it like this: $y = x^2$.

To write math expression on singular line, you need to follow this syntax

$$
ax^4 + 3x^3 - 8x^2 + 9 = 0
$$

to achieve the desired results.

Markdown is useful mainly for rendering output from the LLM,
so don't feel forced to use it.

*slanted text*, **bold text**,

# Heading 1
## Heading 2
### ...

- list item 1
- list item 2
- ...
          `}/>
      </div>
      <div className="half">
        <p>Live Preview</p>
        <Markdown md={editor_content || "Write something in the editor on the left to preview it here."}/>
      </div>
    </SplitViewSection>
  )
}

const SplitViewSection = styled.section`
  display: flex;
  width: 100%;
  border-top: var(--border-alpha);
  border-bottom: 6px double var(--border-alpha-color);
  & > div.half {
    max-width: 50%;
    width: 100%;
    max-height: 32.8rem;
    overflow: auto;
    &:first-child {
      border-right: var(--border-alpha);
    }
    & .cm-editor {
      height: 30rem !important;
    }
    & .cm-focused {
      outline: none !important;
    }
    & > p {
      font-family: Kode;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      border-bottom: var(--border-alpha);
      height: 2.8rem;
    }
  }
`