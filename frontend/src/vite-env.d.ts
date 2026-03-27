/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAILWAY_PUBLIC_DOMAIN: string,
  readonly VITE_BACKEND_PORT: number,
  readonly VITE_AUTH_MODE?: "local" | "supabase",
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
