import { useReducedMotion } from 'framer-motion'
import { useSyncExternalStore } from 'react'
import { breakpoints, isStill } from '../lib/motion'

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
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
