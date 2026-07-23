import { ChevronsUpDown } from 'lucide-react'
import { pluralize } from '@/lib/utils'

export interface CollapsedBlockProps {
  hiddenCount: number
  onExpand: () => void
}

/**
 * The clickable divider shown in place of a collapsed run of unchanged lines.
 * Announces how many lines are hidden and expands the block on click.
 */
export function CollapsedBlock({ hiddenCount, onExpand }: CollapsedBlockProps) {
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-expanded={false}
      aria-label={`Expand ${pluralize(hiddenCount, 'hidden unchanged line')}`}
      className="flex w-full cursor-pointer items-center justify-center gap-2 border-b border-border-default bg-elevated/60 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
    >
      <ChevronsUpDown className="size-3.5" />
      {pluralize(hiddenCount, 'unchanged line')} hidden
    </button>
  )
}
