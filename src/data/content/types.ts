/**
 * Shapes of the website content.
 *
 * "Raw*" = exactly as stored in the Supabase tables (see supabase/migrations/001_init.sql), both languages.
 * "*View" = what components use: one language, ready to render.
 */
import type { Photo, Weekday } from '../site'

export interface RawImageSet {
  path: string
  path_sm?: string | null
  width?: number | null
  height?: number | null
  sm_width?: number | null
  position?: string | null
  alt_de?: string | null
  alt_en?: string | null
}

export interface RawService {
  id: string
  slug: string
  sort_order: number
  icon: string
  title_de: string
  title_en: string
  description_de: string
  description_en: string
  details_de?: string | null
  details_en?: string | null
  included_de: string[]
  included_en: string[]
  price_from?: string | null
  image_path?: string | null
  image_path_sm?: string | null
  image_width?: number | null
  image_height?: number | null
  image_sm_width?: number | null
  image_position?: string | null
  image_alt_de?: string | null
  image_alt_en?: string | null
  extra_image?: RawImageSet | null
  is_specialty: boolean
  is_visible: boolean
}

export type GalleryCategory = 'homes' | 'offices' | 'shops' | 'staircases' | 'it' | 'care'

export interface RawGalleryPhoto {
  id: string
  sort_order: number
  image_path: string
  image_path_sm?: string | null
  width?: number | null
  height?: number | null
  sm_width?: number | null
  position?: string | null
  category: GalleryCategory
  caption_de?: string | null
  caption_en?: string | null
  alt_de: string
  alt_en: string
  is_featured: boolean
  is_visible: boolean
  is_placeholder: boolean
  before_after_pair_id?: string | null
  deleted_at?: string | null
}

export interface RawText {
  key: string
  value_de: string
  value_en: string
}

export interface RawBusiness {
  phone: string
  whatsapp: string
  email: string
  address: { street: string; zip: string; city: string; country?: string }
  opening_hours: Partial<Record<Weekday, { open: string; close: string } | null>>
  announcement_de?: string | null
  announcement_en?: string | null
  announcement_active: boolean
}

export interface RawTestimonial {
  id: string
  sort_order: number
  name: string
  rating: number
  text_de: string
  text_en: string
  is_visible: boolean
}

export interface RawCertificate {
  id: string
  sort_order: number
  title_de: string
  title_en: string
  institution: string
  year: string
  image_path?: string | null
  image_width?: number | null
  image_height?: number | null
  thumb_path?: string | null
  thumb_width?: number | null
  thumb_height?: number | null
  pdf_path?: string | null
  alt_de: string
  alt_en: string
  is_visible: boolean
}

export type CvType = 'experience' | 'education' | 'language' | 'skill'

export interface RawCvEntry {
  id: string
  sort_order: number
  type: CvType
  title_de: string
  title_en: string
  place?: string | null
  years?: string | null
  details_de?: string | null
  details_en?: string | null
  is_highlight: boolean
}

export interface RawContent {
  services: RawService[]
  gallery: RawGalleryPhoto[]
  texts: RawText[]
  business: RawBusiness | null
  testimonials: RawTestimonial[]
  certificates: RawCertificate[]
  cv: RawCvEntry[]
}

// ---------- views ----------

export interface ServiceView {
  id: string
  slug: string
  icon: string
  title: string
  /** German title – used in the notification email, which always goes to the German-speaking owner */
  titleDe: string
  description: string
  details: string
  included: string[]
  priceFrom: string | null
  image: Photo
  extraImage?: Photo
  specialty: boolean
}

export interface TestimonialView {
  id: string
  name: string
  rating: number
  text: string
}

export interface CertificateView {
  id: string
  title: string
  institution: string
  year: string
  alt: string
  thumb: { src: string; width: number; height: number }
  full: { src: string; width: number; height: number }
  pdf: string | null
}

export interface CvView {
  id: string
  title: string
  place: string
  years: string
  details: string
  highlight: boolean
}

export interface BusinessView {
  phone: { display: string; href: string }
  whatsapp: { display: string; href: string }
  email: string
  address: { street: string; zip: string; city: string; country: string }
  mapsUrl: string
  hours: Record<Weekday, { open: string; close: string } | null>
  /** active announcement in the current language, or null */
  announcement: string | null
}
