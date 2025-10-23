/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_AUTH_BASE_URL: string
  readonly VITE_API_AUTH_BASE_URL: string
  readonly VITE_API_ATTACH_BASE_URL: string
  readonly VITE_APP_POST_URL: string
  readonly VITE_APP_DIARY_URL: string
  readonly VITE_DEV_ALLOWED_HOST: string
  readonly VITE_DEV_PROXY_TARGET: string
  readonly VITE_UI_SCHEMA_URL: string
  readonly VITE_API_LANGGRAPH_BASE_URL: string
  // 여기에 필요한 환경변수들 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}