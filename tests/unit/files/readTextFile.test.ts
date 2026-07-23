import { describe, it, expect } from 'vitest'
import {
  readTextFile,
  classifyFile,
  MAX_FILE_BYTES,
} from '@/features/compare/files/readTextFile'

describe('classifyFile', () => {
  it('accepts text MIME types and known code extensions', () => {
    expect(classifyFile(new File(['x'], 'a.txt', { type: 'text/plain' }))).toBe(true)
    expect(classifyFile(new File(['x'], 'a.ts', { type: '' }))).toBe(true)
    expect(classifyFile(new File(['x'], 'a.json', { type: 'application/json' }))).toBe(true)
  })

  it('rejects known binary MIME types', () => {
    expect(classifyFile(new File(['x'], 'a.png', { type: 'image/png' }))).toBe(false)
    expect(classifyFile(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toBe(false)
  })

  it('is ambiguous for unknown extension + empty type', () => {
    expect(classifyFile(new File(['x'], 'a.dat', { type: '' }))).toBeNull()
  })
})

describe('readTextFile', () => {
  it('reads text preserving exact content (whitespace, newlines)', async () => {
    const content = 'line 1\r\n  indented\n\nlast'
    const result = await readTextFile(
      new File([content], 'notes.txt', { type: 'text/plain' }),
    )
    expect(result).toEqual({ ok: true, text: content })
  })

  it('rejects files over the size limit without reading them', async () => {
    const file = new File(['x'], 'big.txt', { type: 'text/plain' })
    Object.defineProperty(file, 'size', { value: MAX_FILE_BYTES + 1 })
    const result = await readTextFile(file)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/too large/i)
  })

  it('rejects non-text files by MIME type', async () => {
    const result = await readTextFile(
      new File(['\u0089PNG'], 'img.png', { type: 'image/png' }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/not a text file/i)
  })

  it('rejects binary content (NUL bytes) for ambiguous files', async () => {
    const result = await readTextFile(
      new File(['abc\u0000def'], 'blob.dat', { type: '' }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/not a text file/i)
  })
})
