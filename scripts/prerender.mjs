/**
 * Post-build step: writes one copy of dist/index.html per page (dist/kontakt/index.html, ...) with that
 * page's <title>, description, canonical and Open Graph tags (German, from src/i18n/seo.json).
 * This lets search engines and link previews (WhatsApp, Facebook, ...) read the right text without
 * executing JavaScript. The React app still takes over in the browser as usual.
 *
 * When adding a page: add it to `routes` below, to src/i18n/seo.json, src/hooks/useRouteMeta.ts,
 * src/App.tsx and public/sitemap.xml.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE_URL = 'https://toshallroundservices.de'
const seo = JSON.parse(readFileSync(join(root, 'src/i18n/seo.json'), 'utf-8')).de

const routes = {
  '/': 'home',
  '/ueber-uns': 'about',
  '/leistungen': 'services',
  '/galerie': 'gallery',
  '/kontakt': 'contact',
  '/impressum': 'impressum',
  '/datenschutz': 'datenschutz',
}

// preload the fonts used above the fold (400 body, 700/800 headings) so text never swaps/shifts
const fontPreloads = ['400', '700', '800']
  .map((w) => readdirSync(join(dist, 'assets')).find((f) => f.startsWith(`jetbrains-mono-latin-${w}-normal`) && f.endsWith('.woff2')))
  .filter(Boolean)
  .map((f) => `    <link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin />`)
  .join('\n')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const html = readFileSync(join(dist, 'index.html'), 'utf-8')

const replaceTag = (src, pattern, replacement, label) => {
  if (!pattern.test(src)) throw new Error(`prerender: could not find ${label} in dist/index.html`)
  return src.replace(pattern, replacement)
}

for (const [path, key] of Object.entries(routes)) {
  const { title, description } = seo[key]
  const url = SITE_URL + path
  let out = html
  out = replaceTag(out, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, 'title')
  for (const [attr, name, value] of [
    ['name', 'description', description],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', url],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
  ]) {
    out = replaceTag(
      out,
      new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`),
      `$1${esc(value)}$2`,
      name,
    )
  }
  out = replaceTag(out, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical')

  out = out.replace('</head>', `${fontPreloads}
  </head>`)

  // the home page's hero photo is the largest thing on screen: start fetching it immediately
  if (path === '/') {
    out = out.replace(
      '</head>',
      '    <link rel="preload" as="image" href="/images/team/tosh-residential-vacuuming.webp" imagesrcset="/images/team/tosh-residential-vacuuming-sm.webp 700w, /images/team/tosh-residential-vacuuming.webp 900w" imagesizes="(min-width: 1024px) 34vw, (min-width: 640px) 360px, 70vw" type="image/webp" fetchpriority="high" />\n  </head>',
    )
  }

  const file = path === '/' ? join(dist, 'index.html') : join(dist, path, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, out)
}
console.log(`prerender: wrote ${Object.keys(routes).length} pages`)
