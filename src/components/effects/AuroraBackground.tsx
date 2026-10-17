import { useMotionPrefs } from '../../hooks/useMotionPrefs'
import { usePauseOffscreen } from '../../hooks/usePauseOffscreen'
import { distance, loopDuration } from '../../lib/motion'

const blobs = [
  { cls: '-left-[10%] -top-[20%] h-[60%] w-[55%]', color: 'rgba(30,107,184,0.38)', loop: 26, dx: 1, dy: 1 },
  { cls: '-right-[8%] top-[5%] h-[65%] w-[50%]', color: 'rgba(46,155,214,0.24)', loop: 32, dx: -1, dy: 1 },
  { cls: 'left-[25%] -bottom-[30%] hidden h-[60%] w-[55%] md:block', color: 'rgba(11,18,38,0.9)', loop: 38, dx: 1, dy: -1 },
]

/** Slow, soft navy / blue / green gradient blobs. Gradients only – no blur filters. Sits behind content. */
export default function AuroraBackground({ className }: { className?: string }) {
  const { reduced } = useMotionPrefs()
  const { ref, pauseProps } = usePauseOffscreen<HTMLDivElement>()
  return (
    <div
      ref={ref}
      {...pauseProps}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-night ${className ?? ''}`}
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`anim absolute rounded-full ${b.cls}`}
          style={{
            background: `radial-gradient(closest-side, ${b.color}, transparent)`,
            animationName: reduced ? 'none' : 'drift',
            animationDuration: loopDuration(b.loop),
            animationDirection: 'alternate',
            ['--dx' as string]: `${b.dx * distance.lg}px`,
            ['--dy' as string]: `${b.dy * distance.lg}px`,
          }}
        />
      ))}
    </div>
  )
}
