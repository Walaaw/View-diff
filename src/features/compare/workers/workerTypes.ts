import type { DiffResult, SyntaxResult } from '../types'

/** Message sent to the diff worker. `id` correlates the response. */
export interface DiffRequest {
  id: number
  originalText: string
  modifiedText: string
  contextLines: number
  /** Whether to also compute syntax tokens (US6). */
  syntaxEnabled: boolean
  /** Language for highlighting ('auto' = detect). */
  language: string
}

/** Message returned by the diff worker. */
export interface DiffResponse {
  id: number
  result: DiffResult
  /** Per-side syntax tokens, or null when highlighting is disabled. */
  syntax: SyntaxResult | null
}
