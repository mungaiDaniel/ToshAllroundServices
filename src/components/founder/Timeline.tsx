import type { ReactNode } from 'react'
import DrawLine from '../motion/DrawLine'
import { Stagger, StaggerItem } from '../motion/Stagger'

export interface TimelineItemData {
  key: string
  period: string
  title: string
  place: string
  /** entries still waiting for the client's real details */
  placeholder?: boolean
  children?: ReactNode
}

/** Vertical CV timeline: the line draws on scroll, entries stagger in. */
export default function Timeline({ items }: { items: TimelineItemData[] }) {
  return (
    <div className="relative pl-8">
      <DrawLine className="absolute bottom-2 left-[5px] top-2 w-[2px] text-ink" />
      <Stagger as="ol" className="space-y-8">
        {items.map((item) => (
          <StaggerItem as="li" key={item.key} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-8 top-1.5 h-3 w-3 rounded-full border-2 bg-white ${
                item.placeholder ? 'border-dashed border-ink-muted' : 'border-sky shadow-[0_0_12px_var(--glow)]'
              }`}
            />
            <p className="eyebrow eyebrow-light !text-xs">{item.period}</p>
            <h4 className={`mt-1 text-lg ${item.placeholder ? '!text-ink-muted' : ''}`}>{item.title}</h4>
            <p className="mt-1 text-sm text-ink-muted">{item.place}</p>
            {item.children}
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
