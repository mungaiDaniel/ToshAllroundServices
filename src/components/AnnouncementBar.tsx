import { AnimatePresence, m } from 'framer-motion'
import { Megaphone, X } from 'lucide-react'
import { useState } from 'react'
import { useBusiness } from '../data/content/hooks'
import { useTranslation } from '../hooks/useTranslation'
import { duration, ease } from '../lib/motion'

const readDismissed = (): string | null => {
  try {
    return sessionStorage.getItem('tosh-announcement-dismissed')
  } catch {
    return null
  }
}

/**
 * Notice from the database (business_info.announcement_*), e.g. holiday opening hours.
 * A floating pill under the navbar, so it never pushes the page content (no layout shift).
 * Dismissed for the current browser session only.
 */
export default function AnnouncementBar() {
  const { t } = useTranslation()
  const { announcement } = useBusiness()
  const [dismissed, setDismissed] = useState(readDismissed)
  const visible = Boolean(announcement) && dismissed !== announcement

  const close = () => {
    setDismissed(announcement)
    try {
      sessionStorage.setItem('tosh-announcement-dismissed', announcement ?? '')
    } catch {
      /* ignore */
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key={announcement}
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
          exit={{ opacity: 0, transition: { duration: duration.fast } }}
          className="pointer-events-none fixed inset-x-0 top-[84px] z-30 flex justify-center px-4"
        >
          <p className="pointer-events-auto flex max-w-xl items-start gap-3 rounded-2xl border border-white/10 bg-night/95 py-3 pl-4 pr-2 text-sm text-snow shadow-glass backdrop-blur">
            <Megaphone size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-leaf" />
            <span className="sr-only">{t('announcement.label')}: </span>
            <span className="min-w-0 !text-snow">{announcement}</span>
            <button
              type="button"
              onClick={close}
              aria-label={t('announcement.dismiss')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/10 hover:text-snow"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </p>
        </m.div>
      )}
    </AnimatePresence>
  )
}
