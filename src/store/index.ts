import { create } from 'zustand'
import { EXAMPLE } from '@/lib/example'
import { runCompare, type RunCompareOutput } from '@/features/compare/runCompare'
import {
  shouldUseWorker,
  requestDiffViaWorker,
} from '@/features/compare/workers/diffClient'
import {
  DEFAULT_CONTEXT_LINES,
  DEFAULT_LANGUAGE,
  type DiffResult,
  type DiffStatus,
  type Language,
  type SyntaxResult,
} from '@/features/compare/types'

/**
 * The single global application store. The app is currently one feature
 * (compare), so state + actions live here directly. When a second feature is
 * added, split this into per-feature slices (see docs) — components only ever
 * touch `useAppStore`, so that refactor won't reach into feature code.
 */
export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'view-diff-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  // Dark-first per the constitution; only an explicit stored choice overrides.
  return stored === 'light' ? 'light' : 'dark'
}

export interface AppStore {
  // --- inputs & result ---
  original: string
  modified: string
  result: DiffResult | null
  status: DiffStatus
  /** Monotonic id of the latest compare; used to discard stale worker results. */
  requestId: number

  // --- syntax highlighting (US6) ---
  /** Whether syntax highlighting is applied to the diff (default on). */
  syntaxEnabled: boolean
  /** Selected language ('auto' = detect). */
  language: Language
  /** Per-side syntax tokens for the current result, or null when off. */
  syntax: SyntaxResult | null
  /** Toggle syntax highlighting and recompute tokens for the current inputs. */
  setSyntaxEnabled: (enabled: boolean) => void
  /** Change the highlighting language and recompute for the current inputs. */
  setLanguage: (language: Language) => void

  // --- app chrome ---
  /** Active color theme (dark default). */
  theme: Theme
  /** Toggle between dark and light and persist the choice. */
  toggleTheme: () => void

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

export const useAppStore = create<AppStore>((set, get) => {
  /**
   * Run a compare (diff + optional syntax tokens), choosing the sync path
   * (small inputs) or the worker (large inputs). Output is applied only if this
   * request is still the latest — superseded (stale) results are discarded.
   * Block expansions are managed by the callers, not here, so recomputes that
   * don't change block structure (e.g. syntax toggles) preserve them.
   */
  const compute = (
    original: string,
    modified: string,
    contextLines: number,
  ) => {
    const { syntaxEnabled, language } = get()
    const id = get().requestId + 1
    set({ requestId: id, status: 'computing' })

    const finish = (out: RunCompareOutput) => {
      if (get().requestId !== id) return // stale — a newer compare has started
      set({ result: out.result, syntax: out.syntax, status: 'ready' })
    }

    if (!shouldUseWorker(original, modified)) {
      finish(runCompare(original, modified, { contextLines, syntaxEnabled, language }))
      return
    }
    requestDiffViaWorker({
      id,
      originalText: original,
      modifiedText: modified,
      contextLines,
      syntaxEnabled,
      language,
    }).then(finish)
  }

  return {
    original: '',
    modified: '',
    result: null,
    status: 'idle',
    requestId: 0,

    syntaxEnabled: true,
    language: DEFAULT_LANGUAGE,
    syntax: null,
    setSyntaxEnabled: (enabled) => {
      const { original, modified, result, contextLines } = get()
      set({ syntaxEnabled: enabled })
      // Block structure is unchanged, so expansions are preserved.
      if (result) compute(original, modified, contextLines)
    },
    setLanguage: (language) => {
      const { original, modified, result, contextLines } = get()
      set({ language })
      if (result) compute(original, modified, contextLines)
    },

    theme: getInitialTheme(),
    toggleTheme: () => {
      const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme)
      }
      set({ theme })
    },

    contextLines: DEFAULT_CONTEXT_LINES,
    collapseEnabled: true,
    expandedBlockIds: new Set<string>(),

    setOriginal: (original) => set({ original }),
    setModified: (modified) => set({ modified }),

    compare: () => {
      const { original, modified, contextLines } = get()
      set({ expandedBlockIds: new Set<string>() })
      compute(original, modified, contextLines)
    },

    reset: () =>
      set({
        original: '',
        modified: '',
        result: null,
        syntax: null,
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
      if (result) {
        set({ expandedBlockIds: new Set<string>() })
        compute(modified, original, contextLines)
      }
    },

    loadExample: () =>
      set({ original: EXAMPLE.original, modified: EXAMPLE.modified }),

    setContextLines: (n) => {
      const { original, modified, result } = get()
      set({ contextLines: n })
      // Block ids change with context, so drop manual expansions.
      if (result) {
        set({ expandedBlockIds: new Set<string>() })
        compute(original, modified, n)
      }
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
