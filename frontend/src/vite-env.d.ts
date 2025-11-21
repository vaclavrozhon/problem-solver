/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_RAILWAY_PUBLIC_DOMAIN: string,
  readonly VITE_BACKEND_PORT: number,
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
