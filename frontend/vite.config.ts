import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import wyw from "@wyw-in-js/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

const FRONTEND_PORT = 5173

export default defineConfig({
  plugins: [
    // IMPORTANT: tanstackRouter needs to be passed before react
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
      experimental: {
        nonNestedRoutes: true,
      }
    }),
    react(),
    wyw(),
  ],
  envDir: "../", // Look for .env files in the parent directory
  publicDir: "static",
  server: {
    port: FRONTEND_PORT,
  }
})