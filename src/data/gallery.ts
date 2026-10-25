import { photos, type Photo } from './site'

/**
 * GALLERY DATA – how to add a photo
 *
 * 1. Put the file in /public/images/team/ (WebP, ~1400px on the long side, under ~300 KB).
 *    Optional: a smaller "-sm" file for phones (see `srcSm` / `smWidth`).
 * 2. Add an entry to `gallery` below (copy an existing one):
 *      id          unique, e.g. 'homes-04'
 *      category    one of `galleryCategories`
 *      src         '/images/team/your-file.webp'
 *      width/height  the image's pixel size (prevents layout shift, drives the masonry layout)
 *      alt         German + English description (for screen readers)
 *      position    optional focal point, e.g. '50% 25%'
 *      placeholder false for real photos
 * 3. Optional before/after pair: add `before: { src: '/images/team/xyz-before.webp' }`.
 *    `src` is then the AFTER photo; both photos should have the same size and framing.
 * 4. New category? Add it to `galleryCategories` AND add its label under
 *    gallery.categories in src/i18n/de.ts and en.ts.
 *
 */
export const galleryCategories = ['homes', 'offices', 'shops', 'staircases', 'it', 'care'] as const

export type GalleryCategory = (typeof galleryCategories)[number]

export interface GalleryImage extends Photo {
  id: string
  category: GalleryCategory
  /** true = stock photo, swap for the client's real photo (then set to false) */
  placeholder: boolean
  /** optional before/after pair */
  before?: { src: string; alt?: { de: string; en: string } }
  /** optional caption shown in the lightbox (falls back to the alt text) */
  caption?: { de: string; en: string }
  featured?: boolean
}

const real = (id: string, category: GalleryCategory, photo: Photo): GalleryImage => ({
  ...photo,
  id,
  category,
  placeholder: false,
})

/** REAL photos of the business (portrait). */
export const gallery: GalleryImage[] = [
  real('real-office', 'offices', photos.officeVacuuming),
  real('real-it-workstation', 'it', photos.itWorkstation),
  real('real-lobby', 'staircases', photos.lobbyMopping),
  real('real-bathroom', 'homes', photos.bathroom),
  real('real-shopfront', 'shops', photos.shopfront),
  real('real-it-printer', 'it', photos.itPrinter),
  real('real-stairs', 'staircases', photos.stairs),
  real('real-retail-shelf', 'shops', photos.retailShelf),
  real('real-it-laptop', 'it', photos.itLaptop),
  real('real-carpet', 'offices', photos.carpet),
]
