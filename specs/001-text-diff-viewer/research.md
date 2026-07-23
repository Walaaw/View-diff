# Phase 0 Research: Side-by-Side Text Diff Viewer

**Feature**: `001-text-diff-viewer` | **Date**: 2026-07-23

The technical stack was fixed by the requester, so research focuses on *how* to use each piece
correctly and on resolving the design decisions the spec left open. No `NEEDS CLARIFICATION`
markers remained in the spec; the items below are best-practice/decision resolutions.

---

## D1. Diff algorithm & library usage (`jsdiff`)

- **Decision**: Use `jsdiff`'s `diffLines` (with `newlineIsToken: false`) as the primitive to
  produce ordered change parts (`added` / `removed` / unchanged, each with a value and line
  `count`). Build our own alignment layer on top rather than using a prebuilt side-by-side
  renderer.
- **Rationale**: `diffLines` is line-oriented (matches our row model), preserves exact content
  (whitespace, blank lines, Unicode) when we split on `\n` ourselves, and is stable/well-tested.
  Owning the alignment layer lets us implement "modified" detection, collapsing, and context
  control exactly as specified.
- **Alternatives considered**:
  - `diff-match-patch` — powerful char-level diffs but heavier and not line-first; overkill for
    MVP and harder to map to line rows.
  - `react-diff-viewer-continued` / prebuilt components — fast to adopt but violate the
    architecture requirement (logic/UI separation), limit design-system control, and reduce
    testability of our own logic.
- **Notes**: For optional intra-line word highlighting (enhancement, not MVP), `diffWordsWithSpace`
  can be applied to matched modified pairs later without changing the row model.

## D2. Line splitting, whitespace, and Unicode fidelity

- **Decision**: Normalize only line endings (`\r\n`/`\r` → `\n`) before diffing; split into lines
  by `\n` and preserve every other character verbatim, including trailing whitespace and empty
  lines. Never `trim()` content used for comparison or display.
- **Rationale**: Spec requires exact preservation and correct handling of trailing whitespace,
  multiple blank lines, and Unicode. Line-ending normalization prevents false diffs from mixed
  CRLF/LF while keeping intra-line content intact.
- **Alternatives considered**: Trimming lines (rejected — loses trailing-whitespace changes);
  no normalization (rejected — produces spurious diffs across OSes).

## D3. Row alignment & "modified" detection

- **Decision**: Convert `jsdiff` parts into two aligned columns. Unchanged parts map 1:1 on both
  sides. A `removed` part immediately followed by an `added` part is paired row-by-row: paired
  rows become `modified` (left+right present); leftover unpaired rows become `removed` (right
  blank) or `added` (left blank). Isolated `added`/`removed` parts fill the opposite side with
  empty placeholder cells so both columns stay row-aligned.
- **Rationale**: Produces the GitHub/GitLab-style aligned side-by-side view the spec requires,
  including correct handling of consecutive insertions/deletions and one-empty-document cases.
- **Alternatives considered**: Pure inline (unified) diff (rejected — spec mandates side-by-side);
  LCS re-implementation (rejected — `jsdiff` already provides the primitive).

## D4. Collapsing unchanged blocks & context control

- **Decision**: After alignment, group consecutive `unchanged` rows. If a group's length exceeds
  `2 * contextLines + 1`, collapse the middle into a single `CollapsedBlock` carrying the hidden
  line count, while keeping `contextLines` visible rows adjacent to each neighboring change.
  Leading/trailing unchanged groups keep only `contextLines` at the change-facing edge. Context
  count is user-adjustable (e.g., 1/3/5/10); each block tracks its own expanded state and an
  Expand-All flag overrides them.
- **Rationale**: Directly satisfies FR-014..FR-018; deterministic and unit-testable.
- **Alternatives considered**: Fixed context (rejected — spec requires a selector); virtualization
  instead of collapsing (complementary, not a substitute — see D6).

## D5. Compute timing, Web Worker, and loading state

- **Decision**: Compute only on explicit **Compare** (FR-007). If the combined input size exceeds
  a threshold (e.g., > ~2,000 lines or > ~200 KB), run the pure diff engine in a Web Worker
  (Vite `?worker` import) and show loading feedback; otherwise compute synchronously. Results are
  memoized keyed by `(originalText, modifiedText, contextLines)`.
- **Rationale**: Meets SC-003 (5,000+ lines responsive) and FR-020 while keeping small inputs
  instant. A pure engine imported by both the main thread and the worker avoids code duplication.
- **Alternatives considered**: Always-sync (rejected — freezes UI on large inputs); debounced
  live diffing (rejected — spec requires explicit Compare); server-side compute (rejected — app
  is fully client-side).

## D6. Rendering large results without DOM blowup

- **Decision**: Collapsing (D4) is the primary mitigation. For very large *changed* diffs, apply
  lightweight row windowing/virtualization in `DiffViewer` (render visible range + overscan)
  while preserving scroll sync and line numbers. Start simple; introduce virtualization only if
  profiling shows jank (YAGNI-guided, per constitution).
- **Rationale**: Keeps 60 fps scrolling on large diffs; avoids premature complexity.
- **Alternatives considered**: Full virtualization from day one (deferred — adds complexity to
  scroll-sync and sticky headers); render-everything (rejected — DOM cost on 10k rows).

## D7. Scroll synchronization & sticky headers

- **Decision**: A `useScrollSync` hook links the two scroll containers: on scroll of one, mirror
  `scrollTop`/`scrollLeft` to the other, guarding against feedback loops with a transient "isSyncing"
  flag (or `requestAnimationFrame`). Column headers use CSS `position: sticky`.
- **Rationale**: Satisfies FR-022 with minimal, testable logic and no layout thrash.
- **Alternatives considered**: Single shared scroll container with two columns (viable, but
  complicates independent horizontal scroll of long lines); scroll libraries (unnecessary).

## D8. Tailwind CSS v4 + design tokens

- **Decision**: Use Tailwind v4's CSS-first configuration: define the constitution's tokens
  (background/surface/elevated, borders, text, indigo accent, diff colors, radii, fonts) via the
  `@theme` block in `src/index.css`, exposed as utility classes and CSS variables. Components
  reference token utilities only (no raw hex).
- **Rationale**: Enforces Design-System Fidelity (Principle III) and keeps theming centralized.
- **Alternatives considered**: JS `tailwind.config` theme (still supported but v4 favors CSS-first);
  inline styles (rejected — bypasses tokens).

## D9. shadcn/ui integration

- **Decision**: Generate needed primitives via shadcn/ui (Button, Textarea, Badge, Select,
  Tooltip, Toggle, Separator) and restyle them through the token theme. Buttons expose primary/
  secondary/ghost/icon variants matching the constitution's component set.
- **Rationale**: Accessible Radix-based primitives accelerate WCAG-AA compliance while remaining
  fully customizable to the design system.
- **Alternatives considered**: Hand-rolled components (more work, weaker a11y guarantees); a
  heavier component library (conflicts with minimal, token-driven styling).

## D10. Accessibility approach

- **Decision**: Semantic landmarks (`header`/`main`/`footer`), labeled form controls, `aria-label`s
  on icon buttons, a visually-hidden live region announcing comparison results/counts, visible
  focus rings via token, and change types conveyed by an icon/sign (`+`/`-`/`~`) plus color.
  Verify contrast of all token pairings against WCAG AA.
- **Rationale**: Satisfies FR-025/FR-026 and Principle IV; `prefers-reduced-motion` disables
  non-essential transitions.
- **Alternatives considered**: Color-only signaling (rejected — fails Principle IV and FR-026).

## D11. Testing strategy (Vitest + RTL)

- **Decision**: Unit-test the pure engine exhaustively (compute → align → collapse) against all
  spec edge cases; test hooks with `renderHook`; test components/interactions with RTL +
  `user-event` (type/paste/clear/swap/compare, expand/collapse, expand-all, context change).
  Use `jsdom` environment; mock the worker to run the engine synchronously in tests.
- **Rationale**: Matches the spec's Testing section and keeps correctness guarantees at the logic
  layer where they are cheapest and most reliable.
- **Alternatives considered**: E2E-only (rejected — slower, weaker unit coverage of edge cases).

---

## Resolved unknowns summary

| Topic | Decision |
|-------|----------|
| Diff primitive | `jsdiff` `diffLines`, custom alignment on top |
| Whitespace/Unicode | Normalize line endings only; preserve everything else |
| Modified detection | Pair adjacent removed+added rows |
| Collapsing/context | Group unchanged; collapse beyond `2*context+1`; user-selectable context |
| Compute timing | On explicit Compare; Web Worker + loading above size threshold; memoized |
| Large rendering | Collapse first; optional row windowing if needed |
| Scroll sync | `useScrollSync` mirroring scroll offsets; sticky CSS headers |
| Styling | Tailwind v4 CSS-first `@theme` tokens from constitution |
| Components | shadcn/ui primitives restyled to tokens |
| A11y | Semantic HTML, ARIA, live region, non-color signals, focus rings |
| Testing | Vitest + RTL; pure-engine edge-case suites; worker mocked |

**All open decisions resolved — ready for Phase 1.**
