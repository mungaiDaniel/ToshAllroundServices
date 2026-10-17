import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Renders its children only when they are about to scroll into view (or after a few idle seconds, so the
 * content always exists for visitors who don't scroll and for crawlers). Used for sections below the fold
 * so the first screen paints quickly. The placeholder keeps roughly the right height to avoid big jumps.
 */
export default function Deferred({
  children,
  minHeight = 700,
  idleAfter = 6000,
}: {
  children: ReactNode
  minHeight?: number
  /** ms after which the content is rendered even if it has not been scrolled near */
  idleAfter?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShow(true)
      },
      { rootMargin: '1200px 0px' },
    )
    io.observe(el)
    const timer = window.setTimeout(() => setShow(true), idleAfter)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [show, idleAfter])

  return show ? <>{children}</> : <div ref={ref} aria-hidden="true" style={{ minHeight }} />
}
