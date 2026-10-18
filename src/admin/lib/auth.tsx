import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminClient, supabaseConfigured } from './client'

export type AuthStatus = 'loading' | 'out' | 'in' | 'recovery'
/** machine-readable problems; the screens turn them into friendly German / English sentences */
export type AuthProblem = 'invalid' | 'rate' | 'network' | 'notAdmin' | 'weak' | 'linkExpired' | 'notConfigured' | 'other'

interface Auth {
  status: AuthStatus
  email: string | null
  /** shown on the login screen (e.g. an expired reset link) */
  notice: AuthProblem | null
  signIn: (email: string, password: string) => Promise<AuthProblem | null>
  signOut: () => Promise<void>
  sendReset: (email: string) => Promise<AuthProblem | null>
  setPassword: (password: string) => Promise<AuthProblem | null>
}

// Read once, before the Supabase client cleans the address bar: did the visitor arrive from a reset e-mail?
const initialHash = typeof window === 'undefined' ? '' : window.location.hash
const cameFromRecoveryLink = /type=recovery/.test(initialHash)
const cameWithLinkError = /error(_code)?=/.test(initialHash)

const classify = (message: string): AuthProblem => {
  if (/invalid|credentials|not found/i.test(message)) return 'invalid'
  if (/rate|too many|security purposes/i.test(message)) return 'rate'
  if (/fetch|network|failed to/i.test(message)) return 'network'
  if (/password/i.test(message)) return 'weak'
  return 'other'
}

async function checkAdmin(sb: SupabaseClient) {
  const { data, error } = await sb.rpc('is_admin')
  return !error && data === true
}

const AuthContext = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [notice, setNotice] = useState<AuthProblem | null>(
    !supabaseConfigured ? 'notConfigured' : cameWithLinkError ? 'linkExpired' : null,
  )

  useEffect(() => {
    if (!supabaseConfigured) {
      setStatus('out')
      return
    }
    let alive = true
    let unsubscribe = () => {}
    getAdminClient()
      .then(async (sb) => {
        // subscribe first, so the "password recovery" event of the e-mail link is never missed
        const { data } = sb.auth.onAuthStateChange((event) => {
          if (!alive) return
          if (event === 'PASSWORD_RECOVERY') setStatus('recovery')
          if (event === 'SIGNED_OUT') {
            setStatus('out')
            setEmail(null)
          }
        })
        unsubscribe = () => data.subscription.unsubscribe()

        const { data: s } = await sb.auth.getSession()
        if (!alive) return
        if (!s.session) {
          setStatus('out')
          return
        }
        setEmail(s.session.user.email ?? null)
        if (cameFromRecoveryLink) {
          setStatus('recovery')
          return
        }
        if (await checkAdmin(sb)) setStatus((cur) => (cur === 'recovery' ? cur : 'in'))
        else {
          await sb.auth.signOut()
          if (alive) {
            setNotice('notAdmin')
            setStatus('out')
          }
        }
      })
      .catch(() => {
        if (alive) {
          setNotice('network')
          setStatus('out')
        }
      })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback<Auth['signIn']>(async (mail, password) => {
    try {
      const sb = await getAdminClient()
      const { data, error } = await sb.auth.signInWithPassword({ email: mail.trim(), password })
      if (error) return classify(error.message)
      if (!(await checkAdmin(sb))) {
        await sb.auth.signOut()
        return 'notAdmin'
      }
      setNotice(null)
      setEmail(data.user.email ?? mail.trim())
      setStatus('in')
      return null
    } catch {
      return 'network'
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const sb = await getAdminClient()
      await sb.auth.signOut()
    } finally {
      setEmail(null)
      setStatus('out')
    }
  }, [])

  const sendReset = useCallback<Auth['sendReset']>(async (mail) => {
    try {
      const sb = await getAdminClient()
      const { error } = await sb.auth.resetPasswordForEmail(mail.trim(), {
        redirectTo: `${window.location.origin}/admin`,
      })
      return error ? classify(error.message) : null
    } catch {
      return 'network'
    }
  }, [])

  const setPassword = useCallback<Auth['setPassword']>(async (password) => {
    try {
      const sb = await getAdminClient()
      const { error } = await sb.auth.updateUser({ password })
      if (error) return classify(error.message)
      if (!(await checkAdmin(sb))) {
        await sb.auth.signOut()
        return 'notAdmin'
      }
      setStatus('in')
      return null
    } catch {
      return 'network'
    }
  }, [])

  const value = useMemo<Auth>(
    () => ({ status, email, notice, signIn, signOut, sendReset, setPassword }),
    [status, email, notice, signIn, signOut, sendReset, setPassword],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
