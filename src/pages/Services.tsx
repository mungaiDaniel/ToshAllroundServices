import CtaBand from '../components/home/CtaBand'
import PageHeader from '../components/PageHeader'
import SectionHeading from '../components/SectionHeading'
import { FeaturedServiceDetail, ServiceDetail } from '../components/ServiceDetail'
import HowItWorks from '../components/services/HowItWorks'
import { services } from '../data/site'
import { useTranslation } from '../hooks/useTranslation'

const specialty = services.find((s) => s.specialty)!
const others = services.filter((s) => !s.specialty)

export default function Services() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader
        eyebrow={t('home.services.eyebrow')}
        title={t('pages.services.title')}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.services') }]}
      />

      <section className="section-mint py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow={t('servicesPage.eyebrow')}
            title={t('servicesPage.title')}
            text={t('servicesPage.text')}
          />
          <div className="mt-12">
            <FeaturedServiceDetail service={specialty} />
          </div>
        </div>
      </section>

      <section className="section-light py-20 sm:py-24">
        <div className="mx-auto max-w-6xl space-y-20 px-4 sm:space-y-28">
          {others.map((s, i) => (
            <ServiceDetail key={s.id} service={s} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      <HowItWorks />
      <CtaBand />
    </>
  )
}
