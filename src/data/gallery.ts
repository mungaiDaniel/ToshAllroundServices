import { photos, type Photo } from './site'

/**
 * GALLERY DATA – how to add a photo
 *
 * 1. Put the file in /public/images/gallery/ (WebP, ~1400px on the long side, under ~300 KB).
 *    Optional: a smaller "-sm" file for phones (see `srcSm` / `smWidth`).
 * 2. Add an entry to `realGallery` below (copy an existing one):
 *      id          unique, e.g. 'homes-04'
 *      category    one of `galleryCategories`
 *      src         '/images/gallery/your-file.webp'
 *      width/height  the image's pixel size (prevents layout shift, drives the masonry layout)
 *      alt         German + English description (for screen readers)
 *      position    optional focal point, e.g. '50% 25%'
 *      placeholder false for real photos
 * 3. Optional before/after pair: add `before: { src: '/images/gallery/xyz-before.webp' }`.
 *    `src` is then the AFTER photo; both photos should have the same size and framing.
 * 4. New category? Add it to `galleryCategories` AND add its label under
 *    gallery.categories in src/i18n/de.ts and en.ts.
 *
 * REAL photos come first (realGallery), STOCK placeholders after (stockGallery, all `placeholder: true`).
 * To remove the stock photos later: set SHOW_PLACEHOLDERS to false (hides them), or delete
 * `stockGallery` and the files in public/images/gallery/ that are listed in public/images/CREDITS.md.
 */
export const SHOW_PLACEHOLDERS = true

export const galleryCategories = ['homes', 'offices', 'shops', 'staircases', 'it', 'care'] as const

export type GalleryCategory = (typeof galleryCategories)[number]

export interface GalleryImage extends Photo {
  id: string
  category: GalleryCategory
  /** true = stock photo, swap for the client's real photo (then set to false) */
  placeholder: boolean
  /** optional before/after pair */
  before?: { src: string; alt?: { de: string; en: string } }
}

const real = (id: string, category: GalleryCategory, photo: Photo): GalleryImage => ({
  ...photo,
  id,
  category,
  placeholder: false,
})

/** REAL photos of the business (portrait). Shown first. */
const realGallery: GalleryImage[] = [
  real('real-vacuuming', 'homes', photos.vacuuming),
  real('real-bathroom', 'homes', photos.bathroom),
  real('real-it', 'it', photos.itEquipment),
  real('real-mopping', 'staircases', photos.mopping),
  real('real-sewing', 'care', photos.clothingCare),
]

/** STOCK placeholders – replace with real photos over time, then delete. */
const stockGallery: GalleryImage[] = [
  {
    id: 'homes-01',
    category: 'homes',
    src: '/images/gallery/homes-01.webp',
    srcSm: '/images/gallery/homes-01-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/homes-02.webp',
    srcSm: '/images/gallery/homes-02-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/homes-03.webp',
    srcSm: '/images/gallery/homes-03-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/offices-01.webp',
    srcSm: '/images/gallery/offices-01-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/offices-02.webp',
    srcSm: '/images/gallery/offices-02-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/offices-03.webp',
    srcSm: '/images/gallery/offices-03-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/shops-01.webp',
    srcSm: '/images/gallery/shops-01-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/shops-02.webp',
    srcSm: '/images/gallery/shops-02-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/staircases-01.webp',
    srcSm: '/images/gallery/staircases-01-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/staircases-02.webp',
    srcSm: '/images/gallery/staircases-02-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/it-01.webp',
    srcSm: '/images/gallery/it-01-sm.webp',
    smWidth: 800,
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
    src: '/images/gallery/it-02.webp',
    srcSm: '/images/gallery/it-02-sm.webp',
    smWidth: 800,
    width: 1400,
    height: 934,
    alt: {
      de: 'Aufgeräumter Arbeitsplatz mit sauberem Laptop und Smartphone',
      en: 'Tidy workspace with a clean laptop and smartphone',
    },
    placeholder: true,
  },
]

export const gallery: GalleryImage[] = [...realGallery, ...(SHOW_PLACEHOLDERS ? stockGallery : [])]
