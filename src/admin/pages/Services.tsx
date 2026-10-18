import { Eye, EyeOff, ImagePlus, Pencil, Plus, Save, Sparkles, Trash2, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { RawService } from '../../data/content/types'
import { mediaUrl } from '../../lib/supabase'
import { focusOptions, nearestFocus } from '../gallery/shared'
import { getAdminClient } from '../lib/client'
import { moveItem, must, nextOrder, rowsOf, reorderGroup, touchSite, useLoad } from '../lib/data'
import { slugify } from '../lib/format'
import { useA } from '../lib/i18n'
import { isImage, makeVariants, MAX_IMAGE_BYTES, removeFiles, uploadVariants } from '../lib/images'
import { useConfirm, useConfirmDelete, useDirty, useToast } from '../ui/feedback'
import { Badge, Button, Callout, EmptyState, IconButton, LoadState, PageHead, SelectField, Sheet, TextAreaField, TextField, Toggle } from '../ui/kit'
import MoveButtons from '../ui/MoveButtons'
import { SortableArea, SortableItem } from '../ui/Sortable'

const LIMIT = { title: 40, description: 200, details: 500, point: 80, price: 40, points: 8 }

const icons = [
  { value: 'Home', de: 'Haus', en: 'House' },
  { value: 'Building2', de: 'Bürogebäude', en: 'Office building' },
  { value: 'Store', de: 'Laden', en: 'Shop' },
  { value: 'Layers', de: 'Treppenhaus', en: 'Staircase' },
  { value: 'Monitor', de: 'Bildschirm / IT', en: 'Screen / IT' },
  { value: 'Sparkles', de: 'Glanz', en: 'Sparkle' },
]

const serviceThumb = (s: Pick<RawService, 'image_path' | 'image_path_sm'>) => mediaUrl(s.image_path_sm || s.image_path) ?? ''

export default function Services() {
  const { t } = useA()
  const toast = useToast()
  const confirmDelete = useConfirmDelete()
  const { data, error, loading, reload, setData } = useLoad<RawService[]>(async (sb) =>
    rowsOf<RawService>(sb.from('services').select('*').order('sort_order').order('created_at')),
  )
  const [editing, setEditing] = useState<RawService | 'new' | null>(null)
  const rows = useMemo(() => data ?? [], [data])

  const persistOrder = async (ids: string[]) => {
    const changes = reorderGroup(rows, ids)
    if (!changes.length) return
    const before = data
    const map = new Map(changes.map((c) => [c.id, c.sort_order]))
    setData((d) => (d ?? []).map((r) => (map.has(r.id) ? { ...r, sort_order: map.get(r.id)! } : r)).sort((a, b) => a.sort_order - b.sort_order))
    try {
      const sb = await getAdminClient()
      await Promise.all(changes.map((c) => must(sb.from('services').update({ sort_order: c.sort_order }).eq('id', c.id))))
      touchSite()
      toast.success(t('Reihenfolge gespeichert.', 'Order saved.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const toggleVisible = async (s: RawService) => {
    const before = data
    setData((d) => (d ?? []).map((r) => (r.id === s.id ? { ...r, is_visible: !s.is_visible } : r)))
    try {
      const sb = await getAdminClient()
      await must(sb.from('services').update({ is_visible: !s.is_visible }).eq('id', s.id))
      touchSite()
      toast.success(s.is_visible ? t('Leistung ist jetzt versteckt.', 'Service is now hidden.') : t('Leistung ist jetzt sichtbar.', 'Service is now visible.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const remove = async (s: RawService) => {
    if (!(await confirmDelete(s.title_de))) return
    try {
      const sb = await getAdminClient()
      await must(sb.from('services').delete().eq('id', s.id))
      await removeFiles(sb, 'site-images', [s.image_path, s.image_path_sm])
      touchSite()
      setEditing(null)
      await reload(true)
      toast.success(t('Leistung gelöscht.', 'Service deleted.'))
    } catch (e) {
      toast.failed(e)
    }
  }

  return (
    <div>
      <PageHead
        title={t('Leistungen', 'Services')}
        help={t(
          'Hier ändern Sie Texte, Aufzählungspunkte, Preis und Foto Ihrer Leistungen, legen neue an und bestimmen die Reihenfolge.',
          'Change the texts, bullet points, price and photo of your services here, add new ones and set the order.',
        )}
        actions={
          <Button icon={Plus} onClick={() => setEditing('new')}>
            {t('Neue Leistung', 'New service')}
          </Button>
        }
      />
      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {rows.length === 0 ? (
          <EmptyState icon={Sparkles} title={t('Noch keine Leistungen', 'No services yet')}>
            {t('Legen Sie mit „Neue Leistung“ die erste an. (Die Website zeigt bis dahin ihre eingebauten Standard-Leistungen.)', 'Create the first one with “New service”. (Until then the website shows its built-in default services.)')}
          </EmptyState>
        ) : (
          <>
            <p className="mb-3 text-sm text-ink-muted">{t('Reihenfolge ändern: am Griff ziehen oder die Pfeile benutzen.', 'Change the order: drag the handle or use the arrows.')}</p>
            <SortableArea ids={rows.map((r) => r.id)} onReorder={(ids) => void persistOrder(ids)}>
              <ul className="space-y-3">
                {rows.map((s, i) => (
                  <li key={s.id}>
                    <SortableItem id={s.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      {({ handle }) => (
                        <div className="p-3">
                          <div className="flex items-start gap-3">
                            {s.image_path ? (
                              <img src={serviceThumb(s)} alt="" className={`h-16 w-16 shrink-0 rounded-xl object-cover ${s.is_visible ? '' : 'opacity-40 grayscale'}`} style={{ objectPosition: s.image_position ?? undefined }} />
                            ) : (
                              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Sparkles size={24} aria-hidden="true" />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-ink">{s.title_de}</p>
                              <p className="line-clamp-2 text-sm text-ink-muted">{s.description_de}</p>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {s.is_specialty && <Badge tone="green">{t('Spezialität', 'Specialty')}</Badge>}
                                {!s.is_visible && <Badge tone="amber">{t('Versteckt', 'Hidden')}</Badge>}
                                {s.price_from && <Badge tone="blue">{s.price_from}</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1 border-t border-slate-100 pt-2">
                            {handle}
                            <MoveButtons index={i} count={rows.length} onMove={(to) => void persistOrder(moveItem(rows.map((r) => r.id), i, to))} />
                            <IconButton
                              icon={s.is_visible ? Eye : EyeOff}
                              label={s.is_visible ? t('Verstecken', 'Hide') : t('Wieder anzeigen', 'Show again')}
                              onClick={() => void toggleVisible(s)}
                            />
                            <Button variant="soft" size="sm" icon={Pencil} className="ml-auto" onClick={() => setEditing(s)}>
                              {t('Bearbeiten', 'Edit')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </SortableItem>
                  </li>
                ))}
              </ul>
            </SortableArea>
          </>
        )}
      </LoadState>

      {editing && (
        <ServiceEditor
          key={editing === 'new' ? 'new' : editing.id}
          service={editing === 'new' ? null : editing}
          rows={rows}
          onClose={() => setEditing(null)}
          onSaved={() => void reload(true)}
          onDelete={remove}
        />
      )}
    </div>
  )
}

interface Draft {
  title_de: string
  title_en: string
  description_de: string
  description_en: string
  details_de: string
  details_en: string
  included_de: string[]
  included_en: string[]
  price_from: string
  icon: string
  is_visible: boolean
  image_position: string
}

const toDraft = (s: RawService | null): Draft => ({
  title_de: s?.title_de ?? '',
  title_en: s?.title_en ?? '',
  description_de: s?.description_de ?? '',
  description_en: s?.description_en ?? '',
  details_de: s?.details_de ?? '',
  details_en: s?.details_en ?? '',
  included_de: s?.included_de ?? [],
  included_en: s?.included_en ?? [],
  price_from: s?.price_from ?? '',
  icon: s?.icon ?? 'Sparkles',
  is_visible: s?.is_visible ?? true,
  image_position: s?.image_position ?? '',
})

function ServiceEditor({
  service,
  rows,
  onClose,
  onSaved,
  onDelete,
}: {
  service: RawService | null
  rows: RawService[]
  onClose: () => void
  onSaved: () => void
  onDelete: (s: RawService) => void
}) {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const base = useMemo(() => toDraft(service), [service])
  const [d, setD] = useState<Draft>(base)
  const [newImage, setNewImage] = useState<{ file: File; preview: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const dirty = JSON.stringify(d) !== JSON.stringify(base) || Boolean(newImage)
  useDirty('service-edit', dirty)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))

  const pointRows = Math.max(d.included_de.length, d.included_en.length)
  const setPoint = (lang: 'de' | 'en', i: number, v: string) =>
    setD((x) => {
      const key = lang === 'de' ? 'included_de' : 'included_en'
      const list = [...x[key]]
      while (list.length <= i) list.push('')
      list[i] = v
      return { ...x, [key]: list }
    })
  const addPoint = () =>
    setD((x) => ({ ...x, included_de: [...x.included_de, ''], included_en: [...x.included_en, ''] }))
  const removePoint = (i: number) =>
    setD((x) => ({ ...x, included_de: x.included_de.filter((_, k) => k !== i), included_en: x.included_en.filter((_, k) => k !== i) }))
  const movePoint = (i: number, to: number) =>
    setD((x) => ({ ...x, included_de: moveItem(x.included_de, i, to), included_en: moveItem(x.included_en, i, to) }))

  const close = async () => {
    if (dirty && !(await confirm({
      title: t('Änderungen verwerfen?', 'Discard changes?'),
      body: t('Ihre Änderungen wurden noch nicht gespeichert.', 'Your changes have not been saved yet.'),
      confirmLabel: t('Ja, verwerfen', 'Yes, discard'),
      cancelLabel: t('Weiter bearbeiten', 'Keep editing'),
      danger: true,
    }))) return
    if (newImage) URL.revokeObjectURL(newImage.preview)
    onClose()
  }

  const chooseImage = (f: File | undefined) => {
    if (!f) return
    if (!isImage(f) || f.size > MAX_IMAGE_BYTES) {
      toast.error(t('Bitte ein normales Foto (JPG, PNG, WebP) unter 40 MB wählen.', 'Please choose a normal photo (JPG, PNG, WebP) under 40 MB.'))
      return
    }
    if (newImage) URL.revokeObjectURL(newImage.preview)
    setNewImage({ file: f, preview: URL.createObjectURL(f) })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!d.title_de.trim()) e.title_de = t('Bitte einen Titel eingeben.', 'Please enter a title.')
    if (!d.description_de.trim()) e.description_de = t('Bitte eine Kurzbeschreibung eingeben.', 'Please enter a short description.')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) {
      toast.error(t('Bitte füllen Sie die markierten Felder aus.', 'Please fill in the marked fields.'))
      return
    }
    setSaving(true)
    let uploaded: Awaited<ReturnType<typeof uploadVariants>> | null = null
    try {
      const sb = await getAdminClient()
      // both point lists stay the same length; an empty German point is dropped together with its English partner,
      // an empty English point falls back to the German text
      const de: string[] = []
      const en: string[] = []
      d.included_de.forEach((p, i) => {
        const x = p.trim()
        if (!x) return
        de.push(x)
        en.push((d.included_en[i] ?? '').trim() || x)
      })
      const row: Record<string, unknown> = {
        title_de: d.title_de.trim(),
        title_en: d.title_en.trim() || d.title_de.trim(),
        description_de: d.description_de.trim(),
        description_en: d.description_en.trim() || d.description_de.trim(),
        details_de: d.details_de.trim() || null,
        details_en: d.details_en.trim() || null,
        included_de: de,
        included_en: en,
        price_from: d.price_from.trim() || null,
        icon: d.icon,
        is_visible: d.is_visible,
        image_position: d.image_position || null,
      }
      if (newImage) {
        const v = await makeVariants(newImage.file)
        uploaded = await uploadVariants(sb, 'services', v)
        Object.assign(row, {
          image_path: uploaded.image_path,
          image_path_sm: uploaded.image_path_sm,
          image_width: uploaded.width,
          image_height: uploaded.height,
          image_sm_width: uploaded.sm_width,
          image_alt_de: d.title_de.trim(),
          image_alt_en: d.title_en.trim() || d.title_de.trim(),
        })
      }
      if (service) {
        await must(sb.from('services').update(row).eq('id', service.id))
        if (uploaded) await removeFiles(sb, 'site-images', [service.image_path, service.image_path_sm])
      } else {
        await must(sb.from('services').insert({ ...row, slug: slugify(d.title_de), sort_order: nextOrder(rows) }))
      }
      touchSite()
      toast.success(
        service
          ? t('Gespeichert. Die Änderung ist jetzt auf der Website.', 'Saved. The change is now on the website.')
          : t('Neue Leistung angelegt und veröffentlicht.', 'New service created and published.'),
      )
      if (newImage) URL.revokeObjectURL(newImage.preview)
      onSaved()
      onClose()
    } catch (e) {
      if (uploaded) {
        const sb = await getAdminClient()
        await removeFiles(sb, 'site-images', [uploaded.image_path, uploaded.image_path_sm])
      }
      toast.failed(e)
    } finally {
      setSaving(false)
    }
  }

  const currentImage = newImage?.preview ?? (service?.image_path ? serviceThumb(service) : '')

  return (
    <Sheet
      open
      title={service ? t('Leistung bearbeiten', 'Edit service') : t('Neue Leistung', 'New service')}
      onClose={() => void close()}
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          {service && !service.is_specialty ? (
            <Button variant="danger-soft" icon={Trash2} onClick={() => onDelete(service)} aria-label={t('Leistung löschen', 'Delete service')}>
              <span className="hidden sm:inline">{t('Löschen', 'Delete')}</span>
            </Button>
          ) : (
            <span />
          )}
          <Button size="lg" icon={Save} loading={saving} disabled={!dirty} onClick={() => void save()}>
            {t('Speichern', 'Save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {service?.is_specialty && (
          <Callout tone="success">
            {t('Das ist Ihre Spezialität und wird auf der Website immer hervorgehoben. Sie können sie verstecken, aber nicht löschen.', 'This is your specialty and is always highlighted on the website. You can hide it, but not delete it.')}
          </Callout>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t('Titel (Deutsch)', 'Title (German)')} limit={LIMIT.title} value={d.title_de} onChange={(v) => set('title_de', v)} error={errors.title_de} />
          <TextField label={t('Titel (Englisch)', 'Title (English)')} optional limit={LIMIT.title} value={d.title_en} onChange={(v) => set('title_en', v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextAreaField label={t('Kurzbeschreibung (Deutsch)', 'Short description (German)')} rows={4} limit={LIMIT.description} value={d.description_de} onChange={(v) => set('description_de', v)} error={errors.description_de} hint={t('Steht auf der Karte.', 'Shown on the card.')} />
          <TextAreaField label={t('Kurzbeschreibung (Englisch)', 'Short description (English)')} optional rows={4} limit={LIMIT.description} value={d.description_en} onChange={(v) => set('description_en', v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextAreaField label={t('Ausführlicher Text (Deutsch)', 'Detailed text (German)')} optional rows={5} limit={LIMIT.details} value={d.details_de} onChange={(v) => set('details_de', v)} hint={t('Steht auf der Seite „Leistungen“.', 'Shown on the “Services” page.')} />
          <TextAreaField label={t('Ausführlicher Text (Englisch)', 'Detailed text (English)')} optional rows={5} limit={LIMIT.details} value={d.details_en} onChange={(v) => set('details_en', v)} />
        </div>

        <fieldset>
          <legend className="text-[15px] font-semibold text-ink">{t('Das ist enthalten (Aufzählungspunkte)', 'What is included (bullet points)')}</legend>
          <p className="mb-2 text-sm text-ink-muted">{t('Pro Punkt eine kurze Zeile. Englisch ist optional.', 'One short line per point. English is optional.')}</p>
          <ul className="space-y-3">
            {Array.from({ length: pointRows }, (_, i) => (
              <li key={i} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label={`${t('Punkt', 'Point')} ${i + 1} (DE)`} limit={LIMIT.point} value={d.included_de[i] ?? ''} onChange={(v) => setPoint('de', i, v)} />
                  <TextField label={`${t('Punkt', 'Point')} ${i + 1} (EN)`} optional limit={LIMIT.point} value={d.included_en[i] ?? ''} onChange={(v) => setPoint('en', i, v)} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <MoveButtons index={i} count={pointRows} onMove={(to) => movePoint(i, to)} />
                  <Button variant="danger-soft" size="sm" icon={X} onClick={() => removePoint(i)}>
                    {t('Entfernen', 'Remove')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="secondary" icon={Plus} className="mt-3" disabled={pointRows >= LIMIT.points} onClick={addPoint}>
            {t('Punkt hinzufügen', 'Add point')}
          </Button>
          {pointRows >= LIMIT.points && <p className="mt-1 text-sm text-ink-muted">{t(`Höchstens ${LIMIT.points} Punkte.`, `At most ${LIMIT.points} points.`)}</p>}
        </fieldset>

        <TextField
          label={t('Preis „ab“', '“From” price')}
          optional
          limit={LIMIT.price}
          value={d.price_from}
          onChange={(v) => set('price_from', v)}
          placeholder={t('z. B. ab 25 € / Std.', 'e.g. ab 25 € / Std.')}
          hint={t('Wird so auf der Website angezeigt. Leer lassen = kein Preis.', 'Shown exactly like this on the website. Leave empty = no price.')}
        />

        <div>
          <p className="mb-1.5 text-[15px] font-semibold text-ink">{t('Foto', 'Photo')}</p>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
            {currentImage ? (
              <img src={currentImage} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" style={{ objectPosition: d.image_position || undefined }} />
            ) : (
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <ImagePlus size={28} aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => (chooseImage(e.target.files?.[0]), (e.target.value = ''))} />
              <Button variant="secondary" icon={ImagePlus} onClick={() => fileRef.current?.click()}>
                {currentImage ? t('Foto ändern', 'Change photo') : t('Foto wählen', 'Choose photo')}
              </Button>
              {newImage && <p className="mt-1.5 text-sm text-emerald-700">{t('Neues Foto – wird beim Speichern hochgeladen.', 'New photo – uploaded when you save.')}</p>}
            </div>
          </div>
          <div className="mt-3">
            <SelectField
              label={t('Bildausschnitt', 'Photo crop')}
              value={nearestFocus(d.image_position)}
              onChange={(v) => set('image_position', v)}
              options={focusOptions.map((o) => ({ value: o.value, label: t(o.de, o.en) }))}
            />
          </div>
        </div>

        <SelectField
          label={t('Symbol', 'Icon')}
          value={d.icon}
          onChange={(v) => set('icon', v)}
          options={icons.map((i) => ({ value: i.value, label: t(i.de, i.en) }))}
        />
        <Toggle checked={d.is_visible} onChange={(v) => set('is_visible', v)} label={t('Auf der Website sichtbar', 'Visible on the website')} hint={t('Ausgeschaltet = versteckt, aber nicht gelöscht.', 'Off = hidden, but not deleted.')} />
      </div>
    </Sheet>
  )
}
