/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAILWAY_PUBLIC_DOMAIN: string,
  readonly VITE_BACKEND_PORT: number,
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
