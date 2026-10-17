import type { ReactNode } from 'react'
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

/**
 * Moves its content at a different speed than the page scroll.
 * Uses a CSS scroll-driven animation (see `.parallax-layer` in index.css): no JavaScript runs while
 * scrolling. Browsers without support simply show the static layout.
 */
export default function Parallax({ children, speed = 1, clip = false, className }: ParallaxProps) {
  const { reduced, mobile } = useMotionPrefs()
  const range = parallax.range * speed * (mobile ? parallax.mobileFactor : 1)

  if (reduced) {
    return <div className={`${className ?? ''} ${clip ? 'overflow-hidden' : ''}`}>{children}</div>
  }

  const vars = { ['--parallax-range' as string]: `${range}px` }

  if (clip) {
    const bleed = Math.abs(range)
    return (
      <div className={`relative overflow-hidden ${className ?? ''}`}>
        <div className="parallax-layer absolute inset-x-0" style={{ top: -bleed, bottom: -bleed, ...vars }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="parallax-layer" style={vars}>
        {children}
      </div>
    </div>
  )
}
