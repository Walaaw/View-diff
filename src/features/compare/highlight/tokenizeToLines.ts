import { createLowlight } from 'lowlight'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import { normalizeEol } from '@/lib/utils'
import type { LineTokens, Token } from '../types'

/** Curated language set (keeps the bundle reasonable vs. all of highlight.js). */
const lowlight = createLowlight({
  bash,
  c,
  cpp,
  csharp,
  css,
  go,
  java,
  javascript,
  json,
  markdown,
  php,
  python,
  ruby,
  rust,
  sql,
  typescript,
  xml,
  yaml,
})

/** Minimal hast shape we consume (avoids a hard dependency on hast types). */
type HastNode =
  | { type: 'text'; value: string }
  | {
      type: 'element'
      properties?: { className?: string[] | string }
      children: HastNode[]
    }
  | { type: 'root'; children: HastNode[] }

/** Depth-first flatten to a flat token stream, carrying the nearest class name. */
function flatten(node: HastNode, className: string | undefined, out: Token[]) {
  if (node.type === 'text') {
    if (node.value) out.push({ text: node.value, className })
    return
  }
  if (node.type === 'element') {
    const cls = node.properties?.className
    const name = Array.isArray(cls) ? cls.join(' ') : (cls ?? className)
    for (const child of node.children) flatten(child, name, out)
    return
  }
  for (const child of node.children) flatten(child, className, out)
}

/** Split a flat token stream into per-line token arrays on `\n`. */
function splitIntoLines(tokens: Token[]): LineTokens[] {
  const lines: LineTokens[] = [[]]
  for (const tok of tokens) {
    const parts = tok.text.split('\n')
    parts.forEach((part, i) => {
      if (i > 0) lines.push([])
      if (part !== '') {
        lines[lines.length - 1].push({ text: part, className: tok.className })
      }
    })
  }
  return lines
}

/** Plain-text fallback: one token per non-empty line, no classes. */
function plainLines(normalized: string): LineTokens[] {
  return normalized.split('\n').map((line) => (line === '' ? [] : [{ text: line }]))
}

/**
 * Highlight a whole document and return tokens grouped by line. Deriving from
 * the whole document (not per line) keeps multi-line constructs correct. The
 * result has exactly one entry per line of `normalizeEol(text)`, so it aligns
 * with `toLines()` and can be indexed by `lineNumber - 1`.
 *
 * Never throws: unknown/undetected languages fall back to plain text.
 */
export function tokenizeToLines(text: string, language: string): LineTokens[] {
  const normalized = normalizeEol(text)
  if (normalized === '') return []
  if (language === 'plaintext' || language === 'text') return plainLines(normalized)

  try {
    const tree =
      language === 'auto'
        ? lowlight.highlightAuto(normalized)
        : lowlight.highlight(language, normalized)
    const tokens: Token[] = []
    flatten(tree as unknown as HastNode, undefined, tokens)
    return splitIntoLines(tokens)
  } catch {
    return plainLines(normalized)
  }
}
