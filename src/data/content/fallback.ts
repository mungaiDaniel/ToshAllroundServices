/**
 * STATIC FALLBACK CONTENT – built from the data that ships with the website (site.ts, gallery.ts, i18n).
 *
 * 1. The site shows this when Supabase is not configured, unreachable, or not set up yet.
 * 2. `npm run seed` copies exactly this content into the Supabase tables, so the database starts out
 *    identical to what visitors see today.
 *
 * Keep it free of browser-only code: the seed script runs it in Node.
 */
import de from '../../i18n/de'
import en from '../../i18n/en'
import { gallery } from '../gallery'
import { certificates, founder, hours, photos, services as staticServices, site, weekdays } from '../site'
import type { Photo } from '../site'
import type {
  RawCertificate,
  RawContent,
  RawCvEntry,
  RawGalleryPhoto,
  RawService,
  RawText,
} from './types'

/** site_texts key  ->  translation key it overrides (see src/i18n). Add rows to site_texts with these keys. */
export const textKeyMap: Record<string, string> = {
  hero_eyebrow: 'home.hero.eyebrow',
  hero_title: 'home.hero.title',
  hero_text: 'home.hero.text',
  tagline: 'tagline',
  services_intro: 'home.services.text',
  why_text: 'home.why.text',
  gallery_intro: 'gallery.intro',
  cta_title: 'home.cta.title',
  cta_text: 'home.cta.text',
  about_welcome: 'about.welcome',
  about_text_1: 'about.p1',
  about_text_2: 'about.p2',
  mission_text: 'about.mission.text',
  founder_profile: 'founder.profile.text',
  founder_education_note: 'founder.education.note',
  contact_intro: 'contact.text',
}

/** Read a dotted key from a translation object */
const dig = (obj: unknown, path: string): string => {
  let n: unknown = obj
  for (const part of path.split('.')) n = (n as Record<string, unknown> | undefined)?.[part]
  return typeof n === 'string' ? n : ''
}

const photoFields = (p: Photo) => ({
  path: p.src,
  path_sm: p.srcSm ?? null,
  width: p.width,
  height: p.height,
  sm_width: p.smWidth ?? null,
  position: p.position ?? null,
  alt_de: p.alt.de,
  alt_en: p.alt.en,
})

const bullets = ['b1', 'b2', 'b3', 'b4'] as const

const services: RawService[] = staticServices.map((s, i) => {
  const dTr = de.services[s.id]
  const eTr = en.services[s.id]
  const img = photoFields(s.image)
  return {
    id: s.id,
    slug: s.id,
    sort_order: (i + 1) * 10,
    icon: s.icon,
    title_de: dTr.title,
    title_en: eTr.title,
    description_de: dTr.description,
    description_en: eTr.description,
    details_de: dTr.details,
    details_en: eTr.details,
    included_de: bullets.map((b) => dTr[b]),
    included_en: bullets.map((b) => eTr[b]),
    price_from: null,
    image_path: img.path,
    image_path_sm: img.path_sm,
    image_width: img.width,
    image_height: img.height,
    image_sm_width: img.sm_width,
    image_position: img.position,
    image_alt_de: img.alt_de,
    image_alt_en: img.alt_en,
    extra_image: s.extraImage ? { ...photoFields(s.extraImage) } : null,
    is_specialty: Boolean(s.specialty),
    is_visible: true,
  }
})

const galleryRows: RawGalleryPhoto[] = gallery.map((g, i) => ({
  id: g.id,
  sort_order: (i + 1) * 10,
  image_path: g.src,
  image_path_sm: g.srcSm ?? null,
  width: g.width,
  height: g.height,
  sm_width: g.smWidth ?? null,
  position: g.position ?? null,
  category: g.category,
  caption_de: null,
  caption_en: null,
  alt_de: g.alt.de,
  alt_en: g.alt.en,
  is_featured: g.id.startsWith('real-'),
  is_visible: true,
  is_placeholder: g.placeholder,
  before_after_pair_id: null,
  deleted_at: null,
}))

const certificateRows: RawCertificate[] = certificates.map((c, i) => {
  const dTr = de.founder.certificates[c.id as 'diploma-electrical-engineering']
  const eTr = en.founder.certificates[c.id as 'diploma-electrical-engineering']
  return {
    id: c.id,
    sort_order: (i + 1) * 10,
    title_de: dTr.title,
    title_en: eTr.title,
    institution: dTr.institution,
    year: c.year,
    image_path: c.full.src,
    image_width: c.full.width,
    image_height: c.full.height,
    thumb_path: c.thumb.src,
    thumb_width: c.thumb.width,
    thumb_height: c.thumb.height,
    pdf_path: c.pdf,
    alt_de: dTr.alt,
    alt_en: eTr.alt,
    is_visible: true,
  }
})

const cv: RawCvEntry[] = []
let n = 0
const add = (e: Omit<RawCvEntry, 'id' | 'sort_order'>) => {
  n += 10
  cv.push({ id: `${e.type}-${n}`, sort_order: n, ...e })
}
add({
  type: 'education',
  title_de: de.founder.education.degree,
  title_en: en.founder.education.degree,
  place: founder.education.institution,
  years: founder.education.year,
  details_de: de.founder.education.note,
  details_en: en.founder.education.note,
  is_highlight: false,
})
for (const k of ['item1', 'item2'] as const) {
  add({
    type: 'experience',
    title_de: de.founder.experience[k].role,
    title_en: en.founder.experience[k].role,
    place: de.founder.experience[k].place,
    years: de.founder.experience[k].period,
    details_de: de.founder.experience[k].details,
    details_en: en.founder.experience[k].details,
    is_highlight: false,
  })
}
for (const k of ['residential', 'office', 'shop', 'staircase', 'it', 'electrical', 'reliability', 'detail'] as const) {
  add({
    type: 'skill',
    title_de: de.founder.skills[k],
    title_en: en.founder.skills[k],
    is_highlight: k === 'it',
  })
}
for (const k of ['german', 'english', 'swahili'] as const) {
  add({
    type: 'language',
    title_de: de.founder.languages[k],
    title_en: en.founder.languages[k],
    is_highlight: false,
  })
}

const texts: RawText[] = [
  ...Object.entries(textKeyMap).map(([key, tKey]) => ({
    key,
    value_de: dig(de, tKey),
    value_en: dig(en, tKey),
  })),
  // path of the downloadable CV (documents bucket, or a local /docs/... path)
  { key: 'founder_cv_pdf', value_de: '/docs/daniel-gitonga-wahome-cv.pdf', value_en: '/docs/daniel-gitonga-wahome-cv.pdf' },
]

export const fallbackContent: RawContent = {
  services,
  gallery: galleryRows,
  texts,
  business: {
    phone: site.phone.display,
    whatsapp: site.whatsapp.display,
    email: site.email,
    address: { street: site.address.street, zip: site.address.zip, city: site.address.city, country: site.address.country },
    opening_hours: Object.fromEntries(weekdays.map((d) => [d, hours[d]])),
    announcement_de: null,
    announcement_en: null,
    announcement_active: false,
  },
  testimonials: [],
  certificates: certificateRows,
  cv,
}

/** Static images that live in the codebase (not in Supabase storage). Used by the seed script. */
export const staticPhotoCatalog = photos
