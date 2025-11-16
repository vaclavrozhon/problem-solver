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
  gap: 15px;
  padding: 1rem;
  & > section:not([class]) {
    display: flex;
    flex-flow: column;
    gap: 15px;
  }
  & h1 {
    font-size: 1.2rem;
  }
  & ul, ol {
    padding-left: 1.75rem;
  }
  & p, a, li {
    // font-family: Roboto Slab
    // font-size: 18px
    font-size: 1.1rem;
    line-height: 1.6;
    // margin: 5px 0
    // letter-spacing: .2px
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
  & h2 {
    font-size: 1.1rem;
    padding: 5px 0 10px 0;
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
    font-size: 20px;
    margin-top: 2.5px;
  }
  & img {
    max-width: 100%;
  }
`
