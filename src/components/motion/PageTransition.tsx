import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { distance, duration, ease } from '../../lib/motion'

export interface PageTransitionProps {
  /** changes on every route change, e.g. location.pathname */
  routeKey: string
  children: ReactNode
}

/**
 * Route transition: old page fades out, new page fades/slides in, and a navy
 * wipe sweeps over the screen in between. Reduced motion => simple fade, no wipe.
 */
export default function PageTransition({ routeKey, children }: PageTransitionProps) {
  const { reduced } = useMotionPrefs()
  const wipe = useAnimationControls()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (reduced) return
    void wipe.start({
      scaleY: [0, 1, 1, 0],
      originY: [1, 1, 0, 0],
      transition: { duration: duration.wipe, ease: ease.wipe, times: [0, 0.45, 0.55, 1] },
    })
  }, [routeKey, reduced, wipe])

  return (
    <>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}
      >
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, y: reduced ? 0 : distance.sm }}
          animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
          exit={{ opacity: 0, transition: { duration: duration.fast } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[55] bg-night"
          initial={{ scaleY: 0 }}
          animate={wipe}
        />
      )}
    </>
  )
}
