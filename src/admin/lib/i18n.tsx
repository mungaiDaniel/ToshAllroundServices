import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type AdminLang = 'de' | 'en'

interface Ctx {
  lang: AdminLang
  setLang: (l: AdminLang) => void
  /** t('Deutscher Text', 'English text') – both languages sit next to each other, so none can be forgotten */
  t: (de: string, en: string) => string
}

const KEY = 'tosh-admin-lang'

const read = (): AdminLang => {
  try {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'de'
  } catch {
    return 'de'
  }
}

const AdminLangContext = createContext<Ctx>({ lang: 'de', setLang: () => {}, t: (de) => de })

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>(read)
  const setLang = useCallback((l: AdminLang) => {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l
  }, [])
  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (de, en) => (lang === 'de' ? de : en) }), [lang, setLang])
  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>
}

export const useA = () => useContext(AdminLangContext)
