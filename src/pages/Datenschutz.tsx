import { useTranslation } from '../hooks/useTranslation'

export default function Datenschutz() {
  const { t } = useTranslation()
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">{t('pages.datenschutz.title')}</h1>
    </section>
  )
}
