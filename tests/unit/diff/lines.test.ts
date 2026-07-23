import { describe, it, expect } from 'vitest'
import { normalizeEol, toLines } from '@/lib/utils'

describe('normalizeEol', () => {
  it('converts CRLF and CR to LF only', () => {
    expect(normalizeEol('a\r\nb\rc\nd')).toBe('a\nb\nc\nd')
  })

  it('leaves other content (including trailing whitespace) untouched', () => {
    expect(normalizeEol('a  \n\tb')).toBe('a  \n\tb')
  })
})

describe('toLines', () => {
  it('returns an empty array for an empty string', () => {
    expect(toLines('')).toEqual([])
  })

  it('preserves blank lines and trailing whitespace', () => {
    expect(toLines('a\n\n b \n')).toEqual(['a', '', ' b ', ''])
  })

  it('preserves Unicode characters', () => {
    expect(toLines('café\n日本語\n😀')).toEqual(['café', '日本語', '😀'])
  })

  it('normalizes CRLF before splitting', () => {
    expect(toLines('x\r\ny')).toEqual(['x', 'y'])
  })
})
