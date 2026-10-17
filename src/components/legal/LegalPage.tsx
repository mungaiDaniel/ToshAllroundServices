/**
 * ⚠️  REVIEW BEFORE LAUNCH  ⚠️
 * Renders the Impressum / Datenschutz texts from src/i18n/legal/{de,en}.ts.
 * Those texts are a DRAFT and NOT legal advice: have the client or a lawyer review them, or
 * generate them with a German legal generator such as e-recht24.de, before the site goes live.
 *
 * Anything in [square brackets] is a placeholder the client must confirm. It is highlighted on
 * the page, and a visible "draft" banner stays on the page until no placeholders are left.
 */
import { TriangleAlert } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { site } from '../../data/site'
import { useTranslation } from '../../hooks/useTranslation'
import legalDe from '../../i18n/legal/de'
import legalEn from '../../i18n/legal/en'
import type { LegalBlock, LegalDoc } from '../../i18n/legal/types'
import PageHeader from '../PageHeader'
import Reveal from '../motion/Reveal'

const PLACEHOLDER = /(\[[^\]]+\])/g

const tokens: Record<string, string> = {
  '{name}': site.name,
  '{street}': site.address.street,
  '{zip}': site.address.zip,
  '{city}': site.address.city,
  '{phone}': site.phone.display,
  '{email}': site.email,
  '{domain}': site.domain,
}

const fill = (text: string) => text.replace(/\{[a-z]+\}/g, (m) => tokens[m] ?? m)

/** Text with site.ts values filled in and [placeholders] highlighted. */
function LegalText({ text }: { text: string }): ReactNode {
  return fill(text)
    .split(PLACEHOLDER)
    .map((part, i) =>
      part.startsWith('[') && part.endsWith(']') ? (
        <mark key={i} className="rounded bg-amber-200 px-1 py-0.5 text-ink">
          {part}
        </mark>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )
}

const blockStrings = (b: LegalBlock) => (Array.isArray(b) ? b : [b])

function countPlaceholders(doc: LegalDoc) {
  const all = [doc.intro ?? '', ...doc.sections.flatMap((s) => [s.heading, ...s.blocks.flatMap(blockStrings)])]
  return all.reduce((n, t) => n + (t.match(PLACEHOLDER)?.length ?? 0), 0)
}

export default function LegalPage({ kind }: { kind: 'impressum' | 'datenschutz' }) {
  const { t, language } = useTranslation()
  const doc = (language === 'de' ? legalDe : legalEn)[kind]
  const title = t(`pages.${kind}.title`)
  const hasPlaceholders = countPlaceholders(doc) > 0
  const showToc = kind === 'datenschutz'

  return (
    <>
      <PageHeader
        eyebrow={t('footer.legal')}
        title={title}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: title }]}
      />

      <section className="section-light py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          {hasPlaceholders && (
            <div
              role="note"
              className="mb-10 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
            >
              <TriangleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">{t('legal.draftTitle')}</p>
                <p className="mt-1">{t('legal.draftText')}</p>
              </div>
            </div>
          )}

          {doc.intro && (
            <Reveal>
              <p className="text-lg">{doc.intro}</p>
            </Reveal>
          )}

          {showToc && (
            <nav aria-label={t('legal.toc')} className="mt-8 rounded-2xl bg-mint p-5">
              <p className="eyebrow eyebrow-light text-xs">{t('legal.toc')}</p>
              <ol className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="link-underline py-0.5 hover:text-emerald-deep">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-10 space-y-10">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl sm:text-2xl">{s.heading}</h2>
                <div className="mt-4 space-y-4">
                  {s.blocks.map((b, i) =>
                    Array.isArray(b) ? (
                      <ul key={i} className="list-disc space-y-1.5 pl-6">
                        {b.map((li, j) => (
                          <li key={j}>
                            <LegalText text={li} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={i} className="whitespace-pre-line">
                        <LegalText text={b} />
                      </p>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
