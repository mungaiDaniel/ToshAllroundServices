import { site } from '../data/site'

/** wa.me link with a pre-filled message. */
export const whatsappHref = (message: string) =>
  `${site.whatsapp.href}?text=${encodeURIComponent(message)}`
