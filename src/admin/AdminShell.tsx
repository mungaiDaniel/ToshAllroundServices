import {
  Ellipsis,
  ExternalLink,
  GraduationCap,
  Images,
  LayoutDashboard,
  CircleHelp,
  LogOut,
  Mail,
  Phone,
  Settings,
  Sparkles,
  Star,
  Type,
  type LucideIcon,
} from 'lucide-react'
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { NavLink, Route, Routes, useBlocker, useLocation, useNavigate } from 'react-router-dom'
import { getAdminClient } from './lib/client'
import { useAuth } from './lib/auth'
import { useA } from './lib/i18n'
import { DirtyContext, useConfirm } from './ui/feedback'
import { LinkButton, Sheet, Spinner } from './ui/kit'
import LangSwitch from './ui/LangSwitch'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Services = lazy(() => import('./pages/Services'))
const Texts = lazy(() => import('./pages/Texts'))
const Contact = lazy(() => import('./pages/Contact'))
const Messages = lazy(() => import('./pages/Messages'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Qualifications = lazy(() => import('./pages/Qualifications'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const Help = lazy(() => import('./pages/Help'))

/* unread message count, shared by the navigation and the dashboard */
const UnreadContext = createContext<{ unread: number | null; refresh: () => void }>({ unread: null, refresh: () => {} })
export const useUnread = () => useContext(UnreadContext)

interface NavItem {
  to: string
  icon: LucideIcon
  de: string
  en: string
  /** shorter label for the bottom bar */
  shortDe?: string
  shortEn?: string
  end?: boolean
}

const items: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, de: 'Übersicht', en: 'Overview', end: true },
  { to: '/admin/galerie', icon: Images, de: 'Galerie', en: 'Gallery' },
  { to: '/admin/nachrichten', icon: Mail, de: 'Nachrichten', en: 'Messages', shortDe: 'Post', shortEn: 'Inbox' },
  { to: '/admin/leistungen', icon: Sparkles, de: 'Leistungen', en: 'Services' },
  { to: '/admin/texte', icon: Type, de: 'Texte', en: 'Texts' },
  { to: '/admin/kontakt', icon: Phone, de: 'Kontaktdaten & Öffnungszeiten', en: 'Contact & opening hours', shortDe: 'Kontakt', shortEn: 'Contact' },
  { to: '/admin/bewertungen', icon: Star, de: 'Bewertungen', en: 'Reviews' },
  { to: '/admin/qualifikationen', icon: GraduationCap, de: 'Qualifikationen & Lebenslauf', en: 'Qualifications & CV', shortDe: 'Qualifikationen', shortEn: 'Qualifications' },
  { to: '/admin/einstellungen', icon: Settings, de: 'Einstellungen', en: 'Settings' },
  { to: '/admin/hilfe', icon: CircleHelp, de: 'Hilfe', en: 'Help' },
]
const bottomBar = ['/admin', '/admin/galerie', '/admin/nachrichten', '/admin/leistungen']

function Badge({ n }: { n: number | null }) {
  if (!n) return null
  return (
    <span
      aria-hidden="true"
      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white"
    >
      {n > 99 ? '99+' : n}
    </span>
  )
}

export default function AdminShell() {
  const { t } = useA()
  const { signOut, email } = useAuth()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const [unread, setUnread] = useState<number | null>(null)

  /* ---------- unsaved changes: block leaving the page while a form is dirty ---------- */
  const dirtyIds = useRef(new Set<string>())
  const [dirtyCount, setDirtyCount] = useState(0)
  const dirtyApi = useMemo(
    () => ({
      set: (id: string, dirty: boolean) => {
        if (dirty) dirtyIds.current.add(id)
        else dirtyIds.current.delete(id)
        setDirtyCount(dirtyIds.current.size)
      },
      anyDirty: () => dirtyIds.current.size > 0,
    }),
    [],
  )
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyIds.current.size > 0 && currentLocation.pathname !== nextLocation.pathname,
  )
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    void confirm({
      title: t('Änderungen nicht gespeichert', 'Changes not saved'),
      body: t('Wenn Sie jetzt gehen, gehen Ihre Änderungen verloren.', 'If you leave now, your changes will be lost.'),
      confirmLabel: t('Verlassen, nicht speichern', 'Leave without saving'),
      cancelLabel: t('Hier bleiben', 'Stay here'),
      danger: true,
    }).then((leave) => (leave ? blocker.proceed() : blocker.reset()))
  }, [blocker, confirm, t])
  useEffect(() => {
    if (!dirtyCount) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirtyCount])

  /* ---------- unread messages ---------- */
  const refreshUnread = useCallback(async () => {
    try {
      const sb = await getAdminClient()
      const { count, error } = await sb.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false)
      if (!error) setUnread(count ?? 0)
    } catch {
      /* offline: keep the old number */
    }
  }, [])
  useEffect(() => {
    void refreshUnread()
    const id = window.setInterval(() => void refreshUnread(), 60_000)
    const onVisible = () => document.visibilityState === 'visible' && void refreshUnread()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refreshUnread])

  useEffect(() => {
    setMoreOpen(false)
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [pathname])

  const unreadValue = useMemo(() => ({ unread, refresh: () => void refreshUnread() }), [unread, refreshUnread])
  const label = (i: NavItem, short = false) => (short ? t(i.shortDe ?? i.de, i.shortEn ?? i.en) : t(i.de, i.en))

  const logout = async () => {
    const ok = await confirm({
      title: t('Abmelden?', 'Log out?'),
      body: t('Beim nächsten Mal müssen Sie sich wieder mit Passwort anmelden.', 'Next time you will have to log in with your password again.'),
      confirmLabel: t('Ja, abmelden', 'Yes, log out'),
    })
    if (ok) {
      await signOut()
      navigate('/admin', { replace: true })
    }
  }

  const sideLink = (i: NavItem) => (
    <NavLink
      key={i.to}
      to={i.to}
      end={i.end}
      className={({ isActive }) =>
        `flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-2 text-[15px] font-semibold leading-tight transition-colors ${isActive ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'}`
      }
    >
      <i.icon size={22} aria-hidden="true" />
      <span className="min-w-0 flex-1">{label(i)}</span>
      {i.to.endsWith('nachrichten') && <Badge n={unread} />}
    </NavLink>
  )

  return (
    <DirtyContext.Provider value={dirtyApi}>
      <UnreadContext.Provider value={unreadValue}>
        <div className="admin-root min-h-screen bg-slate-50">
          {/* desktop sidebar */}
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
            <div className="flex items-center gap-3 px-5 py-5">
              <img src="/images/logo/tosh-logo-96.webp" alt="" width={44} height={44} className="h-11 w-11" />
              <div className="min-w-0">
                <p className="truncate font-extrabold text-ink">Tosh Allround</p>
                <p className="text-xs text-slate-500">{t('Verwaltung', 'Admin')}</p>
              </div>
            </div>
            <nav aria-label={t('Hauptmenü', 'Main menu')} className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
              {items.map(sideLink)}
            </nav>
            <div className="space-y-2 border-t border-slate-200 p-3">
              <LinkButton href="/" target="_blank" rel="noopener noreferrer" variant="soft" icon={ExternalLink} className="w-full">
                {t('Website ansehen', 'View website')}
              </LinkButton>
              <div className="flex items-center justify-between gap-2">
                <LangSwitch />
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <LogOut size={20} aria-hidden="true" />
                  {t('Abmelden', 'Log out')}
                </button>
              </div>
              {email && <p className="truncate px-1 text-xs text-slate-500">{email}</p>}
            </div>
          </aside>

          {/* phone top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
            <div className="flex min-w-0 items-center gap-2.5">
              <img src="/images/logo/tosh-logo-96.webp" alt="" width={36} height={36} className="h-9 w-9" />
              <span className="truncate text-sm font-extrabold text-ink">{t('Verwaltung', 'Admin')}</span>
            </div>
            <div className="flex items-center gap-2">
              <LangSwitch />
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('Website ansehen (neuer Tab)', 'View website (new tab)')}
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl bg-sky-50 px-3 text-sm font-bold text-brand"
              >
                <ExternalLink size={20} aria-hidden="true" />
                <span className="hidden min-[400px]:inline">{t('Website', 'Website')}</span>
              </a>
            </div>
          </header>

          <main className="px-4 pb-32 pt-5 lg:ml-72 lg:px-10 lg:pb-12 lg:pt-8">
            <div className="mx-auto max-w-4xl">
              <Suspense fallback={<Spinner />}>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="galerie" element={<Gallery />} />
                  <Route path="leistungen" element={<Services />} />
                  <Route path="texte" element={<Texts />} />
                  <Route path="kontakt" element={<Contact />} />
                  <Route path="nachrichten" element={<Messages />} />
                  <Route path="bewertungen" element={<Reviews />} />
                  <Route path="qualifikationen" element={<Qualifications />} />
                  <Route path="einstellungen" element={<SettingsPage />} />
                  <Route path="hilfe" element={<Help />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </Suspense>
            </div>
          </main>

          {/* phone bottom navigation */}
          <nav
            aria-label={t('Hauptmenü', 'Main menu')}
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
          >
            {items
              .filter((i) => bottomBar.includes(i.to))
              .map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={i.end}
                  className={({ isActive }) =>
                    `relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 text-[12px] font-bold ${isActive ? 'text-brand' : 'text-slate-600'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-sky-100' : ''}`}>
                        <i.icon size={24} aria-hidden="true" />
                        {i.to.endsWith('nachrichten') && unread ? (
                          <span className="absolute -right-0.5 -top-1">
                            <Badge n={unread} />
                          </span>
                        ) : null}
                      </span>
                      <span className="max-w-full truncate">{label(i, true)}</span>
                      {i.to.endsWith('nachrichten') && unread ? (
                        <span className="sr-only">{t(`${unread} ungelesen`, `${unread} unread`)}</span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 text-[12px] font-bold text-slate-600"
            >
              <span className="flex h-8 w-14 items-center justify-center rounded-full">
                <Ellipsis size={24} aria-hidden="true" />
              </span>
              {t('Mehr', 'More')}
            </button>
          </nav>

          <Sheet open={moreOpen} title={t('Alle Bereiche', 'All sections')} onClose={() => setMoreOpen(false)}>
            <nav aria-label={t('Alle Bereiche', 'All sections')} className="space-y-2">
              {items.map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={i.end}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-base font-semibold ${isActive ? 'border-brand bg-sky-50 text-brand' : 'border-slate-200 bg-white text-ink'}`
                  }
                >
                  <i.icon size={24} aria-hidden="true" />
                  <span className="min-w-0 flex-1">{label(i)}</span>
                  {i.to.endsWith('nachrichten') && <Badge n={unread} />}
                </NavLink>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-ink"
              >
                <ExternalLink size={24} aria-hidden="true" />
                {t('Website ansehen', 'View website')}
              </a>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  void logout()
                }}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left text-base font-semibold text-red-700"
              >
                <LogOut size={24} aria-hidden="true" />
                {t('Abmelden', 'Log out')}
              </button>
              {email && <p className="px-1 pt-1 text-xs text-slate-500">{email}</p>}
            </nav>
          </Sheet>
        </div>
      </UnreadContext.Provider>
    </DirtyContext.Provider>
  )
}
