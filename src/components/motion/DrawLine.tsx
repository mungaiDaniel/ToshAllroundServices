import { useMotionPrefs } from '../../hooks/useMotionPrefs'

export interface DrawLineProps {
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

/**
 * A line that draws itself as it scrolls through the viewport (CSS scroll-driven animation, no JavaScript
 * while scrolling; shown fully drawn where unsupported or with reduced motion).
 * Size/position it with className (it fills its box). The faint track uses `text-*` colour.
 */
export default function DrawLine({ orientation = 'vertical', className }: DrawLineProps) {
  const { reduced } = useMotionPrefs()
  const vertical = orientation === 'vertical'
  return (
    <div className={className} aria-hidden="true">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 rounded-full bg-current opacity-15" />
        <div
          className={`absolute inset-0 rounded-full ${reduced ? '' : vertical ? 'draw-line-y' : 'draw-line-x'}`}
          style={{
            background: vertical
              ? 'linear-gradient(to bottom, var(--color-sky), var(--color-leaf))'
              : 'linear-gradient(to right, var(--color-sky), var(--color-leaf))',
            boxShadow: '0 0 8px var(--glow)',
            transformOrigin: vertical ? 'top' : 'left',
          }}
        />
      </div>
    </div>
  )
}
