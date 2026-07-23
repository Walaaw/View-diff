import type { DiffBlock, DiffRow } from '../types'

/** Group consecutive rows into alternating change / unchanged runs. */
function groupByKind(rows: DiffRow[]): { kind: DiffBlock['kind']; rows: DiffRow[] }[] {
  const groups: { kind: DiffBlock['kind']; rows: DiffRow[] }[] = []
  let current: { kind: DiffBlock['kind']; rows: DiffRow[] } | null = null

  for (const row of rows) {
    const kind: DiffBlock['kind'] =
      row.type === 'unchanged' ? 'unchanged' : 'change'
    if (!current || current.kind !== kind) {
      current = { kind, rows: [] }
      groups.push(current)
    }
    current.rows.push(row)
  }

  return groups
}

export function buildBlocks(rows: DiffRow[], contextLines: number): DiffBlock[] {
  const groups = groupByKind(rows)
  const context = Math.max(0, contextLines)

  return groups.map((group, i) => {
    const id = `block-${i}`
    const len = group.rows.length

    if (group.kind === 'change') {
      return {
        id,
        kind: group.kind,
        rows: group.rows,
        collapsible: false,
        hiddenCount: 0,
        contextBefore: 0,
        contextAfter: 0,
      }
    }

    // Unchanged block: neighbors are always change blocks (runs alternate).
    const hasChangeBefore = i > 0
    const hasChangeAfter = i < groups.length - 1
    const contextBefore = hasChangeBefore ? context : 0
    const contextAfter = hasChangeAfter ? context : 0

    const collapsible = len > contextBefore + contextAfter + 1
    const hiddenCount = collapsible ? len - contextBefore - contextAfter : 0

    return {
      id,
      kind: group.kind,
      rows: group.rows,
      collapsible,
      hiddenCount,
      contextBefore: collapsible ? contextBefore : 0,
      contextAfter: collapsible ? contextAfter : 0,
    }
  })
}
