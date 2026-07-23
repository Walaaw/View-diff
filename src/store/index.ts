import { create } from 'zustand'
import { EXAMPLE } from '@/lib/example'
import { computeDiffResult } from '@/features/compare/diff'
import {
  shouldUseWorker,
  requestDiffViaWorker,
} from '@/features/compare/workers/diffClient'
import {
  DEFAULT_CONTEXT_LINES,
  type DiffResult,
  type DiffStatus,
} from '@/features/compare/types'

/**
 * The single global application store. The app is currently one feature
 * (compare), so state + actions live here directly. When a second feature is
 * added, split this into per-feature slices (see docs) — components only ever
 * touch `useAppStore`, so that refactor won't reach into feature code.
 */
export interface AppStore {
  // --- inputs & result ---
  original: string
  modified: string
  result: DiffResult | null
  status: DiffStatus
  /** Monotonic id of the latest compare; used to discard stale worker results. */
  requestId: number

  // --- collapse / context UI state (US3) ---
  /** Context lines shown around changes; drives collapse building. */
  contextLines: number
  /** Global collapse toggle; when false, everything is expanded. */
  collapseEnabled: boolean
  /** Per-block manual overrides (block ids the user expanded). */
  expandedBlockIds: Set<string>

  setOriginal: (value: string) => void
  setModified: (value: string) => void
  /** Compare the current inputs (sync for small inputs, worker for large). */
  compare: () => void
  /** Clear both inputs and the result (full reset). */
  reset: () => void
  clearOriginal: () => void
  clearModified: () => void
  /** Exchange the two sides (re-computes if a result is showing). */
  swap: () => void
  /** Populate both editors with the built-in example. */
  loadExample: () => void

  /** Change context lines and recompute (resets manual expansions). */
  setContextLines: (n: number) => void
  /** Enable/disable auto-collapse; enabling restores automatic collapsing. */
  setCollapseEnabled: (enabled: boolean) => void
  /** Expand/collapse a single block by id. */
  toggleBlock: (id: string) => void
  /** Expand every collapsible block in the current result. */
  expandAll: () => void
}

function runDiff(
  original: string,
  modified: string,
  contextLines: number,
): DiffResult {
  return computeDiffResult(original, modified, { contextLines })
}

export const useAppStore = create<AppStore>((set, get) => {
  /**
   * Run a compare, choosing the sync path (small inputs) or the worker
   * (large inputs). Results are applied only if this request is still the
   * latest — superseded (stale) results are discarded.
   */
  const compute = (
    original: string,
    modified: string,
    contextLines: number,
  ) => {
    const id = get().requestId + 1
    set({ requestId: id, status: 'computing' })

    const finish = (result: DiffResult) => {
      if (get().requestId !== id) return // stale — a newer compare has started
      set({ result, status: 'ready', expandedBlockIds: new Set<string>() })
    }

    if (!shouldUseWorker(original, modified)) {
      finish(runDiff(original, modified, contextLines))
      return
    }
    requestDiffViaWorker({
      id,
      originalText: original,
      modifiedText: modified,
      contextLines,
    }).then(finish)
  }

  return {
    original: '',
    modified: '',
    result: null,
    status: 'idle',
    requestId: 0,

    contextLines: DEFAULT_CONTEXT_LINES,
    collapseEnabled: true,
    expandedBlockIds: new Set<string>(),

    setOriginal: (original) => set({ original }),
    setModified: (modified) => set({ modified }),

    compare: () => {
      const { original, modified, contextLines } = get()
      compute(original, modified, contextLines)
    },

    reset: () =>
      set({
        original: '',
        modified: '',
        result: null,
        status: 'idle',
        // Invalidate any in-flight worker compare so it can't repopulate.
        requestId: get().requestId + 1,
        collapseEnabled: true,
        expandedBlockIds: new Set<string>(),
      }),

    clearOriginal: () => set({ original: '' }),
    clearModified: () => set({ modified: '' }),

    swap: () => {
      const { original, modified, result, contextLines } = get()
      set({ original: modified, modified: original })
      // Keep the displayed diff consistent with the swapped inputs.
      if (result) compute(modified, original, contextLines)
    },

    loadExample: () =>
      set({ original: EXAMPLE.original, modified: EXAMPLE.modified }),

    setContextLines: (n) => {
      const { original, modified, result } = get()
      set({ contextLines: n })
      if (result) compute(original, modified, n)
    },

    setCollapseEnabled: (enabled) =>
      set({
        collapseEnabled: enabled,
        // Re-enabling restores automatic collapsing (drops manual expansions).
        ...(enabled ? { expandedBlockIds: new Set<string>() } : {}),
      }),

    toggleBlock: (id) => {
      const next = new Set(get().expandedBlockIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      set({ expandedBlockIds: next })
    },

    expandAll: () => {
      const { result } = get()
      if (!result) return
      const ids = result.blocks.filter((b) => b.collapsible).map((b) => b.id)
      set({ expandedBlockIds: new Set(ids) })
    },
  }
})

/** Derived selector: true when at least one side has content. */
export const selectCanCompare = (s: AppStore): boolean =>
  s.original.length > 0 || s.modified.length > 0

/** Whether a given block should render collapsed right now. */
export function selectIsBlockCollapsed(
  s: AppStore,
  blockId: string,
  collapsible: boolean,
): boolean {
  return s.collapseEnabled && collapsible && !s.expandedBlockIds.has(blockId)
}
