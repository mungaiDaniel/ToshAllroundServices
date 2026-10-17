import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface ButtonProps {
  children: ReactNode
  /** internal route */
  to?: string
  /** external / tel: / mailto: link */
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'dark' | 'ghost-dark' | 'ghost-light'
  arrow?: boolean
  className?: string
}

/** One button for the whole site: lift on hover, glow, arrow slide, press-down on click. */
export default function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  arrow = false,
  className,
}: ButtonProps) {
  const cls = `btn btn-${variant} ${className ?? ''}`
  const content = (
    <>
      {children}
      {arrow && <ArrowRight size={16} className="btn-arrow" aria-hidden="true" />}
    </>
  )
  if (to) return <Link to={to} className={cls}>{content}</Link>
  if (href) {
    const external = href.startsWith('http')
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {content}
      </a>
    )
  }
  return <button type="button" onClick={onClick} className={cls}>{content}</button>
}
