import { useTranslation } from '../hooks/useTranslation'
import type { Photo as PhotoData } from '../data/site'

export interface PhotoProps {
  photo: PhotoData
  /** the `sizes` attribute: how wide the image is displayed (helps phones pick the small file) */
  sizes: string
  /** load immediately (images that are visible on first screen) */
  eager?: boolean
  /** also fetch with high priority (only the single most important image of the page) */
  priority?: boolean
  className?: string
}

/**
 * One <img> for every photo: phone-sized file via srcset, intrinsic size to avoid layout shift,
 * focal point via object-position (photos are cropped with object-fit: cover, never stretched).
 */
export default function Photo({ photo, sizes, eager = false, priority = false, className = '' }: PhotoProps) {
  const { language } = useTranslation()
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSm ? `${photo.srcSm} ${photo.smWidth}w, ${photo.src} ${photo.width}w` : undefined}
      sizes={photo.srcSm ? sizes : undefined}
      alt={photo.alt[language]}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      draggable={false}
      className={`h-full w-full object-cover ${className}`}
      style={{ objectPosition: photo.position }}
    />
  )
}
