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
    }),
    react(),
    wyw(),
  ],
  envDir: "../", // Look for .env files in the parent directory
  server: {
    port: FRONTEND_PORT,
    proxy: {
      // Proxy API requests to the backend
      "/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/problems": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/drafts": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/tasks": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/healthz": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/readyz": {
        target: "http://localhost:8000",
        changeOrigin: true,
      }
    }
  }
})