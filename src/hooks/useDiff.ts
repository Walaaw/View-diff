import { useCallback, useState } from 'react'
import { computeDiffResult } from '@/lib/diff'
import {
  DEFAULT_CONTEXT_LINES,
  type DiffResult,
  type DiffStatus,
} from '@/types/diff'

export interface UseDiffResult {
  result: DiffResult | null
  status: DiffStatus
  /** Compute the diff for the given texts (explicit Compare action). */
  compare: (original: string, modified: string, contextLines?: number) => void
  /** Clear the current result (back to the empty state). */
  reset: () => void
}

/**
 * Orchestrates diff computation. Phase 3: synchronous compute on an explicit
 * Compare action. Phase 6 (US4) adds Web Worker offloading + loading state for
 * large inputs; the `status` field is already surfaced for that purpose.
 */
export function useDiff(): UseDiffResult {
  const [result, setResult] = useState<DiffResult | null>(null)
  const [status, setStatus] = useState<DiffStatus>('idle')

  const compare = useCallback(
    (original: string, modified: string, contextLines = DEFAULT_CONTEXT_LINES) => {
      setStatus('computing')
      const next = computeDiffResult(original, modified, { contextLines })
      setResult(next)
      setStatus('ready')
    },
    [],
  )

  const reset = useCallback(() => {
    setResult(null)
    setStatus('idle')
  }, [])

  return { result, status, compare, reset }
}
