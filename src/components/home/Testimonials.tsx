import { Quote, Star } from 'lucide-react'
import { useTestimonials } from '../../data/content/hooks'
import { useTranslation } from '../../hooks/useTranslation'
import SectionHeading from '../SectionHeading'
import { Stagger, StaggerItem } from '../motion/Stagger'

/** Customer testimonials from the database. Renders nothing when there are none (nothing is invented). */
export default function Testimonials() {
  const { t } = useTranslation()
  const { items } = useTestimonials()
  if (!items.length) return null

  return (
    <section className="section-light py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          align="center"
          eyebrow={t('testimonials.eyebrow')}
          title={t('testimonials.title')}
        />
        <Stagger as="ul" gap="loose" className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <StaggerItem as="li" key={it.id}>
              <figure className="card-light flex h-full flex-col p-6 sm:p-8">
                <Quote size={28} aria-hidden="true" className="fill-sky/20 text-sky/50" />
                <div
                  className="mt-4 flex gap-0.5 text-leaf"
                  role="img"
                  aria-label={t('testimonials.stars').replace('{n}', String(it.rating))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={16} aria-hidden="true" className={n <= it.rating ? 'fill-current' : 'opacity-25'} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-ink">{it.text}</blockquote>
                <figcaption className="mt-6 text-sm font-bold">{it.name}</figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
