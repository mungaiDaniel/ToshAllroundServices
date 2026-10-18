import { Copy, Megaphone } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fallbackContent } from '../../data/content/fallback'
import type { RawBusiness } from '../../data/content/types'
import { weekdays, type Weekday } from '../../data/site'
import { getAdminClient } from '../lib/client'
import { must, touchSite, useLoad } from '../lib/data'
import { isEmail } from '../lib/format'
import { useA } from '../lib/i18n'
import { useConfirm, useDirty, useToast } from '../ui/feedback'
import { Button, Card, LoadState, PageHead, SaveBar, TextAreaField, TextField, Toggle } from '../ui/kit'

type Hours = Record<Weekday, { open: string; close: string } | null>

interface Draft {
  phone: string
  whatsapp: string
  email: string
  street: string
  zip: string
  city: string
  hours: Hours
  ann_active: boolean
  ann_de: string
  ann_en: string
}

const dayNames: Record<Weekday, [string, string]> = {
  mon: ['Montag', 'Monday'],
  tue: ['Dienstag', 'Tuesday'],
  wed: ['Mittwoch', 'Wednesday'],
  thu: ['Donnerstag', 'Thursday'],
  fri: ['Freitag', 'Friday'],
  sat: ['Samstag', 'Saturday'],
  sun: ['Sonntag', 'Sunday'],
}

const ANN_LIMIT = 160

const toDraft = (b: RawBusiness): Draft => ({
  phone: b.phone,
  whatsapp: b.whatsapp,
  email: b.email,
  street: b.address.street,
  zip: b.address.zip,
  city: b.address.city,
  hours: Object.fromEntries(weekdays.map((d) => [d, b.opening_hours?.[d] ?? null])) as Hours,
  ann_active: Boolean(b.announcement_active),
  ann_de: b.announcement_de ?? '',
  ann_en: b.announcement_en ?? '',
})

const digitCount = (s: string) => s.replace(/\D/g, '').length

export default function Contact() {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const { hash } = useLocation()
  const { data, error, loading, reload } = useLoad<RawBusiness | null>(async (sb) =>
    must(sb.from('business_info').select('*').eq('id', 1).maybeSingle()),
  )
  const stored = useMemo<RawBusiness>(() => data ?? (fallbackContent.business as RawBusiness), [data])
  const base = useMemo(() => toDraft(stored), [stored])
  const [d, setD] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!loading && !error) setD(toDraft(stored))
  }, [loading, error, stored])

  const dirty = d !== null && JSON.stringify(d) !== JSON.stringify(base)
  useDirty('contact', dirty)

  // arrive from the dashboard's "Ankündigung" button
  useEffect(() => {
    if (!d || hash !== '#ankuendigung') return
    document.getElementById('ankuendigung')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, d === null]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => (x ? { ...x, [k]: v } : x))
  const setDay = (day: Weekday, v: { open: string; close: string } | null) =>
    setD((x) => (x ? { ...x, hours: { ...x.hours, [day]: v } } : x))

  const validate = (x: Draft) => {
    const e: Record<string, string> = {}
    if (digitCount(x.phone) < 6) e.phone = t('Bitte eine gültige Telefonnummer eingeben.', 'Please enter a valid phone number.')
    if (!/^(\+|00)/.test(x.whatsapp.trim()) || digitCount(x.whatsapp) < 8)
      e.whatsapp = t('Bitte mit Ländervorwahl, z. B. +49 176 12345678.', 'Please include the country code, e.g. +49 176 12345678.')
    if (!isEmail(x.email)) e.email = t('Bitte eine gültige E-Mail-Adresse eingeben.', 'Please enter a valid email address.')
    if (!x.street.trim()) e.street = t('Bitte Straße und Hausnummer eingeben.', 'Please enter street and number.')
    if (!x.zip.trim()) e.zip = t('Bitte die Postleitzahl eingeben.', 'Please enter the postcode.')
    if (!x.city.trim()) e.city = t('Bitte den Ort eingeben.', 'Please enter the city.')
    for (const day of weekdays) {
      const h = x.hours[day]
      if (h && (!h.open || !h.close || h.close <= h.open)) e[`hours-${day}`] = t('Die Schließzeit muss nach der Öffnungszeit liegen.', 'Closing time must be after opening time.')
    }
    if (x.ann_active && !x.ann_de.trim() && !x.ann_en.trim())
      e.ann_de = t('Bitte einen Text für die Ankündigung eingeben – oder den Schalter ausschalten.', 'Please enter a text for the announcement – or switch it off.')
    return e
  }

  const save = async () => {
    if (!d) return
    const e = validate(d)
    setErrors(e)
    if (Object.keys(e).length) {
      toast.error(t('Bitte prüfen Sie die rot markierten Felder.', 'Please check the fields marked in red.'))
      return
    }
    setSaving(true)
    try {
      const sb = await getAdminClient()
      await must(
        sb.from('business_info').upsert(
          {
            id: 1,
            phone: d.phone.trim(),
            whatsapp: d.whatsapp.trim(),
            email: d.email.trim(),
            address: { street: d.street.trim(), zip: d.zip.trim(), city: d.city.trim(), country: stored.address.country ?? 'Germany' },
            opening_hours: d.hours,
            announcement_active: d.ann_active,
            announcement_de: d.ann_de.trim() || null,
            announcement_en: d.ann_en.trim() || null,
          },
          { onConflict: 'id' },
        ),
      )
      touchSite()
      toast.success(t('Gespeichert. Die Änderungen sind jetzt auf der Website.', 'Saved. The changes are now on the website.'))
      await reload(true)
    } catch (err) {
      toast.failed(err)
    } finally {
      setSaving(false)
    }
  }

  const discard = async () => {
    if (await confirm({ title: t('Änderungen verwerfen?', 'Discard changes?'), confirmLabel: t('Ja, verwerfen', 'Yes, discard'), danger: true })) {
      setD(base)
      setErrors({})
    }
  }

  const copyMonday = () => {
    if (!d) return
    const mon = d.hours.mon
    setD({ ...d, hours: { ...d.hours, tue: mon && { ...mon }, wed: mon && { ...mon }, thu: mon && { ...mon }, fri: mon && { ...mon } } })
    toast.info(t('Montag wurde für Dienstag bis Freitag übernommen. Vergessen Sie nicht zu speichern.', 'Monday was copied to Tuesday–Friday. Don’t forget to save.'))
  }

  return (
    <div>
      <PageHead
        title={t('Kontaktdaten & Öffnungszeiten', 'Contact & opening hours')}
        help={t(
          'Hier stehen Telefon, WhatsApp, E-Mail, Adresse, Öffnungszeiten und die Ankündigung, die oben auf der Website erscheint.',
          'Phone, WhatsApp, email, address, opening hours and the announcement banner shown at the top of the website.',
        )}
      />
      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {d && (
          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-lg font-bold text-ink">{t('Kontaktdaten', 'Contact details')}</h2>
              <div className="space-y-4">
                <TextField label={t('Telefon (für Anrufe)', 'Phone (for calls)')} type="tel" inputMode="tel" autoComplete="off" value={d.phone} onChange={(v) => set('phone', v)} error={errors.phone} limit={30} />
                <TextField
                  label="WhatsApp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  value={d.whatsapp}
                  onChange={(v) => set('whatsapp', v)}
                  error={errors.whatsapp}
                  limit={30}
                  hint={t('Mit Ländervorwahl, z. B. +49 176 12345678.', 'With country code, e.g. +49 176 12345678.')}
                />
                <TextField label={t('E-Mail', 'Email')} type="email" inputMode="email" autoComplete="off" autoCapitalize="none" value={d.email} onChange={(v) => set('email', v)} error={errors.email} limit={120} />
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-bold text-ink">{t('Adresse', 'Address')}</h2>
              <div className="space-y-4">
                <TextField label={t('Straße und Hausnummer', 'Street and number')} value={d.street} onChange={(v) => set('street', v)} error={errors.street} limit={80} autoComplete="off" />
                <div className="grid grid-cols-[7.5rem_1fr] gap-3">
                  <TextField label={t('PLZ', 'Postcode')} inputMode="numeric" value={d.zip} onChange={(v) => set('zip', v)} error={errors.zip} limit={10} autoComplete="off" />
                  <TextField label={t('Ort', 'City')} value={d.city} onChange={(v) => set('city', v)} error={errors.city} limit={60} autoComplete="off" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-ink">{t('Öffnungszeiten', 'Opening hours')}</h2>
                <Button variant="secondary" size="sm" icon={Copy} onClick={copyMonday} disabled={!d.hours.mon && !d.hours.tue}>
                  {t('Montag für Di–Fr übernehmen', 'Copy Monday to Tue–Fri')}
                </Button>
              </div>
              <ul className="space-y-3">
                {weekdays.map((day) => (
                  <DayRow key={day} day={day} value={d.hours[day]} onChange={(v) => setDay(day, v)} error={errors[`hours-${day}`]} />
                ))}
              </ul>
            </Card>

            <Card className="scroll-mt-20">
              <div id="ankuendigung" className="scroll-mt-24" />
              <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink">
                <Megaphone size={22} className="text-brand" aria-hidden="true" />
                {t('Ankündigung', 'Announcement')}
              </h2>
              <p className="mb-4 text-sm text-ink-muted">
                {t('Ein kurzer Hinweis, der oben auf jeder Seite erscheint – z. B. „Vom 24.–31. Dezember geschlossen“.', 'A short notice shown at the top of every page – e.g. “Closed 24–31 December”.')}
              </p>
              <div className="space-y-4">
                <Toggle checked={d.ann_active} onChange={(v) => set('ann_active', v)} label={t('Ankündigung anzeigen', 'Show announcement')} />
                <TextAreaField label={t('Text (Deutsch)', 'Text (German)')} rows={2} limit={ANN_LIMIT} value={d.ann_de} onChange={(v) => set('ann_de', v)} error={errors.ann_de} />
                <TextAreaField label={t('Text (Englisch)', 'Text (English)')} optional rows={2} limit={ANN_LIMIT} value={d.ann_en} onChange={(v) => set('ann_en', v)} />
                <Preview active={d.ann_active} de={d.ann_de} en={d.ann_en} />
              </div>
            </Card>
          </div>
        )}
      </LoadState>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={() => void discard()} />
    </div>
  )
}

function DayRow({
  day,
  value,
  onChange,
  error,
}: {
  day: Weekday
  value: { open: string; close: string } | null
  onChange: (v: { open: string; close: string } | null) => void
  error?: string
}) {
  const { t } = useA()
  const id = useId()
  const [de, en] = dayNames[day]
  const timeCls =
    'h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25'
  return (
    <li className="rounded-xl border border-slate-200 p-3">
      <Toggle compact checked={Boolean(value)} onChange={(on) => onChange(on ? { open: '08:00', close: '18:00' } : null)} label={t(de, en)} hint={value ? undefined : t('Geschlossen', 'Closed')} />
      {value && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-o`} className="mb-1 block text-sm font-semibold text-ink">
              {t('von', 'from')}
            </label>
            <input id={`${id}-o`} type="time" value={value.open} onChange={(e) => onChange({ ...value, open: e.target.value })} className={timeCls} />
          </div>
          <div>
            <label htmlFor={`${id}-c`} className="mb-1 block text-sm font-semibold text-ink">
              {t('bis', 'to')}
            </label>
            <input id={`${id}-c`} type="time" value={value.close} onChange={(e) => onChange({ ...value, close: e.target.value })} className={timeCls} />
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </li>
  )
}

/** Looks like the banner on the website, so Daniel sees what visitors will see. */
function Preview({ active, de, en }: { active: boolean; de: string; en: string }) {
  const { t } = useA()
  const text = de.trim() || en.trim()
  return (
    <div>
      <p className="mb-1.5 text-[15px] font-semibold text-ink">{t('So sieht es auf der Website aus', 'How it looks on the website')}</p>
      <div className="rounded-2xl bg-night px-3 py-5">
        {active && text ? (
          <div className="mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-white/10 bg-night py-3 pl-4 pr-4 text-sm text-snow shadow-lg">
            <Megaphone size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-leaf" />
            <div className="min-w-0 space-y-1">
              <p className="break-words">
                <span className="mr-1.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-mist">DE</span>
                {de.trim() || en.trim()}
              </p>
              {en.trim() && de.trim() && (
                <p className="break-words text-mist">
                  <span className="mr-1.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase">EN</span>
                  {en.trim()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-mist">
            {active ? t('Geben Sie oben einen Text ein, dann sehen Sie hier die Vorschau.', 'Enter a text above and the preview appears here.') : t('Die Ankündigung ist ausgeschaltet – Besucher sehen nichts.', 'The announcement is switched off – visitors see nothing.')}
          </p>
        )}
      </div>
    </div>
  )
}
