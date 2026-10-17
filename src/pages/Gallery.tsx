import { AnimatePresence, domMax, LayoutGroup, LazyMotion, m } from 'framer-motion'
import { ArrowLeftRight, Maximize2 } from 'lucide-react'
import { useMemo, useState, type MouseEvent } from 'react'
import Lightbox from '../components/gallery/Lightbox'
import CtaBand from '../components/home/CtaBand'
import Reveal from '../components/motion/Reveal'
import PageHeader from '../components/PageHeader'
import { gallery, galleryCategories, type GalleryCategory } from '../data/gallery'
import { useMotionPrefs } from '../hooks/useMotionPrefs'
import { useTranslation } from '../hooks/useTranslation'
import { duration, ease } from '../lib/motion'

type Filter = 'all' | GalleryCategory

const categories = galleryCategories.filter((c) => gallery.some((g) => g.category === c))

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

  const items = useMemo(() => (filter === 'all' ? gallery : gallery.filter((g) => g.category === filter)), [filter])

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
                const active = filter === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(tab)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-all [transition-duration:var(--dur-fast)] ${
                      active
                        ? 'border-night bg-night text-snow shadow-soft'
                        : 'border-ink/15 bg-white text-ink hover:border-emerald hover:bg-mint'
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

          <LayoutGroup>
            <m.ul layout={!reduced} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {items.map((img, i) => (
                  <m.li
                    key={img.id}
                    layout={!reduced}
                    initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
                    animate={{ opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.out } }}
                    exit={{ opacity: 0, scale: reduced ? 1 : 0.92, transition: { duration: duration.fast } }}
                  >
                    <button
                      type="button"
                      onClick={(e) => open(i, e)}
                      aria-label={`${t('gallery.open')}: ${img.alt[language]}`}
                      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl bg-mint shadow-soft"
                    >
                      <img
                        src={img.src}
                        alt={img.alt[language]}
                        width={img.width}
                        height={img.height}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform [transition-duration:var(--dur-slow)] [transition-timing-function:var(--ease-out)] group-hover:scale-105"
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
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald px-3 py-1 text-xs font-bold text-night">
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
            </m.ul>
          </LayoutGroup>
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
