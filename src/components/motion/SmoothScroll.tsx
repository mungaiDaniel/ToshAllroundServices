import Lenis from 'lenis'
import { useEffect } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { duration, features } from '../../lib/motion'

/** Site-wide Lenis smooth scrolling. Off for reduced motion. Touch devices keep native scrolling. */
export default function SmoothScroll() {
  const { reduced } = useMotionPrefs()

  useEffect(() => {
    if (!features.smoothScroll || reduced) return
    const lenis = new Lenis({ duration: duration.slow * 1.2, smoothWheel: true })
    let raf = 0
    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [reduced])

  return null
}
