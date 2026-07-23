---
description: "Task list for Side-by-Side Text Diff Viewer implementation"
---

# Tasks: Side-by-Side Text Diff Viewer

**Input**: Design documents from `specs/001-text-diff-viewer/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: INCLUDED — the spec's Testing section explicitly requests unit tests (diff generation,
line alignment, collapse/expand logic, utility functions) and the stack includes Vitest + RTL.

**Organization**: Tasks are grouped by user story (US1–US4) so each story is independently
implementable and testable. All paths are relative to the project root `view_diff/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 / US3 / US4 (from spec.md); Setup/Foundational/Polish carry no story label
- Exact file paths are included in each task

## Path Conventions

Single-project frontend SPA rooted at `view_diff/`. Source in `src/`, tests in `tests/`
(unit + component) and co-located where noted. See plan.md → Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Vite + React 19 + TS project and the toolchain.

- [x] T001 Scaffold Vite React+TS app at `view_diff/` (package.json, `index.html`, `src/main.tsx`, `src/App.tsx`, `tsconfig.json`, `vite.config.ts`) using yarn
- [x] T002 Add runtime dependencies with yarn: `react@19`, `react-dom@19`, `diff` (jsdiff), `clsx`, `tailwind-merge`, `lucide-react`
- [x] T003 Add dev dependencies with yarn: `typescript`, `vite`, `tailwindcss@4`, `@tailwindcss/vite`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- [x] T004 [P] Configure Tailwind CSS v4 (CSS-first) in `src/index.css` with the constitution design tokens (`@theme`: backgrounds, borders, text, indigo accent, diff colors, radii 10–14px, fonts Inter/Geist/JetBrains Mono) and wire `@tailwindcss/vite` in `vite.config.ts`
- [x] T005 [P] Initialize shadcn/ui (`components.json`) targeting `src/components/ui`, aliased to the token theme
- [x] T006 [P] Configure Vitest (`vitest.config.ts` or `vite.config.ts` test block) with `jsdom` env and `src/test/setup.ts` importing `@testing-library/jest-dom`; add `test`/`coverage` scripts to `package.json`
- [x] T007 [P] Enable TypeScript strict mode and path alias `@/*` in `tsconfig.json`; add lint/format config (ESLint + Prettier) and scripts
- [x] T008 [P] Load web fonts (Inter, Geist, JetBrains Mono) in `index.html`/`src/index.css` and set dark theme as default on `<html>`

**Checkpoint**: ✅ `yarn dev` serves a dark shell; `yarn test`, `yarn build`, and `yarn lint` all pass green.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain types and shared utilities that every story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 [P] Define domain types in `src/types/diff.ts` (`ChangeType`, `DiffCell`, `DiffRow`, `DiffBlock`, `DiffStats`, `DiffResult`, `DiffOptions`) per data-model.md
- [ ] T010 [P] Implement `cn()` and small pure helpers in `src/lib/utils.ts`
- [ ] T011 [P] Add built-in example texts in `src/lib/example.ts` (original + modified sample)
- [ ] T012 [P] Scaffold shadcn/ui primitives in `src/components/ui/` restyled to tokens: `button.tsx` (primary/secondary/ghost/icon variants), `textarea.tsx`, `badge.tsx`, `select.tsx`, `toggle.tsx` (or switch), `tooltip.tsx`, `separator.tsx`
- [ ] T013 Build the app layout shell in `src/App.tsx` with semantic landmarks (`<header>`/`<main>`/`<footer>`) and responsive grid (desktop 2-col, tablet, mobile stacked) — placeholders for editors/diff

**Checkpoint**: Types compile; primitives render with tokens; layout responds to breakpoints.

---

## Phase 3: User Story 1 - Compare two texts side by side (Priority: P1) 🎯 MVP

**Goal**: A user enters two texts, clicks Compare, and sees an aligned, line-numbered,
color-coded side-by-side diff with a changes counter, legend, sticky headers, and scroll sync.

**Independent Test**: Enter two differing texts, click Compare → aligned rows with correct
added/removed/modified/unchanged styling, dual line numbers, synced scrolling.

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL)

- [ ] T014 [P] [US1] Unit tests for `normalizeEol`/`toLines` in `tests/unit/diff/lines.test.ts` (EOL variants, empty, trailing newline, blank lines, Unicode)
- [ ] T015 [P] [US1] Unit tests for `computeLineOps`/`alignRows` in `tests/unit/diff/align.test.ts` (add-only, remove-only, modified pairing, interleaved, one-empty side, completely different, identical)
- [ ] T016 [P] [US1] Unit tests for `computeStats` and `computeDiffResult` flags in `tests/unit/diff/result.test.ts` (`totalChanges` invariant, `isIdentical`, `isEmpty`, edge-case table from contracts/diff-engine.md)
- [ ] T017 [P] [US1] Component test for compare flow in `tests/components/DiffViewer.test.tsx` (type two texts, Compare → styled rows + counter render; identical → zero changes)

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement `normalizeEol` + `toLines` in `src/lib/diff/computeDiff.ts` (EOL-only normalization, no trim)
- [ ] T019 [US1] Implement `computeLineOps` (jsdiff `diffLines` wrapper → `LineOp[]`) in `src/lib/diff/computeDiff.ts`
- [ ] T020 [US1] Implement `alignRows` (pair adjacent removed+added → modified; placeholders; per-side 1-based line numbers) in `src/lib/diff/alignRows.ts`
- [ ] T021 [US1] Implement `computeStats` in `src/lib/diff/computeDiff.ts` and assemble `computeDiffResult` (no collapsing yet: single blocks) in `src/lib/diff/index.ts`
- [ ] T022 [P] [US1] Implement `useDiff` hook (synchronous compute on explicit Compare, memoized by inputs) in `src/hooks/useDiff.ts`
- [ ] T023 [P] [US1] Implement `useScrollSync` hook (mirror scrollTop/scrollLeft, loop-guarded) in `src/hooks/useScrollSync.ts`
- [ ] T024 [P] [US1] Implement `TextEditor` (monospace, paste, whitespace-preserving, focus ring, label) in `src/components/editors/TextEditor.tsx`
- [ ] T025 [US1] Implement minimal `EditorToolbar` with the Compare primary action in `src/components/editors/EditorToolbar.tsx`
- [ ] T026 [P] [US1] Implement `DiffRow` (left/right cells, line numbers, token classes by type, `white-space: pre`, +/-/~ sign) in `src/components/diff/DiffRow.tsx`
- [ ] T027 [P] [US1] Implement `DiffPanelHeader` (sticky column header) in `src/components/diff/DiffPanelHeader.tsx`
- [ ] T028 [P] [US1] Implement `DiffLegend` (Added/Removed/Modified/Unchanged with label+sign, not color-only) in `src/components/diff/DiffLegend.tsx`
- [ ] T029 [US1] Implement `DiffViewer` (render blocks/rows, two scroll-synced columns, sticky headers, changes counter badge) in `src/components/diff/DiffViewer.tsx`
- [ ] T030 [US1] Wire editors → `useDiff` → `DiffViewer` in `src/App.tsx`; render legend + counter

**Checkpoint**: US1 is fully functional and independently testable — the MVP.

---

## Phase 4: User Story 2 - Edit, load example, clear, and swap inputs (Priority: P1)

**Goal**: Efficient input management — type/paste, load example, clear each editor
independently, swap sides, and reset the app.

**Independent Test**: Load example populates both; clear left empties only left; swap exchanges
contents; reset returns to initial state.

### Tests for User Story 2 ⚠️

- [ ] T031 [P] [US2] Component tests in `tests/components/EditorToolbar.test.tsx` (load example populates both; swap exchanges; clear affects only one editor)
- [ ] T032 [P] [US2] Component test for reset in `tests/components/Header.test.tsx` (reset clears inputs and result)

### Implementation for User Story 2

- [ ] T033 [US2] Extend `EditorToolbar` with Load Example, Swap (secondary/ghost variants) in `src/components/editors/EditorToolbar.tsx`
- [ ] T034 [US2] Add independent Clear button to `TextEditor` (`onClear`) in `src/components/editors/TextEditor.tsx`
- [ ] T035 [P] [US2] Implement `Header` (logo, title, theme toggle, reset) in `src/components/layout/Header.tsx`
- [ ] T036 [US2] Implement input state handlers in `src/App.tsx` (clear-one, swap, load-example from `src/lib/example.ts`, reset)

**Checkpoint**: US1 + US2 both work independently.

---

## Phase 5: User Story 3 - Collapse and expand unchanged sections (Priority: P2)

**Goal**: Auto-collapse long unchanged runs with hidden-line counts; expand/collapse single
blocks; Expand All; adjustable context lines.

**Independent Test**: Compare long texts with a large identical middle → middle collapses with
count; expand/collapse works; Expand All reveals all; changing context updates visible context.

### Tests for User Story 3 ⚠️

- [ ] T037 [P] [US3] Unit tests for `buildBlocks` in `tests/unit/diff/collapse.test.ts` (threshold boundaries `len==2c+1` vs `>2c+1`, edge context retention, `hiddenCount`, leading/trailing trim)
- [ ] T038 [P] [US3] Component tests in `tests/components/Collapse.test.tsx` (collapsed shows hidden count; expand reveals; Expand All; toggle restores; context change updates)

### Implementation for User Story 3

- [ ] T039 [US3] Implement `buildBlocks` (group unchanged; collapse beyond `2*context+1`; compute `hiddenCount`) in `src/lib/diff/collapse.ts`
- [ ] T040 [US3] Integrate `buildBlocks` into `computeDiffResult` using `DiffOptions.contextLines` in `src/lib/diff/index.ts`
- [ ] T041 [P] [US3] Implement `useCollapse` hook (per-block expanded set, Expand All, global toggle) in `src/hooks/useCollapse.ts`
- [ ] T042 [P] [US3] Implement `CollapsedBlock` (button, `aria-expanded`, "N unchanged lines hidden", 150–200ms transition) in `src/components/diff/CollapsedBlock.tsx`
- [ ] T043 [US3] Implement `DiffControls` (collapse toggle, Expand All, context selector, changes counter) in `src/components/diff/DiffControls.tsx`
- [ ] T044 [US3] Wire collapse state + context selector into `DiffViewer`/`App.tsx` (recompute on context change)

**Checkpoint**: US1 + US2 + US3 all independently functional.

---

## Phase 6: User Story 4 - Clear feedback and empty/loading states (Priority: P3)

**Goal**: Friendly empty state before comparison; loading feedback for expensive compares via
Web Worker; visible feedback on all interactions.

**Independent Test**: Fresh load shows empty state + CTA; large compare shows loading and stays
responsive; controls show hover/focus/active feedback.

### Tests for User Story 4 ⚠️

- [ ] T045 [P] [US4] Component test for empty state in `tests/components/EmptyState.test.tsx` (shown when result is null; CTA triggers load example)
- [ ] T046 [P] [US4] Test loading/worker orchestration in `tests/components/useDiff.loading.test.ts` (status transitions idle→computing→ready; stale results discarded; worker mocked to run engine sync)

### Implementation for User Story 4

- [ ] T047 [P] [US4] Implement `EmptyState` (illustration, helper text, CTA) in `src/components/states/EmptyState.tsx`; render when `result === null` in `src/App.tsx`
- [ ] T048 [US4] Implement `diff.worker.ts` importing `computeDiffResult` (no logic duplication) in `src/workers/diff.worker.ts` per contracts/diff-engine.md worker contract
- [ ] T049 [US4] Extend `useDiff` to offload above a size threshold to the worker with `status` (idle/computing/ready) and request-id correlation in `src/hooks/useDiff.ts`
- [ ] T050 [US4] Add loading feedback (disabled Compare + spinner) in `EditorToolbar` and viewer in `src/components/editors/EditorToolbar.tsx` / `src/components/diff/DiffViewer.tsx`
- [ ] T051 [P] [US4] Ensure hover/focus/active states + 150–200ms transitions on all `src/components/ui/` primitives

**Checkpoint**: All four user stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, footer, docs, and final validation across all stories.

- [ ] T052 [P] Implement `Footer` (keyboard shortcuts + navigation hints) in `src/components/layout/Footer.tsx`
- [ ] T053 [US1] Add visually-hidden ARIA live region announcing "N changes" after compare in `src/components/diff/DiffViewer.tsx`
- [ ] T054 Accessibility pass: keyboard nav order, `aria-label`s on icon buttons, focus visible, `prefers-reduced-motion`; run an automated a11y/contrast check (WCAG AA) across the app
- [ ] T055 [P] Performance: optional row windowing in `DiffViewer` for very large results (preserve scroll sync + line numbers) per research D6
- [ ] T056 [P] Add theme toggle behavior (dark default; optional light) wired to `Header` in `src/App.tsx`/`src/index.css`
- [ ] T057 [P] Write `README.md` (setup with yarn, design decisions, architecture overview, future improvements) at `view_diff/README.md`
- [ ] T058 Run `quickstart.md` validation scenarios V1–V6; ensure `yarn test` green and `yarn build` passes with strict TS

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phases 3–6)**: All depend on Foundational.
  - US1 (P1) and US2 (P1) are largely independent; US2's toolbar extends US1's toolbar file (T025→T033 sequential).
  - US3 (P2) depends on the engine + viewer from US1 (adds collapsing).
  - US4 (P3) depends on `useDiff` from US1 (adds worker/loading) and can add EmptyState anytime after layout.
- **Polish (Phase 7)**: After the desired stories are complete.

### Story-level dependency notes

- US1: after Phase 2. Self-contained MVP.
- US2: after Phase 2; T033 edits the same `EditorToolbar.tsx` created in T025 → run after US1's T025.
- US3: after US1 (needs `computeDiffResult`, `DiffViewer`).
- US4: after US1 (needs `useDiff`); EmptyState only needs the layout shell.

### Within Each User Story

- Tests written first and failing → then implementation.
- Pure engine (`src/lib/`) before hooks before components before `App.tsx` wiring.

### Parallel Opportunities

- Setup: T004–T008 in parallel after T001–T003.
- Foundational: T009–T012 in parallel; T013 after primitives.
- US1 tests T014–T017 in parallel; engine pieces T018 [P] then T019→T020→T021 sequential (same/related files); components T024/T026/T027/T028 in parallel.
- Across teams: once Phase 2 done, US1 and the EmptyState part of US4 and US2's Header can proceed in parallel.

---

## Parallel Example: User Story 1

```bash
# Tests first (parallel):
Task: "Unit tests for normalizeEol/toLines in tests/unit/diff/lines.test.ts"
Task: "Unit tests for computeLineOps/alignRows in tests/unit/diff/align.test.ts"
Task: "Unit tests for computeStats/computeDiffResult in tests/unit/diff/result.test.ts"
Task: "Component test for compare flow in tests/components/DiffViewer.test.tsx"

# Then parallel components:
Task: "Implement TextEditor in src/components/editors/TextEditor.tsx"
Task: "Implement DiffRow in src/components/diff/DiffRow.tsx"
Task: "Implement DiffPanelHeader in src/components/diff/DiffPanelHeader.tsx"
Task: "Implement DiffLegend in src/components/diff/DiffLegend.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → 4. **STOP & validate US1** → demo.

### Incremental Delivery

Foundation → US1 (MVP) → US2 → US3 → US4 → Polish. Each story is a shippable increment that
does not break previous stories.

---

## Notes

- [P] = different files, no incomplete dependencies.
- Tests are included per the spec's Testing section (Vitest + RTL); verify they fail before implementing.
- Keep `src/lib/` pure (no React/DOM) so it runs in the worker and under Vitest identically.
- Consume design tokens only — no raw hex — per constitution Principle III.
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.

**Total tasks**: 58 | US1: 17 (T014–T030) · US2: 6 (T031–T036) · US3: 8 (T037–T044) · US4: 7 (T045–T051) · Setup: 8 · Foundational: 5 · Polish: 7
