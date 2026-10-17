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

/** A photo with an optional smaller version for phones (used as srcset). */
export interface Photo {
  src: string
  /** smaller file for phones, e.g. "-sm.webp" */
  srcSm?: string
  /** pixel size of `src` (prevents layout shift) */
  width: number
  height: number
  /** pixel width of `srcSm` */
  smWidth?: number
  alt: { de: string; en: string }
  /** CSS object-position used when the photo is cropped to a frame, e.g. '50% 25%' keeps the face in view */
  position?: string
  /** true = stock photo, to be replaced by a real one */
  placeholder?: boolean
}

export const logo = {
  src: '/images/logo/tosh-logo-512.webp',
  src256: '/images/logo/tosh-logo-256.webp',
  src96: '/images/logo/tosh-logo-96.webp',
  alt: {
    de: 'Logo von Tosh Allround Services: Haus mit Besen und Blatt',
    en: 'Tosh Allround Services logo: house with a broom and a leaf',
  },
} as const

/**
 * REAL photos of the business owner at work (portrait format).
 * Each has a large file and a "-sm" file for phones.
 */
export const photos = {
  vacuuming: {
    src: '/images/team/tosh-residential-vacuuming.webp',
    srcSm: '/images/team/tosh-residential-vacuuming-sm.webp',
    width: 900,
    height: 1600,
    smWidth: 700,
    position: '50% 28%',
    alt: {
      de: 'Der Reinigungsprofi von Tosh Allround Services saugt lächelnd den Boden eines hellen Wohnzimmers',
      en: 'The Tosh Allround Services cleaning professional smiling while vacuuming the floor of a bright living room',
    },
  },
  bathroom: {
    src: '/images/team/tosh-bathroom-cleaning.webp',
    srcSm: '/images/team/tosh-bathroom-cleaning-sm.webp',
    width: 900,
    height: 1600,
    smWidth: 700,
    position: '50% 55%',
    alt: {
      de: 'Reinigungsprofi in gelben Handschuhen reinigt mit Sprühflasche und Tuch die gefliesten Wände einer Dusche',
      en: 'Cleaning professional in yellow gloves cleaning the tiled walls of a shower with a spray bottle and cloth',
    },
  },
  mopping: {
    src: '/images/team/tosh-floor-mopping.webp',
    srcSm: '/images/team/tosh-floor-mopping-sm.webp',
    width: 900,
    height: 1600,
    smWidth: 700,
    position: '50% 30%',
    alt: {
      de: 'Reinigungsprofi in gelben Handschuhen wischt mit einem Flachwischer den Boden in einem hellen Flur',
      en: 'Cleaning professional in yellow gloves mopping the floor of a bright hallway with a flat mop',
    },
  },
  itEquipment: {
    src: '/images/team/tosh-it-equipment-cleaning.webp',
    srcSm: '/images/team/tosh-it-equipment-cleaning-sm.webp',
    width: 1124,
    height: 1599,
    smWidth: 700,
    position: '50% 30%',
    alt: {
      de: 'Reinigungsprofi in Schutzhandschuhen reinigt an einem weißen Tisch einen Laptop und einen Drucker',
      en: 'Cleaning professional in protective gloves cleaning a laptop and a printer at a white table',
    },
  },
  clothingCare: {
    src: '/images/team/tosh-clothing-care-sewing.webp',
    srcSm: '/images/team/tosh-clothing-care-sewing-sm.webp',
    width: 900,
    height: 1600,
    smWidth: 700,
    position: '50% 28%',
    alt: {
      de: 'Der Mann hinter Tosh Allround Services sitzt lächelnd an einem Tisch mit Nähmaschine, Bügeleisen und Dampfglätter und misst roten Stoff mit einem Maßband',
      en: 'The man behind Tosh Allround Services smiling at a table with a sewing machine, iron and garment steamer while measuring red fabric with a tape measure',
    },
  },
} satisfies Record<string, Photo>

/**
 * STOCK placeholders (see public/images/CREDITS.md) – only where no real photo exists yet.
 * To replace one: swap the file and delete `placeholder: true`. To remove: delete the entry and its file.
 */
export const stock = {
  office: {
    src: '/images/service-office.webp',
    srcSm: '/images/service-office-sm.webp',
    smWidth: 800,
    width: 1000,
    height: 800,
    placeholder: true,
    position: '50% 40%',
    alt: {
      de: 'Reinigungskraft saugt ein modernes Büro',
      en: 'Cleaner vacuuming a modern office',
    },
  },
  retail: {
    src: '/images/service-retail.webp',
    srcSm: '/images/service-retail-sm.webp',
    smWidth: 800,
    width: 1000,
    height: 1500,
    placeholder: true,
    position: '50% 35%',
    alt: {
      de: 'Reinigungskraft putzt ein Schaufenster',
      en: 'Cleaner washing a shop window',
    },
  },
} satisfies Record<string, Photo>

export interface Service {
  id: ServiceId
  /** Lucide icon name, resolved in the component that renders it */
  icon: string
  image: Photo
  /** optional second photo shown as a tilted overlay (collage) on the Services page */
  extraImage?: Photo
  /** The company specialty – always highlighted in the UI */
  specialty?: boolean
}

export const services: Service[] = [
  { id: 'residential', icon: 'Home', image: photos.vacuuming, extraImage: photos.bathroom },
  { id: 'office', icon: 'Building2', image: stock.office },
  { id: 'retail', icon: 'Store', image: stock.retail },
  { id: 'staircase', icon: 'Layers', image: photos.mopping },
  { id: 'it', icon: 'Monitor', image: photos.itEquipment, specialty: true },
]

export const founder = {
  name: 'Daniel Gitonga Wahome',
  image: {
    src: '/images/team/tosh-it-equipment-cleaning.webp',
    srcSm: '/images/team/tosh-it-equipment-cleaning-sm.webp',
    width: 1124,
    height: 1599,
  },
  /** Education timeline entry (text lives in the translation files) */
  education: { year: '2002', institution: 'The Kenya Polytechnic University College, Nairobi, Kenya' },
} as const

export interface Certificate {
  /** also the translation key: founder.certificates.<id>.{title,institution,alt} */
  id: string
  year: string
  thumb: { src: string; width: number; height: number }
  full: { src: string; width: number; height: number }
  pdf: string
}

/** Qualification documents shown in the certificate viewer. Add an entry here (plus its texts in de.ts / en.ts) to show more. */
export const certificates: Certificate[] = [
  {
    id: 'diploma-electrical-engineering',
    year: '2002',
    thumb: { src: '/images/certificates/diploma-electrical-engineering-thumb.webp', width: 600, height: 800 },
    full: { src: '/images/certificates/diploma-electrical-engineering.webp', width: 1600, height: 2133 },
    pdf: '/docs/diploma-electrical-engineering.pdf',
  },
]
