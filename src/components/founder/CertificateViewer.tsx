import { AnimatePresence } from 'framer-motion'
import { BadgeCheck, FileText, Maximize2 } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import type { Certificate } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import type { TranslationKey } from '../../i18n/LanguageContext'
import Button from '../Button'
import Eyebrow from '../Eyebrow'
import TiltCard from '../motion/TiltCard'
import CertificateLightbox from './CertificateLightbox'

/** Framed "document card" for one certificate: tilt on hover, click opens the zoomable viewer, plus a PDF button. */
export default function CertificateViewer({ certificate }: { certificate: Certificate }) {
  const { t } = useTranslation()
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)
  const key = (name: 'title' | 'institution' | 'alt') =>
    `founder.certificates.${certificate.id}.${name}` as TranslationKey

  const open = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }

  return (
    <figure className="m-0 mx-auto w-full max-w-[15rem] sm:mx-0">
      <Eyebrow tone="light" icon={BadgeCheck}>
        {t('founder.certificates.eyebrow')}
      </Eyebrow>

      <TiltCard className="relative mt-3 rounded-2xl">
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          aria-label={`${t('founder.certificates.open')}: ${t(key('title'))}`}
          className="group/doc relative block w-full cursor-zoom-in rounded-2xl border border-slate-900/10 bg-white p-2 shadow-[0_2px_4px_rgb(15_23_42/0.06),0_14px_34px_rgb(15_23_42/0.14)] transition-shadow [transition-duration:var(--dur-base)] hover:shadow-[0_2px_4px_rgb(15_23_42/0.06),0_22px_50px_rgb(15_23_42/0.2),0_0_40px_var(--glow)]"
        >
          <img
            src={certificate.thumb.src}
            alt={t(key('alt'))}
            width={certificate.thumb.width}
            height={certificate.thumb.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-lg"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-night/80 text-snow opacity-0 transition-opacity [transition-duration:var(--dur-fast)] group-hover/doc:opacity-100 group-focus-visible/doc:opacity-100"
          >
            <Maximize2 size={16} />
          </span>
        </button>
      </TiltCard>

      <figcaption className="mt-4">
        <p className="text-sm font-bold text-ink">{t(key('title'))}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {t(key('institution'))} · {certificate.year}
        </p>
        <p className="mt-1 text-xs text-ink-muted">{t('founder.certificates.enlarge')}</p>
        <Button href={certificate.pdf} variant="ghost-light" className="mt-4 w-full !px-4 !py-2.5 !text-xs">
          <FileText size={14} aria-hidden="true" />
          {t('founder.certificates.pdf')}
        </Button>
      </figcaption>

      <AnimatePresence>
        {origin && <CertificateLightbox certificate={certificate} origin={origin} onClose={() => setOrigin(null)} />}
      </AnimatePresence>
    </figure>
  )
}
