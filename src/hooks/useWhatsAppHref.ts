import { useSite } from '../data/content/hooks'
import { whatsappHref } from '../lib/whatsapp'
import { useTranslation } from './useTranslation'

/** wa.me link with the general pre-filled message in the active language. */
export function useWhatsAppHref() {
  const { t } = useTranslation()
  const site = useSite()
  return whatsappHref(t('whatsapp.message'), site.whatsapp.href)
}

/** Builds a wa.me link with any message (e.g. one that names a specific service). */
export function useWhatsAppLink() {
  const site = useSite()
  return (message: string) => whatsappHref(message, site.whatsapp.href)
}
