import { Building2, Check, Home, Layers, Monitor, Sparkles, Store, type LucideIcon } from 'lucide-react'
import { images, type Service } from '../data/site'
import { useTranslation } from '../hooks/useTranslation'
import { whatsappHref } from '../lib/whatsapp'
import FloatingBubbles from './effects/FloatingBubbles'
import Button from './Button'
import WhatsAppIcon from './icons/WhatsAppIcon'
import Parallax from './motion/Parallax'
import Reveal from './motion/Reveal'
import { Stagger, StaggerItem } from './motion/Stagger'

const icons: Record<string, LucideIcon> = { Home, Building2, Store, Layers, Monitor }
const bullets = ['b1', 'b2', 'b3', 'b4'] as const

interface Props {
  service: Service
  /** flips image/text sides on desktop (regular rows only) */
  reverse?: boolean
}

function useServiceContent(service: Service) {
  const { t, language } = useTranslation()
  const title = t(`services.${service.id}.title`)
  return {
    t,
    title,
    alt: images.services[service.id][language],
    details: t(`services.${service.id}.details`),
    items: bullets.map((b) => t(`services.${service.id}.${b}`)),
    quoteHref: whatsappHref(t('servicesPage.quoteMessage').replace('{service}', title)),
    Icon: icons[service.icon] ?? Sparkles,
  }
}

/** The specialty: big, dark, glowing, always shown first. */
export function FeaturedServiceDetail({ service }: Props) {
  const { t, title, alt, details, items, quoteHref, Icon } = useServiceContent(service)
  return (
    <Reveal variant="scale">
      <article
        id={service.id}
        className="glass glass-specialty relative grid scroll-mt-24 overflow-hidden !bg-night text-snow lg:grid-cols-[0.9fr_1.1fr]"
      >
        <FloatingBubbles variant="edges" seed={5} />
        <Parallax clip speed={0.5} className="aspect-[16/10] lg:aspect-auto lg:min-h-full">
          <img
            src={service.image}
            alt={alt}
            width={1000}
            height={667}
            decoding="async"
            className="h-full w-full object-cover"
          />
        </Parallax>
        <div className="p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-3 py-1 text-xs font-bold uppercase tracking-wider text-night">
            <Sparkles size={14} aria-hidden="true" />
            {t('common.specialty')}
          </span>
          <h2 className="mt-5 flex items-center gap-3 text-3xl text-snow sm:text-4xl">
            <Icon size={32} className="shrink-0 text-emerald" aria-hidden="true" />
            {title}
          </h2>
          <p className="mt-5 text-snow/80">{details}</p>

          <h3 className="eyebrow mt-8 text-xs">{t('servicesPage.included')}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-snow"
              >
                <Check size={18} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <Button href={quoteHref} className="mt-8 w-full sm:w-auto">
            <WhatsAppIcon size={18} />
            {t('servicesPage.quote')}
          </Button>
        </div>
      </article>
    </Reveal>
  )
}

/** Regular service: image and text side by side, sliding in from opposite sides. */
export function ServiceDetail({ service, reverse = false }: Props) {
  const { t, title, alt, details, items, quoteHref, Icon } = useServiceContent(service)
  return (
    <article
      id={service.id}
      className="grid scroll-mt-24 items-center gap-8 lg:grid-cols-2 lg:gap-16"
    >
      <Reveal variant={reverse ? 'right' : 'left'} className={reverse ? 'lg:order-2' : ''}>
        <Parallax clip speed={0.5} className="aspect-[4/3] rounded-3xl shadow-soft">
          <img
            src={service.image}
            alt={alt}
            width={1000}
            height={667}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </Parallax>
      </Reveal>

      <Reveal variant={reverse ? 'left' : 'right'}>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-emerald-deep">
          <Icon size={28} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl sm:text-3xl">{title}</h2>
        <p className="mt-4 text-ink-muted">{details}</p>

        <h3 className="eyebrow eyebrow-light mt-7 text-xs">{t('servicesPage.included')}</h3>
        <Stagger as="ul" gap="tight" className="mt-4 space-y-3">
          {items.map((item) => (
            <StaggerItem as="li" key={item} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-emerald-deep">
                <Check size={13} aria-hidden="true" />
              </span>
              {item}
            </StaggerItem>
          ))}
        </Stagger>

        <Button href={quoteHref} variant="dark" className="mt-8 w-full sm:w-auto">
          <WhatsAppIcon size={18} />
          {t('servicesPage.quote')}
        </Button>
      </Reveal>
    </article>
  )
}
