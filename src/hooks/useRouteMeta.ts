import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { site } from '../data/site'
import seo from '../i18n/seo.json'
import { useTranslation } from './useTranslation'

export type SeoPage = keyof (typeof seo)['de']

/** URL path -> key in src/i18n/seo.json. Keep in sync with the routes in App.tsx and scripts/prerender.mjs. */
export const seoRoutes: Record<string, SeoPage> = {
  '/': 'home',
  '/ueber-uns': 'about',
  '/leistungen': 'services',
  '/galerie': 'gallery',
  '/kontakt': 'contact',
  '/impressum': 'impressum',
  '/datenschutz': 'datenschutz',
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Keeps <title>, description, Open Graph/Twitter tags and canonical in sync with the route and language. */
export function useRouteMeta() {
  const { pathname } = useLocation()
  const { language } = useTranslation()

  useEffect(() => {
    const page: SeoPage = seoRoutes[pathname] ? seoRoutes[pathname] : matchPath('/*', pathname) ? 'notFound' : 'home'
    const { title, description } = seo[language][page]
    const url = site.url + (seoRoutes[pathname] ? (pathname === '/' ? '/' : pathname) : '/')

    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', language === 'de' ? 'de_DE' : 'en_US')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', page === 'notFound' ? 'noindex, follow' : 'index, follow')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [pathname, language])
}
