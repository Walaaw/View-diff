import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAppStore } from '@/store'
import { computeDiffResult } from '@/features/compare'
import type { RunCompareOutput } from '@/features/compare/runCompare'
import {
  __setDiffClientForTests,
  __resetDiffClientForTests,
} from '@/features/compare/workers/diffClient'
import type { DiffRequest } from '@/features/compare/workers/workerTypes'

/**
 * Captured worker calls so each test can resolve them manually and control
 * ordering (to exercise stale-result discarding). The worker is stubbed to run
 * the *real* pure engine, per the diff-engine worker contract.
 */
const deferreds: Array<{
  req: DiffRequest
  resolve: (out: RunCompareOutput) => void
}> = []

function resolveWith(entry: (typeof deferreds)[number]) {
  entry.resolve({
    result: computeDiffResult(entry.req.originalText, entry.req.modifiedText, {
      contextLines: entry.req.contextLines,
    }),
    syntax: null,
  })
}

// Flush pending microtasks (the .then() that applies the worker result).
const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  deferreds.length = 0
  __setDiffClientForTests({
    // Force the worker path so we can observe async status transitions.
    shouldUseWorker: () => true,
    requestDiffViaWorker: (req) =>
      new Promise((resolve) => {
        deferreds.push({ req, resolve })
      }),
  })
})

afterEach(() => {
  __resetDiffClientForTests()
})

describe('store loading + worker orchestration', () => {
  it('transitions idle -> computing -> ready', async () => {
    useAppStore.getState().setOriginal('alpha')
    useAppStore.getState().setModified('beta')
    expect(useAppStore.getState().status).toBe('idle')

    useAppStore.getState().compare()
    expect(useAppStore.getState().status).toBe('computing')
    expect(useAppStore.getState().result).toBeNull()
    expect(deferreds).toHaveLength(1)

    resolveWith(deferreds[0])
    await flush()

    expect(useAppStore.getState().status).toBe('ready')
    expect(useAppStore.getState().result).not.toBeNull()
  })

  it('discards stale results when a newer compare has started', async () => {
    useAppStore.getState().setOriginal('first')
    useAppStore.getState().setModified('x')
    useAppStore.getState().compare() // request #1

    useAppStore.getState().setOriginal('second')
    useAppStore.getState().compare() // request #2 (latest)

    expect(deferreds).toHaveLength(2)

    // Resolve the latest first — it should be applied.
    resolveWith(deferreds[1])
    await flush()
    const latestResult = useAppStore.getState().result
    expect(latestResult).not.toBeNull()

    // Now resolve the older, superseded request — it must be ignored.
    resolveWith(deferreds[0])
    await flush()
    expect(useAppStore.getState().result).toBe(latestResult)
    expect(useAppStore.getState().status).toBe('ready')
  })
})
