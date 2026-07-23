import {
  DEFAULT_CONTEXT_LINES,
  type DiffBlock,
  type DiffOptions,
  type DiffResult,
  type DiffRow,
} from '@/types/diff'
import { toLines } from '@/lib/utils'
import { computeLineOps, computeStats } from './computeDiff'
import { alignRows } from './alignRows'

/**
 * Group consecutive rows into blocks by nature (change vs unchanged).
 * Phase 3: no collapsing yet — every block is fully expanded. Phase 5 (US3)
 * replaces this with collapse-aware block building.
 */
function groupBlocks(rows: DiffRow[]): DiffBlock[] {
  const blocks: DiffBlock[] = []
  let current: DiffBlock | null = null
  let key = 0

  for (const row of rows) {
    const kind: DiffBlock['kind'] =
      row.type === 'unchanged' ? 'unchanged' : 'change'
    if (!current || current.kind !== kind) {
      current = {
        id: `block-${key++}`,
        kind,
        rows: [],
        collapsible: false,
        hiddenCount: 0,
      }
      blocks.push(current)
    }
    current.rows.push(row)
  }

  return blocks
}

/**
 * Compute the aligned, side-by-side view model for two texts.
 * Pure and deterministic. See contracts/diff-engine.md.
 */
export function computeDiffResult(
  originalText: string,
  modifiedText: string,
  options: Partial<DiffOptions> = {},
): DiffResult {
  const contextLines = options.contextLines ?? DEFAULT_CONTEXT_LINES

  const originalLines = toLines(originalText)
  const modifiedLines = toLines(modifiedText)
  const isEmpty = originalLines.length === 0 && modifiedLines.length === 0

  const ops = computeLineOps(originalLines, modifiedLines)
  const rows = alignRows(ops)
  const stats = computeStats(rows)
  const blocks = groupBlocks(rows)

  return {
    blocks,
    stats,
    contextLines,
    isIdentical: stats.totalChanges === 0,
    isEmpty,
  }
}

export { computeLineOps, computeStats } from './computeDiff'
export { alignRows } from './alignRows'
