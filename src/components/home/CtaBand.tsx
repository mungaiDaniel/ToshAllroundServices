import { Phone } from 'lucide-react'
import { site } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import { useWhatsAppHref } from '../../hooks/useWhatsAppHref'
import { loopDuration } from '../../lib/motion'
import Button from '../Button'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import Magnetic from '../motion/Magnetic'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'

export default function CtaBand() {
  const { t } = useTranslation()
  const whatsapp = useWhatsAppHref()
  return (
    <section
      className="relative isolate overflow-hidden py-20 text-center text-night sm:py-24"
      style={{
        backgroundImage: 'linear-gradient(110deg, #10b981, #7c8fd6, #10b981)',
        backgroundSize: '200% 100%',
        animation: `gradient-shift ${loopDuration(14) ?? '0s'} linear infinite`,
      }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <SplitText as="h2" text={t('home.cta.title')} className="!text-night text-3xl sm:text-5xl" />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-5 text-night/80">{t('home.cta.text')}</p>
        </Reveal>
        <Reveal delay={0.35} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic>
            <Button href={whatsapp} variant="dark">
              <WhatsAppIcon size={18} />
              {t('common.whatsapp')}
            </Button>
          </Magnetic>
          <Magnetic>
            <Button href={site.phone.href} variant="ghost-light" className="!border-night/40">
              <Phone size={16} aria-hidden="true" />
              {t('nav.callNow')} · {site.phone.display}
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}
