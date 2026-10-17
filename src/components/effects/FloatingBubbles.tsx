import { motion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { usePauseOffscreen } from '../../hooks/usePauseOffscreen'
import { distance, loopDuration, parallax } from '../../lib/motion'

export interface FloatingBubblesProps {
  /** "edges": few bubbles hugging the left/right edges. "hero": a richer field with depth. */
  variant?: 'edges' | 'hero'
  /** change for a different (but stable) arrangement */
  seed?: number
  className?: string
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Item {
  kind: 'bubble' | 'sparkle'
  x: number
  y: number
  size: number
  /** 0 = far, 1 = near; drives size, blur-free softness, parallax and speed */
  depth: number
  loop: number
}

function build(variant: 'edges' | 'hero', seed: number, mobile: boolean): Item[] {
  const r = rng(seed)
  const bubbles = variant === 'hero' ? (mobile ? 6 : 13) : mobile ? 3 : 6
  const sparkles = variant === 'hero' ? (mobile ? 4 : 9) : mobile ? 2 : 4
  const items: Item[] = []
  for (let i = 0; i < bubbles; i++) {
    const depth = r()
    const edge = variant === 'edges' ? (i % 2 === 0 ? r() * 12 : 88 + r() * 10) : r() * 96
    items.push({
      kind: 'bubble',
      x: edge,
      y: 4 + r() * 88,
      size: 18 + depth * (variant === 'hero' ? 110 : 70),
      depth,
      loop: 9 + r() * 9,
    })
  }
  for (let i = 0; i < sparkles; i++) {
    const depth = r()
    items.push({
      kind: 'sparkle',
      x: variant === 'edges' ? (i % 2 === 0 ? r() * 14 : 86 + r() * 12) : 4 + r() * 92,
      y: 6 + r() * 86,
      size: 10 + depth * 14,
      depth,
      loop: 3 + r() * 4,
    })
  }
  return items
}

const bubbleBg =
  'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 22%, rgba(16,185,129,0.10) 60%, rgba(124,143,214,0.22))'

function Shape({ item, reduced, scrollY }: { item: Item; reduced: boolean; scrollY: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const travel = (item.depth * 2 - 1) * parallax.range * 1.6
  const y = useTransform(scrollY, [0, 1], [travel, -travel])
  const anim = {
    animationName: reduced ? 'none' : item.kind === 'bubble' ? 'float' : 'twinkle',
    animationDuration: loopDuration(item.loop),
    animationDirection: item.kind === 'bubble' ? ('alternate' as const) : ('normal' as const),
    ['--fx' as string]: `${(item.depth - 0.5) * distance.md}px`,
    ['--fy' as string]: `${-distance.md * (0.5 + item.depth)}px`,
  }
  return (
    <motion.div
      className="absolute"
      style={{ left: `${item.x}%`, top: `${item.y}%`, y: reduced ? 0 : y }}
    >
      {item.kind === 'bubble' ? (
        <div
          className="anim rounded-full border border-white/25"
          style={{
            width: item.size,
            height: item.size,
            background: bubbleBg,
            opacity: 0.35 + item.depth * 0.5,
            boxShadow: 'inset -4px -6px 14px rgba(124,143,214,0.18), 0 0 24px rgba(16,185,129,0.10)',
            ...anim,
          }}
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="anim text-snow"
          style={{ width: item.size, height: item.size, opacity: 0.8, ...anim }}
        >
          <path fill="currentColor" d="M12 0C12.8 7.5 16.5 11.2 24 12C16.5 12.8 12.8 16.5 12 24C11.2 16.5 7.5 12.8 0 12C7.5 11.2 11.2 7.5 12 0Z" />
        </svg>
      )}
    </motion.div>
  )
}

/** Glass soap bubbles and glints with scroll parallax. Pure CSS/SVG – no WebGL. Decorative only. */
export default function FloatingBubbles({ variant = 'edges', seed = 7, className }: FloatingBubblesProps) {
  const { reduced, mobile } = useMotionPrefs()
  const { ref, pauseProps } = usePauseOffscreen<HTMLDivElement>()
  const scope = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: scope, offset: ['start end', 'end start'] })
  const items = useMemo(() => build(variant, seed, mobile), [variant, seed, mobile])

  return (
    <div
      ref={(node) => {
        ref.current = node
        scope.current = node
      }}
      {...pauseProps}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-[5] overflow-hidden ${className ?? ''}`}
    >
      {items.map((item, i) => (
        <Shape key={i} item={item} reduced={reduced} scrollY={scrollYProgress} />
      ))}
    </div>
  )
}
