import { Camera, ImagePlus, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { GalleryCategory } from '../../data/content/types'
import { getAdminClient } from '../lib/client'
import { firstOrder, must, touchSite } from '../lib/data'
import { useA } from '../lib/i18n'
import { isImage, makeVariants, MAX_IMAGE_BYTES, removeFiles, uploadVariants, type Variants } from '../lib/images'
import { useConfirm, useDirty, useToast } from '../ui/feedback'
import { Badge, Button, Callout, IconButton, Sheet, SelectField, TextField, Toggle } from '../ui/kit'
import { altFor, categories, categoryLabel, type PhotoRow } from './shared'

const MAX_FILES = 20

interface Item {
  key: string
  name: string
  preview: string | null
  variants: Variants | null
  status: 'processing' | 'ready' | 'uploading' | 'done' | 'error'
  error?: string
  category: GalleryCategory
  caption_de: string
  caption_en: string
  featured: boolean
}

const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`

export default function UploadSheet({
  open,
  rows,
  defaultCategory,
  onClose,
  onDone,
}: {
  open: boolean
  rows: PhotoRow[]
  defaultCategory: GalleryCategory
  onClose: () => void
  onDone: () => void
}) {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const [items, setItems] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)
  const [all, setAll] = useState<GalleryCategory>(defaultCategory)
  const pick = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)
  const previews = useRef<string[]>([])

  const pending = items.some((i) => i.status !== 'done')
  useDirty('upload-sheet', open && pending && items.length > 0)

  // free memory when the sheet is closed
  useEffect(() => {
    if (open) return
    setItems([])
    previews.current.forEach((u) => URL.revokeObjectURL(u))
    previews.current = []
    setAll(defaultCategory)
  }, [open, defaultCategory])

  const patch = (key: string, p: Partial<Item>) => setItems((l) => l.map((i) => (i.key === key ? { ...i, ...p } : i)))

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return
    const files = [...list].slice(0, Math.max(0, MAX_FILES - items.length))
    if (list.length > files.length) toast.info(t(`Es sind höchstens ${MAX_FILES} Fotos auf einmal möglich.`, `You can add at most ${MAX_FILES} photos at once.`))
    const fresh: Item[] = files.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      preview: null,
      variants: null,
      status: 'processing',
      category: all,
      caption_de: '',
      caption_en: '',
      featured: false,
    }))
    setItems((l) => [...l, ...fresh])
    // one after the other: big phone photos need a lot of memory
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const key = fresh[i].key
      try {
        if (!isImage(f)) throw new Error('type')
        if (f.size > MAX_IMAGE_BYTES) throw new Error('size')
        const variants = await makeVariants(f)
        const preview = URL.createObjectURL(variants.thumb.blob)
        previews.current.push(preview)
        patch(key, { variants, preview, status: 'ready' })
      } catch (e) {
        const m = (e as Error).message
        patch(key, {
          status: 'error',
          error:
            m === 'size'
              ? t('Diese Datei ist zu groß (über 40 MB).', 'This file is too large (over 40 MB).')
              : m === 'type' || m === 'unsupported-image'
                ? t('Dieses Format wird nicht unterstützt. Bitte ein normales Foto (JPG, PNG, WebP) wählen.', 'This format is not supported. Please choose a normal photo (JPG, PNG, WebP).')
                : t('Das Foto konnte nicht verarbeitet werden.', 'The photo could not be processed.'),
        })
      }
    }
  }

  const upload = async () => {
    const ready = items.filter((i) => i.status === 'ready' && i.variants)
    if (!ready.length) return
    setBusy(true)
    let ok = 0
    let failed = 0
    try {
      const sb = await getAdminClient()
      // new photos go to the top of the gallery, in the order they were chosen
      const base = firstOrder(rows) - 10 * (ready.length - 1)
      for (let n = 0; n < ready.length; n++) {
        const it = ready[n]
        patch(it.key, { status: 'uploading' })
        let uploaded: Awaited<ReturnType<typeof uploadVariants>> | null = null
        try {
          uploaded = await uploadVariants(sb, 'gallery', it.variants!)
          await must(
            sb.from('gallery_photos').insert({
              ...uploaded,
              sort_order: base + 10 * n,
              category: it.category,
              caption_de: it.caption_de.trim() || null,
              caption_en: it.caption_en.trim() || null,
              alt_de: altFor(it.caption_de, '', categoryLabel(it.category, 'de')),
              alt_en: altFor(it.caption_en, '', categoryLabel(it.category, 'en')),
              is_featured: it.featured,
              is_visible: true,
              is_placeholder: false,
            }),
          )
          patch(it.key, { status: 'done' })
          ok++
        } catch (e) {
          console.warn('[admin] upload failed', e)
          if (uploaded) await removeFiles(sb, 'site-images', [uploaded.image_path, uploaded.image_path_sm])
          patch(it.key, { status: 'ready', error: t('Hochladen hat nicht geklappt.', 'Upload did not work.') })
          failed++
        }
      }
    } catch (e) {
      toast.failed(e)
      setBusy(false)
      return
    }
    setBusy(false)
    if (ok) {
      touchSite()
      onDone()
      toast.success(ok === 1 ? t('Foto hochgeladen und veröffentlicht.', 'Photo uploaded and published.') : t(`${ok} Fotos hochgeladen und veröffentlicht.`, `${ok} photos uploaded and published.`))
    }
    if (failed) toast.error(t(`${failed} Foto(s) konnten nicht hochgeladen werden. Bitte noch einmal versuchen.`, `${failed} photo(s) could not be uploaded. Please try again.`))
    else onClose()
  }

  const close = async () => {
    if (busy) return
    if (pending && items.length) {
      const leave = await confirm({
        title: t('Fotos verwerfen?', 'Discard photos?'),
        body: t('Die ausgewählten Fotos wurden noch nicht hochgeladen.', 'The selected photos have not been uploaded yet.'),
        confirmLabel: t('Ja, verwerfen', 'Yes, discard'),
        cancelLabel: t('Zurück', 'Back'),
        danger: true,
      })
      if (!leave) return
    }
    onClose()
  }

  const readyCount = items.filter((i) => i.status === 'ready').length

  return (
    <Sheet
      open={open}
      title={t('Fotos hinzufügen', 'Add photos')}
      onClose={() => void close()}
      footer={
        <Button full size="lg" icon={Upload} loading={busy} disabled={!readyCount} onClick={() => void upload()}>
          {readyCount > 1 ? t(`${readyCount} Fotos hochladen`, `Upload ${readyCount} photos`) : t('Foto hochladen', 'Upload photo')}
        </Button>
      }
    >
      <input ref={pick} type="file" accept="image/*" multiple hidden onChange={(e) => (void addFiles(e.target.files), (e.target.value = ''))} />
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => (void addFiles(e.target.files), (e.target.value = ''))} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" icon={ImagePlus} onClick={() => pick.current?.click()} disabled={busy || items.length >= MAX_FILES}>
          {t('Aus der Galerie wählen', 'Choose from gallery')}
        </Button>
        <Button size="lg" variant="secondary" icon={Camera} onClick={() => camera.current?.click()} disabled={busy || items.length >= MAX_FILES}>
          {t('Foto aufnehmen', 'Take a photo')}
        </Button>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        {t(
          'Die Fotos werden automatisch verkleinert (max. 1600 Pixel) und platzsparend gespeichert. Das geht schnell – auch mit dem Handy.',
          'Photos are automatically resized (max. 1600 pixels) and saved efficiently. This is quick – even on a phone.',
        )}
      </p>

      {items.length > 1 && (
        <div className="mt-4">
          <SelectField
            label={t('Kategorie für alle Fotos', 'Category for all photos')}
            value={all}
            onChange={(v) => {
              setAll(v as GalleryCategory)
              setItems((l) => l.map((i) => (i.status === 'done' ? i : { ...i, category: v as GalleryCategory })))
            }}
            options={categories.map((c) => ({ value: c.value, label: t(c.de, c.en) }))}
          />
        </div>
      )}

      <ul className="mt-4 space-y-4">
        {items.map((it) => (
          <li key={it.key} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex gap-3">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                {it.preview ? <img src={it.preview} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-slate-500">{t('Lädt …', 'Loading …')}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{it.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {it.status === 'processing' && <Badge>{t('wird verkleinert …', 'resizing …')}</Badge>}
                  {it.status === 'ready' && it.variants && (
                    <Badge tone="green">
                      {it.variants.full.width}×{it.variants.full.height} · {kb(it.variants.full.blob.size)}
                    </Badge>
                  )}
                  {it.status === 'uploading' && <Badge tone="blue">{t('wird hochgeladen …', 'uploading …')}</Badge>}
                  {it.status === 'done' && <Badge tone="green">{t('Hochgeladen ✓', 'Uploaded ✓')}</Badge>}
                  {it.status === 'error' && <Badge tone="red">{t('Fehler', 'Error')}</Badge>}
                </div>
                {it.error && <p className="mt-1 text-sm font-medium text-red-600">{it.error}</p>}
              </div>
              {it.status !== 'done' && it.status !== 'uploading' && (
                <IconButton
                  icon={Trash2}
                  tone="danger"
                  label={t('Dieses Foto entfernen', 'Remove this photo')}
                  onClick={() => setItems((l) => l.filter((x) => x.key !== it.key))}
                />
              )}
            </div>
            {(it.status === 'ready' || it.status === 'processing') && (
              <div className="mt-3 space-y-3">
                <SelectField
                  label={t('Kategorie', 'Category')}
                  value={it.category}
                  onChange={(v) => patch(it.key, { category: v as GalleryCategory })}
                  options={categories.map((c) => ({ value: c.value, label: t(c.de, c.en) }))}
                />
                <TextField
                  label={t('Beschreibung (Deutsch)', 'Caption (German)')}
                  optional
                  limit={120}
                  value={it.caption_de}
                  onChange={(v) => patch(it.key, { caption_de: v })}
                  placeholder={t('z. B. Büro nach der Reinigung', 'e.g. Office after cleaning')}
                />
                <TextField
                  label={t('Beschreibung (Englisch)', 'Caption (English)')}
                  optional
                  limit={120}
                  value={it.caption_en}
                  onChange={(v) => patch(it.key, { caption_en: v })}
                />
                <Toggle
                  compact
                  checked={it.featured}
                  onChange={(v) => patch(it.key, { featured: v })}
                  label={t('Auf der Startseite zeigen', 'Show on the home page')}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <Callout tone="info" className="mt-4">
          {t('Tippen Sie oben auf „Aus der Galerie wählen“. Sie können mehrere Fotos auf einmal auswählen.', 'Tap “Choose from gallery” above. You can select several photos at once.')}
        </Callout>
      )}
    </Sheet>
  )
}
