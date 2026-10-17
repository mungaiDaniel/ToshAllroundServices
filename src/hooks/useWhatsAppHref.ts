import { whatsappHref } from '../lib/whatsapp'
import { useTranslation } from './useTranslation'

/** wa.me link with the general pre-filled message in the active language. */
export function useWhatsAppHref() {
  const { t } = useTranslation()
  return whatsappHref(t('whatsapp.message'))
}
