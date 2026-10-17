import { ArrowRight, Building2, Home, Layers, Monitor, Sparkles, Store, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { images, type Service } from '../data/site'
import { useTranslation } from '../hooks/useTranslation'

const icons: Record<string, LucideIcon> = { Home, Building2, Store, Layers, Monitor }

/** Service teaser. The specialty (IT & office equipment) is wide, dark and glowing, with a badge. */
export default function ServiceCard({ service }: { service: Service }) {
  const { t, language } = useTranslation()
  const Icon = icons[service.icon] ?? Sparkles
  const title = t(`services.${service.id}.title`)
  const alt = images.services[service.id][language]

  const image = (
    <img
      src={service.image}
      alt={alt}
      width={1000}
      height={service.specialty ? 667 : 625}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover transition-transform [transition-duration:var(--dur-slow)] [transition-timing-function:var(--ease-out)] group-hover:scale-105 ${
        service.specialty ? 'aspect-[16/10] lg:aspect-auto' : 'aspect-[16/10]'
      }`}
    />
  )

  if (service.specialty) {
    return (
      <article className="glass glass-specialty group flex h-full flex-col overflow-hidden !bg-night text-snow lg:flex-row">
        <div className="relative overflow-hidden lg:w-1/2">{image}</div>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald px-3 py-1 text-xs font-bold uppercase tracking-wider text-night">
            <Sparkles size={14} aria-hidden="true" />
            {t('common.specialty')}
          </span>
          <h3 className="mt-4 flex items-center gap-3 text-2xl text-snow">
            <Icon size={26} className="shrink-0 text-emerald" aria-hidden="true" />
            {title}
          </h3>
          <p className="mt-3 text-sm !text-mist">{t(`services.${service.id}.description`)}</p>
          <Link
            to="/leistungen"
            aria-label={`${t('common.learnMore')}: ${title}`}
            className="link-underline mt-auto inline-flex w-fit items-center gap-1.5 pt-6 text-sm font-bold text-emerald"
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
      <div className="overflow-hidden">{image}</div>
      <div className="flex flex-1 flex-col p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-emerald-deep">
          <Icon size={22} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-xl">{title}</h3>
        <p className="mt-2 text-sm text-ink-muted">{t(`services.${service.id}.description`)}</p>
        <Link
          to="/leistungen"
          aria-label={`${t('common.learnMore')}: ${title}`}
          className="link-underline mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-bold text-emerald-deep"
        >
          {t('common.learnMore')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
