import { describe, it, expect } from 'vitest'
import { computeDiffResult } from '@/features/compare'

describe('computeDiffResult', () => {
  it('flags two empty inputs as empty and identical', () => {
    const r = computeDiffResult('', '')
    expect(r.isEmpty).toBe(true)
    expect(r.isIdentical).toBe(true)
    expect(r.stats.totalChanges).toBe(0)
  })

  it('flags identical inputs with zero changes', () => {
    const r = computeDiffResult('a\nb\nc', 'a\nb\nc')
    expect(r.isEmpty).toBe(false)
    expect(r.isIdentical).toBe(true)
    expect(r.stats.totalChanges).toBe(0)
    expect(r.stats.unchanged).toBe(3)
  })

  it('counts additions when the right side grows', () => {
    const r = computeDiffResult('a', 'a\nb\nc')
    expect(r.stats.additions).toBe(2)
    expect(r.isIdentical).toBe(false)
  })

  it('counts removals when the left side shrinks', () => {
    const r = computeDiffResult('a\nb\nc', 'a')
    expect(r.stats.removals).toBe(2)
  })

  it('counts modifications for changed lines', () => {
    const r = computeDiffResult('a\nx\nc', 'a\ny\nc')
    expect(r.stats.modifications).toBe(1)
  })

  it('keeps the totalChanges invariant', () => {
    const r = computeDiffResult('a\nb\nc\nd', 'a\nX\ne')
    expect(r.stats.totalChanges).toBe(
      r.stats.additions + r.stats.removals + r.stats.modifications,
    )
  })

  it('handles one empty document (all removed)', () => {
    const r = computeDiffResult('a\nb', '')
    expect(r.stats.removals).toBe(2)
    expect(r.stats.additions).toBe(0)
  })

  it('treats trailing whitespace as a real change', () => {
    const r = computeDiffResult('a', 'a ')
    expect(r.isIdentical).toBe(false)
    expect(r.stats.totalChanges).toBe(1)
  })

  it('preserves multiple blank lines as separate rows', () => {
    const r = computeDiffResult('a\n\n\nb', 'a\n\n\nb')
    expect(r.stats.unchanged).toBe(4)
  })

  it('groups rows into ordered blocks', () => {
    const r = computeDiffResult('a\nb\nc', 'a\nX\nc')
    expect(r.blocks.length).toBeGreaterThan(0)
    const kinds = r.blocks.map((b) => b.kind)
    expect(kinds).toContain('change')
    expect(kinds).toContain('unchanged')
  })
})
