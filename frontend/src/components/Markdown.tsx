import { styled } from "@linaria/react"

import RawMarkdown from "./RawMarkdown"
import ReactMarkdown from "react-markdown"

interface Props {
  md: string,
  render_math?: boolean,
}
export default function MathMarkdown({ md, render_math = true }: Props) {
  return (
    <MarkdownContent>
      {render_math ? (
        <RawMarkdown md={md}/>
      ) : (
        // em needs to be disallowed becuase ... _ ... _ ... in latex code inside $ ... $ can trigger rendering bug
        <ReactMarkdown children={md}
          disallowedElements={["em"]}/>
      )}
    </MarkdownContent>
  )
}

const MarkdownContent = styled.article`
  font-family: SourceSerif;
  display: flex;
  flex-flow: column;
  gap: 1rem;
  padding: 1rem;
  color: var(--fg-alpha);

  & > section:not([class]) {
    display: flex;
    flex-flow: column;
    gap: 1rem;
  }

  & h1 {
    font-size: 1.1rem;
  }

  & h2 {
    font-size: 1.1rem;
    padding: .25rem 0;
    position: relative;
    &:only-child {
      display: none;
    }
    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      background: var(--bg-gamma);
    }
  }

  & h3 {
    font-size: .95rem;
    font-weight: 700;
    font-family: Kode;
    text-transform: uppercase;
    margin-top: .25rem;
  }

  & h4 {
    font-size: .9rem;
    font-weight: 600;
  }

  & p, a, li {
    font-size: 1rem;
    line-height: 1.7;
    letter-spacing: -.025rem;
  }

  & p + p {
    margin-top: -.3rem;
  }

  & p a:not([class]) {
    padding: 0 2px;
    position: relative;
    box-shadow: 0 5px 0 0 transparent;
    transition: .2s ease;
    background-image: linear-gradient(var(--bg-gamma), var(--bg-gamma));
    background-position: 0% 90%;
    background-repeat: no-repeat;
    background-size: 100% 30%;
    box-decoration-break: clone;
    &:hover {
      box-shadow: 0 1px 0 4px var(--bg-gamma);
      border-radius: 2px;
      background-position: 0 100%;
      background-size: 110% 110%;
    }
  }

  & ul, ol {
    padding-left: 1.5rem;
    display: flex;
    flex-flow: column;
    gap: .3rem;
  }
  & ul {
    list-style: disc;
    & ul {
      list-style: circle;
      margin-top: .3rem;
    }
  }
  & ol {
    list-style: decimal;
  }
  & li {
    padding-left: .1rem;
  }

  & code {
    font-family: Kode;
    padding: .1rem .15rem;
    border: 1px solid var(--border-alpha-color);
    border-radius: .25rem;
    background: var(--bg-beta);
    color: var(--color-brand);
    font-size: .8rem;
  }

  pre {
    word-wrap: break-word;
    white-space: pre-wrap;
    font-size: .8rem;
  }

  & strong {
    font-weight: 600;
  }
`
