import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { legalLinks, navLinks } from '../data/nav'
import { site } from '../data/site'
import { useTranslation } from '../hooks/useTranslation'
import BrandLogo from './BrandLogo'
import AuroraBackground from './effects/AuroraBackground'
import WhatsAppIcon from './icons/WhatsAppIcon'
import { Stagger, StaggerItem } from './motion/Stagger'

const YEAR = new Date().getFullYear()

const linkCls = 'link-underline inline-block py-1 text-snow/90 hover:text-sky'

export default function Footer() {
  const { t } = useTranslation()
  const { address } = site

  return (
    <footer className="section-dark">
      <AuroraBackground />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky to-transparent"
      />
      <Stagger
        className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4"
        gap="loose"
      >
        <StaggerItem>
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-extrabold text-snow">
            <BrandLogo size={56} />
            {site.name}
          </Link>
          <p className="mt-4 text-sm">{t('footer.description')}</p>
          <p className="mt-4 text-sm font-medium text-snow">{t('tagline')}</p>
        </StaggerItem>

        <StaggerItem>
          <h2 className="eyebrow !text-sky text-xs font-medium">{t('footer.quickLinks')}</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkCls}>
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </StaggerItem>

        <StaggerItem>
          <h2 className="eyebrow !text-sky text-xs font-medium">{t('footer.contact')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={site.phone.href} className={`${linkCls} inline-flex items-center gap-2`}>
                <Phone size={16} className="text-sky" aria-hidden="true" />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a
                href={site.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkCls} inline-flex items-center gap-2`}
              >
                <WhatsAppIcon size={16} className="text-sky" />
                <span>WhatsApp · <span className="whitespace-nowrap">{site.whatsapp.display}</span></span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={`${linkCls} inline-flex items-center gap-2 break-all`}>
                <Mail size={16} className="shrink-0 text-sky" aria-hidden="true" />
                {site.email}
              </a>
            </li>
          </ul>
        </StaggerItem>

        <StaggerItem>
          <h2 className="eyebrow !text-sky text-xs font-medium">{t('footer.address')}</h2>
          <address className="mt-4 text-sm not-italic leading-relaxed text-snow/90">
            {site.name}
            <br />
            {address.street}
            <br />
            {address.zip} {address.city}
          </address>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkCls} mt-2 inline-flex items-center gap-2 text-sm`}
          >
            <MapPin size={16} className="text-sky" aria-hidden="true" />
            {t('common.openInMaps')}
          </a>
        </StaggerItem>
      </Stagger>

      <div className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {YEAR} {site.name}. {t('footer.rights')}
          </p>
          <ul className="flex gap-5">
            {legalLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkCls}>
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
