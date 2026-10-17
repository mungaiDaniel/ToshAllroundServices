import { motion } from 'framer-motion'
import { useMemo, type ReactNode } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { viewport } from '../../lib/motion'
import { getRevealVariants, type RevealVariant } from './variants'

const tags = {
  div: motion.div,
  span: motion.span,
  li: motion.li,
  section: motion.section,
  article: motion.article,
  p: motion.p,
  h2: motion.h2,
  h3: motion.h3,
} as const

export interface RevealProps {
  children: ReactNode
  variant?: RevealVariant
  /** seconds */
  delay?: number
  /** px override for the slide distance */
  distance?: number
  as?: keyof typeof tags
  className?: string
}

/** Fade + slide (or scale / blur-in) when scrolled into view. Runs once. */
export default function Reveal({
  children,
  variant = 'up',
  delay,
  distance,
  as = 'div',
  className,
}: RevealProps) {
  const { reduced, mobile } = useMotionPrefs()
  const variants = useMemo(
    () => getRevealVariants(variant, { reduced, mobile, delay, distance }),
    [variant, reduced, mobile, delay, distance],
  )
  const Tag = tags[as]
  return (
    <Tag
      data-reveal
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </Tag>
  )
}
