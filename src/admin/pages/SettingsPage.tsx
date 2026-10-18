import { Eye, EyeOff, KeyRound, LogOut } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useA } from '../lib/i18n'
import { useConfirm, useDirty, useToast } from '../ui/feedback'
import { Button, Callout, Card, PageHead, TextField } from '../ui/kit'
import LangSwitch from '../ui/LangSwitch'

export default function SettingsPage() {
  const { t } = useA()
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { email, setPassword, signOut } = useAuth()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useDirty('settings-password', Boolean(pw || pw2))

  const change = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (pw.length < 8) return setError(t('Bitte nehmen Sie mindestens 8 Zeichen.', 'Please use at least 8 characters.'))
    if (pw !== pw2) return setError(t('Die beiden Passwörter sind nicht gleich.', 'The two passwords do not match.'))
    setBusy(true)
    const p = await setPassword(pw)
    setBusy(false)
    if (p) {
      setError(
        p === 'weak'
          ? t('Das Passwort ist zu einfach. Nehmen Sie mehr Zeichen, Zahlen oder Sonderzeichen.', 'That password is too simple. Use more characters, numbers or symbols.')
          : p === 'network'
            ? t('Keine Verbindung. Bitte prüfen Sie Ihr Internet.', 'No connection. Please check your internet.')
            : t('Das hat leider nicht geklappt. Bitte versuchen Sie es noch einmal.', 'That did not work. Please try again.'),
      )
      return
    }
    setPw('')
    setPw2('')
    toast.success(t('Passwort geändert. Merken Sie sich das neue Passwort gut.', 'Password changed. Keep the new password safe.'))
  }

  const logout = async () => {
    const ok = await confirm({
      title: t('Abmelden?', 'Log out?'),
      body: t('Beim nächsten Mal müssen Sie sich wieder mit Passwort anmelden.', 'Next time you will have to log in with your password again.'),
      confirmLabel: t('Ja, abmelden', 'Yes, log out'),
    })
    if (ok) {
      await signOut()
      navigate('/admin', { replace: true })
    }
  }

  return (
    <div>
      <PageHead
        title={t('Einstellungen', 'Settings')}
        help={t('Hier ändern Sie Ihr Passwort, wechseln die Sprache der Verwaltung und melden sich ab.', 'Change your password, switch the language of this admin area and log out.')}
      />
      <div className="space-y-5">
        <Card>
          <h2 className="mb-1 text-lg font-bold text-ink">{t('Angemeldet als', 'Logged in as')}</h2>
          <p className="break-all text-[16px] text-ink-muted">{email ?? '–'}</p>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold text-ink">{t('Sprache der Verwaltung', 'Admin language')}</h2>
          <LangSwitch />
          <p className="mt-2 text-sm text-ink-muted">{t('Das betrifft nur diese Verwaltung, nicht die Website.', 'This only affects this admin area, not the website.')}</p>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold text-ink">{t('Passwort ändern', 'Change password')}</h2>
          <form onSubmit={change} className="space-y-4" noValidate>
            {/* helps password managers; not visible */}
            <input type="text" name="username" autoComplete="username" value={email ?? ''} readOnly hidden />
            <TextField
              label={t('Neues Passwort', 'New password')}
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              autoCapitalize="none"
              spellCheck={false}
              value={pw}
              onChange={setPw}
              hint={t('Mindestens 8 Zeichen. Je länger, desto sicherer.', 'At least 8 characters. The longer, the safer.')}
            />
            <TextField label={t('Neues Passwort noch einmal', 'Repeat new password')} type={show ? 'text' : 'password'} autoComplete="new-password" autoCapitalize="none" spellCheck={false} value={pw2} onChange={setPw2} />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
              className="flex min-h-11 items-center gap-2 text-[15px] font-semibold text-brand"
            >
              {show ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              {show ? t('Passwort verbergen', 'Hide password') : t('Passwort anzeigen', 'Show password')}
            </button>
            {error && <Callout tone="error">{error}</Callout>}
            <Button type="submit" size="lg" icon={KeyRound} loading={busy} disabled={!pw && !pw2}>
              {t('Passwort speichern', 'Save password')}
            </Button>
          </form>
        </Card>

        <Button variant="danger-soft" size="lg" icon={LogOut} full onClick={() => void logout()}>
          {t('Abmelden', 'Log out')}
        </Button>
      </div>
    </div>
  )
}
