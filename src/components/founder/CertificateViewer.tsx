import { AnimatePresence } from 'framer-motion'
import { BadgeCheck, FileText, Maximize2 } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import type { CertificateView } from '../../data/content/types'
import { useTranslation } from '../../hooks/useTranslation'
import Button from '../Button'
import Eyebrow from '../Eyebrow'
import TiltCard from '../motion/TiltCard'
import CertificateLightbox from './CertificateLightbox'

/** Framed "document card" for one certificate: tilt on hover, click opens the zoomable viewer, plus a PDF button. */
export default function CertificateViewer({ certificate }: { certificate: CertificateView }) {
  const { t } = useTranslation()
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)
  // a certificate added in the admin as PDF only has no picture
  const hasImage = Boolean(certificate.thumb.src)

  const open = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }

  return (
    <figure className="m-0 mx-auto w-full max-w-[15rem] sm:mx-0">
      <Eyebrow tone="light" icon={BadgeCheck}>
        {t('founder.certificates.eyebrow')}
      </Eyebrow>

      {hasImage ? (
      <TiltCard className="relative mt-3 rounded-2xl">
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          aria-label={`${t('founder.certificates.open')}: ${certificate.title}`}
          className="group/doc relative block w-full cursor-zoom-in rounded-2xl border border-slate-900/10 bg-white p-2 shadow-[0_2px_4px_rgb(15_23_42/0.06),0_14px_34px_rgb(15_23_42/0.14)] transition-shadow [transition-duration:var(--dur-base)] hover:shadow-[0_2px_4px_rgb(15_23_42/0.06),0_22px_50px_rgb(15_23_42/0.2),0_0_40px_var(--glow)]"
        >
          <img
            src={certificate.thumb.src}
            alt={certificate.alt}
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
      ) : (
        <div className="mt-3 flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-slate-900/10 bg-white text-brand shadow-soft">
          <FileText size={44} aria-hidden="true" />
        </div>
      )}

      <figcaption className="mt-4">
        <p className="text-sm font-bold text-ink">{certificate.title}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {certificate.institution} · {certificate.year}
        </p>
        {hasImage && <p className="mt-1 text-xs text-ink-muted">{t('founder.certificates.enlarge')}</p>}
        {certificate.pdf && (
          <Button href={certificate.pdf} variant="ghost-light" className="mt-4 w-full !px-4 !py-2.5 !text-xs">
            <FileText size={14} aria-hidden="true" />
            {t('founder.certificates.pdf')}
          </Button>
        )}
      </figcaption>

      <AnimatePresence>
        {origin && <CertificateLightbox certificate={certificate} origin={origin} onClose={() => setOrigin(null)} />}
      </AnimatePresence>
    </figure>
  )
}
