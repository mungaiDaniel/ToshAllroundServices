import { motion, type Variants } from 'framer-motion'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { stagger, viewport } from '../../lib/motion'
import { getRevealVariants, type RevealVariant } from './variants'

const ItemVariants = createContext<Variants | null>(null)

const tags = { div: motion.div, ul: motion.ul, ol: motion.ol, section: motion.section } as const
const itemTags = { div: motion.div, li: motion.li, article: motion.article } as const

export interface StaggerProps {
  children: ReactNode
  /** entrance style of each <StaggerItem> */
  variant?: RevealVariant
  gap?: keyof typeof stagger
  /** seconds before the first child */
  delay?: number
  as?: keyof typeof tags
  className?: string
}

/** Staggers the entrance of its <StaggerItem> children once the group scrolls into view. */
export function Stagger({
  children,
  variant = 'up',
  gap = 'base',
  delay = 0,
  as = 'div',
  className,
}: StaggerProps) {
  const { reduced, mobile } = useMotionPrefs()
  const item = useMemo(() => getRevealVariants(variant, { reduced, mobile }), [variant, reduced, mobile])
  const container = useMemo<Variants>(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: reduced ? 0 : stagger[gap], delayChildren: delay } },
    }),
    [gap, delay, reduced],
  )
  const Tag = tags[as]
  return (
    <ItemVariants.Provider value={item}>
      <Tag
        data-reveal
        className={className}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        {children}
      </Tag>
    </ItemVariants.Provider>
  )
}

export function StaggerItem({
  children,
  as = 'div',
  className,
}: {
  children: ReactNode
  as?: keyof typeof itemTags
  className?: string
}) {
  const variants = useContext(ItemVariants)
  const Tag = itemTags[as]
  return (
    <Tag className={className} variants={variants ?? undefined}>
      {children}
    </Tag>
  )
}

export default Stagger
