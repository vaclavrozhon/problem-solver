2026-01-22
- frontend
  - made research problems accessible to anyone with the link
  - admin: added invite money allocation to `/usage`
- backend
  - job queue manager concurrency set to `100`

2026-01-03
- system prompt editing implemented
- introduced prompt file versioning
backend
- fix usage retrieval bug when no key set
- removed saving reasoning because closed-source models return mainly encrypted reasoning (the unencrypted part is too vague) & open-source models reasoning doesn't work with streaming in `ai-sdk@6`


2026-01-02
- wrote custom session handling (Bearer Token -> HttpsOnly cookies)
- replaced advice from research with additional instructions
frontend
- made research system prompt editable
- remove supabase dependency
- fix flash of previously authed user content during login

2025-12-31
backend
- reworked the generating llms a bit
  - added new reasoning config to the request (web search still missing)
  - now the responses are streamed which should hopefully improve stability of the connection
  - the streaming is not utilized in any way even though that option was explored but was deemed too complex & unreliable (streaming valid schemas) to be implemented
  - fixed a bug in backend – always storing reasoning threw error if model did not reason (created by the introduciton of non-reasoning models to bolzano)
- migration to ai-sdk@6 even though openrouter adapter doesn't officially support it yet
frontend
- bugfix: file explorer lost state when opening new file
- quickfix: admin job detail page -> new model config wasn't compatible with displaying model id

2025-12-30
frontend
- new research form design overhaul

2025-12-29
backend
- more zod schemas for validation
frontend
- design overhaul by migrating to tailwind@4
  - mainly default user frontend
  - admin invite management & nav

2025-12-27
backend
- refactored available llm model object
frontend
- new model selector ui/ux

2025-12-23
- added admin only routes
frontend
- improved auth flow
- added footer github code link & support email
- bugfix: themeselector initial click bug

2025-12-22
- added admin invite management & user list dashboard
backend
- new sign in/up flow router through our backend

2025-12-16
- added new admin job dashboard

2025-12-11
backend
- generating llm response now auto-retries 3 times
- updated internal prompt `advice` -> `instructions`
frontend
- unified the looks of tables at overview, problem overview (round times) and archive pages
  - it’s sortable by created/updated time and archive is also sortable by authors
- added round verdict to problem's round summaries

2025-12-10
frontend
- updated conversations view code structure & styling to make it more compact
- added round versions for output.md, proofs.md and notes.md
- redesigned the FileExplorer a bit

2025-12-04
backend
- standard research seems stable
  - softly handles failed LLM prompts
- new DB architecture (again)
  - all previous data is archived and deemed not important to be imported – only problem tasks have been imported
  - all other data is backed up
frontend
  - shows usage cost, used model for output
  - added reasoning output to conversations

2025-11-27
backend
- rewrote research part, seems to be working for now
- added support for various LLM models through OpenRouter

2025-11-21
frontend
- added the option to switch rendering from KaTeX to MathJax per conversation to help resolve occasional issues when AI returns invalid KaTeX syntax (e.g. KaTeX can’t handle $q_s:=\Pr(\text{$G(s,1/2)$ is regular})$ whereas MathJax supports nested $) (KaTeX is still the primary option for rendering because it’s way more performant than MathJax)
- Added Create new problem page interface. (not connected to backend yet)
- Added the interface for starting new research rounds. You can now preview the prompts for prover, verifier and summarizer and edit them. (not connected to backend yet)
- Fixed metadata files bug in File Explorer.
backend
- started rewriting it in ElysiaJS (Typescript & Bun)
- so far, only archive, problem overview, conversations & file explorer have been implemented
- access to DB via Drizzle

2025-11-13
frontend
- Added simple File Explorer (view-only) for research problems & overview with times for each problem.

2025-11-06
backend
- added Markdown & KaTeX outputs for prompts
frontend
- new UI for viewing problems alongside archive of all problems (you can now view problems created by others)
