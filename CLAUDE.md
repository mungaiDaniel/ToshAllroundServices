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

## Languages
- German is the default language, English via a DE/EN toggle in the navbar.
- All text lives in translation files (src/i18n/de.ts and src/i18n/en.ts), never hard-coded in components.
- Remember the chosen language in localStorage.

## Pages
Home, Über uns / About Us, Leistungen / Our Services, Galerie / Gallery, Kontakt / Contact,
plus Impressum and Datenschutz (linked in footer).
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
- Primary accent – fresh emerald/teal: #10B981 (glow: rgba(16,185,129,0.35))
- Secondary accent – soft blue for labels on dark: #7C8FD6
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
- Glassmorphism cards on dark sections: dark translucent surface, fine border, rounded-3xl, soft shadow, emerald hover glow.
- Clean white cards with soft shadows on light sections.
- Decorative elements themed for cleaning: glass soap bubbles, small sparkles/glints, soft foam shapes, a subtle diagonal light beam (like the screenshot). Used sparingly.

### Motion, responsiveness & accessibility
- Subtle fade/slide-in animations on scroll – never distracting. Respect prefers-reduced-motion.
- Mobile-first, fully responsive. Most visitors will be on phones.
- Accessible: good contrast, alt text, keyboard navigation, aria-labels.

## Code rules
- Small reusable components in src/components, pages in src/pages.
- Business details and services in one config file (src/data/site.ts) so they're easy to change.
- Use placeholder images from /public/images with clear filenames until real photos arrive.
