/**
 * Privacy-friendly activity counting (no cookies, no storage, no identifiers, no IP stored by us).
 * Each call increments an anonymous DAILY counter in the database (see supabase/migrations/002_activity.sql).
 * Skipped when the browser sends Do Not Track / Global Privacy Control, on /admin, and when Supabase is not configured.
 */
import { supabaseConfigured, supabaseUrl } from './supabase'

const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const KNOWN_PAGES = ['/', '/ueber-uns', '/leistungen', '/galerie', '/kontakt', '/impressum', '/datenschutz']

const optedOut = () => {
  if (typeof navigator === 'undefined') return true
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true
}

export function trackEvent(kind: 'view' | 'click' | 'device' | 'lang' | 'source', key: string) {
  if (!supabaseConfigured || optedOut() || location.pathname.startsWith('/admin')) return
  try {
    void fetch(`${supabaseUrl}/rest/v1/rpc/track_event`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_kind: kind, p_key: key }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* never break the site because of statistics */
  }
}

export function trackPageView(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  trackEvent('view', KNOWN_PAGES.includes(path) ? path : 'other')
}

/** Once per page load: device class, language and a coarse traffic source (never the full referrer). */
export function trackLanding(language: string) {
  trackEvent('device', window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop')
  trackEvent('lang', language === 'en' ? 'en' : 'de')
  let source = 'direct'
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
    if (ref && ref !== location.hostname) {
      source = /(^|\.)(google|bing|duckduckgo|ecosia|yahoo|qwant|startpage)\./.test(ref)
        ? 'search'
        : /(facebook|instagram|t\.co|twitter|x\.com|linkedin|tiktok|youtube|whatsapp|pinterest|xing)/.test(ref)
          ? 'social'
          : 'other'
    }
  } catch {
    /* ignore */
  }
  trackEvent('source', source)
}

/** Which counted action (if any) a clicked link belongs to. */
export function clickKeyForHref(href: string): string | null {
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return 'whatsapp'
  if (href.startsWith('tel:')) return 'phone'
  if (href.startsWith('mailto:')) return 'email'
  if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl/.test(href)) return 'maps'
  if (/\.pdf($|\?)/i.test(href) && /cv|lebenslauf/i.test(href)) return 'cv'
  return null
}
