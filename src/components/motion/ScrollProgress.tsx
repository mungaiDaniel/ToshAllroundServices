/**
 * Thin blue-to-green reading-progress bar fixed to the top of the page.
 * Pure CSS scroll-driven animation (`.scroll-progress` in index.css): no JavaScript runs while scrolling.
 * Browsers without support simply don't show it.
 */
export default function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="scroll-progress fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand via-sky to-leaf shadow-[0_0_12px_var(--glow)]"
    />
  )
}
