import { useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { mediaUrl } from '../../lib/supabase'
import { site as staticSite } from '../site'
import { useContentState } from './ContentProvider'
import { fallbackContent } from './fallback'
import { rawText, toBusiness, toCertificates, toCv, toGallery, toServices, toTestimonials } from './normalize'

export function useServices() {
  const { raw, status } = useContentState()
  const { language } = useTranslation()
  return { services: useMemo(() => toServices(raw, language), [raw, language]), loading: status === 'loading' }
}

export function useGallery() {
  const { raw, status } = useContentState()
  return { items: useMemo(() => toGallery(raw), [raw]), loading: status === 'loading' }
}

export function useBusiness() {
  const { raw } = useContentState()
  const { language } = useTranslation()
  return useMemo(() => toBusiness(raw.business ?? fallbackContent.business!, language), [raw, language])
}

/** Same shape as the static `site` object (name, address, phone, whatsapp, email, mapsUrl …) but live. */
export function useSite() {
  const b = useBusiness()
  return useMemo(
    () => ({
      name: staticSite.name,
      domain: staticSite.domain,
      url: staticSite.url,
      address: b.address,
      whatsapp: b.whatsapp,
      phone: b.phone,
      email: b.email,
      mapsUrl: b.mapsUrl,
    }),
    [b],
  )
}

export function useTestimonials() {
  const { raw, status } = useContentState()
  const { language } = useTranslation()
  return { items: useMemo(() => toTestimonials(raw, language), [raw, language]), loading: status === 'loading' }
}

export function useCertificates() {
  const { raw, status } = useContentState()
  const { language } = useTranslation()
  return { items: useMemo(() => toCertificates(raw, language), [raw, language]), loading: status === 'loading' }
}

export function useCv() {
  const { raw, status } = useContentState()
  const { language } = useTranslation()
  const cv = useMemo(() => toCv(raw, language), [raw, language])
  const cvPdf = useMemo(() => {
    const p = rawText(raw, 'founder_cv_pdf', language)
    return p ? mediaUrl(p, 'documents') : undefined
  }, [raw, language])
  return { ...cv, cvPdf, loading: status === 'loading' }
}
