import { Eye, Mail, MessageCircle, MousePointerClick, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { rowsOf, useLoad } from '../lib/data'
import { useA } from '../lib/i18n'
import { Callout, Card, LoadState, PageHead } from '../ui/kit'

interface Row {
  day: string
  kind: string
  key: string
  count: number
}

const RANGES = [7, 30, 90] as const

/** "2025-03-04" in Berlin time, the same day boundary the database uses for its counters */
const berlinDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(d)
const daysBack = (n: number) => berlinDay(new Date(Date.now() - n * 86400000))

export default function Activity() {
  const { t, lang } = useA()
  const [range, setRange] = useState<(typeof RANGES)[number]>(30)

  const { data, error, loading, reload } = useLoad(async (sb) => {
    const since = daysBack(180)
    const [rows, msgs] = await Promise.all([
      rowsOf<Row>(sb.from('activity_daily').select('day,kind,key,count').gte('day', since).limit(20000)),
      rowsOf<{ created_at: string }>(sb.from('messages').select('created_at').gte('created_at', new Date(Date.now() - 181 * 86400000).toISOString()).limit(5000)),
    ])
    return { rows, messages: msgs.map((m) => berlinDay(new Date(m.created_at))) }
  })

  const stats = useMemo(() => {
    if (!data) return null
    const from = daysBack(range - 1)
    const prevFrom = daysBack(range * 2 - 1)
    const inRange = data.rows.filter((r) => r.day >= from)
    const inPrev = data.rows.filter((r) => r.day >= prevFrom && r.day < from)
    const sum = (rows: Row[], kind: string, keys?: string[]) =>
      rows.filter((r) => r.kind === kind && (!keys || keys.includes(r.key))).reduce((a, r) => a + r.count, 0)
    const byKey = (kind: string) => {
      const m = new Map<string, number>()
      for (const r of inRange) if (r.kind === kind) m.set(r.key, (m.get(r.key) ?? 0) + r.count)
      return [...m.entries()].sort((a, b) => b[1] - a[1])
    }
    const taps = ['whatsapp', 'phone', 'email']
    const days = Array.from({ length: range }, (_, i) => daysBack(range - 1 - i))
    const perDay = days.map((day) => ({
      day,
      visits: data.rows.filter((r) => r.day === day && r.kind === 'device').reduce((a, r) => a + r.count, 0),
    }))
    return {
      visits: [sum(inRange, 'device'), sum(inPrev, 'device')],
      views: [sum(inRange, 'view'), sum(inPrev, 'view')],
      taps: [sum(inRange, 'click', taps), sum(inPrev, 'click', taps)],
      messages: [data.messages.filter((d) => d >= from).length, data.messages.filter((d) => d >= prevFrom && d < from).length],
      perDay,
      pages: byKey('view'),
      clicks: byKey('click'),
      sources: byKey('source'),
      devices: byKey('device'),
      langs: byKey('lang'),
    }
  }, [data, range])

  const pageName = (k: string) =>
    ({
      '/': t('Startseite', 'Home'),
      '/ueber-uns': t('Über uns', 'About us'),
      '/leistungen': t('Leistungen', 'Services'),
      '/galerie': t('Galerie', 'Gallery'),
      '/kontakt': t('Kontakt', 'Contact'),
      '/impressum': t('Impressum', 'Legal notice'),
      '/datenschutz': t('Datenschutz', 'Privacy policy'),
      other: t('Andere Seiten', 'Other pages'),
    })[k] ?? k
  const clickName = (k: string) =>
    ({
      whatsapp: t('WhatsApp angetippt', 'WhatsApp taps'),
      phone: t('Anruf angetippt', 'Phone taps'),
      email: t('E-Mail angetippt', 'Email taps'),
      maps: t('Google Maps geöffnet', 'Google Maps opened'),
      cv: t('Lebenslauf geöffnet', 'CV opened'),
      language: t('Sprache gewechselt', 'Language switched'),
    })[k] ?? k
  const sourceName = (k: string) =>
    ({
      direct: t('Direkt / Link / App', 'Direct / link / app'),
      search: t('Suchmaschine', 'Search engine'),
      social: t('Soziale Netzwerke', 'Social networks'),
      other: t('Andere Webseiten', 'Other websites'),
    })[k] ?? k
  const deviceName = (k: string) => (k === 'mobile' ? t('Handy', 'Phone') : t('Computer / Tablet', 'Computer / tablet'))
  const langName = (k: string) => (k === 'en' ? 'English' : 'Deutsch')

  const nf = new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB')
  const empty = stats && stats.views[0] === 0 && stats.views[1] === 0

  return (
    <div>
      <PageHead
        title={t('Aktivität', 'Activity')}
        help={t(
          'Hier sehen Sie, wie viele Menschen Ihre Website besuchen und was sie tun. Es werden nur anonyme Tageszahlen gezählt, keine Personen, keine Cookies.',
          'Here you see how many people visit your website and what they do. Only anonymous daily totals are counted: no people, no cookies.',
        )}
      />

      <div role="group" aria-label={t('Zeitraum', 'Time range')} className="mb-5 grid grid-cols-3 gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className={`min-h-11 rounded-xl border px-3 text-[15px] font-bold transition-colors ${range === r ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-ink'}`}
          >
            {t(`${r} Tage`, `${r} days`)}
          </button>
        ))}
      </div>

      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {stats && (
          <>
            {empty && (
              <Callout tone="info" className="mb-5">
                {t(
                  'Noch keine Daten. Sobald die Website besucht wird, erscheinen hier die Zahlen. Falls es nach einigen Tagen leer bleibt, wurde die Datei supabase/migrations/002_activity.sql noch nicht ausgeführt.',
                  'No data yet. Numbers appear here as soon as the website is visited. If it stays empty after a few days, supabase/migrations/002_activity.sql has not been run yet.',
                )}
              </Callout>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Users} label={t('Besuche', 'Visits')} value={stats.visits} nf={nf} />
              <Stat icon={Eye} label={t('Seitenaufrufe', 'Page views')} value={stats.views} nf={nf} />
              <Stat icon={MessageCircle} label={t('Kontakt-Taps', 'Contact taps')} sub={t('WhatsApp, Anruf, E-Mail', 'WhatsApp, phone, email')} value={stats.taps} nf={nf} />
              <Stat icon={Mail} label={t('Nachrichten', 'Messages')} sub={t('über das Formular', 'via the form')} value={stats.messages} nf={nf} />
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              {t('Der Pfeil vergleicht mit den', 'The arrow compares with the')} {range} {t('Tagen davor.', 'days before.')}
            </p>

            <Card className="mt-6">
              <h2 className="mb-3 text-lg font-bold text-ink">{t('Besuche pro Tag', 'Visits per day')}</h2>
              <Bars days={stats.perDay} lang={lang} />
            </Card>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <List title={t('Beliebteste Seiten', 'Most viewed pages')} items={stats.pages} label={pageName} nf={nf} empty={t('Noch keine Aufrufe.', 'No views yet.')} />
              <List title={t('Aktionen', 'Actions')} icon={MousePointerClick} items={stats.clicks} label={clickName} nf={nf} empty={t('Noch keine Aktionen.', 'No actions yet.')} />
              <List title={t('Woher kommen die Besucher?', 'Where do visitors come from?')} items={stats.sources} label={sourceName} nf={nf} empty={t('Noch keine Daten.', 'No data yet.')} />
              <Card>
                <h2 className="mb-3 text-lg font-bold text-ink">{t('Gerät & Sprache', 'Device & language')}</h2>
                <Split items={stats.devices} label={deviceName} />
                <div className="mt-4" />
                <Split items={stats.langs} label={langName} />
              </Card>
            </div>

            <Callout tone="info" className="mt-6">
              {t(
                'Datenschutz: Es werden nur anonyme Tageszähler gespeichert (keine IP-Adressen, keine Cookies, keine einzelnen Besucher). Ein „Besuch“ ist ein Aufruf der Website von Grund auf. Wer „Do Not Track“ aktiviert hat, wird nicht gezählt. Einzelne Bots oder Ihre eigenen Aufrufe (außer im Admin-Bereich) können mitgezählt sein.',
                'Privacy: only anonymous daily counters are stored (no IP addresses, no cookies, no individual visitors). A “visit” is one fresh load of the website. Anyone with “Do Not Track” turned on is not counted. Some bots, or your own views (except in the admin area), may be included.',
              )}
            </Callout>
          </>
        )}
      </LoadState>
    </div>
  )
}

function Stat({ icon: Icon, label, sub, value, nf }: { icon: typeof Eye; label: string; sub?: string; value: number[]; nf: Intl.NumberFormat }) {
  const [now, before] = value
  const pct = before > 0 ? Math.round(((now - before) / before) * 100) : null
  const Up = pct !== null && pct < 0 ? TrendingDown : TrendingUp
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Icon size={26} className="text-brand" aria-hidden="true" />
      <p className="mt-3 text-4xl font-extrabold tabular-nums text-ink">{nf.format(now)}</p>
      <p className="text-[15px] font-semibold text-ink-muted">{label}</p>
      {sub && <p className="text-xs text-ink-muted">{sub}</p>}
      {pct !== null && (
        <p className={`mt-1 flex items-center gap-1 text-sm font-bold ${pct < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
          <Up size={16} aria-hidden="true" />
          {pct > 0 ? '+' : ''}
          {pct} %
        </p>
      )}
    </div>
  )
}

function Bars({ days, lang }: { days: { day: string; visits: number }[]; lang: 'de' | 'en' }) {
  const max = Math.max(1, ...days.map((d) => d.visits))
  const fmt = (d: string) => new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' }).format(new Date(d + 'T12:00:00'))
  return (
    <div>
      <ul className="flex h-32 items-end gap-px" role="img" aria-label={days.map((d) => `${fmt(d.day)}: ${d.visits}`).join(', ')}>
        {days.map((d) => (
          <li key={d.day} className="flex h-full min-w-0 flex-1 items-end" title={`${fmt(d.day)}: ${d.visits}`}>
            <span className="block w-full rounded-t bg-brand" style={{ height: `${Math.max(d.visits ? 4 : 1, (d.visits / max) * 100)}%`, opacity: d.visits ? 1 : 0.2 }} />
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between text-xs font-semibold text-ink-muted">
        <span>{fmt(days[0].day)}</span>
        <span>{t0(lang)}: {max}</span>
        <span>{fmt(days[days.length - 1].day)}</span>
      </div>
    </div>
  )
}
const t0 = (lang: 'de' | 'en') => (lang === 'de' ? 'Höchstwert' : 'Peak')

function List({ title, icon: Icon, items, label, nf, empty }: { title: string; icon?: typeof Eye; items: [string, number][]; label: (k: string) => string; nf: Intl.NumberFormat; empty: string }): ReactNode {
  const max = Math.max(1, ...items.map((i) => i[1]))
  return (
    <Card>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink">
        {Icon && <Icon size={20} className="text-brand" aria-hidden="true" />}
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-[15px] text-ink-muted">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map(([k, n]) => (
            <li key={k}>
              <div className="flex items-baseline justify-between gap-3 text-[15px]">
                <span className="font-semibold text-ink">{label(k)}</span>
                <span className="font-bold tabular-nums text-ink">{nf.format(n)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function Split({ items, label }: { items: [string, number][]; label: (k: string) => string }) {
  const total = items.reduce((a, i) => a + i[1], 0)
  if (!total) return <p className="text-[15px] text-ink-muted">–</p>
  return (
    <ul className="space-y-1">
      {items.map(([k, n]) => (
        <li key={k} className="flex justify-between text-[15px]">
          <span className="font-semibold text-ink">{label(k)}</span>
          <span className="font-bold tabular-nums text-ink">{Math.round((n / total) * 100)} %</span>
        </li>
      ))}
    </ul>
  )
}
