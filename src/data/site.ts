export const site = {
  name: 'Tosh Allround Services',
  domain: 'toshallroundservices.de',
  /** canonical public URL (no trailing slash) – used for SEO tags */
  url: 'https://toshallroundservices.de',
  address: {
    street: 'Richard-Strauss-Straße 34',
    zip: '14193',
    city: 'Berlin',
    country: 'Germany',
  },
  whatsapp: { display: '+49 176 72750299', href: 'https://wa.me/4917672750299' },
  phone: { display: '+49 178 8779695', href: 'tel:+491788779695' },
  email: 'toshdigitals2024@gmail.com',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Richard-Strauss-Stra%C3%9Fe+34%2C+14193+Berlin',
} as const

export const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export type Weekday = (typeof weekdays)[number]

/**
 * Business hours – PLACEHOLDER VALUES, edit freely.
 * Use 24h "HH:MM" strings, or `null` for a closed day.
 */
export const hours: Record<Weekday, { open: string; close: string } | null> = {
  mon: { open: '08:00', close: '18:00' },
  tue: { open: '08:00', close: '18:00' },
  wed: { open: '08:00', close: '18:00' },
  thu: { open: '08:00', close: '18:00' },
  fri: { open: '08:00', close: '18:00' },
  sat: { open: '09:00', close: '14:00' },
  sun: null,
}

export const serviceIds = ['residential', 'office', 'retail', 'staircase', 'it'] as const

export type ServiceId = (typeof serviceIds)[number]

export interface Service {
  id: ServiceId
  /** Lucide icon name, resolved in the component that renders it */
  icon: string
  image: string
  /** The company specialty – always highlighted in the UI */
  specialty?: boolean
}

export const services: Service[] = [
  { id: 'residential', icon: 'Home', image: '/images/service-residential.webp' },
  { id: 'office', icon: 'Building2', image: '/images/service-office.webp' },
  { id: 'retail', icon: 'Store', image: '/images/service-retail.webp' },
  { id: 'staircase', icon: 'Layers', image: '/images/service-staircase.webp' },
  { id: 'it', icon: 'Monitor', image: '/images/service-it-equipment.webp', specialty: true },
]

/** Page images. All are stock placeholders (see public/images/CREDITS.md) until real photos arrive. */
export const images = {
  hero: {
    src: '/images/hero-living-room.webp',
    alt: {
      de: 'Helles, makellos sauberes Wohnzimmer mit Sofas und großen Fenstern',
      en: 'Bright, spotless living room with sofas and large windows',
    },
  },
  aboutCleaner: {
    src: '/images/about-cleaner.webp',
    alt: {
      de: 'Freundliche Reinigungskraft in gelben Handschuhen bei der Arbeit',
      en: 'Friendly cleaning professional in yellow gloves at work',
    },
  },
  aboutSupplies: {
    src: '/images/about-supplies.webp',
    alt: {
      de: 'Reinigungswagen mit Sprühflaschen und Reinigungsmitteln',
      en: 'Cleaning caddy with spray bottles and cleaning products',
    },
  },
  services: {
    residential: {
      de: 'Reinigungskraft wischt den Boden in einer hellen Wohnung',
      en: 'Cleaner mopping the floor of a bright apartment',
    },
    office: {
      de: 'Reinigungskraft saugt ein modernes Büro',
      en: 'Cleaner vacuuming a modern office',
    },
    retail: {
      de: 'Reinigungskraft putzt ein Schaufenster',
      en: 'Cleaner washing a shop window',
    },
    staircase: {
      de: 'Saubere Treppe mit Handläufen in einem Treppenhaus',
      en: 'Clean staircase with handrails in a stairwell',
    },
    it: {
      de: 'Hand reinigt einen Laptop mit einem Mikrofasertuch',
      en: 'Hand cleaning a laptop with a microfibre cloth',
    },
  },
} as const
