import { loopDuration } from '../../lib/motion'

export interface LightBeamProps {
  /** degrees from vertical; positive leans right */
  angle?: number
  className?: string
}

/** Soft diagonal light streak (like the reference). Place inside a `relative overflow-hidden` section. */
export default function LightBeam({ angle = 24, className }: LightBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -top-1/4 left-[30%] -z-10 h-[150%] w-[38%] ${className ?? ''}`}
      style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'top center' }}
    >
      <div
        className="anim h-full w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(236,253,245,0.16) 45%, rgba(16,185,129,0.22) 55%, transparent)',
          animationName: 'beam',
          animationDuration: loopDuration(14),
          animationDirection: 'alternate',
          maskImage: 'linear-gradient(to bottom, transparent, #000 25%, #000 65%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 25%, #000 65%, transparent)',
        }}
      />
    </div>
  )
}
