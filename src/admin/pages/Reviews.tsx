import { Eye, EyeOff, MessageSquareQuote, Pencil, Plus, Save, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { RawTestimonial } from '../../data/content/types'
import { getAdminClient } from '../lib/client'
import { moveItem, must, nextOrder, rowsOf, reorderGroup, touchSite, useLoad } from '../lib/data'
import { useA } from '../lib/i18n'
import { useConfirm, useConfirmDelete, useDirty, useToast } from '../ui/feedback'
import { Badge, Button, EmptyState, IconButton, LoadState, PageHead, Sheet, TextAreaField, TextField, Toggle } from '../ui/kit'
import MoveButtons from '../ui/MoveButtons'
import { SortableArea, SortableItem } from '../ui/Sortable'

const LIMIT = { name: 60, text: 400 }

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  const { t } = useA()
  return (
    <span className="inline-flex" role="img" aria-label={t(`${value} von 5 Sternen`, `${value} out of 5 stars`)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} aria-hidden="true" className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
      ))}
    </span>
  )
}

export default function Reviews() {
  const { t } = useA()
  const toast = useToast()
  const confirmDelete = useConfirmDelete()
  const { data, error, loading, reload, setData } = useLoad<RawTestimonial[]>(async (sb) =>
    rowsOf<RawTestimonial>(sb.from('testimonials').select('*').order('sort_order').order('created_at')),
  )
  const [editing, setEditing] = useState<RawTestimonial | 'new' | null>(null)
  const rows = useMemo(() => data ?? [], [data])

  const persistOrder = async (ids: string[]) => {
    const changes = reorderGroup(rows, ids)
    if (!changes.length) return
    const before = data
    const map = new Map(changes.map((c) => [c.id, c.sort_order]))
    setData((d) => (d ?? []).map((r) => (map.has(r.id) ? { ...r, sort_order: map.get(r.id)! } : r)).sort((a, b) => a.sort_order - b.sort_order))
    try {
      const sb = await getAdminClient()
      await Promise.all(changes.map((c) => must(sb.from('testimonials').update({ sort_order: c.sort_order }).eq('id', c.id))))
      touchSite()
      toast.success(t('Reihenfolge gespeichert.', 'Order saved.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const toggleVisible = async (r: RawTestimonial) => {
    const before = data
    setData((d) => (d ?? []).map((x) => (x.id === r.id ? { ...x, is_visible: !r.is_visible } : x)))
    try {
      const sb = await getAdminClient()
      await must(sb.from('testimonials').update({ is_visible: !r.is_visible }).eq('id', r.id))
      touchSite()
      toast.success(r.is_visible ? t('Bewertung ist jetzt versteckt.', 'Review is now hidden.') : t('Bewertung ist jetzt sichtbar.', 'Review is now visible.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const remove = async (r: RawTestimonial) => {
    if (!(await confirmDelete(t(`Bewertung von ${r.name}`, `review by ${r.name}`)))) return
    try {
      const sb = await getAdminClient()
      await must(sb.from('testimonials').delete().eq('id', r.id))
      touchSite()
      setEditing(null)
      await reload(true)
      toast.success(t('Bewertung gelöscht.', 'Review deleted.'))
    } catch (e) {
      toast.failed(e)
    }
  }

  return (
    <div>
      <PageHead
        title={t('Bewertungen', 'Reviews')}
        help={t(
          'Hier tragen Sie Kundenstimmen mit Sternen ein. Sobald eine Bewertung sichtbar ist, erscheint auf der Startseite ein Bewertungs-Bereich.',
          'Add customer reviews with stars here. As soon as one review is visible, a reviews section appears on the home page.',
        )}
        actions={
          <Button icon={Plus} onClick={() => setEditing('new')}>
            {t('Neue Bewertung', 'New review')}
          </Button>
        }
      />
      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {rows.length === 0 ? (
          <EmptyState icon={MessageSquareQuote} title={t('Noch keine Bewertungen', 'No reviews yet')}>
            {t('Tragen Sie die erste Kundenstimme ein. Bitte nur Bewertungen veröffentlichen, die Ihnen Kunden wirklich gegeben haben und mit deren Einverständnis.', 'Add the first customer review. Please only publish reviews customers really gave you, and with their consent.')}
          </EmptyState>
        ) : (
          <SortableArea ids={rows.map((r) => r.id)} onReorder={(ids) => void persistOrder(ids)}>
            <ul className="space-y-3">
              {rows.map((r, i) => (
                <li key={r.id}>
                  <SortableItem id={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    {({ handle }) => (
                      <>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="font-bold text-ink">{r.name}</p>
                          <Stars value={r.rating} />
                          {!r.is_visible && <Badge tone="amber">{t('Versteckt', 'Hidden')}</Badge>}
                        </div>
                        <p className={`mt-1 line-clamp-3 text-[15px] text-ink-muted ${r.is_visible ? '' : 'opacity-60'}`}>{r.text_de || r.text_en}</p>
                        <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2">
                          {handle}
                          <MoveButtons index={i} count={rows.length} onMove={(to) => void persistOrder(moveItem(rows.map((x) => x.id), i, to))} />
                          <IconButton icon={r.is_visible ? Eye : EyeOff} label={r.is_visible ? t('Verstecken', 'Hide') : t('Wieder anzeigen', 'Show again')} onClick={() => void toggleVisible(r)} />
                          <Button variant="soft" size="sm" icon={Pencil} className="ml-auto" onClick={() => setEditing(r)}>
                            {t('Bearbeiten', 'Edit')}
                          </Button>
                        </div>
                      </>
                    )}
                  </SortableItem>
                </li>
              ))}
            </ul>
          </SortableArea>
        )}
      </LoadState>

      {editing && (
        <ReviewEditor
          key={editing === 'new' ? 'new' : editing.id}
          review={editing === 'new' ? null : editing}
          rows={rows}
          onClose={() => setEditing(null)}
          onSaved={() => void reload(true)}
          onDelete={remove}
        />
      )}
    </div>
  )
}

function ReviewEditor({
  review,
  rows,
  onClose,
  onSaved,
  onDelete,
}: {
  review: RawTestimonial | null
  rows: RawTestimonial[]
  onClose: () => void
  onSaved: () => void
  onDelete: (r: RawTestimonial) => void
}) {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const base = useMemo(
    () => ({
      name: review?.name ?? '',
      rating: review?.rating ?? 5,
      text_de: review?.text_de ?? '',
      text_en: review?.text_en ?? '',
      is_visible: review?.is_visible ?? true,
    }),
    [review],
  )
  const [d, setD] = useState(base)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(d) !== JSON.stringify(base)
  useDirty('review-edit', dirty)

  const close = async () => {
    if (dirty && !(await confirm({
      title: t('Änderungen verwerfen?', 'Discard changes?'),
      body: t('Ihre Änderungen wurden noch nicht gespeichert.', 'Your changes have not been saved yet.'),
      confirmLabel: t('Ja, verwerfen', 'Yes, discard'),
      cancelLabel: t('Weiter bearbeiten', 'Keep editing'),
      danger: true,
    }))) return
    onClose()
  }

  const save = async () => {
    const e: Record<string, string> = {}
    if (!d.name.trim()) e.name = t('Bitte einen Namen eingeben (z. B. „Familie Meyer“).', 'Please enter a name (e.g. “Meyer family”).')
    if (!d.text_de.trim() && !d.text_en.trim()) e.text_de = t('Bitte den Text der Bewertung eingeben.', 'Please enter the review text.')
    setErrors(e)
    if (Object.keys(e).length) return toast.error(t('Bitte füllen Sie die markierten Felder aus.', 'Please fill in the marked fields.'))
    setSaving(true)
    try {
      const sb = await getAdminClient()
      const row = {
        name: d.name.trim(),
        rating: d.rating,
        text_de: d.text_de.trim(),
        text_en: d.text_en.trim(),
        is_visible: d.is_visible,
      }
      if (review) await must(sb.from('testimonials').update(row).eq('id', review.id))
      else await must(sb.from('testimonials').insert({ ...row, sort_order: nextOrder(rows) }))
      touchSite()
      toast.success(review ? t('Gespeichert. Die Änderung ist jetzt auf der Website.', 'Saved. The change is now on the website.') : t('Bewertung hinzugefügt.', 'Review added.'))
      onSaved()
      onClose()
    } catch (err) {
      toast.failed(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open
      title={review ? t('Bewertung bearbeiten', 'Edit review') : t('Neue Bewertung', 'New review')}
      onClose={() => void close()}
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          {review ? (
            <Button variant="danger-soft" icon={Trash2} onClick={() => onDelete(review)} aria-label={t('Bewertung löschen', 'Delete review')}>
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
        <TextField label={t('Name', 'Name')} limit={LIMIT.name} value={d.name} onChange={(v) => setD({ ...d, name: v })} error={errors.name} autoComplete="off" />
        <fieldset>
          <legend className="mb-1.5 text-[15px] font-semibold text-ink">{t('Sterne', 'Stars')}</legend>
          <div className="flex gap-1" role="radiogroup" aria-label={t('Sterne', 'Stars')}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={d.rating === n}
                aria-label={t(`${n} Sterne`, `${n} stars`)}
                onClick={() => setD({ ...d, rating: n })}
                className="flex h-14 w-14 items-center justify-center rounded-xl hover:bg-amber-50"
              >
                <Star size={34} aria-hidden="true" className={n <= d.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
              </button>
            ))}
          </div>
        </fieldset>
        <TextAreaField label={t('Text (Deutsch)', 'Text (German)')} rows={5} limit={LIMIT.text} value={d.text_de} onChange={(v) => setD({ ...d, text_de: v })} error={errors.text_de} />
        <TextAreaField label={t('Text (Englisch)', 'Text (English)')} optional rows={5} limit={LIMIT.text} value={d.text_en} onChange={(v) => setD({ ...d, text_en: v })} hint={t('Ohne englischen Text wird der deutsche gezeigt.', 'Without an English text the German one is shown.')} />
        <Toggle checked={d.is_visible} onChange={(v) => setD({ ...d, is_visible: v })} label={t('Auf der Website sichtbar', 'Visible on the website')} />
      </div>
    </Sheet>
  )
}
