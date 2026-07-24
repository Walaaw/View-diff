import { computeDiffResult } from './diff'
import { tokenizeToLines } from './highlight/tokenizeToLines'
import type { DiffResult, SyntaxResult } from './types'

export interface RunCompareOptions {
  contextLines: number
  syntaxEnabled: boolean
  language: string
}

export interface RunCompareOutput {
  result: DiffResult
  /** Per-side syntax tokens, or null when highlighting is disabled. */
  syntax: SyntaxResult | null
}

/**
 * Compute the diff and (optionally) per-line syntax tokens together. Pure and
 * React/DOM-free so it runs identically on the main thread, in the Web Worker,
 * and under tests.
 */
export function runCompare(
  original: string,
  modified: string,
  { contextLines, syntaxEnabled, language }: RunCompareOptions,
): RunCompareOutput {
  const result = computeDiffResult(original, modified, { contextLines })
  const syntax: SyntaxResult | null = syntaxEnabled
    ? {
        original: tokenizeToLines(original, language),
        modified: tokenizeToLines(modified, language),
      }
    : null
  return { result, syntax }
}
