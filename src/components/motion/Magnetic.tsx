import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { magnetic, spring } from '../../lib/motion'

export interface MagneticProps {
  children: ReactNode
  /** 0–1, how strongly the element follows the cursor */
  pull?: number
  className?: string
}

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v))

/** Wrapper that subtly follows the cursor. Desktop (fine pointer) only. */
export default function Magnetic({ children, pull = magnetic.pull, className }: MagneticProps) {
  const { reduced, finePointer } = useMotionPrefs()
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), spring.magnetic)
  const y = useSpring(useMotionValue(0), spring.magnetic)

  if (reduced || !finePointer) return <div className={className}>{children}</div>

  const onMove = (e: PointerEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set(clamp((e.clientX - (r.left + r.width / 2)) * pull, magnetic.max))
    y.set(clamp((e.clientY - (r.top + r.height / 2)) * pull, magnetic.max))
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className ?? 'inline-block'}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
