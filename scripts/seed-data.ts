/**
 * Builds the rows and the file list for the Supabase seed from the website's built-in content.
 * Separate from seed-supabase.ts so it can also be tested without a database connection.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fallbackContent } from '../src/data/content/fallback'

export type Bucket = 'site-images' | 'documents'

/** local site path ("/images/gallery/a.webp", "/docs/cv.pdf") -> storage key ("gallery/a.webp", "cv.pdf") */
const storageKey = (p: string) => p.replace(/^\/(images|docs)\//, '')

export function buildSeed(root: string, { quiet = false } = {}) {
  const uploads = new Map<string, { bucket: Bucket; key: string; file: string }>()
  let missingFiles = 0

  /** Registers a file for upload and returns the storage key to store in the database. */
  function file(localPath: string | null | undefined, bucket: Bucket = 'site-images'): string | null {
    if (!localPath) return null
    if (!localPath.startsWith('/')) return localPath // already a storage key
    const abs = join(root, 'public', localPath)
    if (!existsSync(abs)) {
      if (!quiet) console.error(`  ✗ missing file: public${localPath}`)
      missingFiles++
    }
    const key = storageKey(localPath)
    uploads.set(`${bucket}/${key}`, { bucket, key, file: abs })
    return key
  }

  const c = fallbackContent

  const services = c.services.map(({ id: _id, ...s }) => ({
    ...s,
    image_path: file(s.image_path),
    image_path_sm: file(s.image_path_sm),
    extra_image: s.extra_image
      ? { ...s.extra_image, path: file(s.extra_image.path), path_sm: file(s.extra_image.path_sm) }
      : null,
  }))

  const gallery = c.gallery.map(({ id: _id, ...g }) => ({
    ...g,
    image_path: file(g.image_path)!,
    image_path_sm: file(g.image_path_sm),
  }))

  const texts = c.texts.map((t) =>
    t.key === 'founder_cv_pdf'
      ? { ...t, value_de: file(t.value_de, 'documents')!, value_en: file(t.value_en, 'documents')! }
      : t,
  )

  const certificates = c.certificates.map(({ id: _id, ...x }) => ({
    ...x,
    image_path: file(x.image_path),
    thumb_path: file(x.thumb_path),
    pdf_path: file(x.pdf_path, 'documents'),
  }))

  const cv = c.cv.map(({ id: _id, ...e }) => e)
  const business = { id: 1, ...c.business! }

  return { services, gallery, texts, certificates, cv, business, uploads, missingFiles }
}
