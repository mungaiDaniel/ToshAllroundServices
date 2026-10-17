import { m, useScroll, useSpring } from 'framer-motion'
import { spring } from '../../lib/motion'

/** Thin emerald reading-progress bar fixed to the top of the page. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, spring.progress)
  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-emerald shadow-[0_0_12px_var(--glow)]"
      style={{ scaleX }}
    />
  )
}
