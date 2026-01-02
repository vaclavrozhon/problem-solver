/**
 * @returns either `frontend` or `backend` url depending on `dev`/`prod` env
 */
export const get_server_url = (end: "frontend" | "backend") =>
  Bun.env.NODE_ENV === "production"
    ? `https://${Bun.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${end === "frontend"
        ? Bun.env.FRONTEND_PORT
        : Bun.env.BACKEND_PORT
      }`