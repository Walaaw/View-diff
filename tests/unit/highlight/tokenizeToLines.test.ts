import { describe, it, expect } from 'vitest'
import { tokenizeToLines } from '@/features/compare/highlight/tokenizeToLines'

/** Concatenate a line's token text back into the raw line. */
const lineText = (tokens: { text: string }[]) => tokens.map((t) => t.text).join('')

describe('tokenizeToLines', () => {
  it('returns no lines for empty input', () => {
    expect(tokenizeToLines('', 'auto')).toEqual([])
  })

  it('produces one entry per line and preserves exact text', () => {
    const code = 'const a = 1\nconst b = 2\n\nreturn a + b'
    const lines = tokenizeToLines(code, 'javascript')
    expect(lines).toHaveLength(4)
    expect(lineText(lines[0])).toBe('const a = 1')
    expect(lines[2]).toEqual([]) // blank line
    expect(lineText(lines[3])).toBe('return a + b')
  })

  it('highlights known languages with hljs class names', () => {
    const lines = tokenizeToLines('const x = 1', 'javascript')
    const classes = lines.flat().map((t) => t.className ?? '')
    expect(classes.some((c) => c.includes('hljs-'))).toBe(true)
  })

  it('keeps multi-line constructs correct across line boundaries', () => {
    const lines = tokenizeToLines('/* a\n b */', 'javascript')
    expect(lines).toHaveLength(2)
    const allClasses = lines.flat().map((t) => t.className ?? '')
    expect(allClasses.some((c) => c.includes('comment'))).toBe(true)
  })

  it('falls back to plain text for unknown languages (no throw)', () => {
    const lines = tokenizeToLines('hello world', 'not-a-language')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toEqual([{ text: 'hello world' }])
  })

  it('emits plain tokens (no classes) for plaintext', () => {
    const lines = tokenizeToLines('a\nb', 'plaintext')
    expect(lines).toEqual([[{ text: 'a' }], [{ text: 'b' }]])
  })
})
