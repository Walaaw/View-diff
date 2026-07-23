import { Badge } from '@/components/ui'
import { pluralize } from '@/lib/utils'
import type { DiffResult } from '../types'
import { DiffPanelHeader } from './DiffPanelHeader'
import { DiffRow } from './DiffRow'

export interface DiffViewerProps {
  result: DiffResult
}

/**
 * Side-by-side diff viewer: sticky column headers, aligned rows with per-side
 * line numbers, and a changes counter. Scrolls vertically as one container so
 * the two columns stay aligned; long lines scroll horizontally per cell.
 */
export function DiffViewer({ result }: DiffViewerProps) {
  const { stats, blocks, isIdentical } = result

  return (
    <div className="overflow-hidden rounded-card border border-border-default bg-surface">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-default px-3 py-2">
        <span
          className="text-xs font-medium text-text-secondary"
          aria-live="polite"
        >
          {isIdentical
            ? 'No changes'
            : pluralize(stats.totalChanges, 'change')}
        </span>
        {stats.additions > 0 && (
          <Badge variant="added">+{stats.additions}</Badge>
        )}
        {stats.removals > 0 && (
          <Badge variant="removed">-{stats.removals}</Badge>
        )}
        {stats.modifications > 0 && (
          <Badge variant="modified">~{stats.modifications}</Badge>
        )}
      </div>

      {/* Scrollable diff grid */}
      <div className="max-h-[70vh] overflow-auto">
        <DiffPanelHeader />
        <div role="table" aria-label="Side-by-side diff">
          {blocks.map((block) =>
            block.rows.map((row) => <DiffRow key={row.id} row={row} />),
          )}
        </div>
      </div>
    </div>
  )
}
