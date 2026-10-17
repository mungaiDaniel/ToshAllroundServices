import { logo } from '../data/site'

/**
 * The round brand logo (transparent background). The alt text is empty by default because the company
 * name is always written next to it; pass `labelled` when it stands alone.
 */
export default function BrandLogo({
  size,
  labelled = false,
  className = '',
  eager = false,
  fluid = false,
}: {
  size: number
  labelled?: boolean
  className?: string
  eager?: boolean
  /** size via CSS classes (e.g. w-28 sm:w-40) instead of the fixed pixel size */
  fluid?: boolean
}) {
  return (
    <img
      src={logo.src96}
      srcSet={`${logo.src96} 96w, ${logo.src256} 256w, ${logo.src} 512w`}
      sizes={`${size}px`}
      alt={labelled ? logo.alt.de : ''}
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={`shrink-0 rounded-full ${className}`}
      style={fluid ? undefined : { width: size, height: size }}
    />
  )
}
