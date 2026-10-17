import { gallery } from '../../data/gallery'
import { useTranslation } from '../../hooks/useTranslation'
import Button from '../Button'
import Photo from '../Photo'
import SectionHeading from '../SectionHeading'
import Parallax from '../motion/Parallax'
import Reveal from '../motion/Reveal'
import { Stagger, StaggerItem } from '../motion/Stagger'

const previewIds = ['real-vacuuming', 'real-bathroom', 'real-mopping', 'real-it']
const preview = previewIds.map((id) => gallery.find((g) => g.id === id)!)

export default function GalleryPreview() {
  const { t } = useTranslation()
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
              <Parallax clip speed={0.4} className="group aspect-[3/4] rounded-3xl shadow-soft">
                <Photo
                  photo={img}
                  sizes="(min-width: 1024px) 280px, 45vw"
                  className="transition-transform [transition-duration:var(--dur-slow)] [transition-timing-function:var(--ease-out)] group-hover:scale-105"
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
