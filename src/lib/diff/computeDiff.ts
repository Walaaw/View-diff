import { diffArrays } from 'diff'
import type { DiffRow, DiffStats, LineOp } from '@/types/diff'

/**
 * Wrap jsdiff's array diff to produce ordered line operations.
 * Operating on line arrays (rather than raw strings) keeps content exact —
 * whitespace, blank lines, and Unicode are compared and preserved verbatim.
 */
export function computeLineOps(a: string[], b: string[]): LineOp[] {
  const parts = diffArrays(a, b)
  return parts.map((part) => ({
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
    lines: part.value,
  }))
}

/** Count rows by change type. */
export function computeStats(rows: DiffRow[]): DiffStats {
  let additions = 0
  let removals = 0
  let modifications = 0
  let unchanged = 0

  for (const row of rows) {
    switch (row.type) {
      case 'added':
        additions++
        break
      case 'removed':
        removals++
        break
      case 'modified':
        modifications++
        break
      case 'unchanged':
        unchanged++
        break
    }
  }

  return {
    additions,
    removals,
    modifications,
    unchanged,
    totalChanges: additions + removals + modifications,
  }
}
