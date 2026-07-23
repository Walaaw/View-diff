import { describe, it, expect } from 'vitest'
import { alignRows, buildBlocks, computeLineOps } from '@/features/compare'

/** Build aligned rows from two line arrays. */
const rowsOf = (a: string[], b: string[]) => alignRows(computeLineOps(a, b))

describe('buildBlocks', () => {
  it('never marks change blocks collapsible', () => {
    const blocks = buildBlocks(rowsOf(['a'], ['b']), 1)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe('change')
    expect(blocks[0].collapsible).toBe(false)
    expect(blocks[0].hiddenCount).toBe(0)
  })

  it('does not collapse a middle unchanged block at the threshold (len == 2c+1)', () => {
    // c=1 → threshold 3; middle block of exactly 3 stays expanded.
    const a = ['a0', 'c1', 'c2', 'c3', 'z4']
    const b = ['b0', 'c1', 'c2', 'c3', 'w4']
    const mid = buildBlocks(rowsOf(a, b), 1)[1]
    expect(mid.kind).toBe('unchanged')
    expect(mid.rows).toHaveLength(3)
    expect(mid.collapsible).toBe(false)
  })

  it('collapses a middle unchanged block above the threshold (len > 2c+1)', () => {
    const a = ['a0', 'c1', 'c2', 'c3', 'c4', 'z5']
    const b = ['b0', 'c1', 'c2', 'c3', 'c4', 'w5']
    const mid = buildBlocks(rowsOf(a, b), 1)[1]
    expect(mid.rows).toHaveLength(4)
    expect(mid.collapsible).toBe(true)
    expect(mid.hiddenCount).toBe(2) // 4 - 1 - 1
    expect(mid.contextBefore).toBe(1)
    expect(mid.contextAfter).toBe(1)
  })

  it('keeps a larger default context (c=3) expanded until it is long enough', () => {
    const a = ['a0', 'c1', 'c2', 'c3', 'c4', 'c5', 'z6']
    const b = ['b0', 'c1', 'c2', 'c3', 'c4', 'c5', 'w6']
    const mid = buildBlocks(rowsOf(a, b), 3)[1]
    expect(mid.rows).toHaveLength(5)
    expect(mid.collapsible).toBe(false) // 5 is not > 2*3+1 = 7
  })

  it('trims a leading unchanged block (no context before the first change)', () => {
    const a = ['u0', 'u1', 'u2', 'u3', 'u4', 'z']
    const b = ['u0', 'u1', 'u2', 'u3', 'u4', 'w']
    const lead = buildBlocks(rowsOf(a, b), 1)[0]
    expect(lead.kind).toBe('unchanged')
    expect(lead.rows).toHaveLength(5)
    expect(lead.collapsible).toBe(true)
    expect(lead.contextBefore).toBe(0)
    expect(lead.contextAfter).toBe(1)
    expect(lead.hiddenCount).toBe(4) // 5 - 0 - 1
  })

  it('trims a trailing unchanged block (no context after the last change)', () => {
    const a = ['z', 'u0', 'u1', 'u2', 'u3', 'u4']
    const b = ['w', 'u0', 'u1', 'u2', 'u3', 'u4']
    const tail = buildBlocks(rowsOf(a, b), 1)[1]
    expect(tail.kind).toBe('unchanged')
    expect(tail.contextBefore).toBe(1)
    expect(tail.contextAfter).toBe(0)
    expect(tail.hiddenCount).toBe(4)
  })

  it('collapses a fully identical document into a single hidden block', () => {
    const same = ['u0', 'u1', 'u2', 'u3', 'u4']
    const blocks = buildBlocks(rowsOf(same, same), 1)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].collapsible).toBe(true)
    expect(blocks[0].contextBefore).toBe(0)
    expect(blocks[0].contextAfter).toBe(0)
    expect(blocks[0].hiddenCount).toBe(5)
  })
})
