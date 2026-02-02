import { BracketLink } from "../action/BracketLink"
import ThemeSelector from "./ThemeSelector"

export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center text-sm px-4 py-1.5 gap-4
    border-t-2 border-t-gamma">
      <BracketLink href="https://github.com/vaclavrozhon/problem-solver/"
        target="_blank">
        Code-&gt;GitHub
      </BracketLink>

      <p className="flex items-center">
        Errors, feedback, help? -&gt;
        <a href="mailto:human@bolzano.app" className="ml-1 font-medium hover:underline">
          human@bolzano.app
        </a>
      </p>

      <div className="ml-auto">
        <ThemeSelector />
      </div>
    </footer>
  )
}
