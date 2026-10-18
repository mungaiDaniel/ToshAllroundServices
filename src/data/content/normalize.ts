import { mediaUrl } from '../../lib/supabase'
import type { GalleryImage } from '../gallery'
import type { Photo, Weekday } from '../site'
import { weekdays } from '../site'
import { textKeyMap } from './fallback'
import type {
  BusinessView,
  CertificateView,
  CvType,
  CvView,
  RawBusiness,
  RawContent,
  RawGalleryPhoto,
  RawImageSet,
  RawService,
  ServiceView,
  TestimonialView,
} from './types'

export type Lang = 'de' | 'en'
const pick = <T extends Record<string, unknown>>(row: T, base: string, lang: Lang) =>
  ((row[`${base}_${lang}`] as string | null | undefined) || (row[`${base}_${lang === 'de' ? 'en' : 'de'}`] as string | null | undefined) || '') as string

const asArray = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

/** Validates / repairs whatever the database returned so components can rely on the shape. */
export function parseContent(data: unknown): RawContent {
  const d = (data ?? {}) as Record<string, unknown>
  return {
    services: asArray(d.services),
    gallery: asArray(d.gallery),
    texts: asArray(d.texts),
    business: d.business && typeof d.business === 'object' ? (d.business as RawBusiness) : null,
    testimonials: asArray(d.testimonials),
    certificates: asArray(d.certificates),
    cv: asArray(d.cv),
  }
}

const photoFrom = (
  path: string | null | undefined,
  pathSm: string | null | undefined,
  width: number | null | undefined,
  height: number | null | undefined,
  smWidth: number | null | undefined,
  position: string | null | undefined,
  altDe: string | null | undefined,
  altEn: string | null | undefined,
  fallbackSize: [number, number],
  placeholder = false,
): Photo => ({
  src: mediaUrl(path) ?? '',
  srcSm: mediaUrl(pathSm),
  width: width || fallbackSize[0],
  height: height || fallbackSize[1],
  smWidth: smWidth || undefined,
  position: position || undefined,
  alt: { de: altDe || altEn || '', en: altEn || altDe || '' },
  placeholder,
})

const imageSetPhoto = (s: RawImageSet): Photo =>
  photoFrom(s.path, s.path_sm, s.width, s.height, s.sm_width, s.position, s.alt_de, s.alt_en, [900, 1600])

export function toServices(raw: RawContent, lang: Lang): ServiceView[] {
  return [...raw.services]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s: RawService) => {
      const description = pick(s as never, 'description', lang)
      const included = (lang === 'de' ? s.included_de : s.included_en)?.length ? (lang === 'de' ? s.included_de : s.included_en) : (s.included_de ?? s.included_en ?? [])
      return {
        id: s.id,
        slug: s.slug,
        icon: s.icon || 'Sparkles',
        title: pick(s as never, 'title', lang),
        titleDe: s.title_de,
        description,
        details: pick(s as never, 'details', lang) || description,
        included,
        priceFrom: s.price_from ? (lang === 'en' ? s.price_from.replace(/^\s*ab\s/i, 'from ') : s.price_from) : null,
        image: photoFrom(s.image_path, s.image_path_sm, s.image_width, s.image_height, s.image_sm_width, s.image_position, s.image_alt_de, s.image_alt_en, [900, 1600]),
        extraImage: s.extra_image?.path ? imageSetPhoto(s.extra_image) : undefined,
        specialty: s.is_specialty,
      }
    })
}

export function toGallery(raw: RawContent): GalleryImage[] {
  const rows = [...raw.gallery].sort((a, b) => a.sort_order - b.sort_order)
  const byId = new Map<string, RawGalleryPhoto>(rows.map((r) => [r.id, r]))
  const beforeIds = new Set(rows.map((r) => r.before_after_pair_id).filter((x): x is string => Boolean(x) && byId.has(x as string)))

  return rows
    .filter((r) => r.is_visible !== false && !r.deleted_at && !beforeIds.has(r.id))
    .map((r) => {
      const before = r.before_after_pair_id ? byId.get(r.before_after_pair_id) : undefined
      const caption =
        r.caption_de || r.caption_en
          ? { de: r.caption_de || r.caption_en || '', en: r.caption_en || r.caption_de || '' }
          : undefined
      return {
        ...photoFrom(r.image_path, r.image_path_sm, r.width, r.height, r.sm_width, r.position, r.alt_de, r.alt_en, [1200, 900], r.is_placeholder),
        id: r.id,
        category: r.category,
        placeholder: r.is_placeholder,
        featured: r.is_featured,
        caption,
        before: before
          ? { src: mediaUrl(before.image_path) ?? '', alt: { de: before.alt_de, en: before.alt_en } }
          : undefined,
      }
    })
}

const digits = (s: string) => s.replace(/\D/g, '')

export function toBusiness(b: RawBusiness, lang: Lang): BusinessView {
  const hours = Object.fromEntries(
    weekdays.map((d: Weekday) => [d, b.opening_hours?.[d] ?? null]),
  ) as BusinessView['hours']
  const a = b.address
  const country = a.country ?? 'Germany'
  const announcement = b.announcement_active ? (lang === 'de' ? b.announcement_de || b.announcement_en : b.announcement_en || b.announcement_de) : null
  return {
    phone: { display: b.phone, href: `tel:${b.phone.replace(/[^\d+]/g, '')}` },
    whatsapp: { display: b.whatsapp, href: `https://wa.me/${digits(b.whatsapp).replace(/^00/, '')}` },
    email: b.email,
    address: { street: a.street, zip: a.zip, city: a.city, country },
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.street}, ${a.zip} ${a.city}`)}`,
    hours,
    announcement: announcement?.trim() ? announcement.trim() : null,
  }
}

export function toTestimonials(raw: RawContent, lang: Lang): TestimonialView[] {
  return [...raw.testimonials]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((t) => ({ id: t.id, name: t.name, rating: Math.min(5, Math.max(1, t.rating || 5)), text: pick(t as never, 'text', lang) }))
    .filter((t) => t.text)
}

export function toCertificates(raw: RawContent, lang: Lang): CertificateView[] {
  return [...raw.certificates]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => {
      const full = mediaUrl(c.image_path) ?? mediaUrl(c.thumb_path) ?? ''
      const thumb = mediaUrl(c.thumb_path) ?? full
      return {
        id: c.id,
        title: pick(c as never, 'title', lang),
        institution: c.institution,
        year: c.year,
        alt: pick(c as never, 'alt', lang) || pick(c as never, 'title', lang),
        thumb: { src: thumb, width: c.thumb_width || c.image_width || 600, height: c.thumb_height || c.image_height || 800 },
        full: { src: full, width: c.image_width || 1600, height: c.image_height || 2133 },
        pdf: mediaUrl(c.pdf_path, 'documents') ?? null,
      }
    })
}

export function toCv(raw: RawContent, lang: Lang): Record<CvType, CvView[]> {
  const out: Record<CvType, CvView[]> = { education: [], experience: [], language: [], skill: [] }
  for (const e of [...raw.cv].sort((a, b) => a.sort_order - b.sort_order)) {
    if (!out[e.type]) continue
    out[e.type].push({
      id: e.id,
      title: pick(e as never, 'title', lang),
      place: e.place || '',
      years: e.years || '',
      details: pick(e as never, 'details', lang),
      highlight: e.is_highlight,
    })
  }
  return out
}

/** site_texts rows -> { "home.hero.title": "…" } for the chosen language (only keys known in textKeyMap). */
export function toTextOverrides(raw: RawContent, lang: Lang): Record<string, string> {
  const out: Record<string, string> = {}
  for (const t of raw.texts) {
    const tKey = textKeyMap[t.key]
    const value = (lang === 'de' ? t.value_de : t.value_en)?.trim()
    if (tKey && value) out[tKey] = value
  }
  return out
}

/** Looks up a stored text by its site_texts key, e.g. "founder_cv_pdf" (language independent). */
export function rawText(raw: RawContent, key: string, lang: Lang): string {
  const t = raw.texts.find((x) => x.key === key)
  return (t && (lang === 'de' ? t.value_de || t.value_en : t.value_en || t.value_de)) || ''
}
