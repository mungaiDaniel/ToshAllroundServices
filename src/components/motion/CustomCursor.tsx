import { m, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { cursor, features, spring } from '../../lib/motion'

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]'

/** Soft ring that follows the mouse and grows over interactive elements. Desktop only. */
export default function CustomCursor() {
  const { reduced, finePointer } = useMotionPrefs()
  const enabled = features.customCursor && finePointer && !reduced
  const x = useSpring(useMotionValue(-100), spring.cursor)
  const y = useSpring(useMotionValue(-100), spring.cursor)
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const over = (e: PointerEvent) => setHover(Boolean((e.target as Element | null)?.closest?.(INTERACTIVE)))
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const size = hover ? cursor.ringHover : cursor.ring
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] rounded-full border border-emerald/70 bg-emerald/10 mix-blend-normal"
      style={{
        x,
        y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        opacity: visible ? 1 : 0,
        transition:
          'width var(--dur-fast) var(--ease-out), height var(--dur-fast) var(--ease-out), margin var(--dur-fast) var(--ease-out), opacity var(--dur-fast)',
      }}
    />
  )
}
