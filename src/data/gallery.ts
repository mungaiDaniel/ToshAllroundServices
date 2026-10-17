export const galleryCategories = ['homes', 'offices', 'shops', 'staircases', 'it'] as const

export type GalleryCategory = (typeof galleryCategories)[number]

export interface GalleryImage {
  id: string
  category: GalleryCategory
  src: string
  width: number
  height: number
  alt: { de: string; en: string }
  /** true = stock photo, swap for the client's real photo (then set to false) */
  placeholder: boolean
}

export const gallery: GalleryImage[] = [
  {
    id: 'homes-01',
    category: 'homes',
    src: '/images/gallery-homes-01.webp',
    width: 1400,
    height: 788,
    alt: {
      de: 'Reinigungskraft mit Mopp in einem hellen Wohnzimmer mit Pflanzen und blauem Sofa',
      en: 'Cleaner mopping a bright living room with plants and a blue sofa',
    },
    placeholder: true,
  },
  {
    id: 'homes-02',
    category: 'homes',
    src: '/images/gallery-homes-02.webp',
    width: 1400,
    height: 788,
    alt: {
      de: 'Makellos sauberes, helles Wohnzimmer mit weißem Sofa und großen Fenstern',
      en: 'Spotless bright living room with white sofas and large windows',
    },
    placeholder: true,
  },
  {
    id: 'homes-03',
    category: 'homes',
    src: '/images/gallery-homes-03.webp',
    width: 1400,
    height: 788,
    alt: {
      de: 'Frau mit gelben Handschuhen wischt eine Oberfläche in einer hellen Wohnung ab',
      en: 'Woman in yellow gloves wiping a surface in a bright home',
    },
    placeholder: true,
  },
  {
    id: 'offices-01',
    category: 'offices',
    src: '/images/gallery-offices-01.webp',
    width: 1400,
    height: 933,
    alt: {
      de: 'Aufgeräumtes, modernes Großraumbüro mit hellen Schreibtischen',
      en: 'Tidy modern open-plan office with bright desks',
    },
    placeholder: true,
  },
  {
    id: 'offices-02',
    category: 'offices',
    src: '/images/gallery-offices-02.webp',
    width: 1400,
    height: 933,
    alt: {
      de: 'Hände in blauen Handschuhen reinigen einen Schreibtisch mit Tuch und Sprühflasche',
      en: 'Hands in blue gloves cleaning a desk with a cloth and spray bottle',
    },
    placeholder: true,
  },
  {
    id: 'offices-03',
    category: 'offices',
    src: '/images/gallery-offices-03.webp',
    width: 1400,
    height: 933,
    alt: {
      de: 'Glänzend gewischter Eingangsbereich mit Glastüren und Wischeimer',
      en: 'Freshly mopped entrance hall with glass doors and a mop bucket',
    },
    placeholder: true,
  },
  {
    id: 'shops-01',
    category: 'shops',
    src: '/images/gallery-shops-01.webp',
    width: 933,
    height: 1400,
    alt: {
      de: 'Saubere, helle Boutique mit Kleiderstange und Regalen',
      en: 'Clean, bright boutique with a clothing rail and shelves',
    },
    placeholder: true,
  },
  {
    id: 'shops-02',
    category: 'shops',
    src: '/images/gallery-shops-02.webp',
    width: 933,
    height: 1400,
    alt: {
      de: 'Gepflegtes Ladengeschäft mit Schaufensterpuppe und großen Fenstern',
      en: 'Well-kept shop interior with a mannequin and large windows',
    },
    placeholder: true,
  },
  {
    id: 'staircases-01',
    category: 'staircases',
    src: '/images/gallery-staircases-01.webp',
    width: 1050,
    height: 1400,
    alt: {
      de: 'Sauberes Treppenhaus mit Geländer und Stufen',
      en: 'Clean stairwell with railings and steps',
    },
    placeholder: true,
  },
  {
    id: 'staircases-02',
    category: 'staircases',
    src: '/images/gallery-staircases-02.webp',
    width: 1050,
    height: 1400,
    alt: {
      de: 'Gepflegter Treppenaufgang in einem Mehrfamilienhaus mit Backsteinwand',
      en: 'Well-kept staircase in an apartment building with a brick wall',
    },
    placeholder: true,
  },
  {
    id: 'it-01',
    category: 'it',
    src: '/images/gallery-it-01.webp',
    width: 1400,
    height: 933,
    alt: {
      de: 'Nahaufnahme einer sauberen weißen Tastatur',
      en: 'Close-up of a clean white keyboard',
    },
    placeholder: true,
  },
  {
    id: 'it-02',
    category: 'it',
    src: '/images/gallery-it-02.webp',
    width: 1400,
    height: 934,
    alt: {
      de: 'Aufgeräumter Arbeitsplatz mit sauberem Laptop und Smartphone',
      en: 'Tidy workspace with a clean laptop and smartphone',
    },
    placeholder: true,
  },
]
