import { animate, useInView } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { duration, ease, viewport } from '../../lib/motion'

export interface CountUpProps {
  to: number
  from?: number
  decimals?: number
  prefix?: string
  suffix?: string
  locale?: string
  className?: string
}

/**
 * Animated number. Only use it for real figures supplied by the business –
 * never for invented statistics.
 */
export default function CountUp({
  to,
  from = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  locale = 'de-DE',
  className,
}: CountUpProps) {
  const { reduced } = useMotionPrefs()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: viewport.once, margin: viewport.margin })

  const format = useMemo(() => {
    const nf = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    return (n: number) => `${prefix}${nf.format(n)}${suffix}`
  }, [locale, decimals, prefix, suffix])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !inView) return
    const controls = animate(from, to, {
      duration: duration.count,
      ease: ease.out,
      onUpdate: (v) => {
        el.textContent = format(v)
      },
    })
    return () => controls.stop()
  }, [inView, reduced, from, to, format])

  return (
    <>
      <span className="sr-only">{format(to)}</span>
      <span ref={ref} aria-hidden="true" className={className}>
        {format(reduced ? to : from)}
      </span>
    </>
  )
}
