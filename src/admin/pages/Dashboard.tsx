import { Camera, ChevronRight, Images, Mail, Megaphone, MessageCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useUnread } from '../AdminShell'
import { must, rowsOf, useLoad } from '../lib/data'
import { timeAgo } from '../lib/format'
import { useA } from '../lib/i18n'
import { Badge, Card, LoadState, PageHead } from '../ui/kit'

/** Name used in the greeting */
const OWNER = 'Daniel'

interface Overview {
  photos: number
  announcementActive: boolean
  latest: { id: string; name: string; message: string; created_at: string; is_read: boolean }[]
}

export default function Dashboard() {
  const { t, lang } = useA()
  const navigate = useNavigate()
  const { unread } = useUnread()
  const { data, error, loading, reload } = useLoad<Overview>(async (sb) => {
    const [photos, biz, latest] = await Promise.all([
      sb.from('gallery_photos').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      must(sb.from('business_info').select('announcement_active').maybeSingle()),
      rowsOf<Overview['latest'][number]>(sb.from('messages').select('id,name,message,created_at,is_read').order('created_at', { ascending: false }).limit(3)),
    ])
    if (photos.error) throw photos.error
    return { photos: photos.count ?? 0, announcementActive: Boolean(biz?.announcement_active), latest }
  })

  const hour = new Date().getHours()
  const greeting =
    hour < 11 ? t('Guten Morgen', 'Good morning') : hour < 18 ? t('Guten Tag', 'Hello') : t('Guten Abend', 'Good evening')

  return (
    <div>
      <PageHead
        title={`${greeting}, ${OWNER}!`}
        help={t(
          'Hier sehen Sie auf einen Blick, was es Neues gibt, und kommen mit einem Tipp zu den wichtigsten Aufgaben.',
          'Here you see what is new at a glance and reach the most important tasks with one tap.',
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/admin/nachrichten"
          className={`rounded-2xl border p-4 shadow-sm transition-colors ${unread ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}
        >
          <Mail size={26} className={unread ? 'text-red-600' : 'text-brand'} aria-hidden="true" />
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-ink">{unread ?? '–'}</p>
          <p className="text-[15px] font-semibold text-ink-muted">
            {unread === 1 ? t('ungelesene Nachricht', 'unread message') : t('ungelesene Nachrichten', 'unread messages')}
          </p>
        </Link>
        <Link to="/admin/galerie" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Images size={26} className="text-brand" aria-hidden="true" />
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-ink">{loading ? '–' : (data?.photos ?? '–')}</p>
          <p className="text-[15px] font-semibold text-ink-muted">{t('Fotos in der Galerie', 'photos in the gallery')}</p>
        </Link>
      </div>

      <h2 className="mb-3 mt-7 text-lg font-bold text-ink">{t('Schnell erledigen', 'Quick tasks')}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Camera, de: 'Foto hinzufügen', en: 'Add photo', go: () => navigate('/admin/galerie', { state: { add: true } }) },
          { icon: MessageCircle, de: 'Nachrichten', en: 'Messages', go: () => navigate('/admin/nachrichten') },
          { icon: Megaphone, de: 'Ankündigung', en: 'Announcement', go: () => navigate('/admin/kontakt#ankuendigung') },
        ].map((q) => (
          <button
            key={q.de}
            type="button"
            onClick={q.go}
            className="flex min-h-16 items-center gap-4 rounded-2xl bg-brand px-5 text-left text-lg font-bold text-white shadow-sm transition-colors hover:bg-[#185a9c]"
          >
            <q.icon size={28} aria-hidden="true" />
            {t(q.de, q.en)}
          </button>
        ))}
      </div>

      <LoadState loading={false} error={error} onRetry={() => void reload()}>
        {data?.announcementActive && (
          <Link
            to="/admin/kontakt#ankuendigung"
            className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] font-semibold text-amber-900"
          >
            <Megaphone size={22} aria-hidden="true" />
            <span className="flex-1">{t('Eine Ankündigung ist gerade auf der Website sichtbar.', 'An announcement is currently shown on the website.')}</span>
            <ChevronRight size={20} aria-hidden="true" />
          </Link>
        )}

        {data && (
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">{t('Neueste Nachrichten', 'Latest messages')}</h2>
              <Link to="/admin/nachrichten" className="flex min-h-11 items-center text-[15px] font-semibold text-brand">
                {t('Alle ansehen', 'View all')}
              </Link>
            </div>
            {data.latest.length === 0 ? (
              <Card>
                <p className="text-[15px] text-ink-muted">
                  {t('Noch keine Nachrichten. Sobald jemand das Kontaktformular benutzt, erscheint es hier.', 'No messages yet. As soon as someone uses the contact form, it will appear here.')}
                </p>
              </Card>
            ) : (
              <ul className="space-y-2">
                {data.latest.map((m) => (
                  <li key={m.id}>
                    <Link
                      to="/admin/nachrichten"
                      className={`flex items-center gap-3 rounded-2xl border bg-white p-4 ${m.is_read ? 'border-slate-200' : 'border-brand/40 shadow-sm'}`}
                    >
                      {!m.is_read && <span className="h-3 w-3 shrink-0 rounded-full bg-brand" aria-label={t('ungelesen', 'unread')} />}
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-bold text-ink">
                          <span className="truncate">{m.name}</span>
                          {!m.is_read && <Badge tone="blue">{t('Neu', 'New')}</Badge>}
                        </p>
                        <p className="truncate text-sm text-ink-muted">{m.message}</p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">{timeAgo(m.created_at, lang)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </LoadState>

      <p className="mt-8 text-center text-sm text-slate-500">
        {t('Unsicher? ', 'Not sure? ')}
        <Link to="/admin/hilfe" className="inline-flex min-h-11 items-center font-semibold text-brand underline">
          {t('Zur Anleitung', 'Open the guide')}
        </Link>
      </p>
    </div>
  )
}
