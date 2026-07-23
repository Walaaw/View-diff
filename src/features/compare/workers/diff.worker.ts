/// <reference lib="webworker" />
import { computeDiffResult } from '../diff'
import type { DiffRequest, DiffResponse } from './workerTypes'

/**
 * Off-main-thread diff computation. Imports and calls the same pure
 * `computeDiffResult` used on the main thread — no diff logic is duplicated
 * (see contracts/diff-engine.md worker contract).
 */
self.addEventListener('message', (event: MessageEvent<DiffRequest>) => {
  const { id, originalText, modifiedText, contextLines } = event.data
  const result = computeDiffResult(originalText, modifiedText, { contextLines })
  const response: DiffResponse = { id, result }
  ;(self as unknown as DedicatedWorkerGlobalScope).postMessage(response)
})
