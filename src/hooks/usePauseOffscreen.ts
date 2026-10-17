import { useInView } from 'framer-motion'
import { useRef } from 'react'

/**
 * For ambient CSS animations: returns a ref plus data attributes. The stylesheet
 * pauses every `.anim` descendant while the element is off-screen.
 */
export function usePauseOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { margin: '120px 0px 120px 0px' })
  return { ref, pauseProps: { 'data-paused': !inView } as const }
}
