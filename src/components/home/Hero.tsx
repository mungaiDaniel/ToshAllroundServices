import { Sparkles } from 'lucide-react'
import { images } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import { useWhatsAppHref } from '../../hooks/useWhatsAppHref'
import AuroraBackground from '../effects/AuroraBackground'
import FloatingBubbles from '../effects/FloatingBubbles'
import GridGlow from '../effects/GridGlow'
import LightBeam from '../effects/LightBeam'
import NoiseOverlay from '../effects/NoiseOverlay'
import Button from '../Button'
import Eyebrow from '../Eyebrow'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import Parallax from '../motion/Parallax'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'

const bubble =
  'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 22%, rgba(16,185,129,0.12) 60%, rgba(124,143,214,0.25))'

export default function Hero() {
  const { t, language } = useTranslation()
  const whatsapp = useWhatsAppHref()

  return (
    <section className="section-dark">
      <AuroraBackground />
      <GridGlow />
      <LightBeam />
      <FloatingBubbles variant="hero" seed={11} />
      <NoiseOverlay />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-36 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-44 lg:pt-24">
        <div>
          <Reveal>
            <Eyebrow>{t('home.hero.eyebrow')}</Eyebrow>
          </Reveal>
          <SplitText as="h1" text={t('home.hero.title')} className="mt-5 text-4xl sm:text-5xl lg:text-6xl" />
          <Reveal variant="blur" delay={0.45}>
            <p className="mt-6 text-base sm:text-lg">{t('home.hero.text')}</p>
          </Reveal>
          <Reveal delay={0.55}>
            <p className="mt-5 flex items-center gap-2 font-medium text-snow">
              <Sparkles size={16} className="shrink-0 text-emerald" aria-hidden="true" />
              {t('tagline')}
            </p>
          </Reveal>
          <Reveal delay={0.65} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href={whatsapp}>
              <WhatsAppIcon size={18} />
              {t('common.whatsapp')}
            </Button>
            <Button to="/leistungen" variant="ghost-dark" arrow>
              {t('home.hero.ctaServices')}
            </Button>
          </Reveal>
        </div>

        <Reveal variant="scale" delay={0.3} className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* decorative shapes */}
          <div
            aria-hidden="true"
            className="absolute -inset-10 -z-10 rounded-full"
            style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.28), transparent)' }}
          />
          <div
            aria-hidden="true"
            className="absolute -right-5 -top-5 -z-10 h-28 w-28 rounded-full border border-white/20"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-6 -left-6 z-10 hidden h-24 w-24 rounded-full border border-white/25 sm:block"
            style={{ background: bubble }}
          />
          <div
            aria-hidden="true"
            className="absolute -right-3 bottom-16 z-10 hidden h-12 w-12 rounded-full border border-white/25 sm:block"
            style={{ background: bubble }}
          />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-glass">
            <Parallax clip speed={0.5} className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
              <img
                src={images.hero.src}
                alt={images.hero.alt[language]}
                width={1920}
                height={1080}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-[62%_50%]"
              />
            </Parallax>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-night/70 p-4 backdrop-blur-md">
              <span className="eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                {t('common.specialty')}
              </span>
              <p className="mt-1 text-sm font-bold text-snow">{t('services.it.title')}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
