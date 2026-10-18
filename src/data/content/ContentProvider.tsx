import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSupabase, supabaseConfigured } from '../../lib/supabase'
import { fallbackContent } from './fallback'
import { parseContent, toTextOverrides } from './normalize'
import type { RawContent } from './types'

/**
 * Where the website content comes from (see CLAUDE.md "Content architecture"):
 *   1. cached copy from the last visit (instant),
 *   2. otherwise the static fallback + skeleton loaders until Supabase answers (max a few seconds),
 *   3. Supabase (one request: rpc get_public_content), then cached for the next visit.
 * If Supabase is not configured / unreachable / not seeded yet, the built-in static content is used.
 */

const CACHE_KEY = 'tosh-content-v1'
const FETCH_TIMEOUT_MS = 8000
/** how long a first-time visitor sees skeletons before we give up and show the built-in content */
const SKELETON_MAX_MS = 2500

type Status = 'loading' | 'ready'

interface ContentState {
  raw: RawContent
  status: Status
  /** true when the data came from Supabase (live or cached), false for the built-in fallback */
  live: boolean
}

function readCache(): RawContent | null {
  try {
    const s = localStorage.getItem(CACHE_KEY)
    return s ? parseContent(JSON.parse(s)) : null
  } catch {
    return null
  }
}
function writeCache(raw: RawContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(raw))
  } catch {
    /* storage unavailable or full: fine, we just won't cache */
  }
}

/** If the database has not been set up/seeded yet (no business row and no services), use the fallback. */
const isUnseeded = (raw: RawContent) => !raw.business && raw.services.length === 0

async function fetchContent(): Promise<RawContent> {
  const client = await getSupabase()
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const { data, error } = await client.rpc('get_public_content').abortSignal(ctrl.signal)
    if (error) throw error
    return parseContent(data)
  } finally {
    window.clearTimeout(timer)
  }
}

const ContentContext = createContext<ContentState>({ raw: fallbackContent, status: 'ready', live: false })

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>(() => {
    if (!supabaseConfigured) return { raw: fallbackContent, status: 'ready', live: false }
    const cached = readCache()
    if (cached && !isUnseeded(cached)) return { raw: cached, status: 'ready', live: true }
    return { raw: fallbackContent, status: 'loading', live: false }
  })

  useEffect(() => {
    if (!supabaseConfigured || window.location.pathname.startsWith('/admin')) return
    let cancelled = false
    const giveUp = window.setTimeout(() => {
      setState((s) => (s.status === 'loading' ? { ...s, status: 'ready' } : s))
    }, SKELETON_MAX_MS)

    // start after first paint so content loading never competes with the page itself
    const hasIdle = 'requestIdleCallback' in window
    const start = () => {
      fetchContent()
        .then((raw) => {
          if (cancelled) return
          if (isUnseeded(raw)) {
            setState((s) => ({ ...s, status: 'ready' }))
            return
          }
          writeCache(raw)
          setState({ raw, status: 'ready', live: true })
        })
        .catch((err) => {
          console.warn('[content] using built-in content:', err?.message ?? err)
          if (!cancelled) setState((s) => ({ ...s, status: 'ready' }))
        })
    }
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 800 }) : window.setTimeout(start, 150)

    return () => {
      cancelled = true
      window.clearTimeout(giveUp)
      if (hasIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

export const useContentState = () => useContext(ContentContext)

/** { "home.hero.title": "…" } overrides coming from site_texts, for the given language */
export function useTextOverrides(language: 'de' | 'en') {
  const { raw } = useContentState()
  return useMemo(() => toTextOverrides(raw, language), [raw, language])
}
