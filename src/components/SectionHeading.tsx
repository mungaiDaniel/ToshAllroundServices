import Eyebrow from './Eyebrow'
import Reveal from './motion/Reveal'
import SplitText from './motion/SplitText'

export interface SectionHeadingProps {
  eyebrow: string
  title: string
  text?: string
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  className?: string
}

/** Eyebrow + animated title + optional intro, used at the top of every section. */
export default function SectionHeading({
  eyebrow,
  title,
  text,
  tone = 'light',
  align = 'left',
  className,
}: SectionHeadingProps) {
  const center = align === 'center'
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl ${className ?? ''}`}>
      <Reveal>
        <Eyebrow tone={tone === 'light' ? 'light' : 'dark'}>{eyebrow}</Eyebrow>
      </Reveal>
      <SplitText as="h2" text={title} className="mt-4 text-3xl sm:text-4xl lg:text-5xl" />
      {text && (
        <Reveal delay={0.2}>
          <p className={`mt-5 ${center ? 'mx-auto' : ''} ${tone === 'light' ? 'text-ink-muted' : ''}`}>{text}</p>
        </Reveal>
      )}
    </div>
  )
}
