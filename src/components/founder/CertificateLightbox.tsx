import { m } from 'framer-motion'
import { FileText, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Certificate } from '../../data/site'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { useTranslation } from '../../hooks/useTranslation'
import type { TranslationKey } from '../../i18n/LanguageContext'
import { duration, spring } from '../../lib/motion'

const MAX_SCALE = 4
const CLICK_SCALE = 2.5
const TAP_SLOP = 6

interface View {
  scale: number
  x: number
  y: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export interface CertificateLightboxProps {
  certificate: Certificate
  /** viewport point (px) the viewer scales open from */
  origin: { x: number; y: number }
  onClose: () => void
}

/**
 * Fullscreen certificate viewer. Click/tap toggles zoom at that point, two fingers pinch, the wheel zooms,
 * one finger or the mouse pans when zoomed. Esc closes. Transform-only animation.
 */
export default function CertificateLightbox({ certificate, origin, onClose }: CertificateLightboxProps) {
  const { t } = useTranslation()
  const { reduced } = useMotionPrefs()
  const panel = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  const [gesturing, setGesturing] = useState(false)

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({ startDist: 0, startScale: 1, moved: 0, pinched: false })

  const key = (name: 'title' | 'alt') => `founder.certificates.${certificate.id}.${name}` as TranslationKey

  /** keep the zoomed image from being dragged away from the stage */
  const constrain = useCallback((v: View): View => {
    const s = stage.current
    const i = img.current
    if (!s || !i) return v
    const scale = clamp(v.scale, 1, MAX_SCALE)
    if (scale === 1) return { scale, x: 0, y: 0 }
    const maxX = Math.max(0, (i.offsetWidth * scale - s.clientWidth) / 2)
    const maxY = Math.max(0, (i.offsetHeight * scale - s.clientHeight) / 2)
    return { scale, x: clamp(v.x, -maxX, maxX), y: clamp(v.y, -maxY, maxY) }
  }, [])

  /** zoom to `scale`, keeping the point (cx, cy) – relative to the stage centre – fixed */
  const zoomAt = useCallback(
    (scale: number, cx: number, cy: number) =>
      setView((v) => {
        const next = clamp(scale, 1, MAX_SCALE)
        const k = next / v.scale
        return constrain({ scale: next, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k })
      }),
    [constrain],
  )

  const fromCentre = (clientX: number, clientY: number) => {
    const r = stage.current!.getBoundingClientRect()
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) }
  }

  const zoomBy = (factor: number) => zoomAt(view.scale * factor, 0, 0)
  const reset = () => setView({ scale: 1, x: 0, y: 0 })

  // scroll lock, focus in / restore
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => {
      document.documentElement.style.overflow = prevOverflow
      trigger?.focus?.()
    }
  }, [])

  // Esc closes, +/- zoom, Tab stays inside the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '+' || e.key === '=') zoomBy(1.5)
      else if (e.key === '-') zoomBy(1 / 1.5)
      else if (e.key === 'Tab') {
        const f = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')
        if (!f?.length) return
        const first = f[0]
        const last = f[f.length - 1]
        const active = document.activeElement
        if (!panel.current?.contains(active) || (e.shiftKey && active === first)) {
          e.preventDefault()
          ;(e.shiftKey ? last : first).focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    if (pointers.current.size === 1) {
      g.moved = 0
      g.pinched = false
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      g.startDist = Math.hypot(a.x - b.x, a.y - b.y)
      g.startScale = view.scale
      g.pinched = true
    }
    setGesturing(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const g = gesture.current
    const now = { x: e.clientX, y: e.clientY }
    pointers.current.set(e.pointerId, now)

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const mid = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2)
      if (g.startDist > 0) zoomAt(g.startScale * (Math.hypot(a.x - b.x, a.y - b.y) / g.startDist), mid.x, mid.y)
    } else if (pointers.current.size === 1) {
      const dx = now.x - prev.x
      const dy = now.y - prev.y
      g.moved += Math.abs(dx) + Math.abs(dy)
      setView((v) => (v.scale > 1 ? constrain({ ...v, x: v.x + dx, y: v.y + dy }) : v))
    }
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.delete(e.pointerId)
    const g = gesture.current
    if (pointers.current.size > 0) return
    setGesturing(false)
    // a tap/click (no drag, no pinch) toggles zoom at the pointer
    if (e.type === 'pointerup' && !g.pinched && g.moved < TAP_SLOP) {
      const p = fromCentre(e.clientX, e.clientY)
      zoomAt(view.scale > 1 ? 1 : CLICK_SCALE, p.x, p.y)
    }
  }

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    const p = fromCentre(e.clientX, e.clientY)
    zoomAt(view.scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2), p.x, p.y)
  }

  const tool =
    'flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-night/60 text-snow backdrop-blur transition-colors [transition-duration:var(--dur-fast)] hover:border-sky hover:text-sky disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-snow'

  return createPortal(
    <m.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={t('founder.certificates.viewer')}
      className="fixed inset-0 z-[80] flex flex-col bg-night/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: duration.base } }}
      exit={{ opacity: 0, transition: { duration: duration.fast } }}
    >
      <div className="relative z-10 flex items-center justify-between gap-3 p-4">
        <p className="min-w-0 truncate text-sm font-bold text-snow">{t(key('title'))}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => zoomBy(1 / 1.5)} disabled={view.scale <= 1} aria-label={t('founder.certificates.zoomOut')} className={tool}>
            <ZoomOut size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => zoomBy(1.5)} disabled={view.scale >= MAX_SCALE} aria-label={t('founder.certificates.zoomIn')} className={tool}>
            <ZoomIn size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={reset} disabled={view.scale === 1} aria-label={t('founder.certificates.zoomReset')} className={`${tool} hidden sm:flex`}>
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <a href={certificate.pdf} target="_blank" rel="noopener noreferrer" aria-label={t('founder.certificates.pdf')} className={tool}>
            <FileText size={20} aria-hidden="true" />
          </a>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label={t('founder.certificates.close')} className={tool}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <m.div
        ref={stage}
        className={`relative min-h-0 flex-1 select-none overflow-hidden ${view.scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        style={{ touchAction: 'none', transformOrigin: `${origin.x}px ${origin.y}px` }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1, transition: reduced ? { duration: duration.fast } : spring.soft }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <img
          ref={img}
          src={certificate.full.src}
          alt={t(key('alt'))}
          width={certificate.full.width}
          height={certificate.full.height}
          draggable={false}
          className="absolute inset-0 m-auto max-h-full max-w-full rounded-lg object-contain shadow-glass"
          style={{
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
            transition: gesturing ? 'none' : 'transform var(--dur-base) var(--ease-out)',
            willChange: 'transform',
          }}
        />
      </m.div>

      <p className="relative z-10 px-4 py-3 text-center text-xs font-medium text-mist" aria-live="polite">
        {t('founder.certificates.zoomHint')}
      </p>
    </m.div>,
    document.body,
  )
}
