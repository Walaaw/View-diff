# Phase 1 Data Model: Side-by-Side Text Diff Viewer

**Feature**: `001-text-diff-viewer` | **Date**: 2026-07-23

All entities are in-memory, client-side TypeScript types (no persistence). Types live in
`src/types/diff.ts`. This document is the source of truth for the domain model consumed by the
diff engine (`src/lib/diff/`) and the presentation layer (`src/components/`).

---

## Enumerations

### `ChangeType`

```ts
type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';
```

- `added` — line exists only on the modified (right) side.
- `removed` — line exists only on the original (left) side.
- `modified` — a left line paired with a different right line (adjacent removed+added).
- `unchanged` — identical line on both sides.

---

## Core Entities

### Document (input)

Represents one side of the comparison. Not a class — modeled as the raw `string` plus a derived
line array produced during computation.

| Field | Type | Notes |
|-------|------|-------|
| `text` | `string` | Exact user input (whitespace/Unicode preserved). |
| `lines` | `string[]` | Derived: `normalizeEol(text).split('\n')`. Not trimmed. |

**Validation / rules**:
- Empty string ⇒ `lines = ['']` conceptually, but treated as "no content" for diffing (0 lines).
- Only line endings are normalized (`\r\n`/`\r` → `\n`); nothing else is altered.

---

### `DiffCell`

One side (left or right) of a rendered row.

```ts
interface DiffCell {
  lineNumber: number | null; // null when this side has no line on this row (placeholder)
  content: string | null;    // exact line text, or null for a blank placeholder cell
}
```

**Rules**:
- Exactly one of the two cells in a row may be a placeholder for `added`/`removed` rows.
- For `unchanged`/`modified` rows, both cells have non-null `lineNumber` and `content`.
- `lineNumber` is 1-based and independent per side (left numbering vs right numbering).

---

### `DiffRow`

The atomic unit of the aligned side-by-side view.

```ts
interface DiffRow {
  id: string;            // stable key, e.g. `${leftNo ?? 'x'}-${rightNo ?? 'x'}-${index}`
  type: ChangeType;
  left: DiffCell;
  right: DiffCell;
}
```

**Rules**:
- `added` ⇒ `left` is placeholder (`lineNumber: null`), `right` populated.
- `removed` ⇒ `right` is placeholder, `left` populated.
- `modified` ⇒ both populated, `left.content !== right.content`.
- `unchanged` ⇒ both populated, `left.content === right.content`.
- Row order preserves document order across the whole comparison.

---

### `DiffBlock`

A contiguous group of rows of related nature, used for collapsing.

```ts
interface DiffBlock {
  id: string;
  kind: 'change' | 'unchanged';
  rows: DiffRow[];
  collapsible: boolean;   // true only for long unchanged blocks
  hiddenCount: number;    // number of rows hidden when collapsed (0 if not collapsible)
}
```

**State transitions (collapse)** — collapse state is kept in UI/hook state keyed by `block.id`,
not mutated on the block itself:

```
[Collapsed] --expand--> [Expanded]
[Expanded]  --collapse--> [Collapsed]
Expand All  --> forces all collapsible blocks to [Expanded]
Collapse toggle (off) --> forces all collapsible blocks to [Expanded]
Collapse toggle (on)  --> restores automatic [Collapsed] for long unchanged blocks
```

**Rules**:
- `kind: 'change'` blocks are never collapsible (`collapsible = false`, `hiddenCount = 0`).
- `kind: 'unchanged'` block is collapsible only when `rows.length > 2 * contextLines + 1`.
- When collapsed, `contextLines` rows remain visible at each change-facing edge; `hiddenCount`
  equals the number of rows between the retained context on each side.

---

### `DiffStats`

Summary counters for the current comparison.

```ts
interface DiffStats {
  additions: number;   // count of 'added' rows
  removals: number;    // count of 'removed' rows
  modifications: number; // count of 'modified' rows
  unchanged: number;   // count of 'unchanged' rows
  totalChanges: number; // additions + removals + modifications
}
```

---

### `DiffResult`

The complete output of the diff engine — the view model the UI renders.

```ts
interface DiffResult {
  blocks: DiffBlock[];   // ordered; render sequentially
  stats: DiffStats;
  contextLines: number;  // context used to build collapsing
  isIdentical: boolean;  // true when totalChanges === 0
  isEmpty: boolean;      // true when both inputs have no content
}
```

---

### `DiffOptions`

Inputs that influence computation.

```ts
interface DiffOptions {
  contextLines: number;      // e.g. 3 (user-adjustable via context selector)
  ignoreTrailingWhitespace?: boolean; // default false (spec: trailing WS is a real change)
}
```

---

## UI / interaction state (not persisted)

Held in React state/hooks, distinct from the pure domain model:

| State | Type | Owner | Notes |
|-------|------|-------|-------|
| `originalText` / `modifiedText` | `string` | `App`/editors | Controlled editor values. |
| `result` | `DiffResult \| null` | `useDiff` | `null` before first Compare (drives empty state). |
| `status` | `'idle' \| 'computing' \| 'ready'` | `useDiff` | Drives loading feedback. |
| `contextLines` | `number` | `useDiff`/controls | Feeds `DiffOptions`; recompute on change. |
| `collapseEnabled` | `boolean` | `useCollapse` | Global collapse toggle. |
| `expandedBlockIds` | `Set<string>` | `useCollapse` | Per-block overrides; Expand-All sets all. |

---

## Relationships

```
DiffResult
├── stats: DiffStats
└── blocks: DiffBlock[]
        └── rows: DiffRow[]
                ├── left:  DiffCell
                └── right: DiffCell
```

- `Document(original)` + `Document(modified)` + `DiffOptions` → **diff engine** → `DiffResult`.
- `DiffResult.blocks` + UI collapse state → rendered rows in `DiffViewer`.

## Validation summary (from spec requirements)

- Whitespace, indentation, blank lines, and Unicode preserved exactly (FR-010) — enforced by not
  trimming `content` and by EOL-only normalization.
- Line numbers present per side (FR-011) — `DiffCell.lineNumber`.
- Change classification into 4 types (FR-008) — `ChangeType` on every `DiffRow`.
- Change counts (FR-012) — `DiffStats`.
- Collapse with hidden count (FR-014, FR-015) — `DiffBlock.collapsible` + `hiddenCount`.
- Context adjustment (FR-018) — `DiffOptions.contextLines` drives block building.
