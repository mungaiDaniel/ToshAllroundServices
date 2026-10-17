import type { TranslationKey } from '../i18n/LanguageContext'

export const navLinks: { to: string; key: TranslationKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/ueber-uns', key: 'nav.about' },
  { to: '/leistungen', key: 'nav.services' },
  { to: '/galerie', key: 'nav.gallery' },
  { to: '/kontakt', key: 'nav.contact' },
]

export const legalLinks: { to: string; key: TranslationKey }[] = [
  { to: '/impressum', key: 'footer.impressum' },
  { to: '/datenschutz', key: 'footer.datenschutz' },
]
