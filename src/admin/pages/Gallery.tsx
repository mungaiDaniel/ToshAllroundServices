import { Camera, EyeOff, Eye, Images, Link2, Pencil, RotateCcw, Star, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { GalleryCategory } from '../../data/content/types'
import { categories, categoryLabel, PhotoPicker, thumbUrl, type PhotoRow } from '../gallery/shared'
import PhotoEditSheet from '../gallery/PhotoEditSheet'
import UploadSheet from '../gallery/UploadSheet'
import { getAdminClient } from '../lib/client'
import { must, reorderGroup, rowsOf, touchSite, useLoad } from '../lib/data'
import { trashDaysLeft, TRASH_DAYS } from '../lib/format'
import { useA } from '../lib/i18n'
import { removeFiles } from '../lib/images'
import { useConfirm, useToast } from '../ui/feedback'
import { Badge, Button, Callout, EmptyState, IconButton, LoadState, PageHead, Sheet } from '../ui/kit'
import { SortableArea, SortableItem } from '../ui/Sortable'

type Filter = 'all' | 'hidden' | GalleryCategory

export default function Gallery() {
  const { t, lang } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const location = useLocation()
  const { data, error, loading, reload, setData } = useLoad<PhotoRow[]>(async (sb) =>
    rowsOf<PhotoRow>(sb.from('gallery_photos').select('*').order('sort_order').order('created_at')),
  )
  const [tab, setTab] = useState<'photos' | 'trash'>('photos')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<PhotoRow | null>(null)
  const [uploadOpen, setUploadOpen] = useState(Boolean((location.state as { add?: boolean } | null)?.add))
  const [pairOpen, setPairOpen] = useState(false)

  const rows = useMemo(() => data ?? [], [data])
  const active = useMemo(() => rows.filter((r) => !r.deleted_at), [rows])
  const trash = useMemo(
    () => rows.filter((r) => r.deleted_at).sort((a, b) => (b.deleted_at ?? '').localeCompare(a.deleted_at ?? '')),
    [rows],
  )
  const shown = useMemo(
    () => (filter === 'all' ? active : filter === 'hidden' ? active.filter((r) => !r.is_visible) : active.filter((r) => r.category === filter)),
    [active, filter],
  )
  const beforeIds = useMemo(() => new Set(active.map((r) => r.before_after_pair_id).filter(Boolean) as string[]), [active])

  /* photos in the trash for more than 30 days are removed for good (once per visit) */
  const purged = useRef(false)
  useEffect(() => {
    if (!data || purged.current) return
    purged.current = true
    const old = data.filter((r) => r.deleted_at && trashDaysLeft(r.deleted_at) === 0)
    if (!old.length) return
    void (async () => {
      try {
        const sb = await getAdminClient()
        await removeFiles(sb, 'site-images', old.flatMap((r) => [r.image_path, r.image_path_sm]))
        await must(sb.from('gallery_photos').delete().in('id', old.map((r) => r.id)))
        void reload(true)
      } catch (e) {
        console.warn('[admin] purge failed', e)
      }
    })()
  }, [data, reload])

  /* ---------- actions ---------- */
  const update = async (id: string, patch: Partial<PhotoRow>, successText: string) => {
    const before = data
    setData((d) => (d ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r)))
    try {
      const sb = await getAdminClient()
      await must(sb.from('gallery_photos').update(patch).eq('id', id))
      touchSite()
      toast.success(successText)
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const toggleVisible = (r: PhotoRow) =>
    update(
      r.id,
      { is_visible: !r.is_visible },
      r.is_visible ? t('Foto ist jetzt versteckt.', 'Photo is now hidden.') : t('Foto ist jetzt auf der Website sichtbar.', 'Photo is now visible on the website.'),
    )

  const moveToTrash = async (r: PhotoRow) => {
    const ok = await confirm({
      title: t('Foto in den Papierkorb legen?', 'Move photo to the trash?'),
      body: t(
        `Das Foto verschwindet von der Website. Sie können es ${TRASH_DAYS} Tage lang wiederherstellen.`,
        `The photo disappears from the website. You can restore it for ${TRASH_DAYS} days.`,
      ),
      confirmLabel: t('Ja, in den Papierkorb', 'Yes, move to trash'),
      danger: true,
    })
    if (!ok) return
    setEditing(null)
    await update(r.id, { deleted_at: new Date().toISOString() }, t('Foto liegt im Papierkorb.', 'Photo is in the trash.'))
  }

  const restore = (r: PhotoRow) => update(r.id, { deleted_at: null }, t('Foto wiederhergestellt.', 'Photo restored.'))

  const deleteForever = async (r: PhotoRow) => {
    const ok = await confirm({
      title: t('Foto endgültig löschen?', 'Delete photo permanently?'),
      body: t('Das Foto wird für immer gelöscht und kann nicht wiederhergestellt werden.', 'The photo is deleted for good and cannot be restored.'),
      confirmLabel: t('Ja, endgültig löschen', 'Yes, delete permanently'),
      danger: true,
    })
    if (!ok) return
    try {
      const sb = await getAdminClient()
      await must(sb.from('gallery_photos').delete().eq('id', r.id))
      await removeFiles(sb, 'site-images', [r.image_path, r.image_path_sm])
      touchSite()
      setData((d) => (d ?? []).filter((x) => x.id !== r.id))
      toast.success(t('Foto endgültig gelöscht.', 'Photo deleted permanently.'))
    } catch (e) {
      toast.failed(e)
    }
  }

  const emptyTrash = async () => {
    const ok = await confirm({
      title: t('Papierkorb leeren?', 'Empty the trash?'),
      body: t(`Alle ${trash.length} Fotos werden für immer gelöscht.`, `All ${trash.length} photos are deleted for good.`),
      confirmLabel: t('Ja, Papierkorb leeren', 'Yes, empty trash'),
      danger: true,
    })
    if (!ok) return
    try {
      const sb = await getAdminClient()
      await must(sb.from('gallery_photos').delete().in('id', trash.map((r) => r.id)))
      await removeFiles(sb, 'site-images', trash.flatMap((r) => [r.image_path, r.image_path_sm]))
      touchSite()
      await reload(true)
      toast.success(t('Papierkorb geleert.', 'Trash emptied.'))
    } catch (e) {
      toast.failed(e)
    }
  }

  const onReorder = async (ids: string[]) => {
    const changes = reorderGroup(rows, ids)
    if (!changes.length) return
    const before = data
    const map = new Map(changes.map((c) => [c.id, c.sort_order]))
    setData((d) => (d ?? []).map((r) => (map.has(r.id) ? { ...r, sort_order: map.get(r.id)! } : r)).sort((a, b) => a.sort_order - b.sort_order))
    try {
      const sb = await getAdminClient()
      await Promise.all(changes.map((c) => must(sb.from('gallery_photos').update({ sort_order: c.sort_order }).eq('id', c.id))))
      touchSite()
      toast.success(t('Reihenfolge gespeichert.', 'Order saved.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const chips: { value: Filter; label: string }[] = [
    { value: 'all', label: t('Alle', 'All') },
    ...categories.map((c) => ({ value: c.value as Filter, label: t(c.de, c.en) })),
    { value: 'hidden', label: t('Versteckt', 'Hidden') },
  ]

  return (
    <div>
      <PageHead
        title={t('Galerie', 'Gallery')}
        help={t(
          'Hier laden Sie Fotos hoch, ordnen sie per Ziehen am Griff, verstecken sie oder legen sie in den Papierkorb – alles erscheint sofort auf der Website.',
          'Upload photos here, reorder them by dragging the handle, hide them or move them to the trash – everything shows up on the website straight away.',
        )}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <Button size="lg" icon={Camera} onClick={() => setUploadOpen(true)}>
          {t('Fotos hinzufügen', 'Add photos')}
        </Button>
        <Button size="lg" variant="secondary" icon={Link2} onClick={() => setPairOpen(true)} disabled={active.length < 2}>
          {t('Vorher/Nachher erstellen', 'Create before/after')}
        </Button>
      </div>

      <div role="tablist" aria-label={t('Ansicht', 'View')} className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1">
        {(['photos', 'trash'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-11 rounded-xl px-3 text-[15px] font-bold ${tab === k ? 'bg-white text-ink shadow-sm' : 'text-slate-600'}`}
          >
            {k === 'photos' ? t(`Fotos (${active.length})`, `Photos (${active.length})`) : t(`Papierkorb (${trash.length})`, `Trash (${trash.length})`)}
          </button>
        ))}
      </div>

      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {tab === 'photos' ? (
          <>
            <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2" role="group" aria-label={t('Nach Kategorie filtern', 'Filter by category')}>
              {chips.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={filter === c.value}
                  onClick={() => setFilter(c.value)}
                  className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold ${filter === c.value ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {shown.length === 0 ? (
              <div className="mt-3">
                <EmptyState icon={Images} title={active.length ? t('Keine Fotos in dieser Ansicht', 'No photos in this view') : t('Noch keine Fotos', 'No photos yet')}>
                  {active.length
                    ? t('Wählen Sie oben eine andere Kategorie.', 'Choose another category above.')
                    : t('Tippen Sie auf „Fotos hinzufügen“, um Ihr erstes Foto hochzuladen.', 'Tap “Add photos” to upload your first photo.')}
                </EmptyState>
              </div>
            ) : (
              <>
                <p className="mb-3 mt-1 text-sm text-ink-muted">
                  {t('Zum Sortieren den Griff oben links am Foto festhalten und ziehen.', 'To reorder, hold the handle at the top left of a photo and drag.')}
                </p>
                <SortableArea layout="grid" ids={shown.map((r) => r.id)} onReorder={(ids) => void onReorder(ids)}>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {shown.map((r) => (
                      <li key={r.id}>
                        <SortableItem id={r.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          {({ handle }) => (
                            <>
                              <div className="relative aspect-square bg-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setEditing(r)}
                                  aria-label={`${t('Foto bearbeiten', 'Edit photo')}: ${r.caption_de || categoryLabel(r.category, lang)}`}
                                  className="absolute inset-0"
                                >
                                  <img
                                    src={thumbUrl(r)}
                                    alt=""
                                    loading="lazy"
                                    draggable={false}
                                    className={`h-full w-full object-cover ${r.is_visible ? '' : 'opacity-40 grayscale'}`}
                                    style={{ objectPosition: r.position ?? undefined }}
                                  />
                                </button>
                                <div className="absolute left-1 top-1 rounded-xl bg-white/90 shadow">{handle}</div>
                                <div className="absolute right-1 top-1 rounded-xl bg-white/90 shadow">
                                  <IconButton
                                    icon={r.is_visible ? Eye : EyeOff}
                                    label={r.is_visible ? t('Verstecken', 'Hide') : t('Wieder anzeigen', 'Show again')}
                                    aria-pressed={!r.is_visible}
                                    onClick={() => void toggleVisible(r)}
                                  />
                                </div>
                                <div className="pointer-events-none absolute bottom-1.5 left-1.5 flex flex-wrap gap-1">
                                  {!r.is_visible && <Badge tone="amber">{t('Versteckt', 'Hidden')}</Badge>}
                                  {r.is_featured && (
                                    <Badge tone="blue">
                                      <Star size={12} aria-hidden="true" />
                                      {t('Start', 'Home')}
                                    </Badge>
                                  )}
                                  {r.before_after_pair_id && <Badge tone="green">{t('Vorher/Nachher', 'Before/After')}</Badge>}
                                  {beforeIds.has(r.id) && <Badge tone="green">{t('„Vorher“', '“Before”')}</Badge>}
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="truncate px-1 text-sm font-semibold text-ink">{r.caption_de || categoryLabel(r.category, lang)}</p>
                                {r.caption_de && <p className="truncate px-1 text-xs text-slate-500">{categoryLabel(r.category, lang)}</p>}
                                <Button variant="soft" size="sm" icon={Pencil} full className="mt-1.5" onClick={() => setEditing(r)}>
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
              </>
            )}
          </>
        ) : (
          <div className="mt-4">
            {trash.length === 0 ? (
              <EmptyState icon={Trash2} title={t('Der Papierkorb ist leer', 'The trash is empty')}>
                {t(`Gelöschte Fotos bleiben hier ${TRASH_DAYS} Tage lang erhalten.`, `Deleted photos stay here for ${TRASH_DAYS} days.`)}
              </EmptyState>
            ) : (
              <>
                <Callout tone="info">
                  {t(`Fotos im Papierkorb sind nicht auf der Website. Nach ${TRASH_DAYS} Tagen werden sie endgültig gelöscht.`, `Photos in the trash are not on the website. After ${TRASH_DAYS} days they are deleted for good.`)}
                </Callout>
                <ul className="mt-3 space-y-3">
                  {trash.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <img src={thumbUrl(r)} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">{r.caption_de || categoryLabel(r.category, lang)}</p>
                        <p className="text-sm text-amber-700">
                          {t(`Noch ${trashDaysLeft(r.deleted_at!)} Tage`, `${trashDaysLeft(r.deleted_at!)} days left`)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button size="sm" variant="soft" icon={RotateCcw} onClick={() => void restore(r)}>
                            {t('Wiederherstellen', 'Restore')}
                          </Button>
                          <IconButton icon={Trash2} tone="danger" label={t('Endgültig löschen', 'Delete permanently')} onClick={() => void deleteForever(r)} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="danger-soft" full className="mt-4" icon={Trash2} onClick={() => void emptyTrash()}>
                  {t('Papierkorb leeren', 'Empty trash')}
                </Button>
              </>
            )}
          </div>
        )}
      </LoadState>

      <UploadSheet
        open={uploadOpen}
        rows={rows}
        defaultCategory={categories.some((c) => c.value === filter) ? (filter as GalleryCategory) : 'homes'}
        onClose={() => setUploadOpen(false)}
        onDone={() => void reload(true)}
      />
      <PhotoEditSheet row={editing} rows={active} onClose={() => setEditing(null)} onSaved={() => void reload(true)} onTrash={(r) => void moveToTrash(r)} />
      <PairSheet open={pairOpen} rows={active} onClose={() => setPairOpen(false)} onDone={() => void reload(true)} />
    </div>
  )
}

/** Two steps: pick the "before" photo, then the "after" photo. */
function PairSheet({ open, rows, onClose, onDone }: { open: boolean; rows: PhotoRow[]; onClose: () => void; onDone: () => void }) {
  const { t } = useA()
  const toast = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [beforeId, setBeforeId] = useState<string | null>(null)
  const [afterId, setAfterId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setBeforeId(null)
      setAfterId(null)
    }
  }, [open])

  // a photo can only be in one pair
  const taken = rows.filter((r) => r.before_after_pair_id || rows.some((o) => o.before_after_pair_id === r.id)).map((r) => r.id)

  const save = async () => {
    if (!beforeId || !afterId) return
    setSaving(true)
    try {
      const sb = await getAdminClient()
      await must(sb.from('gallery_photos').update({ before_after_pair_id: beforeId }).eq('id', afterId))
      touchSite()
      toast.success(t('Vorher/Nachher-Paar erstellt. Die Website zeigt es mit Schieberegler.', 'Before/after pair created. The website shows it with a slider.'))
      onDone()
      onClose()
    } catch (e) {
      toast.failed(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      title={t('Vorher/Nachher erstellen', 'Create before/after')}
      onClose={onClose}
      footer={
        step === 1 ? (
          <Button full size="lg" disabled={!beforeId} onClick={() => setStep(2)}>
            {t('Weiter', 'Next')}
          </Button>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
              {t('Zurück', 'Back')}
            </Button>
            <Button size="lg" loading={saving} disabled={!afterId} onClick={() => void save()}>
              {t('Paar speichern', 'Save pair')}
            </Button>
          </div>
        )
      }
    >
      <p className="mb-3 text-[17px] font-bold text-ink">
        {step === 1 ? t('1. Wählen Sie das „Vorher“-Foto', '1. Choose the “before” photo') : t('2. Wählen Sie das „Nachher“-Foto', '2. Choose the “after” photo')}
      </p>
      {rows.length - taken.length < 2 ? (
        <Callout tone="warn">{t('Es sind nicht genug freie Fotos da. Laden Sie zuerst zwei Fotos hoch.', 'There are not enough free photos. Upload two photos first.')}</Callout>
      ) : step === 1 ? (
        <PhotoPicker rows={rows} selectedId={beforeId} onSelect={setBeforeId} disabledIds={taken} />
      ) : (
        <PhotoPicker rows={rows} selectedId={afterId} onSelect={setAfterId} disabledIds={[...taken, beforeId ?? '']} />
      )}
      <p className="mt-3 text-sm text-ink-muted">
        {t('Das „Vorher“-Foto erscheint danach nicht mehr einzeln, sondern nur im Schieberegler beim „Nachher“-Foto.', 'The “before” photo then no longer appears on its own, only inside the slider of the “after” photo.')}
      </p>
    </Sheet>
  )
}
