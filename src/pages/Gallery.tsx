import { AnimatePresence, domMax, LazyMotion, m } from 'framer-motion'
import { ArrowLeftRight, Maximize2 } from 'lucide-react'
import { useMemo, useState, useSyncExternalStore, type MouseEvent } from 'react'
import Lightbox from '../components/gallery/Lightbox'
import CtaBand from '../components/home/CtaBand'
import Reveal from '../components/motion/Reveal'
import PageHeader from '../components/PageHeader'
import Photo from '../components/Photo'
import { GallerySkeleton } from '../components/Skeletons'
import { useGallery } from '../data/content/hooks'
import { galleryCategories, type GalleryCategory, type GalleryImage } from '../data/gallery'
import { useMotionPrefs } from '../hooks/useMotionPrefs'
import { useTranslation } from '../hooks/useTranslation'
import { duration, ease } from '../lib/motion'

type Filter = 'all' | GalleryCategory

const mq = (q: string) => (cb: () => void) => {
  const m = window.matchMedia(q)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
/** 1 column on phones, 2 on tablets, 3 on desktop */
function useColumnCount() {
  const three = useSyncExternalStore(mq('(min-width: 1024px)'), () => window.matchMedia('(min-width: 1024px)').matches, () => false)
  const two = useSyncExternalStore(mq('(min-width: 640px)'), () => window.matchMedia('(min-width: 640px)').matches, () => false)
  return three ? 3 : two ? 2 : 1
}

/** Puts each photo (in order) into the currently shortest column, so the layout stays balanced. */
function distribute(items: GalleryImage[], count: number) {
  const cols: { img: GalleryImage; index: number }[][] = Array.from({ length: count }, () => [])
  const heights = new Array(count).fill(0)
  items.forEach((img, index) => {
    const c = heights.indexOf(Math.min(...heights))
    cols[c].push({ img, index })
    heights[c] += img.height / img.width + 0.04
  })
  return cols
}

export default function Gallery() {
  // layout animations (filter) and drag (lightbox swipe) need the larger feature set, only loaded on this page
  return (
    <LazyMotion features={domMax} strict>
      <GalleryContent />
    </LazyMotion>
  )
}

function GalleryContent() {
  const { t, language } = useTranslation()
  const { reduced } = useMotionPrefs()
  const [filter, setFilter] = useState<Filter>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })

  const columnCount = useColumnCount()
  const { items: gallery, loading } = useGallery()
  const categories = useMemo(() => galleryCategories.filter((c) => gallery.some((g) => g.category === c)), [gallery])
  // if the chosen category disappears (e.g. content changed), show everything again
  const activeFilter: Filter = filter === 'all' || categories.includes(filter) ? filter : 'all'
  const items = useMemo(() => (activeFilter === 'all' ? gallery : gallery.filter((g) => g.category === activeFilter)), [gallery, activeFilter])

  const columns = useMemo(() => distribute(items, columnCount), [items, columnCount])

  const open = (index: number, e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    setOpenIndex(index)
  }

  const tabs: Filter[] = ['all', ...categories]

  return (
    <>
      <PageHeader
        eyebrow={t('nav.gallery')}
        title={t('pages.gallery.title')}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.gallery') }]}
      />

      <section className="section-light py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-ink-muted">{t('gallery.intro')}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div role="group" aria-label={t('gallery.filterLabel')} className="mt-8 flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const active = activeFilter === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(tab)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-all [transition-duration:var(--dur-fast)] ${
                      active
                        ? 'border-night bg-night text-snow shadow-soft'
                        : 'border-ink/15 bg-white text-ink hover:border-sky hover:bg-mint'
                    }`}
                  >
                    {tab === 'all' ? t('gallery.categories.all') : t(`gallery.categories.${tab}`)}
                  </button>
                )
              })}
            </div>
          </Reveal>

          <p className="sr-only" aria-live="polite">
            {items.length} {t('gallery.count')}
          </p>

          {/* masonry: photos keep their own proportions (tall portraits are never cropped or stretched) */}
          {loading ? (
            <div className="mt-10">
              <GallerySkeleton columns={columnCount} />
            </div>
          ) : (
          <div className="mt-10 flex items-start gap-4 sm:gap-6">
            {columns.map((col, c) => (
              <ul key={c} className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
                <AnimatePresence initial={false}>
                  {col.map(({ img, index }) => (
                    <m.li
                      key={img.id}
                      initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
                      animate={{ opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.out } }}
                      exit={{ opacity: 0, scale: reduced ? 1 : 0.94, transition: { duration: duration.fast } }}
                    >
                      <button
                        type="button"
                        onClick={(e) => open(index, e)}
                        aria-label={`${t('gallery.open')}: ${img.alt[language]}`}
                        className="group relative block w-full overflow-hidden rounded-3xl bg-mint shadow-soft"
                        style={{ aspectRatio: `${img.width} / ${img.height}` }}
                      >
                        <Photo
                          photo={img}
                          eager={index < 3}
                          priority={index === 0}
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) calc(50vw - 2rem), calc(100vw - 2rem)"
                          className="transition-transform [transition-duration:var(--dur-slow)] [transition-timing-function:var(--ease-out)] group-hover:scale-105"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/0 to-transparent opacity-0 transition-opacity [transition-duration:var(--dur-base)] group-hover:opacity-100 group-focus-visible:opacity-100"
                        />
                        <span className="absolute inset-x-4 bottom-4 flex items-center justify-between text-snow opacity-0 transition-opacity [transition-duration:var(--dur-base)] group-hover:opacity-100 group-focus-visible:opacity-100">
                          <span className="text-xs font-bold uppercase tracking-widest">
                            {t(`gallery.categories.${img.category}`)}
                          </span>
                          <Maximize2 size={18} aria-hidden="true" />
                        </span>
                        {img.before && (
                          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-leaf px-3 py-1 text-xs font-bold text-night">
                            <ArrowLeftRight size={14} aria-hidden="true" />
                            {t('gallery.beforeAfter')}
                          </span>
                        )}
                        {import.meta.env.DEV && img.placeholder && (
                          <span className="absolute right-3 top-3 rounded-full bg-night/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-snow">
                            {t('gallery.placeholderNote')}
                          </span>
                        )}
                      </button>
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>
            ))}
          </div>
          )}
        </div>
      </section>

      <CtaBand />

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            key="lightbox"
            items={items}
            index={openIndex}
            origin={origin}
            onClose={() => setOpenIndex(null)}
            onIndexChange={setOpenIndex}
          />
        )}
      </AnimatePresence>
    </>
  )
}
