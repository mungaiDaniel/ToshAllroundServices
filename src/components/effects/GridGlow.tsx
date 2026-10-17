import { useEffect, useRef } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'

const grid = (alpha: number) =>
  `linear-gradient(rgba(255,255,255,${alpha}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${alpha}) 1px, transparent 1px)`

/**
 * Faint grid with an emerald glow that follows the cursor (desktop).
 * Listens on its parent element; place it inside a `relative` section.
 */
export default function GridGlow({ className }: { className?: string }) {
  const { reduced, finePointer } = useMotionPrefs()
  const ref = useRef<HTMLDivElement>(null)
  const live = finePointer && !reduced

  useEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent || !live) return
    let frame = 0
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = parent.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
        el.style.setProperty('--glow-on', '1')
      })
    }
    const leave = () => el.style.setProperty('--glow-on', '0')
    parent.addEventListener('pointermove', move, { passive: true })
    parent.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      parent.removeEventListener('pointermove', move)
      parent.removeEventListener('pointerleave', leave)
    }
  }, [live])

  const size = { backgroundSize: '56px 56px' }
  const mask = 'radial-gradient(260px circle at var(--mx, 50%) var(--my, 40%), #000, transparent)'
  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${className ?? ''}`}>
      <div className="absolute inset-0" style={{ backgroundImage: grid(0.035), ...size }} />
      {live && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: grid(0.28).replaceAll('255,255,255', '16,185,129'),
            ...size,
            WebkitMaskImage: mask,
            maskImage: mask,
            opacity: 'var(--glow-on, 0)',
            transition: 'opacity var(--dur-base) var(--ease-out)',
          }}
        />
      )}
    </div>
  )
}
