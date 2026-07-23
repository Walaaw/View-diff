import { GitCompareArrows, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'

export interface EditorToolbarProps {
  onCompare: () => void
  canCompare: boolean
  isComputing?: boolean
  /** US2 extends this toolbar with Load Example / Swap. */
  onLoadExample?: () => void
  onSwap?: () => void
}

/**
 * Action toolbar for the editors. Compare is the dominant primary action.
 * Load Example / Swap are wired in US2.
 */
export function EditorToolbar({
  onCompare,
  canCompare,
  isComputing = false,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        onClick={onCompare}
        disabled={!canCompare || isComputing}
      >
        {isComputing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <GitCompareArrows />
        )}
        Compare
      </Button>
    </div>
  )
}
