import { useEffect, useState, type ReactNode } from 'react'

/**
 * Renders purely decorative children a moment after first paint (browser idle), so they never compete
 * with the content that matters for loading speed. Children are invisible/aria-hidden anyway.
 */
export default function IdleMount({ children, timeout = 1200 }: { children: ReactNode; timeout?: number }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout })
      return () => (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setReady(true), 200)
    return () => window.clearTimeout(id)
  }, [timeout])
  return ready ? <>{children}</> : null
}
