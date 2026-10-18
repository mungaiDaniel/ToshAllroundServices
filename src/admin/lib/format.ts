import type { AdminLang } from './i18n'

/** "0176 123 45" -> "+4917612345" (German numbers without country code get +49); keeps +CC numbers. */
export function toInternational(phone: string | null | undefined): string {
  const raw = (phone ?? '').trim()
  if (!raw) return ''
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return '+' + digits.slice(1).replace(/\D/g, '')
  if (digits.startsWith('00')) return '+' + digits.slice(2)
  if (digits.startsWith('0')) return '+49' + digits.slice(1)
  return '+' + digits
}

export const waLink = (phone: string, text?: string) =>
  `https://wa.me/${toInternational(phone).replace('+', '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const telLink = (phone: string) => `tel:${toInternational(phone)}`

export function formatDateTime(iso: string, lang: AdminLang) {
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function timeAgo(iso: string, lang: AdminLang) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  const rtf = new Intl.RelativeTimeFormat(lang === 'de' ? 'de' : 'en', { numeric: 'auto' })
  if (min < 60) return rtf.format(-Math.max(min, 0), 'minute')
  if (min < 60 * 24) return rtf.format(-Math.round(min / 60), 'hour')
  if (min < 60 * 24 * 30) return rtf.format(-Math.round(min / (60 * 24)), 'day')
  return formatDateTime(iso, lang)
}

export function slugify(text: string) {
  const base = text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base || 'leistung'}-${Math.random().toString(36).slice(2, 6)}`
}

export const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(s.trim())

/** how long deleted photos stay in the trash */
export const TRASH_DAYS = 30
export const trashDaysLeft = (deletedAt: string) =>
  Math.max(0, TRASH_DAYS - Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000))
