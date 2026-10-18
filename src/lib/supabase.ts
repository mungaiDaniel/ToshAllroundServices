/**
 * Supabase client (EU / Frankfurt project). Keys come from .env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * The anon key is meant to be public; what visitors can do is limited by Row Level Security in the database.
 *
 * The SDK is loaded on demand (dynamic import) so it never slows down the first paint.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

/** false => the site simply runs on its built-in static content */
export const supabaseConfigured = Boolean(supabaseUrl && anonKey)

let client: Promise<SupabaseClient> | null = null

export function getSupabase(): Promise<SupabaseClient> {
  if (!supabaseConfigured) return Promise.reject(new Error('Supabase is not configured'))
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseUrl, anonKey, {
      // visitors never log in: no sessions, no cookies, no storage
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
  )
  return client
}

/** Public URL of a file in a storage bucket. Paths starting with "/" or "http" are used as they are. */
export function mediaUrl(path: string | null | undefined, bucket: 'site-images' | 'documents' = 'site-images') {
  if (!path) return undefined
  if (path.startsWith('/') || /^https?:\/\//.test(path)) return path
  return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` : undefined
}
