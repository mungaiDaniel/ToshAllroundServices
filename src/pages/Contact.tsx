import BusinessHours from '../components/contact/BusinessHours'
import ContactCards from '../components/contact/ContactCards'
import ContactForm from '../components/contact/ContactForm'
import PageHeader from '../components/PageHeader'
import SectionHeading from '../components/SectionHeading'
import { useTranslation } from '../hooks/useTranslation'

export default function Contact() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader
        eyebrow={t('nav.contact')}
        title={t('pages.contact.title')}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.contact') }]}
      />

      <section className="section-mint py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow={t('contact.eyebrow')} title={t('contact.title')} text={t('contact.text')} />
          <div className="mt-12">
            <ContactCards />
          </div>
        </div>
      </section>

      <section className="section-light py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 lg:grid-cols-[1.4fr_0.8fr]">
          <ContactForm />
          <BusinessHours />
        </div>
      </section>
    </>
  )
}
