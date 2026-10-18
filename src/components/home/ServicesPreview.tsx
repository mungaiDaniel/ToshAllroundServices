import { useServices } from '../../data/content/hooks'
import { useTranslation } from '../../hooks/useTranslation'
import SectionHeading from '../SectionHeading'
import ServiceCard from '../ServiceCard'
import { ServicesGridSkeleton } from '../Skeletons'
import { Stagger, StaggerItem } from '../motion/Stagger'
import TiltCard from '../motion/TiltCard'

export default function ServicesPreview() {
  const { t } = useTranslation()
  const { services: all, loading } = useServices()
  // the specialty always comes first
  const services = [...all].sort((a, b) => Number(b.specialty) - Number(a.specialty))
  return (
    <section className="section-mint mt-12 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow={t('home.services.eyebrow')}
          title={t('home.services.title')}
          text={t('home.services.text')}
        />
        {loading ? (
          <div className="mt-12">
            <ServicesGridSkeleton />
          </div>
        ) : (
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap="loose">
          {services.map((s) => (
            <StaggerItem key={s.id} className={s.specialty ? 'sm:col-span-2 lg:col-span-4' : ''}>
              <TiltCard className="h-full rounded-3xl">
                <ServiceCard service={s} />
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
        )}
      </div>
    </section>
  )
}
