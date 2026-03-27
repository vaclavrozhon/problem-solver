# [Bolzano](https://bolzano.app)

Web-based research system that automates mathematical problem solving and proof generation using LLMs.
- It **doesn't** empower formal mathmetical verification using LEAN or alike systems.
- This project focuses on building scaffolding around the model with final-step human verification and guidance.
- Available at [bolzano.app](https://bolzano.app)

## Technical details

Bolzano uses [`Bun`](https://bun.com) as its runtime & package manager. This git respository is a monorepo consisting of `frontend`, `backend` and `shared` packages, all written in TypeScript.

### Frontend

- Written in `React@19` (SPA), `Tailwind@4`.
- Using `Vite`, `Tanstack Router & Query`.

The design has not been made responsive yet. Therefore, it is recommended to use devices with larger viewport rather than phones.

### Backend

- HTTP server runs on [`Elysia`](https://elysiajs.com/).
- LLM requests can be routed through local [`Codex`](https://github.com/openai/codex), local Gemini CLI, local Claude CLI, MetaCentrum OpenAI-compatible API, and/or [`OpenRouter`](https://openrouter.ai/).
- Custom Job Manager based on [`BullMQ`](https://bullmq.io/) with connection to  self-hosted `Redis`.
- Database runs on Postgres. Auth supports a local single-user mode and optional Supabase mode.
- All DB requests should be made through [`Drizzle`](https://orm.drizzle.team/) – `SupabaseSDK` is used only for `.auth` management.

## Running the project

### `.env`

The `.env` file should be located in the root directory. Access for `backend` & `frontend` is specified through run command in scripts. Have a look at [`.env.example`](.env.example) to see all required variables.

### Automated Adapter Test Runner

To run a full local end-to-end adapter test (login, create problem, start research, poll, collect debug, auto-cleanup), use:

```bash
bun run test:adapter \
  --problem /path/to/problem.md \
  --prover "gemini-3-pro-preview(high)" \
  --verifier "gpt-5.2(medium)" \
  --summarizer "gemini-3-flash-preview(medium)"
```

Artifacts are saved under `debug/runs/<timestamp>-<tag>/`.

Useful flags:
- `--rounds <n>` (default `1`)
- `--prover-count <n>` (default `1`)
- `--timeout-min <n>` (default `45`)
- `--auto-delete` (default is keep problem)
- `--backend-url http://localhost:3942`

For local Claude transport, install and authenticate `claude` CLI, then configure:
- `CLAUDE_BIN` (default `claude`)
- `CLAUDE_TIMEOUT_MS` (default `1800000`)
- `CLAUDE_DEBUG` (`1` to store transport debug artifacts)

For MetaCentrum OpenAI-compatible transport:
- Add MetaCentrum API key in `Settings → MetaCentrum API Key`
- Base URL configurable via `METACENTRUM_BASE_URL` (default `https://llm.ai.e-infra.cz/v1`)

For restart behavior of persisted Redis jobs:
- `JOB_STARTUP_RECOVERY_MODE=fail_and_purge` (default) marks `queued/running` problems as failed and purges unfinished queue jobs on backend startup, preventing silent re-runs after restart.
- `JOB_STARTUP_RECOVERY_MODE=none` keeps BullMQ default recovery behavior.

Filesystem output mirror (for backups/audits):
- `OUTPUT_MIRROR_ENABLED=1` enables mirror writes (default on)
- `OUTPUT_MIRROR_ROOT=outputs` (default, relative to repository root)
- Mirror path format: `outputs/<owner-id>/<problem-slug>-<problemId8>/...`
- One-time backfill for existing problems:
  ```bash
  bun run mirror:backfill
  ```

### Production

Bolzano is currently hosted on [Railway](https://railway.com). Railway handles everything on it's own based on the project structure therefore no config is required.

To build the production-ready distribution, run
```properties
bun run build
```
in the root directory. This will build `shared`, `backend` & `frontend`. Each build creates a `dist` folder in the corresponding package directory.

You can then run the build with
```properties
bun run start
```
And everything should be accessible from within one URL.

#### How does it work?

The production-ready distribution is based on running the built backend. A single file `backend/dist/index.js` handles everything. It's an HTTP server that serves the backend endpoints as expected but it also serves everything from within `frontend/dist`. Static files should be included in `frontend/src/static`.

This is possible thanks to Vite which builds the whole frontend and creates a bunch of `.html`, `.css` and `.js` files which are linked together and can be served statically. And thus by our backend.

This is different from the development environment in which you use 2 differnet URLs to access your project – one for your frontend, one for your backend. Backend only serves the API endpoints in this case and frontend serves all the static files & the interface. It could be combined into singular page even in the dev env but for better developer experience we're using Vite which handles compiling TypeScript to JavaScript, linking everything, optimizing etc. And that requires the frontend to run as its separate process.
