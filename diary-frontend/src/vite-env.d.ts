interface ImportMetaEnv {
  VITE_ATTACH_BASE_URL: any;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}