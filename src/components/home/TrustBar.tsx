import { BadgeEuro, CalendarClock, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { TranslationKey } from '../../i18n/LanguageContext'
import { Stagger, StaggerItem } from '../motion/Stagger'

const items: { icon: LucideIcon; title: TranslationKey; text: TranslationKey }[] = [
  { icon: ShieldCheck, title: 'home.trust.reliable.title', text: 'home.trust.reliable.text' },
  { icon: Sparkles, title: 'home.trust.detail.title', text: 'home.trust.detail.text' },
  { icon: CalendarClock, title: 'home.trust.flexible.title', text: 'home.trust.flexible.text' },
  { icon: BadgeEuro, title: 'home.trust.fair.title', text: 'home.trust.fair.text' },
]

/** Overlaps the bottom of the hero. */
export default function TrustBar() {
  const { t } = useTranslation()
  return (
    <section className="relative z-10 bg-white px-4 pb-4">
      <Stagger
        as="ul"
        gap="loose"
        className="mx-auto -mt-16 grid max-w-6xl gap-6 rounded-3xl border border-ink/5 bg-white p-6 shadow-soft sm:grid-cols-2 sm:p-8 lg:grid-cols-4 lg:-mt-20"
      >
        {items.map(({ icon: Icon, title, text }) => (
          <StaggerItem as="li" key={title} className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint text-emerald-deep">
              <Icon size={24} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base">{t(title)}</h3>
              <p className="mt-1 text-sm text-ink-muted">{t(text)}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
