/**
 * Motion tokens – the single source of truth for every animation number.
 * Components import from here; nothing else hardcodes durations, distances,
 * angles or easing. See MOTION.md.
 */

/**
 * GLOBAL INTENSITY
 *   0   = still (no motion, instant transitions)
 *   1   = default
 *   1.5 = energetic
 * Scales distances, durations (higher = snappier), tilt angles, parallax and
 * loop speeds. In `npm run dev` you can preview a value with `?mi=1.5` in the URL.
 */
const DEFAULT_INTENSITY = 1

function readIntensity(): number {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const raw = new URLSearchParams(window.location.search).get('mi')
    const parsed = raw === null ? NaN : Number(raw)
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 3) return parsed
  }
  return DEFAULT_INTENSITY
}

export const MOTION_INTENSITY = readIntensity()
export const isStill = MOTION_INTENSITY === 0
const I = MOTION_INTENSITY

/** Higher intensity => shorter durations. 0 => instant. */
const time = (seconds: number) => (isStill ? 0 : seconds / Math.sqrt(I))

/** Loop length (seconds) for ambient CSS animations; undefined = do not animate. */
export const loopDuration = (seconds: number): string | undefined =>
  isStill ? undefined : `${seconds / I}s`

export const features = {
  smoothScroll: true,
  customCursor: true,
} as const

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  wipe: [0.76, 0, 0.24, 1],
} as const

export const duration = {
  fast: time(0.25),
  base: time(0.6),
  slow: time(1.1),
  count: time(1.8),
  wipe: time(0.9),
} as const

export const stagger = {
  tight: time(0.05),
  base: time(0.09),
  loose: time(0.16),
} as const

/** Pixel distances for reveals and drifts. */
export const distance = {
  sm: 14 * I,
  md: 32 * I,
  lg: 64 * I,
} as const

export const blur = { reveal: 12 * Math.min(I, 1.5) } as const

export const tilt = {
  max: 9 * I,
  perspective: 900,
} as const

export const parallax = {
  /** px of travel at speed=1 on desktop */
  range: 60 * I,
  mobileFactor: 0.5,
} as const

export const magnetic = {
  pull: 0.3,
  max: 14 * I,
} as const

export const spring = {
  soft: { type: 'spring', stiffness: 120, damping: 22, mass: 0.8 },
  snappy: { type: 'spring', stiffness: 260, damping: 26, mass: 0.6 },
  magnetic: { type: 'spring', stiffness: 220, damping: 18, mass: 0.5 },
  cursor: { type: 'spring', stiffness: 420, damping: 38, mass: 0.4 },
  progress: { type: 'spring', stiffness: 140, damping: 28, restDelta: 0.001 },
} as const

/** Scroll-trigger defaults: reveal once, a little before the element is fully in view. */
export const viewport = {
  once: true,
  amount: 0.15,
  margin: '0px 0px -8% 0px',
} as const

export const cursor = {
  ring: 34,
  ringHover: 62,
  dot: 6,
} as const

export const breakpoints = {
  mobile: '(max-width: 767px)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const

/** Expose tokens to CSS so stylesheet transitions share the same numbers. */
export function applyMotionCssVars() {
  const root = document.documentElement
  root.style.setProperty('--dur-fast', `${duration.fast}s`)
  root.style.setProperty('--dur-base', `${duration.base}s`)
  root.style.setProperty('--dur-slow', `${duration.slow}s`)
  root.style.setProperty('--ease-out', `cubic-bezier(${ease.out.join(',')})`)
  root.style.setProperty('--drift', `${distance.md}px`)
  if (isStill) root.dataset.motion = 'still'
}
