import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: `./drizzle/${process.env.NODE_ENV}`,
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  schemaFilter: ["main"],
  dbCredentials: {
    url: process.env.DATABASE_URL.replace(
      "[DATABASE_PASSWORD]",
      encodeURIComponent(process.env.DATABASE_PASSWORD)
    )
  }
})
