/**
 * Static film-grain texture: a tiny pre-rendered tile (public/noise.png), no SVG filter and no blend
 * mode, so it costs almost nothing to paint. Fills its `relative` parent.
 */
export default function NoiseOverlay({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{ backgroundImage: 'url(/noise.png)', backgroundSize: '128px 128px', opacity }}
    />
  )
}
