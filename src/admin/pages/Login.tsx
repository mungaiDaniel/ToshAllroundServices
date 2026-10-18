import { ArrowLeft, Eye, EyeOff, KeyRound, LogIn, MailCheck } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useAuth, type AuthProblem } from '../lib/auth'
import { isEmail } from '../lib/format'
import { useA } from '../lib/i18n'
import { Button, Callout, TextField } from '../ui/kit'
import LangSwitch from '../ui/LangSwitch'

function useProblemText() {
  const { t } = useA()
  return (p: AuthProblem): string => {
    switch (p) {
      case 'invalid':
        return t('E-Mail oder Passwort stimmt nicht. Bitte prüfen Sie Ihre Eingabe.', 'Email or password is not correct. Please check what you typed.')
      case 'rate':
        return t('Zu viele Versuche. Bitte warten Sie ein paar Minuten und versuchen Sie es dann noch einmal.', 'Too many attempts. Please wait a few minutes and try again.')
      case 'network':
        return t('Keine Verbindung. Bitte prüfen Sie Ihr Internet.', 'No connection. Please check your internet.')
      case 'notAdmin':
        return t('Dieses Konto darf die Verwaltung nicht benutzen.', 'This account is not allowed to use the admin area.')
      case 'weak':
        return t('Das Passwort ist zu einfach. Bitte nehmen Sie mindestens 8 Zeichen.', 'That password is too simple. Please use at least 8 characters.')
      case 'linkExpired':
        return t('Der Link ist abgelaufen oder wurde schon benutzt. Bitte fordern Sie unten einen neuen an.', 'The link has expired or was already used. Please request a new one below.')
      case 'notConfigured':
        return t('Die Verbindung zur Datenbank ist noch nicht eingerichtet (siehe SUPABASE_SETUP.md).', 'The database connection is not set up yet (see SUPABASE_SETUP.md).')
      default:
        return t('Das hat leider nicht geklappt. Bitte versuchen Sie es noch einmal.', 'That did not work. Please try again.')
    }
  }
}

function Frame({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="admin-root flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-white to-mint">
      <div className="flex justify-end p-3">
        <LangSwitch />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-10">
        <div className="mb-6 text-center">
          <img src="/images/logo/tosh-logo-256.webp" alt="" width={88} height={88} className="mx-auto h-22 w-22" />
          <h1 className="mt-4 text-3xl font-extrabold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-ink-muted">{subtitle}</p>}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6">{children}</div>
        <p className="mt-6 text-center text-xs text-slate-500">Tosh Allround Services</p>
      </main>
    </div>
  )
}

function PasswordField({ label, value, onChange, autoComplete, error }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string; error?: string | null }) {
  const { t } = useA()
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <TextField
        label={label}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        error={error}
        className="pr-14"
        autoCapitalize="none"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t('Passwort verbergen', 'Hide password') : t('Passwort anzeigen', 'Show password')}
        aria-pressed={show}
        className="absolute right-1 top-[1.85rem] flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
      >
        {show ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
      </button>
    </div>
  )
}

export default function Login() {
  const { t } = useA()
  const { signIn, sendReset, notice } = useAuth()
  const problem = useProblemText()
  const [mode, setMode] = useState<'login' | 'forgot' | 'sent'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isEmail(email)) return setError(t('Bitte geben Sie Ihre E-Mail-Adresse ein.', 'Please enter your email address.'))
    if (!password) return setError(t('Bitte geben Sie Ihr Passwort ein.', 'Please enter your password.'))
    setBusy(true)
    const p = await signIn(email, password)
    setBusy(false)
    if (p) setError(problem(p))
  }

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isEmail(email)) return setError(t('Bitte geben Sie Ihre E-Mail-Adresse ein.', 'Please enter your email address.'))
    setBusy(true)
    const p = await sendReset(email)
    setBusy(false)
    if (p && p !== 'invalid') setError(problem(p))
    else setMode('sent') // always the same answer, so nobody can find out which addresses exist
  }

  if (mode === 'sent')
    return (
      <Frame title={t('E-Mail unterwegs', 'Email on its way')}>
        <div className="text-center">
          <MailCheck size={44} className="mx-auto text-emerald-600" aria-hidden="true" />
          <p className="mt-3 text-[15px] text-ink">
            {t(
              'Wenn diese Adresse bei uns bekannt ist, haben wir Ihnen gerade einen Link zum Zurücksetzen des Passworts geschickt. Schauen Sie auch im Spam-Ordner nach.',
              'If this address is known to us, we just sent you a link to reset your password. Please also check your spam folder.',
            )}
          </p>
          <Button variant="secondary" full className="mt-5" icon={ArrowLeft} onClick={() => setMode('login')}>
            {t('Zurück zur Anmeldung', 'Back to login')}
          </Button>
        </div>
      </Frame>
    )

  if (mode === 'forgot')
    return (
      <Frame title={t('Passwort vergessen?', 'Forgot your password?')} subtitle={t('Wir schicken Ihnen einen Link per E-Mail.', 'We will email you a link.')}>
        <form onSubmit={submitForgot} className="space-y-4" noValidate>
          <TextField
            label={t('E-Mail-Adresse', 'Email address')}
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            value={email}
            onChange={setEmail}
          />
          {error && <Callout tone="error">{error}</Callout>}
          <Button type="submit" full size="lg" loading={busy} icon={KeyRound}>
            {t('Link senden', 'Send link')}
          </Button>
          <Button variant="ghost" full onClick={() => (setError(null), setMode('login'))}>
            {t('Zurück zur Anmeldung', 'Back to login')}
          </Button>
        </form>
      </Frame>
    )

  return (
    <Frame title={t('Anmelden', 'Log in')} subtitle={t('Verwaltung der Website', 'Website administration')}>
      <form onSubmit={submitLogin} className="space-y-4" noValidate>
        {notice && !error && <Callout tone={notice === 'notConfigured' ? 'warn' : 'error'}>{problem(notice)}</Callout>}
        <TextField
          label={t('E-Mail-Adresse', 'Email address')}
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          value={email}
          onChange={setEmail}
        />
        <PasswordField label={t('Passwort', 'Password')} value={password} onChange={setPassword} autoComplete="current-password" />
        {error && <Callout tone="error">{error}</Callout>}
        <Button type="submit" full size="lg" loading={busy} icon={LogIn}>
          {t('Anmelden', 'Log in')}
        </Button>
        <p className="text-center text-sm text-ink-muted">
          {t('Sie bleiben auf diesem Gerät angemeldet, bis Sie sich abmelden.', 'You stay logged in on this device until you log out.')}
        </p>
        <Button variant="ghost" full onClick={() => (setError(null), setMode('forgot'))}>
          {t('Passwort vergessen?', 'Forgot password?')}
        </Button>
      </form>
    </Frame>
  )
}

/** Shown after the visitor clicked the link in the "reset password" e-mail. */
export function NewPassword() {
  const { t } = useA()
  const { setPassword, signOut } = useAuth()
  const problem = useProblemText()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (pw.length < 8) return setError(t('Bitte nehmen Sie mindestens 8 Zeichen.', 'Please use at least 8 characters.'))
    if (pw !== pw2) return setError(t('Die beiden Passwörter sind nicht gleich.', 'The two passwords do not match.'))
    setBusy(true)
    const p = await setPassword(pw)
    setBusy(false)
    if (p) setError(problem(p))
    else history.replaceState(null, '', '/admin')
  }

  return (
    <Frame title={t('Neues Passwort', 'New password')} subtitle={t('Wählen Sie ein neues Passwort.', 'Choose a new password.')}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <PasswordField label={t('Neues Passwort', 'New password')} value={pw} onChange={setPw} autoComplete="new-password" />
        <PasswordField label={t('Noch einmal', 'Repeat')} value={pw2} onChange={setPw2} autoComplete="new-password" />
        {error && <Callout tone="error">{error}</Callout>}
        <Button type="submit" full size="lg" loading={busy} icon={KeyRound}>
          {t('Passwort speichern', 'Save password')}
        </Button>
        <Button variant="ghost" full onClick={() => void signOut()}>
          {t('Abbrechen', 'Cancel')}
        </Button>
      </form>
    </Frame>
  )
}
