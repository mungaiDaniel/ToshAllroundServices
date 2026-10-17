import { useContext } from 'react'
import { LanguageContext } from '../i18n/LanguageContext'

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within <LanguageProvider>')
  return ctx
}
