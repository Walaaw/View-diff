/**
 * Domain model for the compare feature (side-by-side text diff).
 * Source of truth: specs/001-text-diff-viewer/data-model.md
 *
 * These types are pure data (no React/DOM) so they can be shared by the diff
 * engine (`features/compare/diff/`), the Web Worker, and the presentation layer.
 */

/** Classification of a rendered diff row. */
export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged'

/** One side (left or right) of a rendered row. */
export interface DiffCell {
  /** 1-based line number for this side, or null for a blank placeholder cell. */
  lineNumber: number | null
  /** Exact line text (whitespace/Unicode preserved), or null for a placeholder. */
  content: string | null
}

/** The atomic unit of the aligned side-by-side view. */
export interface DiffRow {
  /** Stable React key. */
  id: string
  type: ChangeType
  left: DiffCell
  right: DiffCell
}

/** A contiguous group of rows; unchanged groups may be collapsible. */
export interface DiffBlock {
  id: string
  kind: 'change' | 'unchanged'
  rows: DiffRow[]
  /** True only for long unchanged blocks. */
  collapsible: boolean
  /** Number of rows hidden when collapsed (0 when not collapsible). */
  hiddenCount: number
  /** Rows kept visible above the hidden gap when collapsed (change-facing context). */
  contextBefore: number
  /** Rows kept visible below the hidden gap when collapsed. */
  contextAfter: number
}

/** Summary counters for a comparison. */
export interface DiffStats {
  additions: number
  removals: number
  modifications: number
  unchanged: number
  /** additions + removals + modifications */
  totalChanges: number
}

/** Complete output of the diff engine — the view model the UI renders. */
export interface DiffResult {
  blocks: DiffBlock[]
  stats: DiffStats
  contextLines: number
  /** True when totalChanges === 0. */
  isIdentical: boolean
  /** True when both inputs have no content. */
  isEmpty: boolean
}

/** Inputs that influence computation. */
export interface DiffOptions {
  /** Context lines shown around changes (user-adjustable). */
  contextLines: number
  /** Default false — trailing whitespace is a real change per spec. */
  ignoreTrailingWhitespace?: boolean
}

/** Intermediate op produced by the jsdiff wrapper before alignment. */
export interface LineOp {
  type: 'added' | 'removed' | 'unchanged'
  lines: string[]
}

/** Compute status used by the UI for loading feedback. */
export type DiffStatus = 'idle' | 'computing' | 'ready'

/** One highlighted token within a line (US6). `className` is a highlight.js class. */
export interface Token {
  text: string
  className?: string
}

/** Highlighted tokens for a single line. */
export type LineTokens = Token[]

/** Per-side syntax tokens, indexed by (lineNumber - 1). */
export interface SyntaxResult {
  original: LineTokens[]
  modified: LineTokens[]
}

/** Language choice for syntax highlighting ('auto' = detect). */
export type Language = string

/** Default language mode. */
export const DEFAULT_LANGUAGE: Language = 'auto'

/** Selectable languages for the highlighting selector (value → label). */
export const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Language; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'plaintext', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'HTML / XML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'bash', label: 'Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
]

/** Default number of context lines around a change. */
export const DEFAULT_CONTEXT_LINES = 3

/** Selectable context-line options for the context selector. */
export const CONTEXT_LINE_OPTIONS = [1, 3, 5, 10] as const
