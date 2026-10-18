import { FileText, ListChecks, Pencil, Plus, Save, Star, Trash2, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { CvType, RawCvEntry } from '../../data/content/types'
import { mediaUrl } from '../../lib/supabase'
import { getAdminClient } from '../lib/client'
import { moveItem, must, nextOrder, rowsOf, reorderGroup, touchSite, useLoad } from '../lib/data'
import { useA } from '../lib/i18n'
import { isPdf, MAX_PDF_BYTES, removeFiles, uploadBlob } from '../lib/images'
import { useConfirm, useConfirmDelete, useDirty, useToast } from '../ui/feedback'
import { Badge, Button, Card, EmptyState, LoadState, Sheet, TextAreaField, TextField, Toggle } from '../ui/kit'
import MoveButtons from '../ui/MoveButtons'
import { SortableArea, SortableItem } from '../ui/Sortable'

const types: { value: CvType; de: string; en: string; addDe: string; addEn: string }[] = [
  { value: 'experience', de: 'Erfahrung', en: 'Experience', addDe: 'Station hinzufügen', addEn: 'Add position' },
  { value: 'education', de: 'Ausbildung', en: 'Education', addDe: 'Ausbildung hinzufügen', addEn: 'Add education' },
  { value: 'language', de: 'Sprachen', en: 'Languages', addDe: 'Sprache hinzufügen', addEn: 'Add language' },
  { value: 'skill', de: 'Fähigkeiten', en: 'Skills', addDe: 'Fähigkeit hinzufügen', addEn: 'Add skill' },
]

export default function Cv() {
  const { t } = useA()
  const toast = useToast()
  const confirmDelete = useConfirmDelete()
  const { data, error, loading, reload, setData } = useLoad<RawCvEntry[]>(async (sb) =>
    rowsOf<RawCvEntry>(sb.from('cv_entries').select('*').order('sort_order').order('created_at')),
  )
  const [type, setType] = useState<CvType>('experience')
  const [editing, setEditing] = useState<RawCvEntry | 'new' | null>(null)
  const all = useMemo(() => data ?? [], [data])
  const group = useMemo(() => all.filter((r) => r.type === type), [all, type])
  const typeInfo = types.find((x) => x.value === type)!

  const persistOrder = async (ids: string[]) => {
    const changes = reorderGroup(all, ids)
    if (!changes.length) return
    const before = data
    const map = new Map(changes.map((c) => [c.id, c.sort_order]))
    setData((d) => (d ?? []).map((r) => (map.has(r.id) ? { ...r, sort_order: map.get(r.id)! } : r)).sort((a, b) => a.sort_order - b.sort_order))
    try {
      const sb = await getAdminClient()
      await Promise.all(changes.map((c) => must(sb.from('cv_entries').update({ sort_order: c.sort_order }).eq('id', c.id))))
      touchSite()
      toast.success(t('Reihenfolge gespeichert.', 'Order saved.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const remove = async (r: RawCvEntry) => {
    if (!(await confirmDelete(r.title_de))) return
    try {
      const sb = await getAdminClient()
      await must(sb.from('cv_entries').delete().eq('id', r.id))
      touchSite()
      setEditing(null)
      await reload(true)
      toast.success(t('Eintrag gelöscht.', 'Entry deleted.'))
    } catch (e) {
      toast.failed(e)
    }
  }

  return (
    <div>
      <CvPdf />

      <div role="tablist" aria-label={t('Art des Eintrags', 'Type of entry')} className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2">
        {types.map((x) => (
          <button
            key={x.value}
            role="tab"
            type="button"
            aria-selected={type === x.value}
            onClick={() => setType(x.value)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold ${type === x.value ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}
          >
            {t(x.de, x.en)} ({all.filter((r) => r.type === x.value).length})
          </button>
        ))}
      </div>

      <Button icon={Plus} className="mt-3" onClick={() => setEditing('new')}>
        {t(typeInfo.addDe, typeInfo.addEn)}
      </Button>

      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        <div className="mt-4">
          {group.length === 0 ? (
            <EmptyState icon={ListChecks} title={t('Noch keine Einträge', 'No entries yet')}>
              {t('Mit dem Knopf oben fügen Sie den ersten Eintrag hinzu.', 'Use the button above to add the first entry.')}
            </EmptyState>
          ) : (
            <SortableArea ids={group.map((r) => r.id)} onReorder={(ids) => void persistOrder(ids)}>
              <ul className="space-y-3">
                {group.map((r, i) => (
                  <li key={r.id}>
                    <SortableItem id={r.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      {({ handle }) => (
                        <>
                          <div className="min-w-0 px-1">
                            <p className="flex flex-wrap items-center gap-2 font-bold text-ink">
                              {r.title_de}
                              {r.is_highlight && (
                                <Badge tone="green">
                                  <Star size={12} aria-hidden="true" />
                                  {t('Hervorgehoben', 'Highlighted')}
                                </Badge>
                              )}
                            </p>
                            {(r.place || r.years) && (
                              <p className="text-sm text-ink-muted">{[r.place, r.years].filter(Boolean).join(' · ')}</p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-1 border-t border-slate-100 pt-2">
                            {handle}
                            <MoveButtons index={i} count={group.length} onMove={(to) => void persistOrder(moveItem(group.map((x) => x.id), i, to))} />
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
        </div>
      </LoadState>

      {editing && (
        <CvEditor
          key={editing === 'new' ? `new-${type}` : editing.id}
          entry={editing === 'new' ? null : editing}
          type={editing === 'new' ? type : editing.type}
          all={all}
          onClose={() => setEditing(null)}
          onSaved={() => void reload(true)}
          onDelete={remove}
        />
      )}
    </div>
  )
}

/** The downloadable CV on the "About us" page (stored as site_texts.founder_cv_pdf). */
function CvPdf() {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const { data, error, loading, reload } = useLoad<string>(async (sb) => {
    const row = await must(sb.from('site_texts').select('value_de').eq('key', 'founder_cv_pdf').maybeSingle())
    return row?.value_de ?? ''
  })
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const current = data ? mediaUrl(data, 'documents') : undefined

  const upload = async (f?: File) => {
    if (!f) return
    if (!isPdf(f) || f.size > MAX_PDF_BYTES) return toast.error(t('Bitte eine PDF-Datei unter 20 MB wählen.', 'Please choose a PDF file under 20 MB.'))
    if (!(await confirm({
      title: t('Neuen Lebenslauf hochladen?', 'Upload new CV?'),
      body: t('Der Download-Knopf auf der Website zeigt danach diese Datei.', 'The download button on the website will then offer this file.'),
      confirmLabel: t('Ja, hochladen', 'Yes, upload'),
    }))) return
    setBusy(true)
    try {
      const sb = await getAdminClient()
      const path = await uploadBlob(sb, 'documents', 'cv', f, 'pdf')
      await must(sb.from('site_texts').upsert({ key: 'founder_cv_pdf', value_de: path, value_en: path }, { onConflict: 'key' }))
      await removeFiles(sb, 'documents', [data])
      touchSite()
      toast.success(t('Lebenslauf hochgeladen. Er ist jetzt auf der Website.', 'CV uploaded. It is now on the website.'))
      await reload(true)
    } catch (e) {
      toast.failed(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
        <FileText size={22} className="text-brand" aria-hidden="true" />
        {t('Lebenslauf als PDF', 'CV as PDF')}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{t('Besucher können diese Datei auf der Seite „Über uns“ herunterladen.', 'Visitors can download this file on the “About us” page.')}</p>
      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input ref={ref} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => (void upload(e.target.files?.[0]), (e.target.value = ''))} />
          <Button variant="secondary" icon={Upload} loading={busy} onClick={() => ref.current?.click()}>
            {t('Neue PDF hochladen', 'Upload new PDF')}
          </Button>
          {current && (
            <a href={current} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[15px] font-semibold text-brand underline">
              {t('Aktuelle PDF ansehen', 'View current PDF')}
            </a>
          )}
        </div>
      </LoadState>
    </Card>
  )
}

function CvEditor({
  entry,
  type,
  all,
  onClose,
  onSaved,
  onDelete,
}: {
  entry: RawCvEntry | null
  type: CvType
  all: RawCvEntry[]
  onClose: () => void
  onSaved: () => void
  onDelete: (r: RawCvEntry) => void
}) {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const detailed = type === 'experience' || type === 'education'
  const base = useMemo(
    () => ({
      title_de: entry?.title_de ?? '',
      title_en: entry?.title_en ?? '',
      place: entry?.place ?? '',
      years: entry?.years ?? '',
      details_de: entry?.details_de ?? '',
      details_en: entry?.details_en ?? '',
      is_highlight: entry?.is_highlight ?? false,
    }),
    [entry],
  )
  const [d, setD] = useState(base)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(d) !== JSON.stringify(base)
  useDirty('cv-edit', dirty)

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
    if (!d.title_de.trim()) {
      setError(t('Bitte einen Titel eingeben.', 'Please enter a title.'))
      return toast.error(t('Bitte füllen Sie die markierten Felder aus.', 'Please fill in the marked fields.'))
    }
    setError(null)
    setSaving(true)
    try {
      const sb = await getAdminClient()
      const row = {
        title_de: d.title_de.trim(),
        title_en: d.title_en.trim() || d.title_de.trim(),
        place: detailed ? d.place.trim() || null : null,
        years: detailed ? d.years.trim() || null : null,
        details_de: detailed ? d.details_de.trim() || null : null,
        details_en: detailed ? d.details_en.trim() || null : null,
        is_highlight: type === 'skill' ? d.is_highlight : false,
      }
      if (entry) await must(sb.from('cv_entries').update(row).eq('id', entry.id))
      else await must(sb.from('cv_entries').insert({ ...row, type, sort_order: nextOrder(all) }))
      touchSite()
      toast.success(entry ? t('Gespeichert. Die Änderung ist jetzt auf der Website.', 'Saved. The change is now on the website.') : t('Eintrag hinzugefügt.', 'Entry added.'))
      onSaved()
      onClose()
    } catch (e) {
      toast.failed(e)
    } finally {
      setSaving(false)
    }
  }

  const label = types.find((x) => x.value === type)!
  const titleLabel =
    type === 'experience' ? t('Stelle / Aufgabe', 'Role') : type === 'education' ? t('Abschluss', 'Degree') : type === 'language' ? t('Sprache und Niveau', 'Language and level') : t('Fähigkeit', 'Skill')

  return (
    <Sheet
      open
      title={entry ? `${t(label.de, label.en)}: ${t('bearbeiten', 'edit')}` : t(label.addDe, label.addEn)}
      onClose={() => void close()}
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          {entry ? (
            <Button variant="danger-soft" icon={Trash2} onClick={() => onDelete(entry)} aria-label={t('Eintrag löschen', 'Delete entry')}>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={`${titleLabel} (${t('Deutsch', 'German')})`} limit={80} value={d.title_de} onChange={(v) => setD({ ...d, title_de: v })} error={error} />
          <TextField label={`${titleLabel} (${t('Englisch', 'English')})`} optional limit={80} value={d.title_en} onChange={(v) => setD({ ...d, title_en: v })} />
        </div>
        {detailed && (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <TextField label={type === 'experience' ? t('Firma / Ort', 'Company / place') : t('Schule / Hochschule', 'School / university')} limit={80} value={d.place} onChange={(v) => setD({ ...d, place: v })} />
              <TextField label={t('Zeitraum / Jahr', 'Period / year')} limit={20} value={d.years} onChange={(v) => setD({ ...d, years: v })} placeholder="2018–2022" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextAreaField label={t('Beschreibung (Deutsch)', 'Description (German)')} optional rows={4} limit={300} value={d.details_de} onChange={(v) => setD({ ...d, details_de: v })} />
              <TextAreaField label={t('Beschreibung (Englisch)', 'Description (English)')} optional rows={4} limit={300} value={d.details_en} onChange={(v) => setD({ ...d, details_en: v })} />
            </div>
          </>
        )}
        {type === 'skill' && (
          <Toggle checked={d.is_highlight} onChange={(v) => setD({ ...d, is_highlight: v })} label={t('Hervorheben', 'Highlight')} hint={t('Wird auf der Website farbig hervorgehoben.', 'Shown in colour on the website.')} />
        )}
      </div>
    </Sheet>
  )
}
