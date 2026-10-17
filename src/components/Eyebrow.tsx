import { Sparkles, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface EyebrowProps {
  children: ReactNode
  icon?: LucideIcon
  /** "dark" for dark sections (light blue), "light" for white/mint sections (brand blue, readable) */
  tone?: 'dark' | 'light'
  className?: string
}

export default function Eyebrow({ children, icon: Icon = Sparkles, tone = 'dark', className }: EyebrowProps) {
  return (
    <span className={`eyebrow ${tone === 'light' ? 'eyebrow-light' : ''} ${className ?? ''}`}>
      <Icon size={14} aria-hidden="true" />
      {children}
    </span>
  )
}
