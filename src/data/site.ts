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
  officeVacuuming: {
    src: '/images/team/tosh-office-vacuuming.webp',
    srcSm: '/images/team/tosh-office-vacuuming-sm.webp',
    width: 948,
    height: 1044,
    smWidth: 640,
    position: '50% 25%',
    alt: {
      de: 'Reinigungsprofi in gelben Handschuhen saugt den Teppichboden eines modernen Büros mit Glaswänden',
      en: 'Cleaning professional in yellow gloves vacuuming the carpet of a modern office with glass walls',
    },
  },
  shopfront: {
    src: '/images/team/tosh-shopfront-window.webp',
    srcSm: '/images/team/tosh-shopfront-window-sm.webp',
    width: 946,
    height: 1052,
    smWidth: 640,
    position: '50% 40%',
    alt: {
      de: 'Reinigungsprofi zieht mit einem Abzieher das Schaufenster eines Ladens sauber',
      en: 'Cleaning professional squeegeeing the window of a shop front',
    },
  },
  retailShelf: {
    src: '/images/team/tosh-retail-shelf-cleaning.webp',
    srcSm: '/images/team/tosh-retail-shelf-cleaning-sm.webp',
    width: 903,
    height: 1580,
    smWidth: 640,
    position: '50% 28%',
    alt: {
      de: 'Reinigungsprofi reinigt mit Sprühflasche und Tuch die Regale in einem Geschäft',
      en: 'Cleaning professional wiping shelves in a store with a spray bottle and cloth',
    },
  },
  lobbyMopping: {
    src: '/images/team/tosh-lobby-mopping.webp',
    srcSm: '/images/team/tosh-lobby-mopping-sm.webp',
    width: 871,
    height: 1580,
    smWidth: 640,
    position: '50% 28%',
    alt: {
      de: 'Lächelnder Reinigungsprofi wischt mit einem Flachwischer den glänzenden Boden einer hellen Eingangshalle',
      en: 'Smiling cleaning professional mopping the shiny floor of a bright entrance hall with a flat mop',
    },
  },
  itLaptop: {
    src: '/images/team/tosh-it-laptop-cleaning.webp',
    srcSm: '/images/team/tosh-it-laptop-cleaning-sm.webp',
    width: 882,
    height: 1580,
    smWidth: 640,
    position: '50% 30%',
    alt: {
      de: 'Reinigungsprofi in Schutzhandschuhen reinigt in einem Büro einen Laptop mit Mikrofasertuch und Spray',
      en: 'Cleaning professional in protective gloves cleaning a laptop in an office with a microfibre cloth and spray',
    },
  },
  bathroom: {
    src: '/images/team/tosh-bathroom-cleaning.webp',
    srcSm: '/images/team/tosh-bathroom-cleaning-sm.webp',
    width: 890,
    height: 1580,
    smWidth: 640,
    position: '50% 45%',
    alt: {
      de: 'Reinigungsprofi in gelben Handschuhen reinigt mit Tuch und Sprühflasche ein Bad mit Marmorfliesen',
      en: 'Cleaning professional in yellow gloves cleaning a marble bathroom with a cloth and spray bottle',
    },
  },
  itWorkstation: {
    src: '/images/team/tosh-it-workstation-cleaning.webp',
    srcSm: '/images/team/tosh-it-workstation-cleaning-sm.webp',
    width: 1000,
    height: 1435,
    smWidth: 640,
    position: '50% 30%',
    alt: {
      de: 'Reinigungsprofi in Schutzhandschuhen reinigt Monitor und Tastatur an einem Arbeitsplatz, daneben ein Set mit Spezialreiniger und Bürsten',
      en: 'Cleaning professional in protective gloves cleaning a monitor and keyboard at a workstation, with a kit of specialist cleaner and brushes beside them',
    },
  },
  itPrinter: {
    src: '/images/team/tosh-it-printer-cleaning.webp',
    srcSm: '/images/team/tosh-it-printer-cleaning-sm.webp',
    width: 1000,
    height: 1465,
    smWidth: 640,
    position: '50% 30%',
    alt: {
      de: 'Reinigungsprofi in Schutzhandschuhen reinigt einen Laptop an einem Glastisch mit Drucker und Präzisionswerkzeug',
      en: 'Cleaning professional in protective gloves cleaning a laptop at a glass desk with a printer and precision tools',
    },
  },
  carpet: {
    src: '/images/team/tosh-carpet-vacuuming.webp',
    srcSm: '/images/team/tosh-carpet-vacuuming-sm.webp',
    width: 1000,
    height: 1414,
    smWidth: 640,
    position: '50% 35%',
    alt: {
      de: 'Lächelnder Reinigungsprofi saugt mit einem Bürstsauger den roten Teppichboden eines Wartebereichs',
      en: 'Smiling cleaning professional vacuuming the red carpet of a waiting area with a brush vacuum',
    },
  },
  stairs: {
    src: '/images/team/tosh-staircase-mopping.webp',
    srcSm: '/images/team/tosh-staircase-mopping-sm.webp',
    width: 873,
    height: 1580,
    smWidth: 640,
    position: '50% 22%',
    alt: {
      de: 'Reinigungsprofi wischt mit einem Flachwischer die Marmorstufen eines Treppenhauses mit Glasgeländer',
      en: 'Cleaning professional mopping the marble steps of a staircase with a glass balustrade',
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
  { id: 'residential', icon: 'Home', image: photos.bathroom },
  { id: 'office', icon: 'Building2', image: photos.officeVacuuming, extraImage: photos.carpet },
  { id: 'retail', icon: 'Store', image: photos.shopfront, extraImage: photos.retailShelf },
  { id: 'staircase', icon: 'Layers', image: photos.stairs, extraImage: photos.lobbyMopping },
  { id: 'it', icon: 'Monitor', image: photos.itPrinter, extraImage: photos.itLaptop, specialty: true },
]

export const founder = {
  name: 'Daniel Gitonga Wahome',
  image: {
    src: '/images/team/tosh-it-workstation-cleaning.webp',
    srcSm: '/images/team/tosh-it-workstation-cleaning-sm.webp',
    width: 1000,
    height: 1435,
  },
  /** Education timeline entry (text lives in the translation files) */
  education: { year: '1996–2000', institution: 'Mombasa Polytechnic, Kenya' },
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
