# Codex Integration TODO

- Current backend integration uses strict runtime limits to stabilize non-interactive webapp flow.
- Temporary limits to remove later:
  - discourage/disable tool calls in prover/verifier/summarizer runs
  - conservative timeout handling intended to avoid stuck runs
- Desired end state:
  - allow tool calls for richer research workflows
  - allow longer runs where useful
  - keep "no follow-up questions" behavior (webapp flow is one-shot and cannot answer interactive questions mid-run)
