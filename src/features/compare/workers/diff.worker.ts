/// <reference lib="webworker" />
import { runCompare } from '../runCompare'
import type { DiffRequest, DiffResponse } from './workerTypes'

/**
 * Off-main-thread diff + syntax tokenization. Imports and calls the same pure
 * `runCompare` used on the main thread — no logic is duplicated (see
 * contracts/diff-engine.md worker contract).
 */
self.addEventListener('message', (event: MessageEvent<DiffRequest>) => {
  const { id, originalText, modifiedText, contextLines, syntaxEnabled, language } =
    event.data
  const { result, syntax } = runCompare(originalText, modifiedText, {
    contextLines,
    syntaxEnabled,
    language,
  })
  const response: DiffResponse = { id, result, syntax }
  ;(self as unknown as DedicatedWorkerGlobalScope).postMessage(response)
})
