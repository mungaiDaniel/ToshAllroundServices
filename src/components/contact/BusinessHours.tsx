import { Clock } from 'lucide-react'
import { hours, weekdays } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import Reveal from '../motion/Reveal'

/** Index into `weekdays` (Monday first) for today. */
const todayIndex = () => (new Date().getDay() + 6) % 7

export default function BusinessHours() {
  const { t } = useTranslation()
  const today = todayIndex()
  const suffix = t('contact.hours.oClock')

  return (
    <Reveal variant="right">
      <section aria-labelledby="hours-title" className="card-light !transform-none p-6 sm:p-8">
        <h2 id="hours-title" className="flex items-center gap-3 text-xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-brand">
            <Clock size={20} aria-hidden="true" />
          </span>
          {t('contact.hours.title')}
        </h2>

        <dl className="mt-6 space-y-1 text-sm">
          {weekdays.map((day, i) => {
            const h = hours[day]
            const isToday = i === today
            return (
              <div
                key={day}
                className={`flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 ${
                  isToday ? 'bg-mint font-bold' : ''
                }`}
              >
                <dt className="flex items-center gap-2">
                  {t(`contact.hours.days.${day}`)}
                  {isToday && (
                    <span className="rounded-full bg-leaf px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-night">
                      {t('contact.hours.today')}
                    </span>
                  )}
                </dt>
                <dd className={h ? '' : 'text-ink-muted'}>
                  {h ? `${h.open} – ${h.close} ${suffix}`.trim() : t('contact.hours.closed')}
                </dd>
              </div>
            )
          })}
        </dl>

        <p className="mt-5 text-sm text-ink-muted">{t('contact.hours.note')}</p>
      </section>
    </Reveal>
  )
}
