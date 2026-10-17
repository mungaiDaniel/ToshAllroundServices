import { useWhatsAppHref } from '../hooks/useWhatsAppHref'
import { useTranslation } from '../hooks/useTranslation'
import { loopDuration } from '../lib/motion'
import WhatsAppIcon from './icons/WhatsAppIcon'
import Magnetic from './motion/Magnetic'

const WHATSAPP_GREEN = '#25D366'

export default function WhatsAppButton() {
  const { t } = useTranslation()
  const href = useWhatsAppHref()

  return (
    <Magnetic className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('common.whatsapp')}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform [transition-duration:var(--dur-fast)] hover:scale-105 active:scale-95"
        style={{ backgroundColor: WHATSAPP_GREEN }}
      >
        <span
          aria-hidden="true"
          className="anim absolute inset-0 rounded-full"
          style={{
            backgroundColor: WHATSAPP_GREEN,
            animationName: 'pulse-ring',
            animationDuration: loopDuration(2.8),
            animationTimingFunction: 'ease-out',
          }}
        />
        <WhatsAppIcon size={30} className="relative" />
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-night px-3 py-2 text-xs text-snow opacity-0 shadow-glass transition-opacity [transition-duration:var(--dur-fast)] group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
        >
          {t('whatsapp.tooltip')}
        </span>
      </a>
    </Magnetic>
  )
}
