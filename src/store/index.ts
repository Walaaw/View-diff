import { create } from 'zustand'
import { EXAMPLE } from '@/lib/example'
import { computeDiffResult } from '@/features/compare/diff'
import {
  DEFAULT_CONTEXT_LINES,
  type DiffResult,
  type DiffStatus,
} from '@/features/compare/types'


export interface AppStore {
  original: string
  modified: string
  result: DiffResult | null
  status: DiffStatus
  setOriginal: (value: string) => void
  setModified: (value: string) => void
  /** Compare the current inputs. */
  compare: () => void
  /** Clear both inputs and the result (full reset). */
  reset: () => void
  clearOriginal: () => void
  clearModified: () => void
  /** Exchange the two sides (re-computes if a result is showing). */
  swap: () => void
  /** Populate both editors with the built-in example. */
  loadExample: () => void
}

function runDiff(original: string, modified: string): DiffResult {
  return computeDiffResult(original, modified, {
    contextLines: DEFAULT_CONTEXT_LINES,
  })
}

export const useAppStore = create<AppStore>((set, get) => ({
  original: '',
  modified: '',
  result: null,
  status: 'idle',

  setOriginal: (original) => set({ original }),
  setModified: (modified) => set({ modified }),

  compare: () => {
    const { original, modified } = get()
    set({ status: 'computing' })
    set({ result: runDiff(original, modified), status: 'ready' })
  },

  reset: () => set({ original: '', modified: '', result: null, status: 'idle' }),

  clearOriginal: () => set({ original: '' }),
  clearModified: () => set({ modified: '' }),

  swap: () => {
    const { original, modified, result } = get()
    set({
      original: modified,
      modified: original,
      // Keep the displayed diff consistent with the swapped inputs.
      ...(result ? { result: runDiff(modified, original), status: 'ready' } : {}),
    })
  },

  loadExample: () =>
    set({ original: EXAMPLE.original, modified: EXAMPLE.modified }),
}))

/** Derived selector: true when at least one side has content. */
export const selectCanCompare = (s: AppStore): boolean =>
  s.original.length > 0 || s.modified.length > 0
