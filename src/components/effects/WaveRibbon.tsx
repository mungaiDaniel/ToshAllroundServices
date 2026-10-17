import { useId } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { usePauseOffscreen } from '../../hooks/usePauseOffscreen'
import { loopDuration } from '../../lib/motion'

export interface WaveRibbonProps {
  /** "calm": two gentle lines for page headers. "lively": three taller waves. */
  variant?: 'calm' | 'lively'
  className?: string
}

const PERIOD = 400
const PERIODS = 4

function wave(y: number, amp: number) {
  let d = `M0 ${y} Q${PERIOD / 4} ${y - amp} ${PERIOD / 2} ${y}`
  for (let i = 1; i < PERIODS * 2; i++) {
    d += ` T${(PERIOD / 2) * (i + 1)} ${y}`
  }
  return d
}

const config = {
  calm: [
    { y: 60, amp: 28, loop: 38, opacity: 0.55, width: 1.5 },
    { y: 74, amp: 20, loop: 52, opacity: 0.3, width: 1 },
  ],
  lively: [
    { y: 50, amp: 52, loop: 22, opacity: 0.7, width: 2 },
    { y: 66, amp: 38, loop: 30, opacity: 0.45, width: 1.5 },
    { y: 80, amp: 26, loop: 40, opacity: 0.3, width: 1 },
  ],
} as const

/** Flowing gradient wave lines. Transform-only CSS loop; place at the bottom of a header. */
export default function WaveRibbon({ variant = 'calm', className }: WaveRibbonProps) {
  const { reduced } = useMotionPrefs()
  const { ref, pauseProps } = usePauseOffscreen<HTMLDivElement>()
  const id = useId()
  const lines = config[variant]

  return (
    <div
      ref={ref}
      {...pauseProps}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 overflow-hidden ${className ?? ''}`}
    >
      {lines.map((l, i) => (
        <svg
          key={i}
          viewBox={`0 0 ${PERIOD * PERIODS} 120`}
          preserveAspectRatio="none"
          className="anim absolute bottom-0 left-0 h-full"
          style={{
            width: '133.34%',
            opacity: l.opacity,
            animationName: reduced ? 'none' : 'wave',
            animationTimingFunction: 'linear',
            animationDuration: loopDuration(l.loop),
            animationDirection: i % 2 ? 'reverse' : 'normal',
          }}
        >
          <defs>
            <linearGradient id={`${id}-${i}`} x1="0" x2="1">
              <stop offset="0" stopColor="#1e6bb8" stopOpacity="0" />
              <stop offset="0.35" stopColor="#2e9bd6" />
              <stop offset="0.7" stopColor="#5bb37a" />
              <stop offset="1" stopColor="#5bb37a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={wave(l.y, l.amp)}
            fill="none"
            stroke={`url(#${id}-${i})`}
            strokeWidth={l.width}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}
    </div>
  )
}
