import {
  m,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { spring, tilt } from '../../lib/motion'

export interface TiltCardProps {
  children: ReactNode
  /** max rotation in degrees (defaults to the global tilt token) */
  max?: number
  /** soft moving light highlight */
  glare?: boolean
  className?: string
}

/** 3D tilt toward the cursor with a moving light highlight. Mouse hover only. */
export default function TiltCard({ children, max = tilt.max, glare = true, className }: TiltCardProps) {
  const { reduced, finePointer } = useMotionPrefs()
  const px = useSpring(useMotionValue(0.5), spring.soft)
  const py = useSpring(useMotionValue(0.5), spring.soft)
  const rotateX = useTransform(py, [0, 1], [max, -max])
  const rotateY = useTransform(px, [0, 1], [-max, max])
  const gx = useTransform(px, (v) => v * 100)
  const gy = useTransform(py, (v) => v * 100)
  const glareBg = useMotionTemplate`radial-gradient(380px circle at ${gx}% ${gy}%, rgba(255,255,255,0.14), transparent 60%)`

  if (reduced || !finePointer) return <div className={className}>{children}</div>

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <m.div
      className={`group ${className ?? ''}`}
      style={{ rotateX, rotateY, transformPerspective: tilt.perspective, transformStyle: 'preserve-3d' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
      {glare && (
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity [transition-duration:var(--dur-base)] group-hover:opacity-100"
          style={{ background: glareBg }}
        />
      )}
    </m.div>
  )
}
