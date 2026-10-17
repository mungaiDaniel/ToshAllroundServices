import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import de, { type Translations } from './de'
import en from './en'

export type Language = 'de' | 'en'

const STORAGE_KEY = 'tosh-lang'
const dictionaries: Record<Language, Translations> = { de, en }

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'de' || stored === 'en') return stored
  } catch {
    /* localStorage unavailable */
  }
  return 'de'
}

type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>
}[keyof T & string]

export type TranslationKey = Paths<Translations>

export interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      /* ignore */
    }
  }, [language])

  const t = useCallback(
    (key: TranslationKey) => {
      let node: unknown = dictionaries[language]
      for (const part of key.split('.')) {
        node = (node as Record<string, unknown> | undefined)?.[part]
      }
      return typeof node === 'string' ? node : key
    },
    [language],
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((l) => (l === 'de' ? 'en' : 'de')),
      t,
    }),
    [language, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
