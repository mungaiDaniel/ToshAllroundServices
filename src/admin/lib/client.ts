/**
 * Supabase client for the admin panel. Unlike the public client (src/lib/supabase.ts) this one KEEPS the login
 * session in the browser (localStorage, own storage key) so Daniel stays logged in on his phone.
 * What he may do is decided by Row Level Security in the database (only the admin row in `admins` can write).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfigured, supabaseUrl } from '../../lib/supabase'

const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

let client: Promise<SupabaseClient> | null = null

export function getAdminClient(): Promise<SupabaseClient> {
  if (!supabaseConfigured) return Promise.reject(new Error('Supabase is not configured'))
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // needed for the "password reset" e-mail link
        storageKey: 'tosh-admin-auth',
      },
    }),
  )
  return client
}

export { supabaseConfigured }
