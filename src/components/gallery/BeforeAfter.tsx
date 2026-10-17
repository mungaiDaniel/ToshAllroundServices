import { ArrowLeftRight } from 'lucide-react'
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

export interface BeforeAfterProps {
  before: { src: string; alt: string }
  after: { src: string; alt: string }
  width: number
  height: number
  className?: string
}

const STEP = 5
const clamp = (v: number) => Math.min(100, Math.max(0, v))

/** Drag (or arrow-key) slider that reveals the "before" photo over the "after" photo. */
export default function BeforeAfter({ before, after, width, height, className }: BeforeAfterProps) {
  const { t } = useTranslation()
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [pos, setPos] = useState(50)

  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (r) setPos(clamp(((clientX - r.left) / r.width) * 100))
  }
  const down = (e: PointerEvent) => {
    e.stopPropagation() // don't start the lightbox swipe
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    move(e.clientX)
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.stopPropagation() // don't change lightbox image
      setPos((p) => clamp(p + (e.key === 'ArrowRight' ? STEP : -STEP)))
    }
  }

  return (
    <div
      ref={box}
      className={`relative select-none overflow-hidden rounded-2xl ${className ?? ''}`}
      style={{ aspectRatio: `${width} / ${height}`, touchAction: 'none' }}
      onPointerDown={down}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img src={after.src} alt={after.alt} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={before.src}
        alt={before.alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-night/70 px-3 py-1 text-xs font-bold text-snow backdrop-blur">
        {t('gallery.before')}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-emerald px-3 py-1 text-xs font-bold text-night">
        {t('gallery.after')}
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.4)]" style={{ left: `${pos}%` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label={t('gallery.slider')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={key}
        className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-night shadow-glass"
        style={{ left: `${pos}%` }}
      >
        <ArrowLeftRight size={18} aria-hidden="true" />
      </div>
    </div>
  )
}
