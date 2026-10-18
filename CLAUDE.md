# Project: Tosh Allround Services website
A professional cleaning company in Berlin, Germany.
Tagline: "Your space, our care, our commitment!" (DE: "Ihr Raum, unsere Sorgfalt, unser Versprechen!")

## Tech stack
- React + Vite + TypeScript
- Tailwind CSS for styling
- React Router for pages
- Framer Motion for subtle animations
- lucide-react for icons
- Fonts self-hosted via @fontsource (NO Google Fonts CDN – GDPR requirement in Germany)
- No embedded Google Maps or other third-party embeds without consent (GDPR). Use a "Open in Google Maps" link instead.
- No cookies or tracking, so no cookie banner is needed.
- Content backend: Supabase (EU / Frankfurt) with @supabase/supabase-js – see "Content architecture" below. The only third-party connections visitors make are to our own Supabase project (documented in the Datenschutz page).

## Languages
- German is the default language, English via a DE/EN toggle in the navbar.
- All text lives in translation files (src/i18n/de.ts and src/i18n/en.ts), never hard-coded in components.
- Remember the chosen language in localStorage.

## Pages
Home, Über uns / About Us, Leistungen / Our Services, Galerie / Gallery, Kontakt / Contact,
plus Impressum and Datenschutz (linked in footer). Plus the owner's admin panel at `/admin` (not linked, noindex) – see "Admin panel" below.
A floating WhatsApp button on every page.

## Business details
- Name: Tosh Allround Services
- Address: Richard-Strauss-Straße 34, 14193 Berlin
- WhatsApp: +49 176 72750299 → link https://wa.me/4917672750299
- Phone (calls): +49 178 8779695 → link tel:+491788779695
- Email: toshdigitals2024@gmail.com
- Domain: toshallroundservices.de

## Services
1. Residential Cleaning (Wohnungs- & Hausreinigung)
2. Commercial Office Cleaning (Büroreinigung)
3. Retail & Shop Cleaning (Laden- & Geschäftsreinigung)
4. Staircase & Common Area Cleaning (Treppenhausreinigung)
5. IT & Office Equipment Cleaning (IT- & Bürogerätereinigung) – THE SPECIALTY, always highlighted

## Design direction
Design principle: the hero is dark, cinematic and 3D. Inner sections are light (white and soft mint) so text, services and forms stay very readable. The motion language is shared everywhere: same easing, same durations, same glow, same depth. Elegant and purposeful, never gimmicky, never at the cost of readability or speed. The overall feeling: fresh, spotless, premium, trustworthy.

### Colours
- Night navy (hero, footer, dark sections): #070B1A, #0B1226, card surface #111830
- Card border on dark: rgba(255,255,255,0.08)
- Brand colours come from the logo (Tailwind tokens `brand`, `sky`, `leaf` in src/index.css):
  - Primary blue `brand` #1E6BB8 – main accent: buttons, links on light backgrounds
  - Lighter blue `sky` #2E9BD6 – accent on dark backgrounds: links, eyebrow labels, focus rings, glow (glow: rgba(46,155,214,0.35)), progress bar
  - Fresh green `leaf` #5BB37A – highlights, badges, success states, the IT-specialty glow (glow: rgba(91,179,122,0.38))
  - Gradients run blue → green (e.g. progress bar, CTA band, wave lines)
  - Use `text-brand` (not `sky`/`leaf`) for coloured text on white/mint – it has enough contrast; on dark use `sky`
- Light sections: white #FFFFFF and soft mint #ECFDF5
- Text on light: navy #0F172A, muted #475569
- Text on dark: #F8FAFC, muted #94A3B8

### Typography
- Primary font: JetBrains Mono, self-hosted via @fontsource/jetbrains-mono (weights 400, 500, 700, 800). No Google Fonts CDN (GDPR).
- Eyebrow labels: uppercase, letter-spacing 0.2em, small, in the secondary accent colour with a small icon before them (like "✦ UNSERE LEISTUNGEN").
- Headings: bold, tight line-height, large on desktop.
- Body: JetBrains Mono, line-height 1.7, max line length ~65 characters.
- Make the body font a single Tailwind token (font-body) so I can switch paragraphs to "Inter" later by changing one line.

### Visual style
- Glassmorphism cards on dark sections: dark translucent surface, fine border, rounded-3xl, soft shadow, blue hover glow.
- Clean white cards with soft shadows on light sections.
- Decorative elements themed for cleaning: glass soap bubbles, small sparkles/glints, soft foam shapes, a subtle diagonal light beam (like the screenshot). Used sparingly.

### Motion, responsiveness & accessibility
- Subtle fade/slide-in animations on scroll – never distracting. Respect prefers-reduced-motion.
- Mobile-first, fully responsive. Most visitors will be on phones.
- Accessible: good contrast, alt text, keyboard navigation, aria-labels.

## Brand assets
- Logo: /images/logo/tosh-logo-512.webp (round, transparent; also -256 and -96). Use the BrandLogo component: navbar (44px), footer, and floating in the home hero.
- Real photos of the owner: /images/team/ (portrait, each with a large file and a "-sm" file for phones). Use the Photo component (srcset + focal point), never stretch: crop with object-cover and a sensible object-position. Data and bilingual alt text live in src/data/site.ts (`photos`), gallery entries in src/data/gallery.ts (real photos first).
- Stock photos are placeholders (marked `placeholder: true`, credited in public/images/CREDITS.md). Replace them with real photos when available.

## Content architecture (Supabase)
The client edits the website through Supabase (Table Editor + Storage); the site loads that content at runtime.
- **Setup docs:** SUPABASE_SETUP.md (step by step). Schema + security: supabase/migrations/001_init.sql (paste into the SQL editor). Seed: `npm run seed` (scripts/seed-supabase.ts, uses the built-in content).
- **Keys (.env, git-ignored; also set in Vercel):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public, safe in the browser). `SUPABASE_SERVICE_ROLE_KEY` is only for `npm run seed`, never a VITE_ variable, never committed.
- **Tables:** gallery_photos (soft delete via deleted_at, before/after via before_after_pair_id), services, site_texts, business_info (single row), testimonials, certificates, cv_entries, messages (contact form). **Buckets:** `site-images` (images) and `documents` (PDFs), both public-read.
- **Security (Row Level Security on every table):** visitors (anon) can only READ visible, non-deleted content and only INSERT into `messages` (length limits). Only the admin (a row in `admins`, created with `select public.make_admin('email')`) can write or read messages. Sign-ups are disabled; there is exactly one admin user. Security tests:  (supabase/tests/policies.test.mjs, 66 checks on a real Postgres engine) – re-run after ANY change to the migration or policies.
- **Data flow:** one request `rpc get_public_content` returns all visible content as JSON. `src/data/content/`: `ContentProvider` (fetch after first paint, cache in localStorage `tosh-content-v1`, stale-while-revalidate), `fallback.ts` (the built-in static content, built from site.ts / gallery.ts / i18n; also the seed source), `normalize.ts` (rows → language-specific views), `hooks.ts` (`useServices`, `useGallery`, `useBusiness`, `useSite`, `useTestimonials`, `useCertificates`, `useCv`).
- **Fallback:** if Supabase is not configured, unreachable, or not seeded, the site shows the built-in content from `src/data/site.ts`, `src/data/gallery.ts` and `src/i18n`. Keep those files in sync with the seed meaning: they are the safety net, not the primary source.
- **Texts:** `site_texts.key` maps to a translation key through `textKeyMap` in fallback.ts (e.g. `hero_title` → `home.hero.title`); a non-empty DB value overrides the built-in translation. Unmapped keys are ignored. All other UI strings stay in src/i18n.
- **Skeletons:** first-time visitors (no cache) see skeleton loaders (src/components/Skeletons.tsx) that mirror the real layout (same aspect ratios and min-heights, so no layout shift) for at most ~2.5 s, then the built-in content. Returning visitors get the cached content instantly. Never add a new DB-driven block without a matching skeleton.
- **Contact form:** saves to `messages` AND sends the Web3Forms email; it succeeds if at least one of the two worked. The email/DB always use the German service title.
- **Images:** DB paths are storage keys (`gallery/x.webp`) or local `/images/...` paths; `mediaUrl()` in src/lib/supabase.ts builds the public URL. Always store width/height (and an optional `_sm` file) so the layout does not shift.
- **Privacy:** Datenschutz (src/i18n/legal) documents Supabase (EU hosting), IP processing when loading content, and deletion of messages after 12 months (pg_cron job in the migration). Update it whenever data handling changes.

## Admin panel (/admin)
Daniel (the owner, not technical, mostly on his phone) edits the site at `/admin`. Guide for him: ADMIN_GUIDE.md and `/admin/hilfe` (source: `src/admin/guide.ts`, keep both in step).
- **Separate app inside the same build:** `src/admin/` is one lazy chunk (`{ path: '/admin/*' }` in App.tsx), outside the public `Layout` (no navbar / WhatsApp button / ContentProvider fetch). Public bundle size is unaffected. Never link to it from the public site. Excluded from search engines three ways: `<meta robots noindex>` (AdminRoot), `X-Robots-Tag` header + `no-store` (vercel.json), `Disallow: /admin` (robots.txt).
- **Auth:** `src/admin/lib/auth.tsx` + `client.ts`. Own Supabase client with `persistSession: true` (storage key `tosh-admin-auth`), separate from the public client (which never keeps a session). After sign-in `rpc('is_admin')` must return true, otherwise the user is signed out. Password reset e-mail redirects to `/admin` (needs Redirect URL + working SMTP in Supabase, see SUPABASE_SETUP.md); the recovery hash is detected in `auth.tsx`. All writes are protected by RLS, the UI is only a convenience.
- **UI language:** German by default, EN toggle, stored in `tosh-admin-lang`. Strings are written inline as `t('Deutsch', 'English')` (`lib/i18n.tsx`), so a language can never be forgotten. Not part of src/i18n.
- **Design:** light theme, system sans-serif (`.admin-root` in `admin.css`), brand colours, every tap target >= 44px, inputs 16px (no iOS zoom), bottom navigation on phones (+ "Mehr" sheet), sidebar from `lg`. Shared pieces: `ui/kit.tsx` (Button, fields with live character counters, Toggle, Sheet, PageHead with the "?" tip, SaveBar), `ui/feedback.tsx` (toasts, confirm dialogs, unsaved-changes registry `useDirty`), `ui/Sortable.tsx` (@dnd-kit, drag only from the handle so scrolling still works) + `ui/MoveButtons.tsx` (arrows as alternative).
- **Rules every section follows:** save shows a success toast, failures show a friendly toast (`toast.failed`), every delete goes through `useConfirmDelete`/`useConfirm`, forms register with `useDirty` (route blocker + beforeunload in AdminShell), every write calls `touchSite()` (drops the localStorage content cache so the live site refetches), list loaders use `rowsOf`/`must` from `lib/data.ts`.
- **Sections:** Dashboard, Galerie (multi-upload from camera/gallery, `lib/images.ts` resizes to max 1600 px WebP ~80 % + 640 px small copy -> `image_path_sm`, JPEG fallback on iPhone Safari; drag reorder; hide; before/after pairs via `before_after_pair_id`; trash = `deleted_at`, purged after 30 days when the gallery page opens), Leistungen, Texte (`site_texts` upsert by key, built-in text shown/restorable), Kontakt & Öffnungszeiten (`business_info` row id 1, announcement with live preview), Nachrichten, Bewertungen, Qualifikationen & Lebenslauf (certificate = image and/or PDF, CV entries per type, CV PDF = `site_texts.founder_cv_pdf`), Einstellungen, Hilfe.
- **Public-site touches made for the admin:** `CertificateViewer` copes with PDF-only certificates; English price text turns "ab " into "from "; `ContentProvider` skips its fetch on `/admin`.
- **Testing:** the admin was verified in a real browser (Playwright, 375 px phone + 320 px + desktop) against a mocked Supabase (auth, PostgREST, storage); RLS itself is covered by `npm run test:db` (no migration change was needed for the admin). After touching admin code run `npx tsc -b`, `npm run build`, and re-check at 375 px: every tap target >= 44 px, no horizontal overflow.

## Code rules
- Small reusable components in src/components, pages in src/pages.
- Business details and services live in Supabase; src/data/site.ts is the static fallback / seed source (and keeps constants like name, domain, URL).
- Use placeholder images from /public/images with clear filenames until real photos arrive.
