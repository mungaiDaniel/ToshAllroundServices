import { Eye, EyeOff, FileText, ImagePlus, Pencil, Plus, Save, Trash2, Award } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { RawCertificate } from '../../data/content/types'
import { mediaUrl } from '../../lib/supabase'
import { getAdminClient } from '../lib/client'
import { moveItem, must, nextOrder, rowsOf, reorderGroup, touchSite, useLoad } from '../lib/data'
import { useA } from '../lib/i18n'
import { isImage, isPdf, makeVariants, MAX_IMAGE_BYTES, MAX_PDF_BYTES, removeFiles, uploadBlob } from '../lib/images'
import { useConfirm, useConfirmDelete, useDirty, useToast } from '../ui/feedback'
import { Badge, Button, EmptyState, IconButton, LoadState, Sheet, TextField, Toggle } from '../ui/kit'
import MoveButtons from '../ui/MoveButtons'
import { SortableArea, SortableItem } from '../ui/Sortable'

const certThumb = (c: Pick<RawCertificate, 'thumb_path' | 'image_path'>) => mediaUrl(c.thumb_path || c.image_path) ?? ''

export default function Certificates() {
  const { t } = useA()
  const toast = useToast()
  const confirmDelete = useConfirmDelete()
  const { data, error, loading, reload, setData } = useLoad<RawCertificate[]>(async (sb) =>
    rowsOf<RawCertificate>(sb.from('certificates').select('*').order('sort_order').order('created_at')),
  )
  const [editing, setEditing] = useState<RawCertificate | 'new' | null>(null)
  const rows = useMemo(() => data ?? [], [data])

  const persistOrder = async (ids: string[]) => {
    const changes = reorderGroup(rows, ids)
    if (!changes.length) return
    const before = data
    const map = new Map(changes.map((c) => [c.id, c.sort_order]))
    setData((d) => (d ?? []).map((r) => (map.has(r.id) ? { ...r, sort_order: map.get(r.id)! } : r)).sort((a, b) => a.sort_order - b.sort_order))
    try {
      const sb = await getAdminClient()
      await Promise.all(changes.map((c) => must(sb.from('certificates').update({ sort_order: c.sort_order }).eq('id', c.id))))
      touchSite()
      toast.success(t('Reihenfolge gespeichert.', 'Order saved.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const toggleVisible = async (c: RawCertificate) => {
    const before = data
    setData((d) => (d ?? []).map((x) => (x.id === c.id ? { ...x, is_visible: !c.is_visible } : x)))
    try {
      const sb = await getAdminClient()
      await must(sb.from('certificates').update({ is_visible: !c.is_visible }).eq('id', c.id))
      touchSite()
      toast.success(c.is_visible ? t('Zertifikat ist jetzt versteckt.', 'Certificate is now hidden.') : t('Zertifikat ist jetzt sichtbar.', 'Certificate is now visible.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const remove = async (c: RawCertificate) => {
    if (!(await confirmDelete(c.title_de))) return
    try {
      const sb = await getAdminClient()
      await must(sb.from('certificates').delete().eq('id', c.id))
      await removeFiles(sb, 'site-images', [c.image_path, c.thumb_path])
      await removeFiles(sb, 'documents', [c.pdf_path])
      touchSite()
      setEditing(null)
      await reload(true)
      toast.success(t('Zertifikat gelöscht.', 'Certificate deleted.'))
    } catch (e) {
      toast.failed(e)
    }
  }

  return (
    <div>
      <Button icon={Plus} onClick={() => setEditing('new')} className="mb-4">
        {t('Zertifikat hinzufügen', 'Add certificate')}
      </Button>
      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {rows.length === 0 ? (
          <EmptyState icon={Award} title={t('Noch keine Zertifikate', 'No certificates yet')}>
            {t('Fügen Sie ein Zeugnis oder Zertifikat als Foto oder PDF hinzu.', 'Add a diploma or certificate as a photo or PDF.')}
          </EmptyState>
        ) : (
          <SortableArea ids={rows.map((r) => r.id)} onReorder={(ids) => void persistOrder(ids)}>
            <ul className="space-y-3">
              {rows.map((c, i) => (
                <li key={c.id}>
                  <SortableItem id={c.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    {({ handle }) => (
                      <>
                        <div className="flex items-start gap-3">
                          {c.image_path || c.thumb_path ? (
                            <img src={certThumb(c)} alt="" className={`h-20 w-16 shrink-0 rounded-lg border border-slate-200 object-cover ${c.is_visible ? '' : 'opacity-40 grayscale'}`} />
                          ) : (
                            <span className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                              <FileText size={26} aria-hidden="true" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-ink">{c.title_de}</p>
                            <p className="text-sm text-ink-muted">
                              {c.institution} · {c.year}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {c.pdf_path && <Badge tone="blue">PDF</Badge>}
                              {!c.is_visible && <Badge tone="amber">{t('Versteckt', 'Hidden')}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 border-t border-slate-100 pt-2">
                          {handle}
                          <MoveButtons index={i} count={rows.length} onMove={(to) => void persistOrder(moveItem(rows.map((x) => x.id), i, to))} />
                          <IconButton icon={c.is_visible ? Eye : EyeOff} label={c.is_visible ? t('Verstecken', 'Hide') : t('Wieder anzeigen', 'Show again')} onClick={() => void toggleVisible(c)} />
                          <Button variant="soft" size="sm" icon={Pencil} className="ml-auto" onClick={() => setEditing(c)}>
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
        <CertificateEditor
          key={editing === 'new' ? 'new' : editing.id}
          cert={editing === 'new' ? null : editing}
          rows={rows}
          onClose={() => setEditing(null)}
          onSaved={() => void reload(true)}
          onDelete={remove}
        />
      )}
    </div>
  )
}

function CertificateEditor({
  cert,
  rows,
  onClose,
  onSaved,
  onDelete,
}: {
  cert: RawCertificate | null
  rows: RawCertificate[]
  onClose: () => void
  onSaved: () => void
  onDelete: (c: RawCertificate) => void
}) {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const base = useMemo(
    () => ({
      title_de: cert?.title_de ?? '',
      title_en: cert?.title_en ?? '',
      institution: cert?.institution ?? '',
      year: cert?.year ?? '',
      is_visible: cert?.is_visible ?? true,
    }),
    [cert],
  )
  const [d, setD] = useState(base)
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [removePdf, setRemovePdf] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  const dirty = JSON.stringify(d) !== JSON.stringify(base) || Boolean(image) || Boolean(pdf) || removePdf
  useDirty('cert-edit', dirty)

  const close = async () => {
    if (dirty && !(await confirm({
      title: t('Änderungen verwerfen?', 'Discard changes?'),
      body: t('Ihre Änderungen wurden noch nicht gespeichert.', 'Your changes have not been saved yet.'),
      confirmLabel: t('Ja, verwerfen', 'Yes, discard'),
      cancelLabel: t('Weiter bearbeiten', 'Keep editing'),
      danger: true,
    }))) return
    if (image) URL.revokeObjectURL(image.preview)
    onClose()
  }

  const chooseImage = (f?: File) => {
    if (!f) return
    if (!isImage(f) || f.size > MAX_IMAGE_BYTES) return toast.error(t('Bitte ein normales Foto (JPG, PNG, WebP) unter 40 MB wählen.', 'Please choose a normal photo (JPG, PNG, WebP) under 40 MB.'))
    if (image) URL.revokeObjectURL(image.preview)
    setImage({ file: f, preview: URL.createObjectURL(f) })
  }
  const choosePdf = (f?: File) => {
    if (!f) return
    if (!isPdf(f) || f.size > MAX_PDF_BYTES) return toast.error(t('Bitte eine PDF-Datei unter 20 MB wählen.', 'Please choose a PDF file under 20 MB.'))
    setPdf(f)
    setRemovePdf(false)
  }

  const hasImage = Boolean(image || cert?.image_path)
  const hasPdf = Boolean(pdf || (cert?.pdf_path && !removePdf))

  const save = async () => {
    const e: Record<string, string> = {}
    if (!d.title_de.trim()) e.title_de = t('Bitte einen Titel eingeben.', 'Please enter a title.')
    if (!d.institution.trim()) e.institution = t('Bitte die Einrichtung eingeben.', 'Please enter the institution.')
    if (!d.year.trim()) e.year = t('Bitte das Jahr eingeben.', 'Please enter the year.')
    if (!hasImage && !hasPdf) e.file = t('Bitte ein Foto oder eine PDF-Datei hinzufügen.', 'Please add a photo or a PDF file.')
    setErrors(e)
    if (Object.keys(e).length) return toast.error(t('Bitte füllen Sie die markierten Felder aus.', 'Please fill in the marked fields.'))

    setSaving(true)
    const uploadedImages: string[] = []
    const uploadedPdf: string[] = []
    try {
      const sb = await getAdminClient()
      const row: Record<string, unknown> = {
        title_de: d.title_de.trim(),
        title_en: d.title_en.trim() || d.title_de.trim(),
        institution: d.institution.trim(),
        year: d.year.trim(),
        is_visible: d.is_visible,
        alt_de: d.title_de.trim(),
        alt_en: d.title_en.trim() || d.title_de.trim(),
      }
      if (image) {
        const v = await makeVariants(image.file, 1600, 600)
        const full = await uploadBlob(sb, 'site-images', 'certificates', v.full.blob, v.full.ext)
        uploadedImages.push(full)
        const thumb = await uploadBlob(sb, 'site-images', 'certificates', v.thumb.blob, v.thumb.ext, '-sm')
        uploadedImages.push(thumb)
        Object.assign(row, {
          image_path: full,
          image_width: v.full.width,
          image_height: v.full.height,
          thumb_path: thumb,
          thumb_width: v.thumb.width,
          thumb_height: v.thumb.height,
        })
      }
      if (pdf) {
        const p = await uploadBlob(sb, 'documents', 'certificates', pdf, 'pdf')
        uploadedPdf.push(p)
        row.pdf_path = p
      } else if (removePdf) row.pdf_path = null

      if (cert) {
        await must(sb.from('certificates').update(row).eq('id', cert.id))
        if (image) await removeFiles(sb, 'site-images', [cert.image_path, cert.thumb_path])
        if (pdf || removePdf) await removeFiles(sb, 'documents', [cert.pdf_path])
      } else {
        await must(sb.from('certificates').insert({ ...row, sort_order: nextOrder(rows) }))
      }
      touchSite()
      toast.success(cert ? t('Gespeichert. Die Änderung ist jetzt auf der Website.', 'Saved. The change is now on the website.') : t('Zertifikat hinzugefügt.', 'Certificate added.'))
      if (image) URL.revokeObjectURL(image.preview)
      onSaved()
      onClose()
    } catch (err) {
      const sb = await getAdminClient()
      await removeFiles(sb, 'site-images', uploadedImages)
      await removeFiles(sb, 'documents', uploadedPdf)
      toast.failed(err)
    } finally {
      setSaving(false)
    }
  }

  const preview = image?.preview ?? (cert?.image_path ? certThumb(cert) : '')

  return (
    <Sheet
      open
      title={cert ? t('Zertifikat bearbeiten', 'Edit certificate') : t('Zertifikat hinzufügen', 'Add certificate')}
      onClose={() => void close()}
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          {cert ? (
            <Button variant="danger-soft" icon={Trash2} onClick={() => onDelete(cert)} aria-label={t('Zertifikat löschen', 'Delete certificate')}>
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
        <TextField label={t('Titel (Deutsch)', 'Title (German)')} limit={100} value={d.title_de} onChange={(v) => setD({ ...d, title_de: v })} error={errors.title_de} placeholder={t('z. B. Diplom Elektrotechnik', 'e.g. Diploma in Electrical Engineering')} />
        <TextField label={t('Titel (Englisch)', 'Title (English)')} optional limit={100} value={d.title_en} onChange={(v) => setD({ ...d, title_en: v })} />
        <TextField label={t('Einrichtung', 'Institution')} limit={100} value={d.institution} onChange={(v) => setD({ ...d, institution: v })} error={errors.institution} />
        <TextField label={t('Jahr', 'Year')} limit={12} inputMode="numeric" value={d.year} onChange={(v) => setD({ ...d, year: v })} error={errors.year} />

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[15px] font-semibold text-ink">{t('Foto oder Scan', 'Photo or scan')}</p>
          <div className="mt-2 flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="" className="h-28 w-20 shrink-0 rounded-lg border border-slate-200 object-cover" />
            ) : (
              <span className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <ImagePlus size={26} aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => (chooseImage(e.target.files?.[0]), (e.target.value = ''))} />
              <Button variant="secondary" icon={ImagePlus} onClick={() => imgRef.current?.click()}>
                {preview ? t('Foto ändern', 'Change photo') : t('Foto wählen', 'Choose photo')}
              </Button>
              {image && <p className="mt-1.5 text-sm text-emerald-700">{t('Wird beim Speichern hochgeladen.', 'Uploaded when you save.')}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[15px] font-semibold text-ink">
            {t('PDF-Datei', 'PDF file')} <span className="font-normal text-slate-500">({t('optional', 'optional')})</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input ref={pdfRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => (choosePdf(e.target.files?.[0]), (e.target.value = ''))} />
            <Button variant="secondary" icon={FileText} onClick={() => pdfRef.current?.click()}>
              {hasPdf ? t('PDF ändern', 'Change PDF') : t('PDF wählen', 'Choose PDF')}
            </Button>
            {pdf && <span className="min-w-0 truncate text-sm text-emerald-700">{pdf.name}</span>}
            {!pdf && cert?.pdf_path && !removePdf && (
              <>
                <a href={mediaUrl(cert.pdf_path, 'documents')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand underline">
                  {t('Aktuelle PDF ansehen', 'View current PDF')}
                </a>
                <Button variant="ghost" size="sm" onClick={() => setRemovePdf(true)}>
                  {t('PDF entfernen', 'Remove PDF')}
                </Button>
              </>
            )}
            {removePdf && <span className="text-sm text-amber-700">{t('PDF wird beim Speichern entfernt.', 'PDF is removed when you save.')}</span>}
          </div>
        </div>
        {errors.file && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {errors.file}
          </p>
        )}
        <Toggle checked={d.is_visible} onChange={(v) => setD({ ...d, is_visible: v })} label={t('Auf der Website sichtbar', 'Visible on the website')} />
      </div>
    </Sheet>
  )
}
