/**
 * Sticky column headers for the diff viewer's two panels.
 * Rendered as one sticky row spanning both columns so it stays aligned with
 * the grid below while scrolling.
 */
export function DiffPanelHeader() {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-2 border-b border-border-default bg-elevated">
      <div className="border-r border-border-default px-3 py-2 font-heading text-xs font-bold text-text-secondary">
        Original
      </div>
      <div className="px-3 py-2 font-heading text-xs font-bold text-text-secondary">
        Modified
      </div>
    </div>
  )
}
