import { ChevronDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { guide, guideFooter } from '../guide'
import { useA } from '../lib/i18n'
import { Callout, PageHead } from '../ui/kit'

export default function Help() {
  const { t, lang } = useA()
  const [open, setOpen] = useState<string | null>('anmelden')
  return (
    <div>
      <PageHead
        title={t('Hilfe & Anleitung', 'Help & guide')}
        help={t('Kurze Schritt-für-Schritt-Anleitungen für die wichtigsten Aufgaben.', 'Short step-by-step instructions for the most important tasks.')}
      />
      <p className="mb-4 text-[17px] text-ink">
        {t('Hallo Daniel! Hier steht Schritt für Schritt, wie Sie Ihre Website selbst pflegen. Tippen Sie auf eine Überschrift.', 'Hello Daniel! Here you find step by step how to look after your website yourself. Tap a heading.')}
      </p>
      <ul className="space-y-3">
        {guide.map((s) => {
          const isOpen = open === s.id
          const steps = lang === 'de' ? s.stepsDe : s.stepsEn
          const intro = lang === 'de' ? s.introDe : s.introEn
          return (
            <li key={s.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <h2>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`guide-${s.id}`}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="flex min-h-16 w-full items-center gap-3 px-4 text-left text-[17px] font-bold text-ink"
                >
                  <span className="flex-1">{t(s.titleDe, s.titleEn)}</span>
                  <ChevronDown size={22} aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </h2>
              {isOpen && (
                <div id={`guide-${s.id}`} className="border-t border-slate-100 px-4 pb-5 pt-4">
                  {intro && <p className="mb-3 text-[15px] text-ink-muted">{intro}</p>}
                  <ol className="space-y-3">
                    {steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-[16px] leading-relaxed text-ink">
                        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {s.to && (
                    <Link to={s.to} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-sky-50 px-4 text-[15px] font-bold text-brand">
                      <ExternalLink size={18} aria-hidden="true" />
                      {t('Jetzt öffnen', 'Open now')}
                    </Link>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <Callout tone="info" className="mt-5">
        {guideFooter[lang]}
      </Callout>
      <p className="mt-4 text-center text-sm text-slate-500">
        {t('Etwas funktioniert nicht? Melden Sie sich bei Ihrem Webdesigner.', 'Something not working? Contact your web designer.')}
      </p>
    </div>
  )
}
