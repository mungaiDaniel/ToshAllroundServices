import type { Variants } from 'framer-motion'
import { blur, distance, duration, ease } from '../../lib/motion'

export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'blur'

interface Options {
  reduced: boolean
  mobile: boolean
  delay?: number
  distance?: number
}

/** Shared by <Reveal> and <Stagger>. Reduced motion => plain fade. */
export function getRevealVariants(variant: RevealVariant, o: Options): Variants {
  const delay = o.delay ?? 0

  if (o.reduced) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: duration.fast, ease: ease.out, delay } },
    }
  }

  const d = (o.distance ?? distance.md) * (o.mobile ? 0.6 : 1)
  const b = o.mobile ? blur.reveal / 2 : blur.reveal
  const transition = { duration: duration.base, ease: ease.out, delay }

  switch (variant) {
    case 'left':
      return { hidden: { opacity: 0, x: -d }, show: { opacity: 1, x: 0, transition } }
    case 'right':
      return { hidden: { opacity: 0, x: d }, show: { opacity: 1, x: 0, transition } }
    case 'scale':
      return { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition } }
    case 'blur':
      return {
        hidden: { opacity: 0, y: d / 2, filter: `blur(${b}px)` },
        show: { opacity: 1, y: 0, filter: 'blur(0px)', transition },
      }
    default:
      return { hidden: { opacity: 0, y: d }, show: { opacity: 1, y: 0, transition } }
  }
}
