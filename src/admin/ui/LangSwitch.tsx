import { useA } from '../lib/i18n'

/** DE | EN toggle for the admin interface (separate from the public website's language). */
export default function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang } = useA()
  return (
    <div role="group" aria-label="Sprache / Language" className={`inline-flex rounded-xl border border-slate-300 bg-white p-0.5 ${className}`}>
      {(['de', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={l === 'de' ? 'Deutsch' : 'English'}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`h-11 min-w-12 rounded-[10px] px-3 text-sm font-bold uppercase transition-colors ${lang === l ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
