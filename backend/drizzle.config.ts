import { defineConfig } from "drizzle-kit"
import { get_db_connection_string } from "./src/db"

export default defineConfig({
  out: `./drizzle/${process.env.NODE_ENV}`,
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  schemaFilter: ["main"],
  dbCredentials: {
    url: get_db_connection_string(),
  }
})