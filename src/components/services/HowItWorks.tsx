import { ClipboardCheck, MessageCircle, Sparkles, type LucideIcon } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { TranslationKey } from '../../i18n/LanguageContext'
import SectionHeading from '../SectionHeading'
import DrawLine from '../motion/DrawLine'
import { Stagger, StaggerItem } from '../motion/Stagger'

const steps: { icon: LucideIcon; title: TranslationKey; text: TranslationKey }[] = [
  { icon: MessageCircle, title: 'servicesPage.how.step1.title', text: 'servicesPage.how.step1.text' },
  { icon: ClipboardCheck, title: 'servicesPage.how.step2.title', text: 'servicesPage.how.step2.text' },
  { icon: Sparkles, title: 'servicesPage.how.step3.title', text: 'servicesPage.how.step3.text' },
]

/** Three-step timeline; the connecting line draws itself on scroll. */
export default function HowItWorks() {
  const { t } = useTranslation()
  return (
    <section className="section-mint py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          align="center"
          eyebrow={t('servicesPage.how.eyebrow')}
          title={t('servicesPage.how.title')}
        />

        <div className="relative mx-auto mt-14 max-w-xl lg:max-w-none">
          {/* vertical line (mobile) */}
          <DrawLine className="absolute bottom-10 left-7 top-10 w-[2px] text-ink lg:hidden" />
          {/* horizontal line (desktop), runs behind the number badges */}
          <DrawLine
            orientation="horizontal"
            className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-[2px] text-ink lg:block"
          />

          <Stagger as="ol" gap="loose" className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <StaggerItem
                as="li"
                key={title}
                className="relative flex items-start gap-5 lg:flex-col lg:items-center lg:text-center"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-night text-sky shadow-[0_0_30px_var(--glow)] ring-4 ring-mint">
                  <Icon size={24} aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-leaf text-xs font-extrabold text-night">
                    {i + 1}
                  </span>
                </span>
                <div className="card-light flex-1 p-5 sm:p-6 lg:mt-6 lg:w-full">
                  <h3 className="text-lg">{t(title)}</h3>
                  <p className="mt-2 text-sm text-ink-muted lg:mx-auto">{t(text)}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
