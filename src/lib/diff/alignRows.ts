import type { DiffRow, LineOp } from '@/types/diff'

/**
 * Convert ordered line operations into aligned side-by-side rows.
 *
 * Rules (see contracts/diff-engine.md):
 *  - unchanged → both cells populated, same visual row
 *  - a `removed` run immediately followed by an `added` run is paired
 *    row-by-row into `modified` rows; surplus lines become `removed`/`added`
 *  - isolated `removed`/`added` fill the opposite side with a placeholder cell
 *  - left/right line numbers are independent 1-based sequences that skip
 *    placeholder cells
 */
export function alignRows(ops: LineOp[]): DiffRow[] {
  const rows: DiffRow[] = []
  let leftNo = 0
  let rightNo = 0
  let key = 0

  const nextId = () => `row-${key++}`

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]

    if (op.type === 'unchanged') {
      for (const content of op.lines) {
        leftNo++
        rightNo++
        rows.push({
          id: nextId(),
          type: 'unchanged',
          left: { lineNumber: leftNo, content },
          right: { lineNumber: rightNo, content },
        })
      }
      continue
    }

    if (op.type === 'removed') {
      const next = ops[i + 1]
      if (next && next.type === 'added') {
        // Pair removed + added → modified (row by row), then surplus.
        const removed = op.lines
        const added = next.lines
        const pairCount = Math.min(removed.length, added.length)

        for (let k = 0; k < pairCount; k++) {
          leftNo++
          rightNo++
          rows.push({
            id: nextId(),
            type: 'modified',
            left: { lineNumber: leftNo, content: removed[k] },
            right: { lineNumber: rightNo, content: added[k] },
          })
        }
        for (let k = pairCount; k < removed.length; k++) {
          leftNo++
          rows.push({
            id: nextId(),
            type: 'removed',
            left: { lineNumber: leftNo, content: removed[k] },
            right: { lineNumber: null, content: null },
          })
        }
        for (let k = pairCount; k < added.length; k++) {
          rightNo++
          rows.push({
            id: nextId(),
            type: 'added',
            left: { lineNumber: null, content: null },
            right: { lineNumber: rightNo, content: added[k] },
          })
        }
        i++ // consumed the following `added` op
        continue
      }

      // Standalone removed run.
      for (const content of op.lines) {
        leftNo++
        rows.push({
          id: nextId(),
          type: 'removed',
          left: { lineNumber: leftNo, content },
          right: { lineNumber: null, content: null },
        })
      }
      continue
    }

    // op.type === 'added' (standalone; paired case handled above)
    for (const content of op.lines) {
      rightNo++
      rows.push({
        id: nextId(),
        type: 'added',
        left: { lineNumber: null, content: null },
        right: { lineNumber: rightNo, content },
      })
    }
  }

  return rows
}
