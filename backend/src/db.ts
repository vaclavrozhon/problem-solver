import postgres from "postgres"
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import * as schema from "../drizzle/schema"
import * as relations from "../drizzle/relations"

type DBSchema = typeof schema & typeof relations
export type Database = PostgresJsDatabase<DBSchema>

let db_client: Database | null = null
let supabase_admin_client: SupabaseClient | null = null

/**
 * @returns `Drizzle` instance connected to DB.
 */
export function get_db(): Database {
  if (db_client) return db_client
  const client = postgres(get_db_connection_string(), {
    prepare: false,
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  })
  db_client = drizzle({
    client,
    casing: "snake_case",
    schema: { ...schema, ...relations },
  })
  return db_client
}

/**
 * @returns valid DB connection string built from `.env` variables.
 */
export function get_db_connection_string() {
  return process.env.DATABASE_URL.replace(
    "[DATABASE_PASSWORD]",
    encodeURIComponent(process.env.DATABASE_PASSWORD)
  )
}

/**
 * @returns `SupabaseSDK` ADMIN client built from `SUPABASE_SECRET_KEY`
 */
export function get_supabase_admin() {
  if (supabase_admin_client) return supabase_admin_client
  supabase_admin_client = createClient(
    Bun.env.SUPABASE_URL,
    Bun.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        flowType: "pkce",
      }
    }
  )
  return supabase_admin_client
}