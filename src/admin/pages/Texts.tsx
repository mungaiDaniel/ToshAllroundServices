import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fallbackContent } from '../../data/content/fallback'
import type { RawText } from '../../data/content/types'
import { getAdminClient } from '../lib/client'
import { must, touchSite, useLoad } from '../lib/data'
import { useA } from '../lib/i18n'
import { useConfirm, useDirty, useToast } from '../ui/feedback'
import { Button, Callout, Card, LoadState, PageHead, SaveBar, TextAreaField } from '../ui/kit'

interface TextDef {
  key: string
  de: string
  en: string
  limit: number
  rows: number
  hintDe?: string
  hintEn?: string
}
interface Group {
  id: string
  de: string
  en: string
  texts: TextDef[]
}

const groups: Group[] = [
  {
    id: 'home',
    de: 'Startseite',
    en: 'Home page',
    texts: [
      { key: 'hero_title', de: 'Überschrift ganz oben', en: 'Headline at the top', limit: 60, rows: 2, hintDe: 'Die große Überschrift der Startseite.', hintEn: 'The big headline of the home page.' },
      { key: 'hero_text', de: 'Text unter der Überschrift', en: 'Text under the headline', limit: 220, rows: 3 },
      { key: 'tagline', de: 'Slogan', en: 'Tagline', limit: 80, rows: 2, hintDe: 'Zum Beispiel unten auf der Seite.', hintEn: 'For example at the bottom of the page.' },
      { key: 'hero_eyebrow', de: 'Kleine Zeile über der Überschrift', en: 'Small line above the headline', limit: 50, rows: 1 },
    ],
  },
  {
    id: 'about',
    de: 'Über uns',
    en: 'About us',
    texts: [
      { key: 'about_welcome', de: 'Begrüßung', en: 'Welcome line', limit: 80, rows: 2 },
      { key: 'about_text_1', de: 'Über uns – Absatz 1', en: 'About us – paragraph 1', limit: 500, rows: 6 },
      { key: 'about_text_2', de: 'Über uns – Absatz 2', en: 'About us – paragraph 2', limit: 500, rows: 6 },
      { key: 'mission_text', de: 'Unser Versprechen', en: 'Our promise', limit: 400, rows: 5 },
    ],
  },
  {
    id: 'founder',
    de: 'Gründer-Profil',
    en: 'Founder profile',
    texts: [
      { key: 'founder_profile', de: 'Profil-Text', en: 'Profile text', limit: 450, rows: 5 },
      { key: 'founder_education_note', de: 'Hinweis zur Ausbildung', en: 'Note on education', limit: 300, rows: 4 },
    ],
  },
  {
    id: 'more',
    de: 'Weitere Texte',
    en: 'More texts',
    texts: [
      { key: 'services_intro', de: 'Einleitung zu den Leistungen (Startseite)', en: 'Intro to the services (home page)', limit: 220, rows: 3 },
      { key: 'why_text', de: 'Warum wir? – Text', en: 'Why us? – text', limit: 400, rows: 5 },
      { key: 'gallery_intro', de: 'Einleitung der Galerie', en: 'Gallery intro', limit: 220, rows: 3 },
      { key: 'cta_title', de: 'Aufruf: Überschrift', en: 'Call to action: headline', limit: 70, rows: 2 },
      { key: 'cta_text', de: 'Aufruf: Text', en: 'Call to action: text', limit: 220, rows: 3 },
      { key: 'contact_intro', de: 'Einleitung der Kontaktseite', en: 'Contact page intro', limit: 240, rows: 3 },
    ],
  },
]

const allKeys = groups.flatMap((g) => g.texts.map((x) => x.key))

type Values = Record<string, { de: string; en: string }>

const builtin: Values = Object.fromEntries(
  fallbackContent.texts.filter((x) => allKeys.includes(x.key)).map((x) => [x.key, { de: x.value_de, en: x.value_en }]),
)

const merge = (rows: Pick<RawText, 'key' | 'value_de' | 'value_en'>[]): Values => {
  const out: Values = {}
  for (const k of allKeys) {
    const row = rows.find((r) => r.key === k)
    out[k] = {
      de: row?.value_de?.trim() ? row.value_de : (builtin[k]?.de ?? ''),
      en: row?.value_en?.trim() ? row.value_en : (builtin[k]?.en ?? ''),
    }
  }
  return out
}

export default function Texts() {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const { data, error, loading, reload } = useLoad(async (sb) =>
    must(sb.from('site_texts').select('key,value_de,value_en').in('key', allKeys)),
  )
  const [base, setBase] = useState<Values | null>(null)
  const [draft, setDraft] = useState<Values>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!data) return
    const v = merge(data)
    setBase(v)
    setDraft(v)
  }, [data])

  const changed = useMemo(
    () => (base ? allKeys.filter((k) => base[k].de !== draft[k]?.de || base[k].en !== draft[k]?.en) : []),
    [base, draft],
  )
  const dirty = changed.length > 0
  useDirty('texts', dirty)

  const save = async () => {
    setSaving(true)
    try {
      const sb = await getAdminClient()
      await must(
        sb.from('site_texts').upsert(
          changed.map((key) => ({ key, value_de: draft[key].de.trim(), value_en: draft[key].en.trim() })),
          { onConflict: 'key' },
        ),
      )
      touchSite()
      setBase({ ...draft })
      toast.success(t('Gespeichert. Die neuen Texte sind jetzt auf der Website.', 'Saved. The new texts are now on the website.'))
      void reload(true)
    } catch (e) {
      toast.failed(e)
    } finally {
      setSaving(false)
    }
  }

  const discard = async () => {
    if (await confirm({ title: t('Änderungen verwerfen?', 'Discard changes?'), confirmLabel: t('Ja, verwerfen', 'Yes, discard'), danger: true })) {
      setDraft(base ?? {})
    }
  }

  const set = (key: string, lang: 'de' | 'en', v: string) =>
    setDraft((d) => ({ ...d, [key]: { ...d[key], [lang]: v } }))

  const field = (x: TextDef) => {
    const isDefault = draft[x.key]?.de === (builtin[x.key]?.de ?? '') && draft[x.key]?.en === (builtin[x.key]?.en ?? '')
    return (
      <Card key={x.key}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-ink">{t(x.de, x.en)}</h3>
            {(x.hintDe || x.hintEn) && <p className="text-sm text-ink-muted">{t(x.hintDe ?? '', x.hintEn ?? '')}</p>}
          </div>
          {!isDefault && builtin[x.key] && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => setDraft((d) => ({ ...d, [x.key]: { ...builtin[x.key] } }))}
              title={t('Ursprünglichen Text wiederherstellen', 'Restore the original text')}
            >
              <span className="hidden sm:inline">{t('Original', 'Original')}</span>
            </Button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextAreaField label="Deutsch" value={draft[x.key]?.de ?? ''} onChange={(v) => set(x.key, 'de', v)} limit={x.limit} rows={x.rows} lang="de" />
          <TextAreaField label="English" value={draft[x.key]?.en ?? ''} onChange={(v) => set(x.key, 'en', v)} limit={x.limit} rows={x.rows} lang="en" />
        </div>
      </Card>
    )
  }

  return (
    <div>
      <PageHead
        title={t('Texte', 'Texts')}
        help={t(
          'Hier ändern Sie die wichtigsten Texte der Website – Deutsch und Englisch nebeneinander. Mit „Speichern“ sind sie sofort online.',
          'Change the main texts of the website here – German and English side by side. After “Save” they are online immediately.',
        )}
      />
      <Callout tone="info" className="mb-4">
        {t('Wenn Sie ein Feld leer lassen, zeigt die Website den ursprünglichen Text.', 'If you leave a field empty, the website shows the original text.')}
      </Callout>
      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {base && (
          <div className="space-y-8">
            {groups.map((g) =>
              g.id === 'more' ? (
                <details key={g.id} className="group rounded-2xl">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-lg font-bold text-ink">
                    {t(g.de, g.en)}
                    <span className="text-sm font-semibold text-brand group-open:hidden">{t('Aufklappen', 'Show')}</span>
                  </summary>
                  <div className="mt-3 space-y-4">{g.texts.map(field)}</div>
                </details>
              ) : (
                <section key={g.id} aria-labelledby={`g-${g.id}`}>
                  <h2 id={`g-${g.id}`} className="mb-3 text-xl font-extrabold text-ink">
                    {t(g.de, g.en)}
                  </h2>
                  <div className="space-y-4">{g.texts.map(field)}</div>
                </section>
              ),
            )}
          </div>
        )}
      </LoadState>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={() => void discard()} />
    </div>
  )
}
