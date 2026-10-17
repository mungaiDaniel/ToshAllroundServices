import { AnimatePresence, m } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Send, Sparkles } from 'lucide-react'
import { useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { serviceIds, site } from '../../data/site'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { useTranslation } from '../../hooks/useTranslation'
import de from '../../i18n/de'
import type { TranslationKey } from '../../i18n/LanguageContext'
import { distance, duration, ease } from '../../lib/motion'
import Button from '../Button'
import { Stagger, StaggerItem } from '../motion/Stagger'

type FieldName = 'name' | 'email' | 'phone' | 'service' | 'message' | 'consent'
type Values = Record<Exclude<FieldName, 'consent'>, string> & { consent: boolean }
type Errors = Partial<Record<FieldName, TranslationKey>>
type Status = 'idle' | 'sending' | 'success' | 'error'

const EMPTY: Values = { name: '', email: '', phone: '', service: '', message: '', consent: false }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9\s()/.-]{6,20}$/
const FIELD_ORDER: FieldName[] = ['name', 'email', 'phone', 'service', 'message', 'consent']
const MIN_MESSAGE = 10
const TIMEOUT_MS = 15000

function validate(v: Values): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'contact.form.errors.name'
  if (!v.email.trim()) e.email = 'contact.form.errors.email'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'contact.form.errors.emailInvalid'
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = 'contact.form.errors.phoneInvalid'
  if (!v.service) e.service = 'contact.form.errors.service'
  if (v.message.trim().length < MIN_MESSAGE) e.message = 'contact.form.errors.message'
  if (!v.consent) e.consent = 'contact.form.errors.consent'
  return e
}

/** Sends the enquiry to the owner's inbox via Web3Forms. Throws on any failure. */
async function sendToWeb3Forms(v: Values, language: string, botcheck: boolean) {
  const key = import.meta.env.VITE_WEB3FORMS_KEY
  if (!key) throw new Error('VITE_WEB3FORMS_KEY is not set (see .env.example)')

  // the email goes to the business owner, so labels are always German
  const service = v.service === 'other' ? 'Sonstiges' : de.services[v.service as keyof typeof de.services].title
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: `Neue Kontaktanfrage – ${service}`,
        from_name: 'Website Tosh Allround Services',
        name: v.name.trim(),
        email: v.email.trim(),
        phone: v.phone.trim() || '–',
        service,
        message: v.message.trim(),
        sprache: language,
        datenschutz_zugestimmt: 'Ja',
        botcheck,
      }),
      signal: ctrl.signal,
    })
    const data = (await res.json()) as { success?: boolean; message?: string }
    if (!res.ok || !data.success) throw new Error(data.message ?? `HTTP ${res.status}`)
  } finally {
    clearTimeout(timer)
  }
}

const inputCls = (invalid: boolean) =>
  `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 transition-[border-color,box-shadow] [transition-duration:var(--dur-fast)] focus:outline-none ${
    invalid
      ? 'border-red-600 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.15)]'
      : 'border-ink/15 hover:border-ink/30 focus:border-brand focus:shadow-[0_0_0_4px_rgba(30,107,184,0.2)]'
  }`

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
        {label}
        {hint && <span className="ml-1 font-normal text-ink-muted">{hint}</span>}
      </label>
      {children}
      <div aria-live="polite" id={`${id}-error`}>
        <AnimatePresence>
          {error && (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: duration.fast } }}
              exit={{ opacity: 0, transition: { duration: duration.fast } }}
              className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const sparkleAngles = [0, 45, 90, 135, 180, 225, 270, 315]

/** Short, calm sparkle burst behind the success icon. */
function Celebration() {
  const { reduced } = useMotionPrefs()
  return (
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
      {!reduced &&
        sparkleAngles.map((a) => (
          <m.span
            key={a}
            aria-hidden="true"
            className="absolute text-leaf"
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.6],
              x: Math.cos((a * Math.PI) / 180) * distance.lg,
              y: Math.sin((a * Math.PI) / 180) * distance.lg,
              transition: { duration: duration.slow * 1.4, ease: ease.out, delay: 0.15 },
            }}
          >
            <Sparkles size={16} />
          </m.span>
        ))}
      <m.span
        className="flex h-20 w-20 items-center justify-center rounded-full bg-leaf text-night shadow-[0_0_40px_var(--glow)]"
        initial={{ scale: reduced ? 1 : 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
      >
        <CheckCircle2 size={40} aria-hidden="true" />
      </m.span>
    </div>
  )
}

export default function ContactForm() {
  const { t, language } = useTranslation()
  const uid = useId()
  const [values, setValues] = useState<Values>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [debugReason, setDebugReason] = useState('')
  const honeypot = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const errors = useMemo(() => validate(values), [values])
  const id = (f: FieldName) => `${uid}-${f}`
  const showError = (f: FieldName) => ((touched[f] || submitted) && errors[f] ? t(errors[f]!) : undefined)
  const aria = (f: FieldName) => ({
    id: id(f),
    'aria-invalid': showError(f) ? true : undefined,
    'aria-describedby': `${id(f)}-error`,
  })

  const set =
    (f: Exclude<FieldName, 'consent'>) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [f]: e.target.value }))
  const blur = (f: FieldName) => () => setTouched((x) => ({ ...x, [f]: true }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setSubmitted(true)
    const firstInvalid = FIELD_ORDER.find((f) => errors[f])
    if (firstInvalid) {
      document.getElementById(id(firstInvalid))?.focus()
      return
    }
    setStatus('sending')
    try {
      await sendToWeb3Forms(values, language, Boolean(honeypot.current?.checked))
      setStatus('success')
      setValues(EMPTY)
      setTouched({})
      setSubmitted(false)
      requestAnimationFrame(() => successRef.current?.focus())
    } catch (err) {
      setDebugReason(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="card-light !transform-none p-8 text-center outline-none sm:p-12"
      >
        <Celebration />
        <h2 className="mt-6 text-2xl">{t('contact.form.success.title')}</h2>
        <p className="mx-auto mt-3 text-ink-muted">{t('contact.form.success.text')}</p>
        <Button variant="ghost-light" className="mt-8" onClick={() => setStatus('idle')}>
          {t('contact.form.success.again')}
        </Button>
      </div>
    )
  }

  const hasErrors = submitted && Object.keys(errors).length > 0
  const [consentBefore, consentAfter] = t('contact.form.consent').split('{link}')

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label={t('contact.form.title')}
      className="card-light !transform-none p-6 sm:p-10"
    >
      <h2 className="text-2xl">{t('contact.form.title')}</h2>
      <p className="mt-2 text-sm text-ink-muted">{t('contact.form.intro')}</p>

      <Stagger className="mt-8 space-y-5" gap="tight" variant="up">
        <StaggerItem>
          <Field id={id('name')} label={`${t('contact.form.name')} *`} error={showError('name')}>
            <input
              {...aria('name')}
              type="text"
              name="name"
              autoComplete="name"
              required
              aria-required="true"
              value={values.name}
              onChange={set('name')}
              onBlur={blur('name')}
              placeholder={t('contact.form.namePlaceholder')}
              className={inputCls(Boolean(showError('name')))}
            />
          </Field>
        </StaggerItem>

        <StaggerItem className="grid gap-5 sm:grid-cols-2">
          <Field id={id('email')} label={`${t('contact.form.email')} *`} error={showError('email')}>
            <input
              {...aria('email')}
              type="email"
              name="email"
              autoComplete="email"
              required
              aria-required="true"
              value={values.email}
              onChange={set('email')}
              onBlur={blur('email')}
              placeholder={t('contact.form.emailPlaceholder')}
              className={inputCls(Boolean(showError('email')))}
            />
          </Field>
          <Field
            id={id('phone')}
            label={t('contact.form.phone')}
            hint={t('contact.form.phoneOptional')}
            error={showError('phone')}
          >
            <input
              {...aria('phone')}
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={set('phone')}
              onBlur={blur('phone')}
              placeholder={t('contact.form.phonePlaceholder')}
              className={inputCls(Boolean(showError('phone')))}
            />
          </Field>
        </StaggerItem>

        <StaggerItem>
          <Field id={id('service')} label={`${t('contact.form.service')} *`} error={showError('service')}>
            <select
              {...aria('service')}
              name="service"
              required
              aria-required="true"
              value={values.service}
              onChange={set('service')}
              onBlur={blur('service')}
              className={inputCls(Boolean(showError('service')))}
            >
              <option value="">{t('contact.form.servicePlaceholder')}</option>
              {serviceIds.map((s) => (
                <option key={s} value={s}>
                  {t(`services.${s}.title`)}
                </option>
              ))}
              <option value="other">{t('contact.form.serviceOther')}</option>
            </select>
          </Field>
        </StaggerItem>

        <StaggerItem>
          <Field id={id('message')} label={`${t('contact.form.message')} *`} error={showError('message')}>
            <textarea
              {...aria('message')}
              name="message"
              rows={5}
              required
              aria-required="true"
              value={values.message}
              onChange={set('message')}
              onBlur={blur('message')}
              placeholder={t('contact.form.messagePlaceholder')}
              className={`${inputCls(Boolean(showError('message')))} resize-y`}
            />
          </Field>
        </StaggerItem>

        <StaggerItem>
          <div>
            <div className="flex items-start gap-3">
              <input
                {...aria('consent')}
                type="checkbox"
                name="consent"
                required
                aria-required="true"
                checked={values.consent}
                onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
                onBlur={blur('consent')}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-ink/30 accent-brand"
              />
              <label htmlFor={id('consent')} className="cursor-pointer text-sm">
                {consentBefore}
                <Link to="/datenschutz" target="_blank" className="link-underline font-bold text-brand">
                  {t('contact.form.privacyLink')}
                </Link>
                {consentAfter}
              </label>
            </div>
            <div aria-live="polite" id={`${id('consent')}-error`}>
              {showError('consent') && (
                <p className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {showError('consent')}
                </p>
              )}
            </div>
            <p className="mt-2 pl-8 text-xs text-ink-muted">{t('contact.form.transmitNote')}</p>
          </div>
        </StaggerItem>
      </Stagger>

      {/* honeypot for bots (Web3Forms "botcheck"): hidden from people and assistive tech */}
      <input
        ref={honeypot}
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <AnimatePresence>
        {hasErrors && status !== 'error' && (
          <m.p
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-center gap-2 text-sm font-bold text-red-700"
          >
            <AlertCircle size={16} aria-hidden="true" />
            {t('contact.form.errors.summary')}
          </m.p>
        )}
        {status === 'error' && (
          <m.div
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <p className="flex items-center gap-2 font-bold">
              <AlertCircle size={18} aria-hidden="true" />
              {t('contact.form.error.title')}
            </p>
            <p className="mt-1">{t('contact.form.error.text')}</p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-bold">
              <a className="link-underline" href={site.whatsapp.href} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <a className="link-underline" href={site.phone.href}>
                {site.phone.display}
              </a>
              <a className="link-underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </p>
            {import.meta.env.DEV && <p className="mt-2 text-xs opacity-70">dev: {debugReason}</p>}
          </m.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn btn-primary mt-8 w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {status === 'sending' ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            {t('contact.form.sending')}
          </>
        ) : (
          <>
            <Send size={18} aria-hidden="true" />
            {t('contact.form.submit')}
          </>
        )}
      </button>
    </form>
  )
}
