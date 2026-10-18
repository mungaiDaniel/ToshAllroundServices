import { useEffect } from 'react'
import './admin.css'
import { AuthProvider, useAuth } from './lib/auth'
import { AdminLangProvider } from './lib/i18n'
import AdminShell from './AdminShell'
import Login, { NewPassword } from './pages/Login'
import { ConfirmProvider, ToastProvider } from './ui/feedback'
import { Spinner } from './ui/kit'

/** Keeps the admin out of search engines (also set as a header in vercel.json and in robots.txt). */
function useNoindex() {
  useEffect(() => {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const before = meta?.content
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex, nofollow, noarchive'
    const title = document.title
    document.title = 'Admin | Tosh Allround Services'
    return () => {
      if (meta) meta.content = before ?? 'index, follow'
      document.title = title
    }
  }, [])
}

function Gate() {
  const { status } = useAuth()
  useNoindex()
  if (status === 'loading')
    return (
      <div className="admin-root flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    )
  if (status === 'out') return <Login />
  if (status === 'recovery') return <NewPassword />
  return <AdminShell />
}

/** Everything under /admin. Not part of the public Layout (no navbar, no WhatsApp button). */
export default function AdminRoot() {
  return (
    // `contents`: no box of its own, but the admin font reaches the toasts and dialogs too
    <div className="admin-root contents">
      <AdminLangProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <Gate />
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </AdminLangProvider>
    </div>
  )
}
