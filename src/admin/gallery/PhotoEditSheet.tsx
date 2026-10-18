import { Link2, Link2Off, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { GalleryCategory } from '../../data/content/types'
import { getAdminClient } from '../lib/client'
import { must, touchSite } from '../lib/data'
import { useA } from '../lib/i18n'
import { useConfirm, useDirty, useToast } from '../ui/feedback'
import { Button, Card, SelectField, Sheet, TextField, Toggle } from '../ui/kit'
import { altFor, categories, categoryLabel, focusOptions, nearestFocus, PhotoPicker, thumbUrl, type PhotoRow } from './shared'

export default function PhotoEditSheet({
  row,
  rows,
  onClose,
  onSaved,
  onTrash,
}: {
  row: PhotoRow | null
  rows: PhotoRow[]
  onClose: () => void
  onSaved: () => void
  onTrash: (row: PhotoRow) => void
}) {
  if (!row) return null
  return <Editor key={row.id} row={row} rows={rows} onClose={onClose} onSaved={onSaved} onTrash={onTrash} />
}

function Editor({
  row,
  rows,
  onClose,
  onSaved,
  onTrash,
}: {
  row: PhotoRow
  rows: PhotoRow[]
  onClose: () => void
  onSaved: () => void
  onTrash: (row: PhotoRow) => void
}) {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const [category, setCategory] = useState<GalleryCategory>(row.category)
  const [captionDe, setCaptionDe] = useState(row.caption_de ?? '')
  const [captionEn, setCaptionEn] = useState(row.caption_en ?? '')
  const [featured, setFeatured] = useState(row.is_featured)
  const [visible, setVisible] = useState(row.is_visible)
  const [position, setPosition] = useState(row.position ?? '')
  const [pairId, setPairId] = useState<string | null>(row.before_after_pair_id ?? null)
  const [choosing, setChoosing] = useState(false)
  const [saving, setSaving] = useState(false)

  const dirty =
    category !== row.category ||
    captionDe !== (row.caption_de ?? '') ||
    captionEn !== (row.caption_en ?? '') ||
    featured !== row.is_featured ||
    visible !== row.is_visible ||
    position !== (row.position ?? '') ||
    pairId !== (row.before_after_pair_id ?? null)
  useDirty('photo-edit', dirty)

  const before = pairId ? rows.find((r) => r.id === pairId) : undefined
  // a photo that is already an "after" photo, or already the "before" of another, cannot be chosen again
  const usedAsBefore = new Set(rows.filter((r) => r.id !== row.id && r.before_after_pair_id).map((r) => r.before_after_pair_id as string))
  const isBeforeOfOther = rows.some((r) => r.before_after_pair_id === row.id)
  const candidates = rows.filter((r) => r.id !== row.id && !r.deleted_at)
  const disabled = candidates.filter((r) => r.before_after_pair_id || usedAsBefore.has(r.id)).map((r) => r.id)

  const close = async () => {
    if (dirty) {
      const leave = await confirm({
        title: t('Änderungen verwerfen?', 'Discard changes?'),
        body: t('Ihre Änderungen an diesem Foto wurden noch nicht gespeichert.', 'Your changes to this photo have not been saved yet.'),
        confirmLabel: t('Ja, verwerfen', 'Yes, discard'),
        cancelLabel: t('Weiter bearbeiten', 'Keep editing'),
        danger: true,
      })
      if (!leave) return
    }
    onClose()
  }

  const save = async () => {
    setSaving(true)
    try {
      const sb = await getAdminClient()
      // keep the alt text in step with the description, unless it was a real hand-written alt text
      const wasAutoDe = !row.alt_de || row.alt_de === categoryLabel(row.category, 'de')
      const wasAutoEn = !row.alt_en || row.alt_en === categoryLabel(row.category, 'en')
      await must(
        sb
          .from('gallery_photos')
          .update({
            category,
            caption_de: captionDe.trim() || null,
            caption_en: captionEn.trim() || null,
            alt_de: altFor(captionDe, wasAutoDe ? '' : row.alt_de, categoryLabel(category, 'de')),
            alt_en: altFor(captionEn, wasAutoEn ? '' : row.alt_en, categoryLabel(category, 'en')),
            is_featured: featured,
            is_visible: visible,
            position: position || null,
            before_after_pair_id: pairId,
          })
          .eq('id', row.id),
      )
      touchSite()
      toast.success(t('Gespeichert. Die Änderung ist jetzt auf der Website.', 'Saved. The change is now on the website.'))
      onSaved()
      onClose()
    } catch (e) {
      toast.failed(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open
      title={t('Foto bearbeiten', 'Edit photo')}
      onClose={() => void close()}
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="danger-soft" icon={Trash2} onClick={() => onTrash(row)} aria-label={t('In den Papierkorb', 'Move to trash')}>
            <span className="hidden sm:inline">{t('Löschen', 'Delete')}</span>
          </Button>
          <Button size="lg" icon={Save} loading={saving} disabled={!dirty} onClick={() => void save()}>
            {t('Speichern', 'Save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-slate-200">
          <img
            src={thumbUrl(row)}
            alt=""
            className="mx-auto max-h-72 w-full object-contain"
          />
        </div>

        <SelectField
          label={t('Kategorie', 'Category')}
          value={category}
          onChange={(v) => setCategory(v as GalleryCategory)}
          options={categories.map((c) => ({ value: c.value, label: t(c.de, c.en) }))}
        />
        <TextField
          label={t('Beschreibung (Deutsch)', 'Caption (German)')}
          optional
          limit={120}
          value={captionDe}
          onChange={setCaptionDe}
          placeholder={t('z. B. Büro nach der Reinigung', 'e.g. Office after cleaning')}
          hint={t('Wird unter dem Foto in der Vergrößerung gezeigt und für Sehbehinderte vorgelesen.', 'Shown with the enlarged photo and read aloud for visually impaired visitors.')}
        />
        <TextField label={t('Beschreibung (Englisch)', 'Caption (English)')} optional limit={120} value={captionEn} onChange={setCaptionEn} />

        <SelectField
          label={t('Bildausschnitt', 'Photo crop')}
          value={nearestFocus(position)}
          onChange={setPosition}
          options={focusOptions.map((o) => ({ value: o.value, label: t(o.de, o.en) }))}
          hint={t('Welcher Teil des Fotos bleibt sichtbar, wenn es zugeschnitten wird.', 'Which part of the photo stays visible when it is cropped.')}
        />

        <div className="space-y-2">
          <Toggle checked={featured} onChange={setFeatured} label={t('Auf der Startseite zeigen', 'Show on the home page')} hint={t('Es werden vier Fotos auf der Startseite gezeigt.', 'Four photos are shown on the home page.')} />
          <Toggle checked={visible} onChange={setVisible} label={t('Auf der Website sichtbar', 'Visible on the website')} hint={t('Ausgeschaltet = versteckt, aber nicht gelöscht.', 'Off = hidden, but not deleted.')} />
        </div>

        <Card>
          <h3 className="text-base font-bold text-ink">{t('Vorher / Nachher', 'Before / after')}</h3>
          {isBeforeOfOther ? (
            <p className="mt-1 text-[15px] text-ink-muted">
              {t('Dieses Foto ist das „Vorher“-Bild eines Vorher/Nachher-Paares. Es wird nur dort als Schieberegler gezeigt.', 'This photo is the “before” picture of a before/after pair. It is only shown inside that slider.')}
            </p>
          ) : before ? (
            <div className="mt-2 flex items-center gap-3">
              <img src={thumbUrl(before)} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-ink">
                  {t('Dieses Foto ist das „Nachher“. Das gezeigte Foto ist das „Vorher“.', 'This photo is the “after”. The photo shown is the “before”.')}
                </p>
                <Button variant="secondary" size="sm" icon={Link2Off} className="mt-2" onClick={() => setPairId(null)}>
                  {t('Verbindung lösen', 'Remove link')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 text-[15px] text-ink-muted">
                {t('Dieses Foto kann das „Nachher“ sein. Wählen Sie das passende „Vorher“-Foto – die Website zeigt beide mit einem Schieberegler.', 'This photo can be the “after”. Choose the matching “before” photo – the website shows both with a slider.')}
              </p>
              <Button variant="secondary" size="sm" icon={Link2} className="mt-2" onClick={() => setChoosing((c) => !c)}>
                {choosing ? t('Auswahl schließen', 'Close selection') : t('Vorher-Foto wählen', 'Choose before photo')}
              </Button>
              {choosing && (
                <div className="mt-3">
                  <PhotoPicker
                    rows={candidates}
                    selectedId={pairId}
                    disabledIds={disabled}
                    onSelect={(id) => {
                      setPairId(id)
                      setChoosing(false)
                    }}
                  />
                  {candidates.length === 0 && <p className="text-sm text-ink-muted">{t('Es gibt kein anderes Foto.', 'There is no other photo.')}</p>}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Sheet>
  )
}
