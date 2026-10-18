import { AnimatePresence, m, useDragControls, type PanInfo, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { GalleryImage } from '../../data/gallery'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { useTranslation } from '../../hooks/useTranslation'
import { distance, duration, ease, spring } from '../../lib/motion'
import BeforeAfter from './BeforeAfter'

export interface LightboxProps {
  items: GalleryImage[]
  index: number
  /** viewport point (px) the lightbox scales open from – the clicked thumbnail's centre */
  origin: { x: number; y: number }
  onClose: () => void
  onIndexChange: (index: number) => void
}

const SWIPE_DISTANCE = 70
const SWIPE_VELOCITY = 500

/** Fullscreen viewer: arrows, keyboard (← → Esc), swipe on touch, focus trap, optional before/after slider. */
export default function Lightbox({ items, index, origin, onClose, onIndexChange }: LightboxProps) {
  const { t, language } = useTranslation()
  const { reduced } = useMotionPrefs()
  const controls = useDragControls()
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [direction, setDirection] = useState(0)

  const item = items[index]
  const total = items.length

  const go = useCallback(
    (step: number) => {
      if (total < 2) return
      setDirection(step)
      onIndexChange((index + step + total) % total)
    },
    [index, total, onIndexChange],
  )

  // scroll lock, focus in / restore, keyboard
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

  // keep Tab inside the dialog, even after a click/drag moved focus to the page
  const trapFocus = useCallback((e: KeyboardEvent) => {
    const f = panel.current?.querySelectorAll<HTMLElement>('button, [tabindex="0"]')
    if (!f?.length) return
    const first = f[0]
    const last = f[f.length - 1]
    const active = document.activeElement
    const inside = panel.current?.contains(active)
    if (!inside || (e.shiftKey && active === first)) {
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') trapFocus(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose, trapFocus])

  // preload neighbours so next/prev feel instant
  useEffect(() => {
    if (total < 2) return
    for (const n of [items[(index + 1) % total], items[(index - 1 + total) % total]]) {
      new Image().src = n.src
      if (n.before) new Image().src = n.before.src
    }
  }, [index, items, total])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1)
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1)
  }

  const slide: Variants = {
    enter: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * distance.lg }),
    center: { opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.out } },
    exit: (d: number) =>
      reduced
        ? { opacity: 0, transition: { duration: duration.fast } }
        : { opacity: 0, x: -d * distance.lg, transition: { duration: duration.fast } },
  }

  const alt = item.alt[language]
  const ratio = item.width / item.height
  const stageWidth = `min(92vw, 1100px, calc(70vh * ${ratio}))`

  const arrow =
    'absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-night/60 text-snow backdrop-blur transition-colors [transition-duration:var(--dur-fast)] hover:border-sky hover:text-sky sm:flex'

  return createPortal(
    <m.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={t('gallery.lightbox')}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-night/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: duration.base } }}
      exit={{ opacity: 0, transition: { duration: duration.fast } }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        ref={closeBtn}
        type="button"
        onClick={onClose}
        aria-label={t('gallery.close')}
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-night/60 text-snow transition-colors [transition-duration:var(--dur-fast)] hover:border-sky hover:text-sky"
      >
        <X size={22} aria-hidden="true" />
      </button>

      {total > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label={t('gallery.prev')} className={`${arrow} left-4`}>
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label={t('gallery.next')} className={`${arrow} right-4`}>
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </>
      )}

      {/* scales open from the clicked thumbnail */}
      <m.div
        className="flex w-full flex-col items-center px-4"
        style={{ transformOrigin: `${origin.x}px ${origin.y}px`, touchAction: 'none' }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1, transition: reduced ? { duration: duration.fast } : spring.soft }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <m.div
          drag="x"
          dragListener={false}
          dragControls={controls}
          dragSnapToOrigin
          dragElastic={0.35}
          onDragEnd={onDragEnd}
          onPointerDown={(e) => total > 1 && controls.start(e)}
          className="flex w-full justify-center"
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <m.figure
              key={item.id}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              className="m-0 flex flex-col items-center"
            >
              <div style={{ width: stageWidth }}>
                {item.before ? (
                  <BeforeAfter
                    before={{ src: item.before.src, alt: (item.before.alt ?? item.alt)[language] }}
                    after={{ src: item.src, alt }}
                    width={item.width}
                    height={item.height}
                    className="shadow-glass"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={alt}
                    width={item.width}
                    height={item.height}
                    draggable={false}
                    className="h-auto w-full rounded-2xl object-contain shadow-glass"
                  />
                )}
              </div>
              <figcaption className="mt-4 max-w-xl px-2 text-center text-sm text-snow/80">
                {item.caption?.[language] || alt}
              </figcaption>
            </m.figure>
          </AnimatePresence>
        </m.div>

        <p className="mt-3 text-xs font-medium text-mist" aria-live="polite">
          {index + 1} {t('gallery.of')} {total}
        </p>
      </m.div>
    </m.div>,
    document.body,
  )
}
