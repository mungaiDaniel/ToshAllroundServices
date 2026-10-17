import AuroraBackground from '../components/effects/AuroraBackground'
import FloatingBubbles from '../components/effects/FloatingBubbles'
import NoiseOverlay from '../components/effects/NoiseOverlay'
import Button from '../components/Button'
import Reveal from '../components/motion/Reveal'
import { useTranslation } from '../hooks/useTranslation'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <section className="section-dark flex min-h-[70vh] items-center">
      <AuroraBackground />
      <FloatingBubbles variant="edges" seed={9} />
      <NoiseOverlay />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Reveal>
          <p className="font-heading text-7xl font-extrabold text-sky sm:text-9xl">{t('notFound.code')}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-4 text-3xl sm:text-4xl">{t('notFound.title')}</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4">{t('notFound.text')}</p>
        </Reveal>
        <Reveal delay={0.3} className="mt-8">
          <Button to="/" arrow>
            {t('notFound.home')}
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
