import { AnimatePresence, m } from 'framer-motion'
import { Languages, Menu, Phone, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navLinks } from '../data/nav'
import { useSite } from '../data/content/hooks'
import { useMotionPrefs } from '../hooks/useMotionPrefs'
import { useTranslation } from '../hooks/useTranslation'
import { distance, duration, ease, stagger } from '../lib/motion'
import BrandLogo from './BrandLogo'
import Button from './Button'

const SCROLL_THRESHOLD = 16

function Logo({ onClick }: { onClick?: () => void }) {
  const site = useSite()
  const { t } = useTranslation()
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={t('nav.homeLabel')}
      className="group flex items-center gap-2 font-heading text-base font-extrabold sm:text-lg"
    >
      <BrandLogo size={44} eager className="transition-transform [transition-duration:var(--dur-base)] group-hover:rotate-6" />
      <span>{site.name}</span>
    </Link>
  )
}

export default function Navbar() {
  const site = useSite()
  const { t, language, toggleLanguage } = useTranslation()
  const { reduced } = useMotionPrefs()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  // menu is open only for the route it was opened on, so navigating closes it
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === pathname
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // "scrolled" state for the glass navbar: a passive listener that only reads window.scrollY (no layout work)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const next = window.scrollY > SCROLL_THRESHOLD
      setScrolled((prev) => (prev === next ? prev : next))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // lock page scroll, Escape to close, focus management while the menu is open
  useEffect(() => {
    if (!open) return
    const burger = burgerRef.current
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpenAt(null)
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      burger?.focus()
    }
  }, [open])

  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `link-underline py-1 text-sm font-medium transition-colors [transition-duration:var(--dur-fast)] hover:text-brand ${
      isActive ? 'text-brand [background-size:100%_1.5px]' : ''
    }`

  const panelVariants = {
    hidden: reduced ? { opacity: 0 } : { x: '100%' },
    show: reduced
      ? { opacity: 1, transition: { duration: duration.fast } }
      : { x: 0, transition: { duration: duration.base, ease: ease.out, staggerChildren: stagger.base, delayChildren: stagger.loose } },
    exit: reduced
      ? { opacity: 0, transition: { duration: duration.fast } }
      : { x: '100%', transition: { duration: duration.base, ease: ease.inOut } },
  }
  const itemVariants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, x: distance.md },
    show: { opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.out } },
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,backdrop-filter,border-color] [transition-duration:var(--dur-base)] ${
        scrolled
          ? 'border-ink/5 bg-white/80 shadow-soft backdrop-blur-lg'
          : 'border-transparent bg-white'
      }`}
    >
      <nav
        aria-label={t('nav.mainLabel')}
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] [transition-duration:var(--dur-base)] ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <Logo />

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end className={linkCls}>
                {t(l.key)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={`${t('nav.language')}: ${language === 'de' ? 'EN' : 'DE'}`}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-colors [transition-duration:var(--dur-fast)] hover:bg-mint"
          >
            <Languages size={16} aria-hidden="true" />
            {language === 'de' ? 'EN' : 'DE'}
          </button>
          <Button href={site.phone.href} className="hidden !px-5 !py-2.5 lg:inline-flex">
            <Phone size={16} aria-hidden="true" />
            {t('nav.callNow')}
          </Button>
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors [transition-duration:var(--dur-fast)] hover:bg-mint lg:hidden"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {createPortal(
      <AnimatePresence>
        {open && (
          <>
            <m.div
              key="backdrop"
              aria-hidden="true"
              className="fixed inset-0 z-50 bg-night/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: duration.base } }}
              exit={{ opacity: 0, transition: { duration: duration.fast } }}
              onClick={() => setOpen(false)}
            />
            <m.div
              key="panel"
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.mainLabel')}
              onKeyDown={trapFocus}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,380px)] flex-col bg-night px-6 text-snow pb-8 pt-5 shadow-glass lg:hidden"
              variants={panelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  {site.name}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t('nav.closeMenu')}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-snow transition-colors [transition-duration:var(--dur-fast)] hover:bg-white/10"
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>

              <ul className="mt-10 flex flex-col gap-2">
                {navLinks.map((l) => (
                  <m.li key={l.to} variants={itemVariants}>
                    <NavLink
                      to={l.to}
                      end
                      className={({ isActive }) =>
                        `block rounded-2xl px-4 py-3 font-heading text-2xl font-bold transition-colors [transition-duration:var(--dur-fast)] hover:bg-white/5 ${
                          isActive ? 'text-sky' : 'text-snow'
                        }`
                      }
                    >
                      {t(l.key)}
                    </NavLink>
                  </m.li>
                ))}
              </ul>

              <m.div variants={itemVariants} className="mt-auto flex flex-col gap-3">
                <Button href={site.phone.href} className="w-full">
                  <Phone size={16} aria-hidden="true" />
                  {t('nav.callNow')}
                </Button>
                <p className="text-center text-sm">{site.phone.display}</p>
              </m.div>
            </m.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </header>
  )
}
