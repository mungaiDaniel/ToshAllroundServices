import { m, type Variants } from 'framer-motion'
import { useMemo } from 'react'
import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { blur, distance, duration, ease, stagger, viewport } from '../../lib/motion'

const tags = {
  h1: m.h1,
  h2: m.h2,
  h3: m.h3,
  p: m.p,
  div: m.div,
} as const

export interface SplitTextProps {
  text: string
  as?: keyof typeof tags
  /** "words" animates every word; "lines" animates each "\n"-separated line */
  by?: 'words' | 'lines'
  /** seconds before the first word */
  delay?: number
  className?: string
}

/** Headline reveal, blur-to-sharp. The full text stays in the DOM and is exposed via aria-label. */
export default function SplitText({ text, as = 'h2', by = 'words', delay = 0, className }: SplitTextProps) {
  const { reduced, mobile } = useMotionPrefs()

  const container = useMemo<Variants>(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduced ? 0 : by === 'words' ? stagger.tight * 0.6 : stagger.base,
          delayChildren: delay,
        },
      },
    }),
    [by, delay, reduced],
  )

  const piece = useMemo<Variants>(() => {
    if (reduced) {
      return {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: duration.fast } },
      }
    }
    const b = mobile ? blur.reveal / 2 : blur.reveal
    return {
      hidden: { opacity: 0, y: distance.sm, filter: `blur(${b}px)` },
      show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: duration.base, ease: ease.out },
      },
    }
  }, [reduced, mobile])

  const Tag = tags[as]
  const lines = text.split('\n')

  return (
    <Tag
      data-reveal
      className={className}
      aria-label={lines.join(' ')}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {by === 'lines'
        ? lines.map((line, i) => (
            <m.span key={i} aria-hidden="true" className="block" variants={piece}>
              {line}
            </m.span>
          ))
        : lines.map((line, li) => (
            <span key={li} aria-hidden="true" className="block">
              {line.split(/\s+/).map((word, wi, arr) => (
                <span key={wi}>
                  <m.span className="inline-block" variants={piece}>
                    {word}
                  </m.span>
                  {wi < arr.length - 1 ? ' ' : null}
                </span>
              ))}
            </span>
          ))}
    </Tag>
  )
}
