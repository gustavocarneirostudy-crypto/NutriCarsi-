/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEON_AUTH_URL: string
  readonly VITE_NEON_DATABASE_URL: string
  readonly VITE_NEON_PROJECT_ID: string
  readonly VITE_NEON_BRANCH_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
