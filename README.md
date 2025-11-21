# Problem Solver

Web based research system that automates mathematical problem solving and proof generation using LLMs. It **doesn't** empower formal mathmetical verification using LEAN or alike systems. This project focuses on correct prompting of the model with final-step human verification and guidance.

## Technical details

This is a short overview of how the project is implemented any why. Longer and more detailed explanations can be found inside the `docs` folder.

Project uses [Bun](https://bun.com) as it's runtime & package manager. Both the `frontend` and `backend` are written in TypeScript.

### Frontend

The frontend is written in `React` (SPA) with modern packages like `Tanstack Router` or ... Using Vite.

Currently using a larger viewport (computer, tablet) is recommended as the web interface is not optimized for smaller viewports (shrinked windows, phones, ...).

### Backend

The backend runs on Elysia with tRPC.

Database & Auth is hosted by [Supabase](https://supabase.com).

## Running the project

### Required `.env` values (for both `dev` & `prod`)

The `.env` file should be located in the root directory. Access to it for backend & frontend is specified through run command in scripts.

#### Required

- `SUPABASE_URL`:
- `SUPABASE_PUBLISHABLE_KEY`:
- `VITE_SUPABASE_URL`:
- `VITE_SUPABASE_PUBLISHABLE_KEY`:

- `DATABASE_PASSWORD`:
- `DATABASE_URL`:

- `VITE_RAILWAY_PUBLIC_DOMAIN`: Needs to be set up in Railway to mirror `RAILWAY_PUBLIC_DOMAIN`. The frontend requires to know this domain for API requests.


### Dev env

#### Optional

- `FRONTEND_PORT`:
- `BACKEND_PORT`: You can specify this port or leave it blank. If blank, it'll default to port `3942`.
- `VITE_BACKEND_PORT`: 

TODO

### Production

We're using [Railway](https://railway.com) for deploying this repo. Railway handles everything on it's own based on the project structure therefore no config is required.

To build the production-ready distribution, run
```properties
bun run build
```
in the root directory. This will build both `backend` & `frontend`. Each build creates a `dist` folder: for frontend at `frontend/dist`, for backend at `backend/dist`.

Then you can run this build with
```properties
bun run start
```
And everything should be accessible from within one URL.

#### How does it work?

The production-ready distribution is based on running the built backend. A single file `backend/dist/index.js` handles everything. It's an HTTP server that serves the backend endpoints as expected but it also serves everything from within `frontend/dist`. Static files should be included in `frontend/src/static`.

This is possible thanks to Vite which builds the whole frontend and creates a bunch of `.html`, `.css` and `.js` files which are linked together and can be served statically. And thus by our backend.

This is different from the development environment in which you use 2 differnet URLs to access your project – one for your frontend, one for your backend. Backend only serves the API endpoints in this case and frontend serves all the static files & the interface. It could be combined into singular page even in the dev env but for better developer experience we're using Vite which handles compiling TypeScript to JavaScript, linking everything etc, optimizing etc. And that requires the frontend to run as its separate process.

## TODO

- [ ] Before deploying, look at [Elysia deploy guide](https://elysiajs.com/patterns/deploy.html)
- [ ] Railway prod injects `PORT` env variable which should be used to run the service
- [ ] Study single-threaded vs. multi-threaded backend apps differences and railway setup