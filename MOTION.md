# Motion system

All animation numbers live in [src/lib/motion.ts](src/lib/motion.ts). Components import from there; nothing else hardcodes durations, distances, angles or easing. Stylesheet transitions use the same numbers through CSS variables (`--dur-fast`, `--dur-base`, `--dur-slow`, `--ease-out`) that `applyMotionCssVars()` sets at startup.

## MOTION_INTENSITY

One constant (`DEFAULT_INTENSITY` in `src/lib/motion.ts`) scales everything:

| Value | Effect |
| --- | --- |
| `0` | Still: no motion, instant transitions, ambient loops off |
| `0.5` | Calm: smaller distances and tilt, slower timings |
| `1` | Default |
| `1.5` | Energetic: bigger distances, tilt, parallax, snappier timings |

It scales slide distances, durations (higher = faster), stagger delays, tilt angle, parallax travel, magnetic pull, drift distances and loop speeds.
While running `npm run dev` you can preview a value without editing: `/motion-demo?mi=1.5`.

Other switches in `motion.ts`: `features.smoothScroll` (Lenis) and `features.customCursor`.

## Rules every component follows

- `prefers-reduced-motion` (or intensity 0): no parallax, tilt, magnetic, marquee, bubbles, drifting, smooth scroll or wipe; reveals become plain fades. A global CSS safety net also kills CSS animations.
- Mobile (< 768px): lighter effects (fewer bubbles, half parallax, half blur, shorter slides, no cursor effects).
- Transform and opacity only (blur-in uses `filter` on short text/cards, sparingly).
- Reveals run once. Content is always in the DOM; `<noscript>` CSS in `index.html` forces visibility.
- Ambient CSS loops pause while off-screen (`usePauseOffscreen`).

## Hooks

- `useMotionPrefs()` → `{ reduced, mobile, finePointer }`.
- `usePauseOffscreen()` → `{ ref, pauseProps }` for ambient loops.

## Primitives — `src/components/motion/`

| Component | Props | What it does |
| --- | --- | --- |
| `Reveal` | `variant` (`up` `left` `right` `scale` `blur`), `delay` (s), `distance` (px), `as`, `className` | Fade + slide/scale/blur-in once on scroll |
| `Stagger` / `StaggerItem` | `variant`, `gap` (`tight` `base` `loose`), `delay`, `as`, `className` | Children enter one after another |
| `SplitText` | `text` (`\n` = line break), `by` (`words` `lines`), `as`, `delay`, `className` | Headline reveal, blur-to-sharp. Full text kept in `aria-label` |
| `CountUp` | `to`, `from`, `decimals`, `prefix`, `suffix`, `locale` (default `de-DE`) | Number counter. Real figures only |
| `Parallax` | `speed` (negative reverses), `clip` (image mode), `className` | Layer moves at a different speed than the scroll |
| `Magnetic` | `pull` (0–1), `className` | Wrapper that follows the cursor (desktop) |
| `TiltCard` | `max` (deg), `glare`, `className` | 3D hover tilt with a moving light highlight |
| `Marquee` | `loop` (s), `reverse`, `className` | Infinite strip; pauses on hover and off-screen |
| `DrawLine` | `orientation`, or `d` + `viewBox`, `className` | SVG line that draws on scroll; colour the track via `text-*` |
| `PageTransition` | `routeKey`, `children` | Route fade/slide with a navy wipe (used in `Layout`) |
| `ScrollProgress` | none | Emerald progress bar at the top (in `Layout`) |
| `CustomCursor` | none | Soft ring, grows over links/buttons (in `Layout`; desktop only) |
| `SmoothScroll` | none | Lenis (in `Layout`) |

## Effects — `src/components/effects/`

Place inside a `relative` (or `.section-dark`) section. They are decorative (`aria-hidden`, `pointer-events-none`).

| Component | Props | What it does |
| --- | --- | --- |
| `AuroraBackground` | `className` | Slow navy/emerald/blue gradient blobs (gradients, no blur filters) |
| `GridGlow` | `className` | Faint grid; emerald glow follows the cursor on desktop |
| `NoiseOverlay` | `opacity` | Static film grain |
| `LightBeam` | `angle`, `className` | Soft diagonal light streak |
| `WaveRibbon` | `variant` (`calm` `lively`) | Flowing gradient wave lines; `calm` for page headers |
| `FloatingBubbles` | `variant` (`edges` `hero`), `seed` | Glass bubbles + sparkles with depth and scroll parallax. CSS/SVG only (no WebGL) |

## Shared building blocks — `src/components/`

`GlassCard` (dark glass / light card, `specialty` glow), `Eyebrow`, `Button` (lift, glow, arrow slide, press), `PageHeader` (eyebrow + SplitText title + breadcrumb over aurora/waves). Utility classes in `index.css`: `.glass`, `.glass-specialty`, `.card-light`, `.btn`, `.btn-primary`, `.btn-ghost-dark`, `.btn-ghost-light`, `.link-underline`, `.section-dark`, `.section-light`, `.section-mint`.

## Contrast note

Emerald `#10B981` is too light for text on white. On light backgrounds use `text-emerald-deep` (`#047857`); on emerald buttons the label is night navy.

## Demo

The temporary `/motion-demo` review page has been removed.
