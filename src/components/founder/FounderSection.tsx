import { Briefcase, GraduationCap, Languages, Phone, Sparkles, UserRound, type LucideIcon } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { certificates, founder, site } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import { useWhatsAppHref } from '../../hooks/useWhatsAppHref'
import type { TranslationKey } from '../../i18n/LanguageContext'
import Button from '../Button'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import Reveal from '../motion/Reveal'
import { Stagger, StaggerItem } from '../motion/Stagger'
import SectionHeading from '../SectionHeading'
import CertificateViewer from './CertificateViewer'
import Timeline from './Timeline'

const skills: TranslationKey[] = [
  'founder.skills.residential',
  'founder.skills.office',
  'founder.skills.shop',
  'founder.skills.staircase',
  'founder.skills.it',
  'founder.skills.electrical',
  'founder.skills.reliability',
  'founder.skills.detail',
]

const languages: TranslationKey[] = [
  'founder.languages.german',
  'founder.languages.english',
  'founder.languages.swahili',
]

/** Which skills are the company specialty (highlighted chip) */
const specialtySkills = new Set<TranslationKey>(['founder.skills.it'])

function CvBlock({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <Reveal as="section" className="border-t border-slate-900/10 pt-8 first:border-t-0 first:pt-0">
      <h3 className="flex items-center gap-3 text-xl">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-brand">
          <Icon size={18} aria-hidden="true" />
        </span>
        {title}
      </h3>
      <div className="mt-6">{children}</div>
    </Reveal>
  )
}

function Chips({ items, specialty }: { items: TranslationKey[]; specialty?: Set<TranslationKey> }) {
  const { t } = useTranslation()
  return (
    <Stagger as="ul" gap="tight" variant="scale" className="flex flex-wrap gap-2">
      {items.map((key) => {
        const isSpecialty = specialty?.has(key)
        const isPlaceholder = t(key).startsWith('[')
        return (
          <StaggerItem as="li" key={key}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                isSpecialty
                  ? 'border-leaf/50 bg-mint text-brand'
                  : isPlaceholder
                    ? 'border-dashed border-ink-muted/50 text-ink-muted'
                    : 'border-slate-900/10 bg-slate-50 text-ink'
              }`}
            >
              {isSpecialty && <Sparkles size={12} aria-hidden="true" />}
              {t(key)}
            </span>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}

/** "Meet the founder": portrait + contact on the left, CV blocks and certificate viewer on the right. */
export default function FounderSection() {
  const { t } = useTranslation()
  const whatsapp = useWhatsAppHref()
  const { hash } = useLocation()

  // deep link from the home preview (/ueber-uns#gruender)
  useEffect(() => {
    if (hash !== '#gruender') return
    const id = window.setTimeout(() => document.getElementById('gruender')?.scrollIntoView({ block: 'start' }), 700)
    return () => window.clearTimeout(id)
  }, [hash])

  return (
    <section id="gruender" className="section-mint overflow-x-clip scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={t('founder.eyebrow')} title={t('founder.title')} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* LEFT: portrait, name, contact */}
          <Reveal variant="left" className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_50%_at_25%_20%,var(--glow),transparent),radial-gradient(60%_50%_at_80%_85%,var(--glow-leaf),transparent)]"
              />
              <div className="aspect-[3/4] overflow-hidden rounded-3xl border-4 border-white shadow-[0_0_60px_var(--glow),0_24px_70px_var(--glow-leaf)]">
                <img
                  src={founder.image.src}
                  srcSet={`${founder.image.srcSm} 700w, ${founder.image.src} 1124w`}
                  sizes="(min-width: 1024px) 460px, 90vw"
                  alt={t('founder.photoAlt')}
                  width={founder.image.width}
                  height={founder.image.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>

            <div className="mt-8 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl">{founder.name}</h3>
              <p className="eyebrow eyebrow-light mt-2 justify-center lg:justify-start">{t('founder.role')}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button href={whatsapp} variant="primary">
                  <WhatsAppIcon size={18} />
                  {t('common.whatsapp')}
                </Button>
                <Button href={site.phone.href} variant="ghost-light">
                  <Phone size={16} aria-hidden="true" />
                  {t('common.call')}
                </Button>
              </div>
            </div>
          </Reveal>

          {/* RIGHT: CV */}
          <div className="space-y-8 rounded-3xl border border-slate-900/5 bg-white p-6 shadow-soft sm:p-10">
            <CvBlock icon={UserRound} title={t('founder.profile.title')}>
              <p>{t('founder.profile.text')}</p>
            </CvBlock>

            <CvBlock icon={GraduationCap} title={t('founder.education.title')}>
              <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,1fr)_15rem]">
                <Timeline
                  items={[
                    {
                      key: 'education',
                      period: founder.education.year,
                      title: t('founder.education.degree'),
                      place: founder.education.institution,
                      children: (
                        <p className="mt-4 rounded-2xl border border-leaf/30 bg-mint p-4 text-sm text-ink">
                          {t('founder.education.note')}
                        </p>
                      ),
                    },
                  ]}
                />
                <div className="space-y-8">
                  {certificates.map((c) => (
                    <Reveal key={c.id} variant="scale" delay={0.15}>
                      <CertificateViewer certificate={c} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </CvBlock>

            <CvBlock icon={Briefcase} title={t('founder.experience.title')}>
              <Timeline
                items={(['item1', 'item2'] as const).map((k) => ({
                  key: k,
                  period: t(`founder.experience.${k}.period`),
                  title: t(`founder.experience.${k}.role`),
                  place: t(`founder.experience.${k}.place`),
                  placeholder: true,
                }))}
              />
            </CvBlock>

            <CvBlock icon={Sparkles} title={t('founder.skills.title')}>
              <Chips items={skills} specialty={specialtySkills} />
            </CvBlock>

            <CvBlock icon={Languages} title={t('founder.languages.title')}>
              <Chips items={languages} />
            </CvBlock>
          </div>
        </div>
      </div>
    </section>
  )
}
