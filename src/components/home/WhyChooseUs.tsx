import { CalendarCheck, Laptop, MessageCircle, SprayCan, type LucideIcon } from 'lucide-react'
import { photos } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import type { TranslationKey } from '../../i18n/LanguageContext'
import Photo from '../Photo'
import SectionHeading from '../SectionHeading'
import Parallax from '../motion/Parallax'
import Reveal from '../motion/Reveal'
import { Stagger, StaggerItem } from '../motion/Stagger'

const points: { icon: LucideIcon; title: TranslationKey; text: TranslationKey }[] = [
  { icon: MessageCircle, title: 'home.why.contact.title', text: 'home.why.contact.text' },
  { icon: SprayCan, title: 'home.why.care.title', text: 'home.why.care.text' },
  { icon: Laptop, title: 'home.why.specialty.title', text: 'home.why.specialty.text' },
  { icon: CalendarCheck, title: 'home.why.flexible.title', text: 'home.why.flexible.text' },
]

export default function WhyChooseUs() {
  const { t } = useTranslation()
  return (
    <section className="section-light py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 lg:grid-cols-2 lg:gap-20">
        <Reveal variant="left" className="relative mx-auto w-full max-w-sm pb-8 sm:max-w-md lg:max-w-none">
          <div aria-hidden="true" className="absolute -left-6 -top-6 -z-10 h-40 w-40 rounded-full bg-mint" />
          <Parallax clip speed={0.6} className="mx-auto aspect-[4/5] w-[86%] -rotate-2 rounded-3xl shadow-soft lg:ml-0">
            <Photo photo={photos.bathroom} sizes="(min-width: 1024px) 400px, 80vw" />
          </Parallax>
          <div className="absolute -bottom-2 right-0 w-[42%] rotate-3 overflow-hidden rounded-2xl border-4 border-white shadow-soft lg:right-[8%]">
            <div className="aspect-[3/4]">
              <Photo photo={photos.stairs} sizes="220px" />
            </div>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            eyebrow={t('home.why.eyebrow')}
            title={t('home.why.title')}
            text={t('home.why.text')}
          />
          <Stagger as="ul" className="mt-10 grid gap-6 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, text }) => (
              <StaggerItem as="li" key={title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-brand">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm">{t(title)}</h3>
                  <p className="mt-0.5 text-sm text-ink-muted">{t(text)}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
