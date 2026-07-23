import { describe, it, expect } from 'vitest'
import { computeLineOps } from '@/lib/diff/computeDiff'
import { alignRows } from '@/lib/diff/alignRows'
import type { DiffRow } from '@/types/diff'

/** Helper: build rows from two line arrays. */
function rowsFor(a: string[], b: string[]): DiffRow[] {
  return alignRows(computeLineOps(a, b))
}

describe('alignRows', () => {
  it('marks identical lines as unchanged with matching line numbers', () => {
    const rows = rowsFor(['a', 'b'], ['a', 'b'])
    expect(rows).toHaveLength(2)
    expect(rows.every((r) => r.type === 'unchanged')).toBe(true)
    expect(rows[0].left.lineNumber).toBe(1)
    expect(rows[0].right.lineNumber).toBe(1)
  })

  it('handles add-only as added rows with left placeholders', () => {
    const rows = rowsFor(['a'], ['a', 'b', 'c'])
    const added = rows.filter((r) => r.type === 'added')
    expect(added).toHaveLength(2)
    expect(added.every((r) => r.left.content === null && r.left.lineNumber === null)).toBe(true)
    expect(added.map((r) => r.right.content)).toEqual(['b', 'c'])
  })

  it('handles remove-only as removed rows with right placeholders', () => {
    const rows = rowsFor(['a', 'b', 'c'], ['a'])
    const removed = rows.filter((r) => r.type === 'removed')
    expect(removed).toHaveLength(2)
    expect(removed.every((r) => r.right.content === null && r.right.lineNumber === null)).toBe(true)
  })

  it('pairs adjacent removed+added into modified rows', () => {
    const rows = rowsFor(['a', 'x', 'c'], ['a', 'y', 'c'])
    const modified = rows.filter((r) => r.type === 'modified')
    expect(modified).toHaveLength(1)
    expect(modified[0].left.content).toBe('x')
    expect(modified[0].right.content).toBe('y')
  })

  it('pairs where possible and leaves surplus as removed/added', () => {
    // 2 removed vs 1 added → 1 modified + 1 removed
    const rows = rowsFor(['a', 'x1', 'x2', 'c'], ['a', 'y1', 'c'])
    expect(rows.filter((r) => r.type === 'modified')).toHaveLength(1)
    expect(rows.filter((r) => r.type === 'removed')).toHaveLength(1)
  })

  it('keeps independent left/right line numbering across changes', () => {
    const rows = rowsFor(['a', 'b'], ['a', 'c', 'd'])
    const lastUnchangedOrModified = rows[rows.length - 1]
    // right side has 3 lines, left has 2
    const maxRight = Math.max(
      ...rows.map((r) => r.right.lineNumber ?? 0),
    )
    const maxLeft = Math.max(...rows.map((r) => r.left.lineNumber ?? 0))
    expect(maxRight).toBe(3)
    expect(maxLeft).toBe(2)
    expect(lastUnchangedOrModified).toBeDefined()
  })

  it('treats completely different documents with no unchanged rows', () => {
    const rows = rowsFor(['a', 'b'], ['c', 'd'])
    expect(rows.some((r) => r.type === 'unchanged')).toBe(false)
  })
})
