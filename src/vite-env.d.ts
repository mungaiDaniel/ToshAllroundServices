/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key for the contact form */
  readonly VITE_WEB3FORMS_KEY?: string
  /** Supabase project URL, e.g. https://abcd1234.supabase.co */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase "anon" (public) key */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
