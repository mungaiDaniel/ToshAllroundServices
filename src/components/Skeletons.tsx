/**
 * Skeleton loaders. Each one mirrors the real component's box model (same aspect ratios, paddings and
 * minimum heights), so when the content arrives nothing moves (no layout shift).
 * Shown only on a visitor's very first visit while the content is loading (later visits use the cache).
 */
import type { ReactNode } from 'react'

const bar = (cls: string) => <div className={`animate-pulse rounded-full bg-slate-900/10 ${cls}`} />
const barDark = (cls: string) => <div className={`animate-pulse rounded-full bg-white/10 ${cls}`} />

function Frame({ children, label = 'Loading' }: { children: ReactNode; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  )
}

/** Matches <ServiceCard> */
export function ServiceCardSkeleton({ specialty = false }: { specialty?: boolean }) {
  if (specialty) {
    return (
      <div className="glass glass-specialty flex h-full flex-col overflow-hidden !bg-night lg:flex-row">
        <div className="aspect-[4/5] animate-pulse bg-white/10 sm:aspect-[16/11] lg:aspect-auto lg:min-h-[420px] lg:w-[38%]" />
        <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8 lg:justify-center lg:p-12">
          {barDark('h-7 w-40')}
          {barDark('h-9 w-3/4')}
          {barDark('h-4 w-full')}
          {barDark('h-4 w-11/12')}
          {barDark('h-4 w-2/3')}
        </div>
      </div>
    )
  }
  return (
    <div className="card-light flex h-full flex-col overflow-hidden !transform-none">
      <div className="aspect-[4/5] animate-pulse bg-slate-900/10" />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-900/10" />
        {bar('h-6 w-3/4')}
        {bar('h-4 w-full')}
        {bar('h-4 w-5/6')}
        {bar('mt-3 h-4 w-28')}
      </div>
    </div>
  )
}

/** Matches the grid in <ServicesPreview> (specialty first, then four cards) */
export function ServicesGridSkeleton() {
  return (
    <Frame>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <ServiceCardSkeleton specialty />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </Frame>
  )
}

/** Matches the Services page (featured card + alternating rows) */
export function ServicesPageSkeleton() {
  return (
    <Frame>
      <div className="glass glass-specialty grid overflow-hidden !bg-night lg:grid-cols-[0.9fr_1.1fr]">
        <div className="aspect-[4/5] animate-pulse bg-white/10 sm:aspect-[16/11] lg:aspect-auto lg:min-h-[560px]" />
        <div className="flex flex-col gap-4 p-6 sm:p-10 lg:p-12">
          {barDark('h-7 w-40')}
          {barDark('h-10 w-3/4')}
          {barDark('h-4 w-full')}
          {barDark('h-4 w-11/12')}
          {barDark('h-4 w-2/3')}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  )
}

export function ServiceRowsSkeleton() {
  return (
    <Frame>
      <div className="space-y-20 sm:space-y-28">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className={`mx-auto aspect-[4/5] w-full max-w-sm animate-pulse rounded-3xl bg-slate-900/10 sm:max-w-md ${i % 2 ? 'lg:order-2' : ''}`} />
            <div className="flex flex-col gap-4">
              <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-900/10" />
              {bar('h-8 w-2/3')}
              {bar('h-4 w-full')}
              {bar('h-4 w-11/12')}
              {bar('h-4 w-3/4')}
              <div className="mt-4 space-y-3">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j}>{bar('h-4 w-3/5')}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

/** Matches the masonry gallery: tall and wide tiles in the same column structure */
export function GallerySkeleton({ columns }: { columns: number }) {
  const ratios = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-[3/4]']
  return (
    <Frame>
      <div className="flex items-start gap-4 sm:gap-6">
        {Array.from({ length: columns }, (_, c) => (
          <div key={c} className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${ratios[(c + i * 2) % ratios.length]} animate-pulse rounded-3xl bg-slate-900/10`} />
            ))}
          </div>
        ))}
      </div>
    </Frame>
  )
}

/** 4 portrait tiles of the home gallery preview */
export function GalleryPreviewSkeleton() {
  return (
    <Frame>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-slate-900/10" />
        ))}
      </div>
    </Frame>
  )
}

/** Matches <CertificateViewer> (portrait document card + caption) */
export function CertificateSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[15rem] sm:mx-0" role="status" aria-busy="true" aria-label="Loading">
      {bar('h-4 w-28')}
      <div className="mt-3 aspect-[3/4] animate-pulse rounded-2xl border border-slate-900/10 bg-slate-900/10" />
      <div className="mt-4 space-y-2">
        {bar('h-4 w-3/4')}
        {bar('h-3 w-full')}
        {bar('mt-4 h-10 w-full')}
      </div>
    </div>
  )
}

/** Timeline entries of the CV (period, title, place, details) */
export function TimelineSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="relative space-y-8 pl-8" role="status" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2">
          {bar('h-3 w-24')}
          {bar('h-5 w-2/3')}
          {bar('h-3 w-1/2')}
          {bar('h-3 w-full')}
        </div>
      ))}
    </div>
  )
}

export function ChipsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2" role="status" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[34px] animate-pulse rounded-full bg-slate-900/10" style={{ width: 96 + ((i * 37) % 70) }} />
      ))}
    </div>
  )
}
