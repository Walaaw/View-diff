# Contract: Diff Engine (`src/lib/diff/`)

**Feature**: `001-text-diff-viewer` | **Date**: 2026-07-23

The diff engine is the pure, framework-agnostic core. It has **no React and no DOM
dependencies** (only `jsdiff`) so it can run on the main thread, inside a Web Worker, and under
Vitest identically. Types are defined in [`data-model.md`](../data-model.md).

## Public API (the contract surface — `src/lib/diff/index.ts`)

```ts
/**
 * Compute the aligned, collapsible side-by-side view model for two texts.
 * Pure and deterministic: same inputs → same output. Never throws for valid strings.
 */
export function computeDiffResult(
  originalText: string,
  modifiedText: string,
  options?: Partial<DiffOptions>,   // default contextLines = 3
): DiffResult;
```

Internal (unit-tested) building blocks:

```ts
export function normalizeEol(text: string): string;                 // CRLF/CR -> LF only
export function toLines(text: string): string[];                     // split('\n'), no trim
export function computeLineOps(a: string[], b: string[]): LineOp[];  // jsdiff wrapper
export function alignRows(ops: LineOp[]): DiffRow[];                 // pair removed+added
export function buildBlocks(rows: DiffRow[], contextLines: number): DiffBlock[];
export function computeStats(rows: DiffRow[]): DiffStats;
```

Where `LineOp` is an intermediate:

```ts
interface LineOp { type: 'added' | 'removed' | 'unchanged'; lines: string[]; }
```

## Behavioral contract

### `computeDiffResult`

| Aspect | Guarantee |
|--------|-----------|
| Determinism | Pure; no side effects; stable output for stable input. |
| EOL handling | Normalizes `\r\n`/`\r` → `\n` before diffing; no other mutation. |
| Preservation | Line content (incl. trailing whitespace, blank lines, Unicode) is returned verbatim in `DiffCell.content`. |
| Alignment | Every row has aligned left/right cells; opposite side is a placeholder (`null`) for pure add/remove. |
| Modified detection | Adjacent `removed`→`added` runs are paired row-by-row into `modified` rows; surplus become add/remove. |
| Numbering | `left.lineNumber` and `right.lineNumber` are independent 1-based sequences skipping placeholder cells. |
| Collapsing | Unchanged blocks longer than `2*contextLines + 1` become `collapsible` with correct `hiddenCount`. |
| Stats | `stats.totalChanges === additions + removals + modifications`. |
| Flags | `isIdentical === (totalChanges === 0)`; `isEmpty === (both inputs have no content)`. |

### Edge-case contract (maps to spec Edge Cases & SC-002)

| Input scenario | Required output |
|----------------|-----------------|
| Both empty | `isEmpty = true`, `blocks = []` (or single empty unchanged), `totalChanges = 0`. |
| One empty | All lines of the non-empty side become `added` (if right) or `removed` (if left); opposite cells are placeholders. |
| Identical | All rows `unchanged`; `isIdentical = true`; long runs collapsible. |
| Completely different | No `unchanged` rows; left lines `removed`, right lines `added` (paired as `modified` where adjacent). |
| Consecutive insertions | A run of `added` rows with left placeholders; no misalignment. |
| Consecutive deletions | A run of `removed` rows with right placeholders; no misalignment. |
| Trailing whitespace only | Row is `modified` (not `unchanged`) unless `ignoreTrailingWhitespace` is set. |
| Multiple blank lines | Each blank line is its own row; counts preserved. |
| Unicode | Multi-byte characters compared and returned intact. |
| Very long line | Returned intact in a single cell (wrapping/scroll handled by UI). |

## Test contract (Vitest — `tests/unit/`)

Each guarantee above has at least one unit test. Required suites:

- `normalizeEol` / `toLines`: EOL variants, empty string, trailing newline, blank lines.
- `alignRows`: add-only, remove-only, modified pairing, interleaved changes, one-empty side.
- `buildBlocks`: collapse threshold boundaries (`len == 2c+1` not collapsed, `> 2c+1` collapsed),
  context retention at edges, `hiddenCount` correctness, leading/trailing unchanged trimming.
- `computeStats`: counts per type; `totalChanges` invariant.
- `computeDiffResult`: every row in the Edge-case table; `isIdentical`/`isEmpty` flags.

## Worker contract (`src/workers/diff.worker.ts`)

```ts
// message in
interface DiffRequest { id: number; originalText: string; modifiedText: string; contextLines: number; }
// message out
interface DiffResponse { id: number; result: DiffResult; }
```

- The worker imports and calls `computeDiffResult` — **no diff logic is duplicated**.
- `id` correlates responses to requests so stale results (superseded by a newer Compare) are
  discarded by `useDiff`.
- In tests, the worker is mocked to call `computeDiffResult` synchronously.
