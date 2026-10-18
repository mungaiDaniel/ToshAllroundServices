import { CircleHelp, Loader2, RefreshCw, X } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import type { LucideIcon } from 'lucide-react'
import { isOffline } from '../lib/data'
import { useA } from '../lib/i18n'

/* ---------------------------------------------------------------- buttons */

type Variant = 'primary' | 'secondary' | 'soft' | 'danger' | 'danger-soft' | 'ghost'
type Size = 'md' | 'sm' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-[#185a9c] disabled:bg-slate-300',
  secondary: 'border border-slate-300 bg-white text-ink hover:bg-slate-50 disabled:text-slate-400',
  soft: 'bg-sky-50 text-brand hover:bg-sky-100 disabled:text-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300',
  'danger-soft': 'border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-slate-400',
  ghost: 'text-brand hover:bg-sky-50 disabled:text-slate-400',
}
const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3.5 text-sm gap-2',
  md: 'min-h-12 px-5 text-base gap-2.5',
  lg: 'min-h-14 px-6 text-base gap-3',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  loading?: boolean
  full?: boolean
}

export function Button({ variant = 'primary', size = 'md', icon: Icon, loading, full, className = '', children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : Icon ? <Icon size={20} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

/** Link that looks like a button (opens pages / WhatsApp / phone) */
export function LinkButton({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className = '',
  children,
  ...rest
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> & { variant?: Variant; size?: Size; icon?: LucideIcon }) {
  return (
    <a
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={20} aria-hidden="true" />}
      {children}
    </a>
  )
}

export function IconButton({
  icon: Icon,
  label,
  tone = 'default',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; tone?: 'default' | 'danger' | 'brand' }) {
  const tones = {
    default: 'text-slate-600 hover:bg-slate-100',
    danger: 'text-red-600 hover:bg-red-50',
    brand: 'text-brand hover:bg-sky-50',
  }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-40 ${tones[tone]} ${className}`}
      {...rest}
    >
      <Icon size={22} aria-hidden="true" />
    </button>
  )
}

/* ----------------------------------------------------------------- fields */

export function CharCount({ value, limit, id }: { value: string; limit: number; id?: string }) {
  const n = value.length
  const tone = n >= limit ? 'text-red-600 font-bold' : n >= limit * 0.9 ? 'text-amber-600 font-semibold' : 'text-slate-500'
  return (
    <span id={id} className={`text-xs tabular-nums ${tone}`}>
      {n} / {limit}
    </span>
  )
}

const inputBase =
  'block w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:bg-slate-100'

function FieldShell({
  label,
  hint,
  error,
  htmlFor,
  right,
  children,
  optional,
}: {
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  htmlFor: string
  right?: ReactNode
  children: ReactNode
  optional?: boolean
}) {
  const { t } = useA()
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[15px] font-semibold text-ink">
          {label}
          {optional && <span className="ml-1.5 text-sm font-normal text-slate-500">({t('optional', 'optional')})</span>}
        </label>
        {right}
      </div>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: ReactNode
  value: string
  onChange: (v: string) => void
  limit?: number
  hint?: ReactNode
  error?: string | null
  optional?: boolean
}

export function TextField({ label, value, onChange, limit, hint, error, optional, className = '', ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      htmlFor={id}
      optional={optional}
      right={limit ? <CharCount value={value} limit={limit} /> : undefined}
    >
      <input
        id={id}
        value={value}
        maxLength={limit}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} h-12 ${error ? 'border-red-400' : ''} ${className}`}
        {...rest}
      />
    </FieldShell>
  )
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label: ReactNode
  value: string
  onChange: (v: string) => void
  limit?: number
  hint?: ReactNode
  error?: string | null
  optional?: boolean
}

export function TextAreaField({ label, value, onChange, limit, hint, error, optional, rows = 4, ...rest }: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      htmlFor={id}
      optional={optional}
      right={limit ? <CharCount value={value} limit={limit} /> : undefined}
    >
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={limit}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} resize-y py-3 leading-relaxed ${error ? 'border-red-400' : ''}`}
        {...rest}
      />
    </FieldShell>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  className = '',
  ...rest
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> & {
  label: ReactNode
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  hint?: ReactNode
}) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} h-12 ${className}`}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

/** Big on/off switch with its label (whole row is the tap target) */
export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
  compact,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  hint?: ReactNode
  disabled?: boolean
  compact?: boolean
}) {
  const { t } = useA()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 text-left transition-colors hover:bg-slate-50 disabled:opacity-50 ${compact ? 'min-h-12 py-2' : 'min-h-14 py-3'}`}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-muted">{hint}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className={`w-8 text-right text-xs font-bold uppercase ${checked ? 'text-emerald-700' : 'text-slate-500'}`}>
          {checked ? t('An', 'On') : t('Aus', 'Off')}
        </span>
        <span
          aria-hidden="true"
          className={`relative h-8 w-14 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`}
          />
        </span>
      </span>
    </button>
  )
}

/* -------------------------------------------------------------- containers */

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'blue' | 'amber' | 'red' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-sky-100 text-sky-800',
    amber: 'bg-amber-100 text-amber-900',
    red: 'bg-red-100 text-red-800',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>
}

export function Callout({ tone = 'info', children, className = '' }: { tone?: 'info' | 'warn' | 'error' | 'success'; children: ReactNode; className?: string }) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }
  return <div className={`rounded-xl border px-4 py-3 text-[15px] ${tones[tone]} ${className}`}>{children}</div>
}

export function Spinner({ label }: { label?: string }) {
  const { t } = useA()
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-12 text-slate-600">
      <Loader2 size={26} className="animate-spin text-brand" aria-hidden="true" />
      <span className="text-[15px]">{label ?? t('Lädt …', 'Loading …')}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-brand">
        <Icon size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-sm text-[15px] text-ink-muted">{children}</div>}
    </div>
  )
}

/** Shows a spinner while loading and a friendly retry box when loading failed. */
export function LoadState({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean
  error: unknown
  onRetry: () => void
  children: ReactNode
}) {
  const { t } = useA()
  if (loading) return <Spinner />
  if (error) {
    return (
      <Callout tone="error" className="my-4">
        <p className="font-semibold">
          {isOffline(error)
            ? t('Keine Internetverbindung.', 'No internet connection.')
            : t('Die Daten konnten nicht geladen werden.', 'The data could not be loaded.')}
        </p>
        <p className="mt-1 text-sm">{t('Bitte prüfen Sie Ihr Internet und versuchen Sie es noch einmal.', 'Please check your internet and try again.')}</p>
        <Button variant="danger-soft" size="sm" icon={RefreshCw} className="mt-3" onClick={onRetry}>
          {t('Neu laden', 'Reload')}
        </Button>
      </Callout>
    )
  }
  return <>{children}</>
}

/* ------------------------------------------------------------ page header */

export function PageHead({ title, help, actions }: { title: string; help: string; actions?: ReactNode }) {
  const { t } = useA()
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            aria-label={t('Hilfe zu diesem Bereich', 'Help for this section')}
            onClick={() => setOpen((o) => !o)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${open ? 'bg-brand text-white' : 'text-brand hover:bg-sky-50'}`}
          >
            <CircleHelp size={24} aria-hidden="true" />
          </button>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {open && (
        <p id={id} role="note" className="mt-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[15px] text-sky-950">
          {help}
        </p>
      )}
    </header>
  )
}

/** Sticks above the bottom navigation while a form has unsaved changes */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  saveLabel,
}: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onDiscard: () => void
  saveLabel?: string
}) {
  const { t } = useA()
  return (
    <div
      className={`sticky bottom-[4.75rem] z-20 mt-6 transition-all lg:bottom-4 ${dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      aria-hidden={!dirty}
    >
      <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-white p-2.5 shadow-xl">
        <p className="min-w-0 flex-1 px-2 text-sm font-semibold text-amber-900">{t('Nicht gespeicherte Änderungen', 'Unsaved changes')}</p>
        <Button variant="secondary" size="sm" onClick={onDiscard} disabled={saving || !dirty} tabIndex={dirty ? 0 : -1}>
          {t('Verwerfen', 'Discard')}
        </Button>
        <Button size="sm" onClick={onSave} loading={saving} disabled={!dirty} tabIndex={dirty ? 0 : -1}>
          {saveLabel ?? t('Speichern', 'Save')}
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ sheet */

/**
 * Pop-up for editing one item: full screen on phones, centred box on larger screens.
 * Closing is handled by the parent (so it can ask about unsaved changes first).
 */
export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  const { t } = useA()
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      // the confirm dialog (rendered later) handles its own Escape
      if (e.key === 'Escape' && !document.querySelector('[role="alertdialog"]')) closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div className="admin-root fixed inset-0 z-[60] flex items-stretch justify-center bg-slate-900/50 sm:items-center sm:p-6">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="flex w-full max-w-2xl flex-col bg-slate-50 outline-none sm:max-h-[92vh] sm:rounded-3xl sm:shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2 sm:rounded-t-3xl">
          <h2 className="truncate text-lg font-bold text-ink">{title}</h2>
          <IconButton icon={X} label={t('Schließen', 'Close')} onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-white p-3 sm:rounded-b-3xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
