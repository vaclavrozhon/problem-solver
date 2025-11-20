import { Elysia } from "elysia"
import { createClient } from "@supabase/supabase-js"
import { drizzle } from "drizzle-orm/postgres-js"
import { z } from "zod"
import * as schema from "../../drizzle/schema"
import * as relations from "../../drizzle/relations"
import postgres from "postgres"

// All other DB requests should be made through drizzle
export const drizzle_plugin = new Elysia({ name: "drizzle" })
  .decorate("db", new_db_connection())

function new_db_connection() {
  const connection_string = Bun.env.DATABASE_URL.replace(
    "DATABASE_PASSWORD",
    encodeURIComponent(Bun.env.DATABASE_PASSWORD)
  )
  const client = postgres(connection_string, { prepare: false })
  return drizzle({
    client,
    casing: "snake_case",
    schema: {
      ...schema,
      ...relations,
    },
  })
}

// The purpose of Supabase is to use the .auth capabilities
export const supabase_plugin = new Elysia({ name: "supabase" })
  .decorate("supabase", createClient(
    Bun.env.SUPABASE_URL,
    Bun.env.SUPABASE_PUBLISHABLE_KEY
  ))


export const auth_plugin = new Elysia({ name: "auth" })
  .use(supabase_plugin)
  .macro({
    /** 
     * If `isAuth` is enabled, the route shall be accessible
     * only for authorized users and extends the context by `user` object.
     * 
     * if not authorized, returns `401` error with request for auth.
     */
    isAuth: {
      beforeHandle: ({ request }) => {
        let path = new URL(request.url).pathname
        console.log("[auth] got request for secured route: ", path)
      },
      headers: z.object({
        authorization: z.string("Please provide Authorization token in headers.")
          .startsWith("Bearer")
          .min(8, "Authorization header should contain Bearer token"),
      }),
      resolve: async ({ headers, supabase, status }) => {
        console.log("start", headers)
        // TODO: resolve this TS issue
        let jwt_token = headers["authorization"].split(" ")[1]
        const { data: { user } } = await supabase.auth.getUser(jwt_token)
        if (user === null) return status(401, {
          type: "error",
          message: "Invalid Authorization Bearer token. Access denied."
        })
        return { user }
      }
    },
  })