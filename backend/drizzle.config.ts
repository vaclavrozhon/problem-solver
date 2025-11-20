import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres.qtsteugcmlmdabngjrxz:jevgqNDViiwfk9uadk3%25RtD%25@aws-1-eu-north-1.pooler.supabase.com:5432/postgres",
  },
  schemaFilter: ["main"]
})
