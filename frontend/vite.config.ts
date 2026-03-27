import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import wyw from "@wyw-in-js/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

export default defineConfig(({ mode }) => {
  const env_dir = path.resolve(__dirname, "../")
  const env = loadEnv(mode, env_dir, "")
  const frontend_port = Number(env.FRONTEND_PORT || 5175)

  return {
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
      tailwindcss(),
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
      port: frontend_port,
      strictPort: true,
    },
    preview: {
      port: frontend_port,
      strictPort: true,
    },
  }
})
