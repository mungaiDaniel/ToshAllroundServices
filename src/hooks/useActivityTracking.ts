import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { clickKeyForHref, trackEvent, trackLanding, trackPageView } from '../lib/track'
import { useTranslation } from './useTranslation'

/** Counts page views and contact-link clicks (anonymous daily counters, see src/lib/track.ts). */
export function useActivityTracking() {
  const { pathname } = useLocation()
  const { language } = useTranslation()
  const landed = useRef(false)
  const lastPath = useRef<string | null>(null)
  const lastLang = useRef(language)

  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    trackPageView(pathname)
    if (!landed.current) {
      landed.current = true
      trackLanding(language)
    }
  }, [pathname, language])

  useEffect(() => {
    if (lastLang.current !== language) {
      lastLang.current = language
      trackEvent('click', 'language')
    }
  }, [language])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]')
      const key = a ? clickKeyForHref(a.getAttribute('href') ?? '') : null
      if (key) trackEvent('click', key)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
