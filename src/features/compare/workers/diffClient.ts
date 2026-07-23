import type { DiffResult } from '../types'
import type { DiffRequest, DiffResponse } from './workerTypes'

/**
 * Total input length (original + modified, in characters) above which a compare
 * is offloaded to the Web Worker so the main thread stays responsive.
 */
export const WORKER_CHAR_THRESHOLD = 15_000

function defaultShouldUseWorker(original: string, modified: string): boolean {
  return original.length + modified.length > WORKER_CHAR_THRESHOLD
}

let worker: Worker | null = null
const pending = new Map<number, (result: DiffResult) => void>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./diff.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.addEventListener('message', (event: MessageEvent<DiffResponse>) => {
      const { id, result } = event.data
      const resolve = pending.get(id)
      if (resolve) {
        pending.delete(id)
        resolve(result)
      }
    })
  }
  return worker
}

function defaultRequestDiffViaWorker(req: DiffRequest): Promise<DiffResult> {
  return new Promise((resolve) => {
    pending.set(req.id, resolve)
    getWorker().postMessage(req)
  })
}

// Swappable implementations behind a seam. jsdom has no Web Worker, so tests
// override these to exercise the store's async/staleness orchestration without
// a real worker (see tests/components/store.loading.test.ts).
let shouldUseWorkerImpl = defaultShouldUseWorker
let requestDiffViaWorkerImpl = defaultRequestDiffViaWorker

/** Whether a compare of these inputs should be offloaded to the worker. */
export function shouldUseWorker(original: string, modified: string): boolean {
  return shouldUseWorkerImpl(original, modified)
}

/**
 * Compute a diff on the worker. The returned promise resolves with the result
 * whose `id` matches this request; the caller discards results that have since
 * been superseded (staleness).
 */
export function requestDiffViaWorker(req: DiffRequest): Promise<DiffResult> {
  return requestDiffViaWorkerImpl(req)
}

export interface DiffClientOverrides {
  shouldUseWorker?: (original: string, modified: string) => boolean
  requestDiffViaWorker?: (req: DiffRequest) => Promise<DiffResult>
}

/** Test seam: override the worker client implementation. */
export function __setDiffClientForTests(overrides: DiffClientOverrides): void {
  shouldUseWorkerImpl = overrides.shouldUseWorker ?? defaultShouldUseWorker
  requestDiffViaWorkerImpl =
    overrides.requestDiffViaWorker ?? defaultRequestDiffViaWorker
}

/** Test seam: restore the real worker client implementation. */
export function __resetDiffClientForTests(): void {
  shouldUseWorkerImpl = defaultShouldUseWorker
  requestDiffViaWorkerImpl = defaultRequestDiffViaWorker
}
