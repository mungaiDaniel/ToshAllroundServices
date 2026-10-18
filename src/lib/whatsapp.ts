/** wa.me link with a pre-filled message. `base` is the business WhatsApp link, e.g. https://wa.me/4917672750299 */
export const whatsappHref = (message: string, base: string) => `${base}?text=${encodeURIComponent(message)}`
