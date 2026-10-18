/**
 * Photo handling in the browser: resize (max 1600 px), convert to WebP (~80 %), make a small version for phones,
 * upload to Supabase Storage. Phones deliver 4–12 MB photos; the website gets ~150–300 KB.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export const FULL_EDGE = 1600
export const THUMB_EDGE = 640
export const QUALITY = 0.8

export interface Processed {
  blob: Blob
  width: number
  height: number
  ext: 'webp' | 'jpg'
  mime: string
}

export interface Variants {
  full: Processed
  thumb: Processed
}

type Source = ImageBitmap | HTMLImageElement

async function decode(file: File): Promise<{ src: Source; w: number; h: number; done: () => void }> {
  if ('createImageBitmap' in window) {
    try {
      // 'from-image' applies the camera's rotation, so portrait photos are not turned sideways
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { src: bmp, w: bmp.width, h: bmp.height, done: () => bmp.close() }
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return { src: img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    throw new Error('unsupported-image')
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

async function render(src: Source, w: number, h: number, maxEdge: number): Promise<Processed> {
  const scale = Math.min(1, maxEdge / Math.max(w, h))
  const width = Math.max(1, Math.round(w * scale))
  const height = Math.max(1, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, width, height)

  const webp = await toBlob(canvas, 'image/webp', QUALITY)
  // Safari on iPhone cannot encode WebP and silently returns PNG: use JPEG there
  if (webp && webp.type === 'image/webp') return { blob: webp, width, height, ext: 'webp', mime: 'image/webp' }

  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  const jpg = await toBlob(canvas, 'image/jpeg', 0.82)
  if (!jpg) throw new Error('encode')
  return { blob: jpg, width, height, ext: 'jpg', mime: 'image/jpeg' }
}

/** One compressed copy at `maxEdge` px. */
export async function processImage(file: File, maxEdge = FULL_EDGE): Promise<Processed> {
  const d = await decode(file)
  try {
    return await render(d.src, d.w, d.h, maxEdge)
  } finally {
    d.done()
  }
}

/** The big website photo (max 1600 px) plus a small copy (640 px) for phones / previews. */
export async function makeVariants(file: File, full = FULL_EDGE, thumb = THUMB_EDGE): Promise<Variants> {
  const d = await decode(file)
  try {
    const f = await render(d.src, d.w, d.h, full)
    const t = await render(d.src, d.w, d.h, Math.min(thumb, full))
    return { full: f, thumb: t }
  } finally {
    d.done()
  }
}

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export type Bucket = 'site-images' | 'documents'

/** Uploads a blob under `folder/` with a unique name. Returns the storage path (what the database stores). */
export async function uploadBlob(
  sb: SupabaseClient,
  bucket: Bucket,
  folder: string,
  blob: Blob,
  ext: string,
  suffix = '',
): Promise<string> {
  const path = `${folder}/${uid()}${suffix}.${ext}`
  const { error } = await sb.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || undefined,
    cacheControl: '31536000', // names are unique, so the browser may keep the file for a year
    upsert: false,
  })
  if (error) throw error
  return path
}

/** Uploads both versions of a photo. */
export async function uploadVariants(sb: SupabaseClient, folder: string, v: Variants) {
  const image_path = await uploadBlob(sb, 'site-images', folder, v.full.blob, v.full.ext)
  let image_path_sm: string | null = null
  try {
    image_path_sm = await uploadBlob(sb, 'site-images', folder, v.thumb.blob, v.thumb.ext, '-sm')
  } catch (e) {
    await removeFiles(sb, 'site-images', [image_path])
    throw e
  }
  return {
    image_path,
    image_path_sm,
    width: v.full.width,
    height: v.full.height,
    sm_width: v.thumb.width,
  }
}

/** Built-in files (paths starting with "/" or "http") are not in Storage and are never deleted. */
export const isStorageKey = (p: string | null | undefined): p is string => Boolean(p) && !p!.startsWith('/') && !/^https?:\/\//.test(p!)

/** Best-effort cleanup of files that are no longer used. Never throws. */
export async function removeFiles(sb: SupabaseClient, bucket: Bucket, paths: (string | null | undefined)[]) {
  const keys = paths.filter(isStorageKey)
  if (!keys.length) return
  try {
    await sb.storage.from(bucket).remove(keys)
  } catch (e) {
    console.warn('[admin] could not remove files', e)
  }
}

export const MAX_IMAGE_BYTES = 40 * 1024 * 1024
export const MAX_PDF_BYTES = 20 * 1024 * 1024

export const isImage = (f: File) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif|heic|heif)$/i.test(f.name)
export const isPdf = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
