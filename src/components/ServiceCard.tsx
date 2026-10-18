import { ArrowRight, Building2, Home, Layers, Monitor, Sparkles, Store, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ServiceView } from '../data/content/types'
import { useTranslation } from '../hooks/useTranslation'
import Photo from './Photo'

const icons: Record<string, LucideIcon> = { Home, Building2, Store, Layers, Monitor }
const zoom =
  'transition-transform [transition-duration:var(--dur-slow)] [transition-timing-function:var(--ease-out)] group-hover:scale-105'

/** Service teaser. The specialty (IT & office equipment) is wide, dark and glowing, with a badge. */
export default function ServiceCard({ service }: { service: ServiceView }) {
  const { t } = useTranslation()
  const Icon = icons[service.icon] ?? Sparkles
  const title = service.title

  if (service.specialty) {
    return (
      <article className="glass glass-specialty group flex h-full flex-col overflow-hidden !bg-night text-snow lg:flex-row">
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:aspect-auto lg:min-h-[420px] lg:w-[38%]">
          <Photo photo={service.image} sizes="(min-width: 1024px) 440px, calc(100vw - 2rem)" className={zoom} />
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-8 lg:justify-center lg:p-12">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-leaf px-3 py-1 text-xs font-bold uppercase tracking-wider text-night">
            <Sparkles size={14} aria-hidden="true" />
            {t('common.specialty')}
          </span>
          <h3 className="mt-4 flex items-center gap-3 text-2xl text-snow lg:text-4xl">
            <Icon size={26} className="shrink-0 text-sky" aria-hidden="true" />
            {title}
          </h3>
          <p className="mt-3 text-sm !text-mist lg:mt-5 lg:text-base">{service.description}</p>
          <Link
            to="/leistungen"
            aria-label={`${t('common.learnMore')}: ${title}`}
            className="link-underline mt-auto inline-flex w-fit items-center gap-1.5 pt-6 text-sm font-bold text-sky lg:mt-0 lg:pt-8"
          >
            {t('common.learnMore')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article className="card-light group flex h-full flex-col overflow-hidden">
      <div className="aspect-[4/5] overflow-hidden">
        <Photo photo={service.image} sizes="(min-width: 1024px) 360px, (min-width: 640px) calc(50vw - 2rem), calc(100vw - 2rem)" className={zoom} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-brand">
          <Icon size={22} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-xl">{title}</h3>
        {service.priceFrom && <p className="mt-1 text-sm font-bold text-brand">{service.priceFrom}</p>}
        <p className="mt-2 text-sm text-ink-muted">{service.description}</p>
        <Link
          to="/leistungen"
          aria-label={`${t('common.learnMore')}: ${title}`}
          className="link-underline mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-bold text-brand"
        >
          {t('common.learnMore')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
