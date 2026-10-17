import type { ReactNode } from 'react'

export interface GlassCardProps {
  children: ReactNode
  /** "dark" = glass on dark sections, "light" = white card on light sections */
  tone?: 'dark' | 'light'
  /** permanent emerald glow – used for the IT & Office Equipment specialty */
  specialty?: boolean
  className?: string
}

export default function GlassCard({ children, tone = 'dark', specialty = false, className }: GlassCardProps) {
  const base = tone === 'dark' ? `glass ${specialty ? 'glass-specialty' : ''}` : 'card-light'
  return <div className={`${base} p-6 sm:p-8 ${className ?? ''}`}>{children}</div>
}
