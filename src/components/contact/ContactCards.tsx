import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { site } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import { useWhatsAppHref } from '../../hooks/useWhatsAppHref'
import type { TranslationKey } from '../../i18n/LanguageContext'
import Button from '../Button'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import Reveal from '../motion/Reveal'
import { Stagger, StaggerItem } from '../motion/Stagger'

function SmallCard({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon
  title: TranslationKey
  text: TranslationKey
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className="card-light flex h-full flex-col p-6 sm:p-7">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-brand">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg">{t(title)}</h3>
      <p className="mt-1 text-sm text-ink-muted">{t(text)}</p>
      <div className="mt-4 text-sm font-bold">{children}</div>
    </div>
  )
}

/** WhatsApp is the primary, biggest card; phone, email and address follow. */
export default function ContactCards() {
  const { t } = useTranslation()
  const whatsapp = useWhatsAppHref()
  const { address } = site

  return (
    <div className="space-y-6">
      <Reveal variant="scale">
        <div className="glass glass-specialty relative flex flex-col gap-6 overflow-hidden !bg-night p-7 text-snow sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] sm:h-20 sm:w-20"
              style={{ backgroundColor: '#25D366' }}
            >
              <WhatsAppIcon size={40} />
            </span>
            <div>
              <h2 className="text-2xl text-snow sm:text-3xl">{t('contact.whatsapp.title')}</h2>
              <p className="mt-2 text-snow/80">{t('contact.whatsapp.text')}</p>
              <p className="mt-3 font-bold text-snow">{site.whatsapp.display}</p>
            </div>
          </div>
          <Button href={whatsapp} className="w-full shrink-0 lg:w-auto">
            <WhatsAppIcon size={18} />
            {t('common.whatsapp')}
          </Button>
        </div>
      </Reveal>

      <Stagger className="grid gap-6 md:grid-cols-3" gap="loose">
        <StaggerItem>
          <SmallCard icon={Phone} title="contact.phone.title" text="contact.phone.text">
            <a href={site.phone.href} className="link-underline text-brand">
              {site.phone.display}
            </a>
          </SmallCard>
        </StaggerItem>
        <StaggerItem>
          <SmallCard icon={Mail} title="contact.email.title" text="contact.email.text">
            <a href={`mailto:${site.email}`} className="link-underline break-all text-brand">
              {site.email}
            </a>
          </SmallCard>
        </StaggerItem>
        <StaggerItem>
          <SmallCard icon={MapPin} title="contact.address.title" text="contact.address.text">
            <address className="font-medium not-italic leading-relaxed">
              {address.street}
              <br />
              {address.zip} {address.city}
            </address>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline mt-2 inline-block text-brand"
            >
              {t('common.openInMaps')}
            </a>
          </SmallCard>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
