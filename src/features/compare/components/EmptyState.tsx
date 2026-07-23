import { FileDiff, FileText } from 'lucide-react'
import { Button } from '@/components/ui'

export interface EmptyStateProps {
  /** Load the built-in example (the primary call to action). */
  onLoadExample: () => void
}

/**
 * Shown before the first comparison: a friendly illustration, a short hint, and
 * a call to action that loads the example so users can see the tool in action.
 */
export function EmptyState({ onLoadExample }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border-default bg-surface/50 px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-card bg-accent/15 text-accent">
        <FileDiff className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-heading text-sm font-bold text-text-primary">
          Nothing to compare yet
        </p>
        <p className="max-w-sm text-sm text-text-muted">
          Paste or type text in both editors and click Compare — or load an
          example to see a side-by-side diff.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onLoadExample}>
        <FileText />
        Load example
      </Button>
    </div>
  )
}
