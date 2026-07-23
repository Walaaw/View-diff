import { ArrowLeftRight, FileText, GitCompareArrows, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'

export interface EditorToolbarProps {
  onCompare: () => void
  canCompare: boolean
  isComputing?: boolean
  onLoadExample?: () => void
  onSwap?: () => void
}

/**
 * Action toolbar for the editors. Compare is the dominant primary action;
 * Load Example and Swap are secondary/ghost helpers (US2).
 */
export function EditorToolbar({
  onCompare,
  canCompare,
  isComputing = false,
  onLoadExample,
  onSwap,
}: EditorToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Editor actions"
      className="flex flex-wrap items-center gap-2"
    >
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

      {onSwap ? (
        <Button
          variant="secondary"
          onClick={onSwap}
          disabled={!canCompare}
          aria-label="Swap original and modified"
        >
          <ArrowLeftRight />
          Swap
        </Button>
      ) : null}

      {onLoadExample ? (
        <Button variant="ghost" onClick={onLoadExample}>
          <FileText />
          Load example
        </Button>
      ) : null}
    </div>
  )
}
