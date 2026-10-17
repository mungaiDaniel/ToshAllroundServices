import { gallery } from '../../data/gallery'
import { useTranslation } from '../../hooks/useTranslation'
import Button from '../Button'
import SectionHeading from '../SectionHeading'
import Parallax from '../motion/Parallax'
import Reveal from '../motion/Reveal'
import { Stagger, StaggerItem } from '../motion/Stagger'

const previewIds = ['homes-02', 'offices-01', 'shops-01', 'it-02']
const preview = previewIds.map((id) => gallery.find((g) => g.id === id)!)

export default function GalleryPreview() {
  const { t, language } = useTranslation()
  return (
    <section className="section-mint py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={t('home.galleryPreview.eyebrow')}
            title={t('home.galleryPreview.title')}
            text={t('home.galleryPreview.text')}
          />
          <Reveal className="hidden sm:block">
            <Button to="/galerie" variant="ghost-light" arrow>
              {t('home.galleryPreview.cta')}
            </Button>
          </Reveal>
        </div>

        <Stagger className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" gap="loose">
          {preview.map((img) => (
            <StaggerItem key={img.id}>
              <Parallax clip speed={0.4} className="group aspect-[4/5] rounded-3xl shadow-soft">
                <img
                  src={img.src}
                  alt={img.alt[language]}
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform [transition-duration:var(--dur-slow)] [transition-timing-function:var(--ease-out)] group-hover:scale-105"
                />
              </Parallax>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-8 sm:hidden">
          <Button to="/galerie" variant="ghost-light" arrow className="w-full">
            {t('home.galleryPreview.cta')}
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
