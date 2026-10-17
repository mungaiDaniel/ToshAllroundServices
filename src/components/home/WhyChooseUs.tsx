import { CalendarCheck, Laptop, MessageCircle, SprayCan, type LucideIcon } from 'lucide-react'
import { images } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import type { TranslationKey } from '../../i18n/LanguageContext'
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
  const { t, language } = useTranslation()
  return (
    <section className="section-light py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 lg:grid-cols-2 lg:gap-20">
        <Reveal variant="left" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -left-6 -top-6 -z-10 h-40 w-40 rounded-full bg-mint"
          />
          <Parallax clip speed={0.6} className="aspect-[4/5] rounded-3xl shadow-soft">
            <img
              src={images.aboutCleaner.src}
              alt={images.aboutCleaner.alt[language]}
              width={1000}
              height={563}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-[65%_50%]"
            />
          </Parallax>
          <div className="absolute -bottom-6 -right-3 w-36 overflow-hidden rounded-2xl border-4 border-white shadow-soft sm:-right-6 sm:w-44">
            <img
              src={images.aboutSupplies.src}
              alt={images.aboutSupplies.alt[language]}
              width={1000}
              height={667}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-emerald-deep">
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
