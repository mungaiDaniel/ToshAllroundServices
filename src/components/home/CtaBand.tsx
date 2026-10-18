import { Phone } from 'lucide-react'
import { useSite } from '../../data/content/hooks'
import { useTranslation } from '../../hooks/useTranslation'
import { useWhatsAppHref } from '../../hooks/useWhatsAppHref'
import { loopDuration } from '../../lib/motion'
import Button from '../Button'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import Magnetic from '../motion/Magnetic'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'

export default function CtaBand() {
  const site = useSite()
  const { t } = useTranslation()
  const whatsapp = useWhatsAppHref()
  return (
    <section
      className="relative isolate overflow-hidden py-20 text-center text-snow sm:py-24"
      style={{
        // brand gradient (blue -> light blue -> green), darkened so white text stays readable
        backgroundImage:
          'linear-gradient(rgba(7,11,26,0.5), rgba(7,11,26,0.5)), linear-gradient(110deg, #1e6bb8, #2e9bd6, #5bb37a, #2e9bd6, #1e6bb8)',
        backgroundSize: '100% 100%, 300% 100%',
        animation: `gradient-shift ${loopDuration(14) ?? '0s'} linear infinite`,
      }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <SplitText as="h2" text={t('home.cta.title')} className="!text-snow text-3xl sm:text-5xl" />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-5 !text-snow/90">{t('home.cta.text')}</p>
        </Reveal>
        <Reveal delay={0.35} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic>
            <Button href={whatsapp} variant="light">
              <WhatsAppIcon size={18} />
              {t('common.whatsapp')}
            </Button>
          </Magnetic>
          <Magnetic>
            <Button href={site.phone.href} variant="ghost-dark" className="!border-white/60">
              <Phone size={16} aria-hidden="true" />
              {t('nav.callNow')} · {site.phone.display}
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}
