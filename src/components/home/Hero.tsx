import { Sparkles } from 'lucide-react'
import { photos } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import { useWhatsAppHref } from '../../hooks/useWhatsAppHref'
import { loopDuration } from '../../lib/motion'
import AuroraBackground from '../effects/AuroraBackground'
import FloatingBubbles from '../effects/FloatingBubbles'
import GridGlow from '../effects/GridGlow'
import IdleMount from '../effects/IdleMount'
import LightBeam from '../effects/LightBeam'
import NoiseOverlay from '../effects/NoiseOverlay'
import BrandLogo from '../BrandLogo'
import Button from '../Button'
import Eyebrow from '../Eyebrow'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import Parallax from '../motion/Parallax'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'
import Photo from '../Photo'

export default function Hero() {
  const { t } = useTranslation()
  const whatsapp = useWhatsAppHref()

  return (
    <section className="section-dark">
      <AuroraBackground />
      <IdleMount>
        <GridGlow />
        <LightBeam />
        <FloatingBubbles variant="hero" seed={11} />
      </IdleMount>
      <NoiseOverlay />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-36 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-44 lg:pt-24">
        <div>
          <Reveal>
            <Eyebrow>{t('home.hero.eyebrow')}</Eyebrow>
          </Reveal>
          <SplitText as="h1" text={t('home.hero.title')} className="mt-5 text-4xl sm:text-5xl lg:text-6xl" />
          <Reveal variant="blur" delay={0.15}>
            <p className="mt-6 text-base sm:text-lg">{t('home.hero.text')}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 flex items-center gap-2 font-medium text-snow">
              <Sparkles size={16} className="shrink-0 text-leaf" aria-hidden="true" />
              {t('tagline')}
            </p>
          </Reveal>
          <Reveal delay={0.25} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href={whatsapp}>
              <WhatsAppIcon size={18} />
              {t('common.whatsapp')}
            </Button>
            <Button to="/leistungen" variant="ghost-dark" arrow>
              {t('home.hero.ctaServices')}
            </Button>
          </Reveal>
        </div>

        {/* Photo collage of the real owner at work (portrait photos), with the floating logo */}
        <div className="relative mx-auto w-full max-w-sm pb-10 pt-6 sm:max-w-md lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -inset-10 -z-10 rounded-full"
            style={{ background: 'radial-gradient(closest-side, rgba(46,155,214,0.26), rgba(91,179,122,0.10) 60%, transparent)' }}
          />

          {/* main photo */}
          <div className="relative ml-auto w-[80%] rotate-2 overflow-hidden rounded-3xl border border-white/15 shadow-glass">
            <Parallax clip speed={0.4} className="aspect-[3/4]">
              <Photo photo={photos.vacuuming} eager priority sizes="(min-width: 1024px) 34vw, (min-width: 640px) 360px, 70vw" />
            </Parallax>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/50 via-transparent to-transparent"
            />
          </div>

          {/* second photo: the specialty */}
          <div className="absolute bottom-0 left-0 w-[44%] -rotate-6 overflow-hidden rounded-2xl border-4 border-night shadow-glass">
            <div className="relative aspect-[3/4]">
              <Photo photo={photos.itEquipment} sizes="(min-width: 1024px) 15vw, 30vw" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/90 to-transparent p-2.5 pt-8">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-leaf sm:text-xs">
                  <Sparkles size={12} aria-hidden="true" />
                  {t('common.specialty')}
                </span>
              </div>
            </div>
          </div>

          {/* floating logo with soft glow and slow parallax */}
          <Parallax speed={-0.8} className="absolute -left-2 top-0 z-10 w-[112px] sm:-left-6 sm:w-[140px] lg:-left-10 lg:w-[172px]">
            <div
              className="anim relative"
              style={{
                animationName: 'float',
                animationDuration: loopDuration(8),
                animationDirection: 'alternate',
                ['--fx' as string]: '0px',
                ['--fy' as string]: '-14px',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-full"
                style={{ background: 'radial-gradient(closest-side, rgba(46,155,214,0.55), rgba(91,179,122,0.25) 60%, transparent)' }}
              />
              <BrandLogo size={172} fluid labelled eager className="relative h-auto w-full shadow-[0_10px_40px_rgba(0,0,0,0.5)]" />
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  )
}
