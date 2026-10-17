import { useReducedMotion } from 'framer-motion'
import { useSyncExternalStore } from 'react'
import { breakpoints, isStill } from '../lib/motion'

/** One MediaQueryList (and one listener set) per query, shared by every component that asks. */
const stores = new Map<string, { mql: MediaQueryList; listeners: Set<() => void> }>()

function store(query: string) {
  let s = stores.get(query)
  if (!s) {
    const mql = window.matchMedia(query)
    const listeners = new Set<() => void>()
    mql.addEventListener('change', () => listeners.forEach((l) => l()))
    s = { mql, listeners }
    stores.set(query, s)
  }
  return s
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const { listeners } = store(query)
      listeners.add(notify)
      return () => listeners.delete(notify)
    },
    () => store(query).mql.matches,
    () => false,
  )
}

/**
 * Central place that decides how much motion a component may use.
 * - reduced: user prefers reduced motion (or MOTION_INTENSITY is 0)
 * - mobile: small viewport => lighter effects
 * - finePointer: mouse/trackpad available => hover effects make sense
 */
export function useMotionPrefs() {
  const prefersReduced = useReducedMotion()
  const mobile = useMediaQuery(breakpoints.mobile)
  const finePointer = useMediaQuery(breakpoints.finePointer)
  return { reduced: Boolean(prefersReduced) || isStill, mobile, finePointer }
}
