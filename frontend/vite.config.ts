import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import wyw from "@wyw-in-js/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import path from "node:path"

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
  envDir: "../",
  publicDir: "static",
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared/src"),
      "@frontend": path.resolve(__dirname, "./src"),
      "@backend": path.resolve(__dirname, "../backend/src"),
    }
  },
  server: {
    port: import.meta.env.FRONTEND_PORT,
  },
})