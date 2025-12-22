import { Elysia } from "elysia"
import { desc } from "drizzle-orm"
import { auth_plugin, drizzle_plugin } from "../plugins"
import { profiles } from "../../drizzle/schema"

export const users_router = new Elysia({ prefix: "/users" })
  .use(auth_plugin)
  .use(drizzle_plugin)

  /**
   * [ADMIN] GET /admin/users/all
   * 
   * Lists all users.
   * 
   * MANUALLY TESTED?: YES, works.
   */
  .get("/all", async ({ db }) => {
    const all_profiles = await db.query.profiles.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        openrouter_key_encrypted: true,
        key_source: true,
      },
      orderBy: [desc(profiles.created_at)],
    })

    return {
      users: all_profiles.map(({ openrouter_key_encrypted, ...p}) => ({
        ...p,
        has_openrouter_key: !!openrouter_key_encrypted,
      }))
    }
  }, { isAdmin: true })