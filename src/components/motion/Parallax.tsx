import { m, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { parallax } from '../../lib/motion'

export interface ParallaxProps {
  children: ReactNode
  /** 1 = default travel; negative reverses direction */
  speed?: number
  /**
   * Image mode: the wrapper clips its content and the moving layer is
   * oversized so no gaps show. Give the child `h-full w-full object-cover`.
   */
  clip?: boolean
  className?: string
}

/** Moves its content at a different speed than the page scroll. Transform only. */
export default function Parallax({ children, speed = 1, clip = false, className }: ParallaxProps) {
  const { reduced, mobile } = useMotionPrefs()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const range = parallax.range * speed * (mobile ? parallax.mobileFactor : 1)
  const y = useTransform(scrollYProgress, [0, 1], [range, -range])

  if (reduced) {
    return <div className={`${className ?? ''} ${clip ? 'overflow-hidden' : ''}`}>{children}</div>
  }

  if (clip) {
    const bleed = Math.abs(range)
    return (
      <div ref={ref} className={`relative overflow-hidden ${className ?? ''}`}>
        <m.div
          className="absolute inset-x-0 will-change-transform"
          style={{ top: -bleed, bottom: -bleed, y }}
        >
          {children}
        </m.div>
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      <m.div className="will-change-transform" style={{ y }}>
        {children}
      </m.div>
    </div>
  )
}
