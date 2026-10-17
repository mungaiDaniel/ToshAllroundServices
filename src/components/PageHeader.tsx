import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuroraBackground from './effects/AuroraBackground'
import FloatingBubbles from './effects/FloatingBubbles'
import NoiseOverlay from './effects/NoiseOverlay'
import WaveRibbon from './effects/WaveRibbon'
import Eyebrow from './Eyebrow'
import SplitText from './motion/SplitText'

export interface PageHeaderProps {
  eyebrow: string
  title: string
  breadcrumb: { label: string; to?: string }[]
}

/** Compact animated header that opens every inner page (smaller sibling of the home hero). */
export default function PageHeader({ eyebrow, title, breadcrumb }: PageHeaderProps) {
  return (
    <header className="section-dark">
      <AuroraBackground />
      <WaveRibbon variant="calm" />
      <FloatingBubbles variant="edges" />
      <NoiseOverlay />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:pt-32">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-mist">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumb.map((b, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} aria-hidden="true" />}
                {b.to ? (
                  <Link to={b.to} className="link-underline hover:text-snow">
                    {b.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-snow">
                    {b.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <Eyebrow>{eyebrow}</Eyebrow>
        <SplitText as="h1" text={title} className="mt-4 text-4xl sm:text-5xl lg:text-6xl" />
      </div>
    </header>
  )
}
