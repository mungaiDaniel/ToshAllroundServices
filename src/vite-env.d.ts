/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key for the contact form */
  readonly VITE_WEB3FORMS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
