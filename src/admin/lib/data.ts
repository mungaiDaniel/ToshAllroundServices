import { useCallback, useEffect, useRef, useState } from 'react'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { getAdminClient } from './client'

/** The public website caches its content in the visitor's browser; drop OUR copy so the next view is fresh. */
export function touchSite() {
  try {
    localStorage.removeItem('tosh-content-v1')
  } catch {
    /* ignore */
  }
}

export class DbError extends Error {
  offline: boolean
  constructor(message: string, offline = false) {
    super(message)
    this.offline = offline
  }
}

/** Unwraps a Supabase response or throws a readable error. */
export async function must<T>(p: PromiseLike<{ data: T; error: PostgrestError | null }>): Promise<T> {
  let res
  try {
    res = await p
  } catch (e) {
    throw new DbError((e as Error)?.message ?? 'network', true)
  }
  if (res.error) {
    console.warn('[admin]', res.error)
    throw new DbError(res.error.message, /fetch|network/i.test(res.error.message))
  }
  return res.data
}

export const isOffline = (e: unknown) =>
  (e instanceof DbError && e.offline) || (typeof navigator !== 'undefined' && !navigator.onLine)

/** Loads data with the admin client. `reload()` fetches again; `setData` allows optimistic updates. */
export function useLoad<T>(loader: (sb: SupabaseClient) => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const ref = useRef(loader)
  ref.current = loader

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const sb = await getAdminClient()
      setData(await ref.current(sb))
      setError(null)
    } catch (e) {
      console.warn('[admin] load failed', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, error, loading, reload, setData }
}

/**
 * Re-assigns the order of a group of rows. `orderedIds` is the NEW order of the group; the group re-uses its own
 * sort_order numbers (sorted), so rows outside the group keep their place. Returns only the rows that changed.
 */
export function reorderGroup<T extends { id: string; sort_order: number }>(rows: T[], orderedIds: string[]) {
  const byId = new Map(rows.map((r) => [r.id, r]))
  const slots = orderedIds.map((id) => byId.get(id)?.sort_order ?? 0).sort((a, b) => a - b)
  // make the numbers unique (rows may share a sort_order)
  for (let i = 1; i < slots.length; i++) if (slots[i] <= slots[i - 1]) slots[i] = slots[i - 1] + 1
  const changes: { id: string; sort_order: number }[] = []
  orderedIds.forEach((id, i) => {
    if (byId.get(id)?.sort_order !== slots[i]) changes.push({ id, sort_order: slots[i] })
  })
  return changes
}

export const moveItem = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [x] = next.splice(from, 1)
  next.splice(to, 0, x)
  return next
}

export const nextOrder = (rows: { sort_order: number }[]) =>
  (rows.length ? Math.max(...rows.map((r) => r.sort_order)) : 0) + 10
export const firstOrder = (rows: { sort_order: number }[]) =>
  (rows.length ? Math.min(...rows.map((r) => r.sort_order)) : 10) - 10

/** Like `must`, for list queries: always returns an array. */
export async function rowsOf<T>(p: PromiseLike<{ data: unknown[] | null; error: PostgrestError | null }>): Promise<T[]> {
  return ((await must(p)) ?? []) as T[]
}
