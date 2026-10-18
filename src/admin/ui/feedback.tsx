import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useA } from '../lib/i18n'
import { isOffline } from '../lib/data'

/* ------------------------------------------------------------------ toasts */

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  kind: ToastKind
  text: string
}
interface ToastApi {
  success: (text: string) => void
  error: (text: string) => void
  info: (text: string) => void
  /** friendly "that did not work" message for a failed save/load */
  failed: (e: unknown) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useA()
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((x) => x.id !== id)), [])
  const push = useCallback(
    (kind: ToastKind, text: string) => {
      const id = ++idRef.current
      setItems((l) => [...l.slice(-2), { id, kind, text }])
      window.setTimeout(() => dismiss(id), kind === 'error' ? 8000 : 3800)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (x) => push('success', x),
      error: (x) => push('error', x),
      info: (x) => push('info', x),
      failed: (e) =>
        push(
          'error',
          isOffline(e)
            ? t('Keine Internetverbindung. Es wurde nichts gespeichert – bitte versuchen Sie es noch einmal.', 'No internet connection. Nothing was saved – please try again.')
            : t('Das hat leider nicht geklappt. Bitte versuchen Sie es noch einmal.', 'That did not work. Please try again.'),
        ),
    }),
    [push, t],
  )

  const icons = { success: CheckCircle2, error: XCircle, info: Info }
  const tone = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    error: 'border-red-300 bg-red-50 text-red-900',
    info: 'border-sky-300 bg-sky-50 text-sky-900',
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-3"
      >
        {items.map((it) => {
          const Icon = icons[it.kind]
          return (
            <div
              key={it.id}
              role={it.kind === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-[15px] font-medium shadow-lg ${tone[it.kind]}`}
            >
              <Icon size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">{it.text}</span>
              <button
                type="button"
                onClick={() => dismiss(it.id)}
                aria-label={t('Schließen', 'Close')}
                className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast outside ToastProvider')
  return ctx
}

/* ----------------------------------------------------------------- confirm */

interface ConfirmOptions {
  title: string
  body?: string
  confirmLabel?: string
  cancelLabel?: string
  /** red button for deleting */
  danger?: boolean
}
type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useA()
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback<ConfirmFn>((o) => new Promise<boolean>((resolve) => setState({ ...o, resolve })), [])
  const close = (v: boolean) => {
    state?.resolve(v)
    setState(null)
  }

  useEffect(() => {
    if (!state) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        state.resolve(false)
        setState(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 p-3 sm:items-center">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${state.danger ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-brand'}`}
              >
                <AlertTriangle size={22} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="confirm-title" className="text-lg font-bold text-ink">
                  {state.title}
                </h2>
                {state.body && <p className="mt-1 text-[15px] text-ink-muted">{state.body}</p>}
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => close(false)}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-ink hover:bg-slate-50"
              >
                {state.cancelLabel ?? t('Abbrechen', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`min-h-12 rounded-xl px-4 text-base font-semibold text-white ${state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-[#185a9c]'}`}
              >
                {state.confirmLabel ?? t('Ja, weiter', 'Yes, continue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm outside ConfirmProvider')
  return ctx
}

/** Shortcut for the always-same "delete?" question. */
export function useConfirmDelete() {
  const confirm = useConfirm()
  const { t } = useA()
  return useCallback(
    (what: string, body?: string) =>
      confirm({
        title: t(`„${what}“ wirklich löschen?`, `Really delete “${what}”?`),
        body: body ?? t('Das kann nicht rückgängig gemacht werden.', 'This cannot be undone.'),
        confirmLabel: t('Ja, löschen', 'Yes, delete'),
        danger: true,
      }),
    [confirm, t],
  )
}

/* ------------------------------------------------- unsaved changes registry */

interface DirtyApi {
  set: (id: string, dirty: boolean) => void
  anyDirty: () => boolean
}
export const DirtyContext = createContext<DirtyApi>({ set: () => {}, anyDirty: () => false })

/** Tell the admin shell that a form has unsaved changes: leaving the page (or closing the tab) then asks first. */
export function useDirty(id: string, dirty: boolean) {
  const { set } = useContext(DirtyContext)
  useEffect(() => {
    set(id, dirty)
    return () => set(id, false)
  }, [id, dirty, set])
}
