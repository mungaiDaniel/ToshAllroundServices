import { useState } from 'react'
import Certificates from '../qualifications/Certificates'
import Cv from '../qualifications/Cv'
import { useA } from '../lib/i18n'
import { PageHead } from '../ui/kit'

export default function Qualifications() {
  const { t } = useA()
  const [tab, setTab] = useState<'certs' | 'cv'>('certs')
  return (
    <div>
      <PageHead
        title={t('Qualifikationen & Lebenslauf', 'Qualifications & CV')}
        help={t(
          'Hier laden Sie Zeugnisse und Zertifikate hoch (Foto oder PDF) und pflegen die Stationen Ihres Lebenslaufs.',
          'Upload diplomas and certificates here (photo or PDF) and maintain the entries of your CV.',
        )}
      />
      <div role="tablist" aria-label={t('Bereich', 'Section')} className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1">
        {(['certs', 'cv'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-12 rounded-xl px-3 text-[15px] font-bold ${tab === k ? 'bg-white text-ink shadow-sm' : 'text-slate-600'}`}
          >
            {k === 'certs' ? t('Zertifikate', 'Certificates') : t('Lebenslauf', 'CV')}
          </button>
        ))}
      </div>
      {tab === 'certs' ? <Certificates /> : <Cv />}
    </div>
  )
}
