import { BadgeCheck } from 'lucide-react'
import { founder } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import Button from '../Button'
import Eyebrow from '../Eyebrow'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'
import TiltCard from '../motion/TiltCard'

/** Short "meet the founder" card for the home page; links to the full CV on the About page. */
export default function FounderPreview() {
  const { t } = useTranslation()
  return (
    <section className="section-light py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal variant="scale">
          <TiltCard className="relative rounded-3xl">
            <div className="card-light grid !bg-mint items-center gap-8 p-6 sm:grid-cols-[14rem_minmax(0,1fr)] sm:p-10">
              <div className="mx-auto w-48 sm:w-full">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl border-4 border-white shadow-[0_0_44px_var(--glow),0_16px_50px_var(--glow-leaf)]">
                  <img
                    src={founder.image.srcSm}
                    alt={t('founder.photoAlt')}
                    width={founder.image.width}
                    height={founder.image.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>

              <div className="text-center sm:text-left">
                <Eyebrow tone="light">{t('founder.preview.eyebrow')}</Eyebrow>
                <SplitText as="h2" text={t('founder.preview.title')} className="mt-3 text-2xl sm:text-3xl lg:text-4xl" />
                <p className="mt-4 text-sm font-bold text-ink">
                  {founder.name} <span className="font-medium text-ink-muted">· {t('founder.role')}</span>
                </p>
                <p className="mt-3 text-ink-muted">{t('founder.profile.text')}</p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-leaf/40 bg-mint px-3.5 py-1.5 text-xs font-medium text-brand">
                  <BadgeCheck size={14} aria-hidden="true" />
                  {t('founder.preview.badge')}
                </p>
                <div className="mt-6">
                  <Button to="/ueber-uns#gruender" variant="primary" arrow>
                    {t('founder.preview.cta')}
                  </Button>
                </div>
              </div>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  )
}
