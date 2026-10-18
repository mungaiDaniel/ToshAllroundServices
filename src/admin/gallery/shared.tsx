import { Check } from 'lucide-react'
import type { GalleryCategory, RawGalleryPhoto } from '../../data/content/types'
import { mediaUrl } from '../../lib/supabase'
import { useA } from '../lib/i18n'

/** a gallery_photos row as the admin sees it (all columns, including hidden / deleted ones) */
export interface PhotoRow extends RawGalleryPhoto {
  created_at: string
}

export const categories: { value: GalleryCategory; de: string; en: string }[] = [
  { value: 'homes', de: 'Wohnungen', en: 'Homes' },
  { value: 'offices', de: 'Büros', en: 'Offices' },
  { value: 'shops', de: 'Läden', en: 'Shops' },
  { value: 'staircases', de: 'Treppenhäuser', en: 'Staircases' },
  { value: 'it', de: 'IT-Geräte', en: 'IT equipment' },
  { value: 'care', de: 'Textilpflege', en: 'Garment care' },
]

export const categoryLabel = (c: string, lang: 'de' | 'en') => {
  const x = categories.find((k) => k.value === c)
  return x ? x[lang] : c
}

export const thumbUrl = (p: Pick<PhotoRow, 'image_path' | 'image_path_sm'>) => mediaUrl(p.image_path_sm || p.image_path) ?? ''

/** which part of a tall photo stays visible when it is cropped into a square or wide frame */
export const focusOptions = [
  { value: '50% 15%', de: 'Oben (z. B. Gesichter)', en: 'Top (e.g. faces)' },
  { value: '50% 50%', de: 'Mitte', en: 'Middle' },
  { value: '50% 85%', de: 'Unten', en: 'Bottom' },
]

export function nearestFocus(position: string | null | undefined) {
  const y = Number.parseFloat((position ?? '').split(/\s+/)[1] ?? '50')
  const v = Number.isFinite(y) ? y : 50
  return v < 33 ? focusOptions[0].value : v > 67 ? focusOptions[2].value : focusOptions[1].value
}

export const altFor = (caption: string | null | undefined, previousAlt: string | null | undefined, fallback: string) =>
  (caption ?? '').trim() || (previousAlt ?? '').trim() || fallback

/** Grid of photos to choose one from (used for before / after pairs). */
export function PhotoPicker({
  rows,
  selectedId,
  onSelect,
  disabledIds = [],
}: {
  rows: PhotoRow[]
  selectedId: string | null
  onSelect: (id: string) => void
  disabledIds?: string[]
}) {
  const { t, lang } = useA()
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {rows.map((r) => {
        const disabled = disabledIds.includes(r.id)
        const selected = selectedId === r.id
        return (
          <li key={r.id}>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(r.id)}
              aria-label={`${categoryLabel(r.category, lang)}${r.caption_de ? ': ' + r.caption_de : ''}${selected ? ' – ' + t('ausgewählt', 'selected') : ''}`}
              className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-slate-100 ${selected ? 'border-brand ring-2 ring-brand/30' : 'border-transparent'} ${disabled ? 'opacity-35' : ''}`}
            >
              <img src={thumbUrl(r)} alt="" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: r.position ?? undefined }} />
              {selected && (
                <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
                  <Check size={18} aria-hidden="true" />
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
