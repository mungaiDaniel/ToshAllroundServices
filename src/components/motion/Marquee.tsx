import type { ReactNode } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { usePauseOffscreen } from '../../hooks/usePauseOffscreen'
import { loopDuration } from '../../lib/motion'

export interface MarqueeProps {
  children: ReactNode
  /** seconds for one full loop at intensity 1 */
  loop?: number
  reverse?: boolean
  className?: string
}

const fade = '[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]'

/** Infinite strip. Pauses on hover and while off-screen; static and wrapped when motion is reduced. */
export default function Marquee({ children, loop = 40, reverse = false, className }: MarqueeProps) {
  const { reduced } = useMotionPrefs()
  const { ref, pauseProps } = usePauseOffscreen<HTMLDivElement>()

  if (reduced) {
    return <div className={`flex flex-wrap items-center justify-center gap-4 ${className ?? ''}`}>{children}</div>
  }

  const group = 'flex shrink-0 items-center gap-4 pr-4'
  return (
    <div ref={ref} {...pauseProps} className={`marquee overflow-hidden ${fade} ${className ?? ''}`}>
      <div
        className="marquee-track anim flex w-max"
        style={{
          animationName: 'marquee',
          animationTimingFunction: 'linear',
          animationDuration: loopDuration(loop),
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className={group}>{children}</div>
        <div className={group} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
