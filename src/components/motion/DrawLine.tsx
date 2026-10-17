import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { spring } from '../../lib/motion'

export interface DrawLineProps {
  /** straight line orientation, or pass a custom path via `d` */
  orientation?: 'vertical' | 'horizontal'
  d?: string
  viewBox?: string
  className?: string
}

/**
 * SVG line that draws itself as the element scrolls through the viewport.
 * Size/position it with className (it fills its box). Colour via `text-*`.
 */
export default function DrawLine({ orientation = 'vertical', d, viewBox, className }: DrawLineProps) {
  const { reduced } = useMotionPrefs()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 55%'] })
  const pathLength = useSpring(scrollYProgress, spring.progress)
  const opacity = useTransform(scrollYProgress, [0, 0.02], [0, 1])

  const path = d ?? (orientation === 'vertical' ? 'M1 0 V100' : 'M0 1 H100')
  const box = viewBox ?? (orientation === 'vertical' ? '0 0 2 100' : '0 0 100 2')

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox={box} preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={path}
          fill="none"
          stroke="var(--color-emerald)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            pathLength: reduced ? 1 : pathLength,
            opacity: reduced ? 1 : opacity,
            filter: 'drop-shadow(0 0 6px var(--glow))',
          }}
        />
      </svg>
    </div>
  )
}
