import { Eye, Handshake, Quote, ShieldCheck, Smile, Target, type LucideIcon } from 'lucide-react'
import AuroraBackground from '../components/effects/AuroraBackground'
import FloatingBubbles from '../components/effects/FloatingBubbles'
import NoiseOverlay from '../components/effects/NoiseOverlay'
import CtaBand from '../components/home/CtaBand'
import Eyebrow from '../components/Eyebrow'
import Parallax from '../components/motion/Parallax'
import Reveal from '../components/motion/Reveal'
import SplitText from '../components/motion/SplitText'
import { Stagger, StaggerItem } from '../components/motion/Stagger'
import TiltCard from '../components/motion/TiltCard'
import PageHeader from '../components/PageHeader'
import SectionHeading from '../components/SectionHeading'
import { gallery } from '../data/gallery'
import { images, site } from '../data/site'
import { useTranslation } from '../hooks/useTranslation'
import type { TranslationKey } from '../i18n/LanguageContext'

const portrait = gallery.find((g) => g.id === 'homes-03')!

const values: { icon: LucideIcon; title: TranslationKey; text: TranslationKey }[] = [
  { icon: ShieldCheck, title: 'about.values.reliability.title', text: 'about.values.reliability.text' },
  { icon: Eye, title: 'about.values.detail.title', text: 'about.values.detail.text' },
  { icon: Handshake, title: 'about.values.respect.title', text: 'about.values.respect.text' },
  { icon: Smile, title: 'about.values.satisfaction.title', text: 'about.values.satisfaction.text' },
]

export default function About() {
  const { t, language } = useTranslation()

  return (
    <>
      <PageHeader
        eyebrow={t('nav.about')}
        title={t('pages.about.title')}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }]}
      />

      {/* Intro */}
      <section className="section-light overflow-x-clip py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 lg:grid-cols-2 lg:gap-20">
          <div>
            <SplitText as="h2" text={t('about.welcome')} className="text-3xl sm:text-4xl lg:text-5xl" />
            <Reveal delay={0.15}>
              <p className="mt-6">{t('about.p1')}</p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-5">{t('about.p2')}</p>
            </Reveal>
          </div>

          <Reveal variant="right" className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div aria-hidden="true" className="absolute -bottom-6 -right-6 -z-10 h-44 w-44 rounded-full bg-mint" />
            <Parallax clip speed={0.6} className="aspect-[4/5] rounded-3xl shadow-soft">
              <img
                src={portrait.src}
                alt={portrait.alt[language]}
                width={portrait.width}
                height={portrait.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[75%_50%]"
              />
            </Parallax>
            <div className="absolute -bottom-6 -left-3 w-36 overflow-hidden rounded-2xl border-4 border-white shadow-soft sm:-left-6 sm:w-44">
              <img
                src={images.aboutSupplies.src}
                alt={images.aboutSupplies.alt[language]}
                width={1000}
                height={667}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section className="section-dark py-20 sm:py-28">
        <AuroraBackground />
        <FloatingBubbles variant="edges" seed={3} />
        <NoiseOverlay />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Reveal>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald/40 bg-emerald/10 text-emerald shadow-[0_0_40px_var(--glow)]">
              <Target size={26} aria-hidden="true" />
            </span>
          </Reveal>
          <Reveal delay={0.1} className="mt-6">
            <Eyebrow>{t('about.mission.eyebrow')}</Eyebrow>
          </Reveal>
          <SplitText as="h2" text={t('about.mission.title')} className="mt-4 text-3xl sm:text-5xl" />
          <Reveal delay={0.3}>
            <p className="mx-auto mt-6 text-lg text-snow/90 sm:text-xl">{t('about.mission.text')}</p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="section-mint py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            align="center"
            eyebrow={t('about.values.eyebrow')}
            title={t('about.values.title')}
          />
          <Stagger as="ul" gap="loose" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <StaggerItem as="li" key={title}>
                <TiltCard className="h-full rounded-3xl">
                  <div className="card-light h-full p-6 text-center sm:p-8">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-emerald-deep">
                      <Icon size={26} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg">{t(title)}</h3>
                    <p className="mx-auto mt-2 text-sm text-ink-muted">{t(text)}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Tagline */}
      <section className="section-light py-24 sm:py-32">
        <figure className="mx-auto max-w-4xl px-4 text-center">
          <Reveal variant="scale">
            <Quote size={56} aria-hidden="true" className="mx-auto fill-emerald/20 text-emerald/50" />
          </Reveal>
          <blockquote>
            <SplitText
              as="p"
              text={t('tagline')}
              className="mx-auto -mt-6 max-w-3xl text-balance font-heading text-3xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl"
            />
          </blockquote>
          <Reveal delay={0.4}>
            <figcaption className="eyebrow eyebrow-light mt-8 justify-center">{site.name}</figcaption>
          </Reveal>
        </figure>
      </section>

      <CtaBand />
    </>
  )
}
