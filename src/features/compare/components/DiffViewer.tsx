import { Fragment } from 'react'
import { pluralize } from '@/lib/utils'
import { useAppStore } from '@/store'
import type { DiffBlock, DiffResult } from '../types'
import { CollapsedBlock } from './CollapsedBlock'
import { DiffPanelHeader } from './DiffPanelHeader'
import { DiffRow } from './DiffRow'

export interface DiffViewerProps {
  result: DiffResult
}

/**
 * Side-by-side diff viewer: sticky column headers and aligned rows with per-side
 * line numbers. Long unchanged blocks collapse to a clickable "N lines hidden"
 * divider (context rows remain visible at each change-facing edge). Scrolls
 * vertically as one container so the two columns stay aligned.
 */
export function DiffViewer({ result }: DiffViewerProps) {
  const collapseEnabled = useAppStore((s) => s.collapseEnabled)
  const expandedBlockIds = useAppStore((s) => s.expandedBlockIds)
  const toggleBlock = useAppStore((s) => s.toggleBlock)

  const renderBlock = (block: DiffBlock) => {
    const collapsed =
      collapseEnabled && block.collapsible && !expandedBlockIds.has(block.id)

    if (!collapsed) {
      return (
        <Fragment key={block.id}>
          {block.rows.map((row) => (
            <DiffRow key={row.id} row={row} />
          ))}
        </Fragment>
      )
    }

    const top = block.rows.slice(0, block.contextBefore)
    const bottom = block.rows.slice(block.rows.length - block.contextAfter)

    return (
      <Fragment key={block.id}>
        {top.map((row) => (
          <DiffRow key={row.id} row={row} />
        ))}
        <CollapsedBlock
          hiddenCount={block.hiddenCount}
          onExpand={() => toggleBlock(block.id)}
        />
        {bottom.map((row) => (
          <DiffRow key={row.id} row={row} />
        ))}
      </Fragment>
    )
  }

  const { stats, isIdentical } = result
  const announcement = isIdentical
    ? 'No changes.'
    : `${pluralize(stats.totalChanges, 'change')}: ${stats.additions} added, ${stats.removals} removed, ${stats.modifications} modified.`

  return (
    <div className="overflow-hidden rounded-card border border-border-default bg-surface">
      {/* Screen-reader announcement of the result summary (US1). */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      <div className="max-h-[70vh] overflow-auto">
        <DiffPanelHeader />
        <div role="table" aria-label="Side-by-side diff">
          {result.blocks.map(renderBlock)}
        </div>
      </div>
    </div>
  )
}
