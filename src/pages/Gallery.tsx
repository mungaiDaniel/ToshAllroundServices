import { useTranslation } from '../hooks/useTranslation'

export default function Gallery() {
  const { t } = useTranslation()
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">{t('pages.gallery.title')}</h1>
    </section>
  )
}
