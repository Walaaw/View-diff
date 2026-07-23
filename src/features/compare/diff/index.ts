import {
  DEFAULT_CONTEXT_LINES,
  type DiffOptions,
  type DiffResult,
} from '../types'
import { toLines } from '@/lib/utils'
import { computeLineOps, computeStats } from './computeDiff'
import { alignRows } from './alignRows'
import { buildBlocks } from './collapse'

/**
 * Compute the aligned, collapsible side-by-side view model for two texts.
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
  const blocks = buildBlocks(rows, contextLines)

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
export { buildBlocks } from './collapse'
