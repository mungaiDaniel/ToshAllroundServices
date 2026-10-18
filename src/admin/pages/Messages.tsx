import { Check, ChevronDown, Inbox, Mail, MailOpen, Phone, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useUnread } from '../AdminShell'
import WhatsAppIcon from '../../components/icons/WhatsAppIcon'
import { getAdminClient } from '../lib/client'
import { must, rowsOf, useLoad } from '../lib/data'
import { formatDateTime, telLink, timeAgo, waLink } from '../lib/format'
import { useA } from '../lib/i18n'
import { useConfirmDelete, useToast } from '../ui/feedback'
import { Badge, Button, EmptyState, LinkButton, LoadState, PageHead } from '../ui/kit'

interface Message {
  id: string
  created_at: string
  name: string
  phone: string | null
  email: string
  service: string | null
  message: string
  is_read: boolean
}

const PAGE = 100

export default function Messages() {
  const { t, lang } = useA()
  const toast = useToast()
  const confirmDelete = useConfirmDelete()
  const { refresh } = useUnread()
  const [limit, setLimit] = useState(PAGE)
  const { data, error, loading, reload, setData } = useLoad<Message[]>(
    async (sb) =>
      rowsOf<Message>(
        sb
          .from('messages')
          .select('id,created_at,name,phone,email,service,message,is_read')
          .order('created_at', { ascending: false })
          .limit(limit),
      ),
  )
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  // "load older messages": fetch again with the higher limit (not on the first render)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    void reload(true)
  }, [limit, reload])

  const rows = useMemo(() => data ?? [], [data])
  const unreadCount = rows.filter((m) => !m.is_read).length
  const shown = filter === 'unread' ? rows.filter((m) => !m.is_read) : rows

  const setRead = async (m: Message, is_read: boolean, quiet = false) => {
    const before = data
    setData((d) => (d ?? []).map((x) => (x.id === m.id ? { ...x, is_read } : x)))
    try {
      const sb = await getAdminClient()
      await must(sb.from('messages').update({ is_read }).eq('id', m.id))
      refresh()
      if (!quiet) toast.success(is_read ? t('Als gelesen markiert.', 'Marked as read.') : t('Als ungelesen markiert.', 'Marked as unread.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const markAll = async () => {
    const ids = rows.filter((m) => !m.is_read).map((m) => m.id)
    if (!ids.length) return
    const before = data
    setData((d) => (d ?? []).map((x) => ({ ...x, is_read: true })))
    try {
      const sb = await getAdminClient()
      await must(sb.from('messages').update({ is_read: true }).in('id', ids))
      refresh()
      toast.success(t('Alle Nachrichten sind jetzt als gelesen markiert.', 'All messages are now marked as read.'))
    } catch (e) {
      setData(before)
      toast.failed(e)
    }
  }

  const remove = async (m: Message) => {
    if (!(await confirmDelete(t(`Nachricht von ${m.name}`, `message from ${m.name}`)))) return
    try {
      const sb = await getAdminClient()
      await must(sb.from('messages').delete().eq('id', m.id))
      setData((d) => (d ?? []).filter((x) => x.id !== m.id))
      refresh()
      toast.success(t('Nachricht gelöscht.', 'Message deleted.'))
    } catch (e) {
      toast.failed(e)
    }
  }

  const toggle = (m: Message) => {
    const opening = openId !== m.id
    setOpenId(opening ? m.id : null)
    if (opening && !m.is_read) void setRead(m, true, true)
  }

  return (
    <div>
      <PageHead
        title={t('Nachrichten', 'Messages')}
        help={t(
          'Hier erscheinen Anfragen aus dem Kontaktformular. Antworten Sie mit einem Tipp per WhatsApp, Anruf oder E-Mail.',
          'Enquiries from the contact form appear here. Reply with one tap by WhatsApp, phone call or email.',
        )}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t('Filter', 'Filter')} className="flex gap-2">
          {(['all', 'unread'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className={`min-h-11 rounded-full border px-4 text-sm font-bold ${filter === k ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}
            >
              {k === 'all' ? t('Alle', 'All') : t(`Ungelesen (${unreadCount})`, `Unread (${unreadCount})`)}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={Check} className="ml-auto" onClick={() => void markAll()}>
            {t('Alle als gelesen', 'Mark all read')}
          </Button>
        )}
      </div>

      <LoadState loading={loading} error={error} onRetry={() => void reload()}>
        {shown.length === 0 ? (
          <EmptyState icon={Inbox} title={filter === 'unread' ? t('Keine ungelesenen Nachrichten', 'No unread messages') : t('Noch keine Nachrichten', 'No messages yet')}>
            {filter === 'unread'
              ? t('Sie sind auf dem neuesten Stand.', 'You are all caught up.')
              : t('Sobald jemand das Kontaktformular auf der Website benutzt, erscheint die Nachricht hier.', 'As soon as someone uses the contact form on the website, the message appears here.')}
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {shown.map((m) => {
              const open = openId === m.id
              const panel = `msg-${m.id}`
              return (
                <li
                  key={m.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${m.is_read ? 'border-slate-200' : 'border-brand/50 ring-1 ring-brand/20'}`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panel}
                    onClick={() => toggle(m)}
                    className={`flex w-full items-start gap-3 p-4 text-left ${m.is_read ? '' : 'bg-sky-50/60'}`}
                  >
                    <span className="mt-1.5 flex h-3 w-3 shrink-0">
                      {!m.is_read && <span className="h-3 w-3 rounded-full bg-brand" aria-label={t('ungelesen', 'unread')} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`text-[17px] text-ink ${m.is_read ? 'font-semibold' : 'font-extrabold'}`}>{m.name}</span>
                        {!m.is_read && <Badge tone="blue">{t('Neu', 'New')}</Badge>}
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-500">
                        {timeAgo(m.created_at, lang)}
                        {m.service ? ` · ${m.service}` : ''}
                      </span>
                      {!open && <span className="mt-1 line-clamp-2 block text-[15px] text-ink-muted">{m.message}</span>}
                    </span>
                    <ChevronDown size={22} aria-hidden="true" className={`mt-1 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div id={panel} className="border-t border-slate-100 p-4">
                      <p className="whitespace-pre-wrap break-words text-[16px] leading-relaxed text-ink">{m.message}</p>
                      <dl className="mt-4 space-y-1 text-[15px]">
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-slate-500">{t('Gesendet', 'Sent')}</dt>
                          <dd>{formatDateTime(m.created_at, lang)}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-slate-500">{t('E-Mail', 'Email')}</dt>
                          <dd className="min-w-0 break-all">{m.email}</dd>
                        </div>
                        {m.phone && (
                          <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-slate-500">{t('Telefon', 'Phone')}</dt>
                            <dd>{m.phone}</dd>
                          </div>
                        )}
                        {m.service && (
                          <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-slate-500">{t('Leistung', 'Service')}</dt>
                            <dd>{m.service}</dd>
                          </div>
                        )}
                      </dl>

                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {m.phone ? (
                          <LinkButton
                            href={waLink(m.phone, `Guten Tag ${m.name}, vielen Dank für Ihre Anfrage bei Tosh Allround Services. `)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="!bg-emerald-700 !text-white hover:!bg-emerald-800"
                            variant="primary"
                          >
                            <WhatsAppIcon size={20} />
                            WhatsApp
                          </LinkButton>
                        ) : (
                          <Button disabled variant="secondary" title={t('Keine Telefonnummer angegeben', 'No phone number given')}>
                            <WhatsAppIcon size={20} />
                            WhatsApp
                          </Button>
                        )}
                        {m.phone ? (
                          <LinkButton href={telLink(m.phone)} variant="primary" icon={Phone}>
                            {t('Anrufen', 'Call')}
                          </LinkButton>
                        ) : (
                          <Button disabled variant="secondary" icon={Phone} title={t('Keine Telefonnummer angegeben', 'No phone number given')}>
                            {t('Anrufen', 'Call')}
                          </Button>
                        )}
                        <LinkButton
                          href={`mailto:${m.email}?subject=${encodeURIComponent('Ihre Anfrage bei Tosh Allround Services')}&body=${encodeURIComponent(`Guten Tag ${m.name},\n\nvielen Dank für Ihre Nachricht.\n\n`)}`}
                          variant="primary"
                          icon={Mail}
                        >
                          {t('E-Mail', 'Email')}
                        </LinkButton>
                      </div>
                      {!m.phone && <p className="mt-2 text-sm text-ink-muted">{t('Der Absender hat keine Telefonnummer angegeben – antworten Sie per E-Mail.', 'The sender gave no phone number – reply by email.')}</p>}

                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        <Button variant="secondary" size="sm" icon={m.is_read ? Mail : MailOpen} onClick={() => void setRead(m, !m.is_read)}>
                          {m.is_read ? t('Als ungelesen markieren', 'Mark as unread') : t('Als gelesen markieren', 'Mark as read')}
                        </Button>
                        <Button variant="danger-soft" size="sm" icon={Trash2} className="ml-auto" onClick={() => void remove(m)}>
                          {t('Löschen', 'Delete')}
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {rows.length >= limit && (
          <Button variant="secondary" full className="mt-4" onClick={() => setLimit((l) => l + PAGE)}>
            {t('Ältere Nachrichten laden', 'Load older messages')}
          </Button>
        )}
      </LoadState>
    </div>
  )
}
