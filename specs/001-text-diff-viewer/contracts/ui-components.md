# Contract: UI Components (`src/components/`)

**Feature**: `001-text-diff-viewer` | **Date**: 2026-07-23

These are the presentation-layer contracts (props + behavior + accessibility) for the app. All
components consume design-system tokens (constitution v1.0.0) via Tailwind v4 utilities — no raw
hex values. Types referenced (`DiffResult`, `DiffRow`, `DiffBlock`, `DiffStats`) come from
[`data-model.md`](../data-model.md).

## Layout

### `Header`
- **Props**: `{ onReset: () => void; theme: 'dark' | 'light'; onToggleTheme: () => void; }`
- **Renders**: app logo + title (Geist/bold), theme toggle (icon button), reset button.
- **A11y**: `<header>` landmark; icon buttons have `aria-label`; reset is `type="button"`.

### `Footer`
- **Props**: none.
- **Renders**: keyboard shortcuts and navigation hints.
- **A11y**: `<footer>` landmark; shortcuts in a semantic list.

## Editors

### `TextEditor`
- **Props**: `{ id: string; label: string; value: string; onChange: (v: string) => void; onClear: () => void; placeholder?: string; }`
- **Behavior**: monospace (JetBrains Mono), supports typing + paste, preserves whitespace,
  auto-resize or scroll on overflow, visible focus ring. Clear button empties only this editor.
- **A11y**: `<label>` bound to the textarea via `htmlFor`/`id`; clear button `aria-label`.

### `EditorToolbar`
- **Props**: `{ onCompare: () => void; onSwap: () => void; onLoadExample: () => void; canCompare: boolean; isComputing: boolean; }`
- **Behavior**: Compare is the primary button (dominant); Swap, Load Example are secondary/ghost.
  Compare is disabled when `!canCompare`; shows a spinner/label when `isComputing`.
- **A11y**: buttons are focusable in logical order; disabled state communicated via `disabled`.

## Diff controls & legend

### `DiffControls`
- **Props**:
  ```ts
  {
    collapseEnabled: boolean;
    onToggleCollapse: (v: boolean) => void;
    onExpandAll: () => void;
    contextLines: number;
    onContextChange: (n: number) => void;
    stats: DiffStats;
  }
  ```
- **Renders**: collapse-unchanged toggle, expand-all button, context selector (e.g. 1/3/5/10),
  and a changes counter (badge) from `stats.totalChanges`.
- **A11y**: toggle is a labeled switch; selector is a labeled combobox/select.

### `DiffLegend`
- **Props**: none (static) or `{ stats?: DiffStats }` for per-type counts.
- **Renders**: Added / Removed / Modified / Unchanged swatches with labels.
- **A11y**: each item pairs a colored swatch with a **text label and sign** (`+`/`-`/`~`) so
  meaning is not color-only (FR-026).

## Diff viewer

### `DiffViewer`
- **Props**: `{ result: DiffResult; collapseEnabled: boolean; expandedBlockIds: Set<string>; onToggleBlock: (id: string) => void; }`
- **Behavior**: renders `result.blocks` in order; two scroll-synced columns; sticky column
  headers; line numbers per side; aligned rows; collapsed blocks render `CollapsedBlock`.
  Optional row windowing for very large results (see research D6).
- **A11y**: `<main>`/region with an accessible name; a visually-hidden live region announces
  "N changes" after compare; scrollable panels are keyboard-scrollable.

### `DiffPanelHeader`
- **Props**: `{ side: 'original' | 'modified'; title: string; }`
- **Behavior**: sticky (`position: sticky; top: 0`) header for each column.

### `DiffRow`
- **Props**: `{ row: DiffRow }`
- **Behavior**: renders left/right cells with line numbers and content; applies token classes by
  `row.type` (green/red/amber/neutral); placeholder cells render an empty, visually-muted cell.
  Content uses `white-space: pre` to preserve whitespace; long lines scroll/wrap per design.
- **A11y**: change type exposed via an icon/sign and (optionally) `aria-label` on the row.

### `CollapsedBlock`
- **Props**: `{ block: DiffBlock; onExpand: (id: string) => void; }`
- **Behavior**: shows "▸ N unchanged lines hidden" (from `block.hiddenCount`); clicking expands
  the block in place with a 150–200ms transition.
- **A11y**: rendered as a `<button>` with `aria-expanded` reflecting state.

## States

### `EmptyState`
- **Props**: `{ onLoadExample: () => void }`
- **Behavior**: shown when `result === null` (before first compare); friendly illustration, short
  helper text, and a call-to-action (Load Example / enter text).
- **A11y**: informative heading; CTA is a real button.

## UI primitives (`src/components/ui/`, via shadcn/ui)

Restyled to tokens; used across the app:

| Primitive | Variants / notes |
|-----------|------------------|
| `Button` | `primary` \| `secondary` \| `ghost` \| `icon`; radius 10px; 150–200ms transitions; visible focus ring; active/press feedback. |
| `Textarea` | monospace, focus ring, radius 10px. |
| `Badge` | change count, line count. |
| `Select` | context selector. |
| `Toggle`/`Switch` | collapse-unchanged. |
| `Tooltip` | shortcut hints (non-essential; not sole carrier of info). |

## Cross-cutting behavioral contract

| Requirement | Contract |
|-------------|----------|
| Explicit compare (FR-007) | Diff updates only when `EditorToolbar.onCompare` fires. |
| Independent clear (FR-003) | `TextEditor.onClear` affects only its own editor. |
| Swap (FR-004) | `onSwap` exchanges the two editor values. |
| Loading (FR-020) | `isComputing` disables Compare and shows feedback; UI stays responsive. |
| Interaction feedback (FR-021) | All interactive elements show hover/focus/active states. |
| Sticky + scroll sync (FR-022) | `DiffPanelHeader` sticky; `useScrollSync` mirrors both panels. |
| Responsive (FR-024) | Desktop 2-col; tablet reduced spacing side-by-side; mobile stacked editors, diff below. |
| A11y (FR-025/026) | Semantic HTML, keyboard operable, focus visible, non-color signals, WCAG-AA contrast. |

## Component/interaction test contract (Vitest + RTL — `tests/components/`)

- Typing/pasting updates editor value; Clear empties only that editor.
- Load Example populates both editors; Swap exchanges contents.
- Compare renders the viewer; identical inputs show zero-changes state; empty inputs show/keep
  the empty state appropriately.
- Collapsed block shows hidden count; expanding reveals rows; Expand All reveals all; toggling
  collapse restores collapsed state; changing context updates visible context.
- Scroll on one panel updates the other (scroll-sync hook test).
- Keyboard: all controls reachable via Tab; focus visible; icon buttons have accessible names.
