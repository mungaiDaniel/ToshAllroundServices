import { services } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import SectionHeading from '../SectionHeading'
import ServiceCard from '../ServiceCard'
import { Stagger, StaggerItem } from '../motion/Stagger'
import TiltCard from '../motion/TiltCard'

export default function ServicesPreview() {
  const { t } = useTranslation()
  return (
    <section className="section-mint mt-12 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow={t('home.services.eyebrow')}
          title={t('home.services.title')}
          text={t('home.services.text')}
        />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap="loose">
          {services.map((s) => (
            <StaggerItem key={s.id} className={s.specialty ? 'sm:col-span-2 lg:col-span-2' : ''}>
              <TiltCard className="h-full rounded-3xl">
                <ServiceCard service={s} />
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
