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

Single-project frontend SPA rooted at `view_diff/`, organized **feature-first**. Feature code lives
in `src/features/<feature>/` (e.g. `src/features/compare/` with `components/`, `hooks/`, `diff/`,
`types.ts`, and a `CompareFeature.tsx` root). Shared, cross-feature code stays global:
`src/components/ui/` (design-system primitives), `src/components/layout/` (app chrome),
`src/lib/` (pure helpers). `src/App.tsx` is only a composition root. Tests live in `tests/`
(unit + component). See plan.md → Project Structure.

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

- [x] T009 [P] Define domain types in `src/features/compare/types.ts` (`ChangeType`, `DiffCell`, `DiffRow`, `DiffBlock`, `DiffStats`, `DiffResult`, `DiffOptions`) per data-model.md
- [x] T010 [P] Implement `cn()` and small pure helpers (`normalizeEol`, `toLines`, `pluralize`) in `src/lib/utils.ts`
- [x] T011 [P] Add built-in example texts in `src/lib/example.ts` (original + modified sample)
- [x] T012 [P] Scaffold shadcn/ui primitives in `src/components/ui/` restyled to tokens: `button.tsx` (primary/secondary/ghost/icon variants), `textarea.tsx`, `badge.tsx`, `select.tsx`, `switch.tsx`, `tooltip.tsx`, `separator.tsx`
- [x] T013 Build the app layout shell in `src/components/layout/` (`AppLayout`, `Header`, `Footer`) with semantic landmarks (`<header>`/`<main>`/`<footer>`) and responsive grid (desktop 2-col, tablet, mobile stacked); `src/App.tsx` composes features only

**Checkpoint**: ✅ Types compile; primitives render with tokens; layout responds to breakpoints; `yarn build`/`lint`/`test` all pass.

---

## Phase 3: User Story 1 - Compare two texts side by side (Priority: P1) 🎯 MVP

**Goal**: A user enters two texts, clicks Compare, and sees an aligned, line-numbered,
color-coded side-by-side diff with a changes counter, legend, sticky headers, and scroll sync.

**Independent Test**: Enter two differing texts, click Compare → aligned rows with correct
added/removed/modified/unchanged styling, dual line numbers, synced scrolling.

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL)

- [x] T014 [P] [US1] Unit tests for `normalizeEol`/`toLines` in `tests/unit/diff/lines.test.ts` (EOL variants, empty, trailing newline, blank lines, Unicode)
- [x] T015 [P] [US1] Unit tests for `computeLineOps`/`alignRows` in `tests/unit/diff/align.test.ts` (add-only, remove-only, modified pairing, interleaved, one-empty side, completely different, identical)
- [x] T016 [P] [US1] Unit tests for `computeStats` and `computeDiffResult` flags in `tests/unit/diff/result.test.ts` (`totalChanges` invariant, `isIdentical`, `isEmpty`, edge-case table from contracts/diff-engine.md)
- [x] T017 [P] [US1] Component test for compare flow in `tests/components/DiffViewer.test.tsx` (type two texts, Compare → styled rows + counter render; identical → zero changes)

### Implementation for User Story 1

- [x] T018 [P] [US1] Implement `normalizeEol` + `toLines` in `src/lib/utils.ts` (EOL-only normalization, no trim)
- [x] T019 [US1] Implement `computeLineOps` (jsdiff `diffArrays` wrapper → `LineOp[]`) in `src/features/compare/diff/computeDiff.ts`
- [x] T020 [US1] Implement `alignRows` (pair adjacent removed+added → modified; placeholders; per-side 1-based line numbers) in `src/features/compare/diff/alignRows.ts`
- [x] T021 [US1] Implement `computeStats` in `src/features/compare/diff/computeDiff.ts` and assemble `computeDiffResult` (no collapsing yet: single blocks) in `src/features/compare/diff/index.ts`
- [x] T022 [P] [US1] Implement `useDiff` hook (synchronous compute on explicit Compare) in `src/features/compare/hooks/useDiff.ts`
- [x] T023 [P] [US1] Implement `useScrollSync` hook (mirror scrollTop/scrollLeft, loop-guarded) in `src/features/compare/hooks/useScrollSync.ts`
- [x] T024 [P] [US1] Implement `TextEditor` (monospace, paste, whitespace-preserving, focus ring, label) in `src/features/compare/components/TextEditor.tsx`
- [x] T025 [US1] Implement minimal `EditorToolbar` with the Compare primary action in `src/features/compare/components/EditorToolbar.tsx`
- [x] T026 [P] [US1] Implement `DiffRow` (left/right cells, line numbers, token classes by type, `white-space: pre`, +/-/~ sign) in `src/features/compare/components/DiffRow.tsx`
- [x] T027 [P] [US1] Implement `DiffPanelHeader` (sticky column header) in `src/features/compare/components/DiffPanelHeader.tsx`
- [x] T028 [P] [US1] Implement `DiffLegend` (Added/Removed/Modified/Unchanged with label+sign, not color-only) in `src/features/compare/components/DiffLegend.tsx`
- [x] T029 [US1] Implement `DiffViewer` (render blocks/rows, sticky headers, changes counter badge) in `src/features/compare/components/DiffViewer.tsx`
- [x] T030 [US1] Wire editors → `useDiff` → `DiffViewer` in `src/features/compare/CompareFeature.tsx` (render legend + counter); mount via `src/App.tsx`

**Checkpoint**: ✅ US1 is fully functional and independently testable — the MVP.

---

## Phase 4: User Story 2 - Edit, load example, clear, and swap inputs (Priority: P1)

**Goal**: Efficient input management — type/paste, load example, clear each editor
independently, swap sides, and reset the app.

**Independent Test**: Load example populates both; clear left empties only left; swap exchanges
contents; reset returns to initial state.

### Tests for User Story 2 ⚠️

- [x] T031 [P] [US2] Component tests in `tests/components/EditorToolbar.test.tsx` (load example populates both; swap exchanges; clear affects only one editor)
- [x] T032 [P] [US2] Component test for reset in `tests/components/Header.test.tsx` (reset clears inputs and result)

### Implementation for User Story 2

- [x] T033 [US2] Extend `EditorToolbar` with Load Example, Swap (secondary/ghost variants) in `src/features/compare/components/EditorToolbar.tsx`
- [x] T034 [US2] Add independent Clear button to `TextEditor` (`onClear`) in `src/features/compare/components/TextEditor.tsx`
- [x] T035 [P] [US2] Implement `Header` (logo, title, theme toggle, reset) in `src/components/layout/Header.tsx`
- [x] T036 [US2] Implement input state + actions in the global store `src/store/index.ts` (setOriginal/Modified, compare, clear-one, swap, load-example from `src/lib/example.ts`, reset) — consumed by `CompareFeature.tsx` and Header via selectors

**Checkpoint**: ✅ US1 + US2 both work independently.

---

## Phase 5: User Story 3 - Collapse and expand unchanged sections (Priority: P2)

**Goal**: Auto-collapse long unchanged runs with hidden-line counts; expand/collapse single
blocks; Expand All; adjustable context lines.

**Independent Test**: Compare long texts with a large identical middle → middle collapses with
count; expand/collapse works; Expand All reveals all; changing context updates visible context.

### Tests for User Story 3 ⚠️

- [x] T037 [P] [US3] Unit tests for `buildBlocks` in `tests/unit/diff/collapse.test.ts` (threshold boundaries `len==2c+1` vs `>2c+1`, edge context retention, `hiddenCount`, leading/trailing trim)
- [x] T038 [P] [US3] Component tests in `tests/components/Collapse.test.tsx` (collapsed shows hidden count; expand reveals; Expand All; toggle restores; context change updates)

### Implementation for User Story 3

- [x] T039 [US3] Implement `buildBlocks` (group unchanged; collapse beyond `2*context+1`; compute `hiddenCount`) in `src/features/compare/diff/collapse.ts`
- [x] T040 [US3] Integrate `buildBlocks` into `computeDiffResult` using `DiffOptions.contextLines` in `src/features/compare/diff/index.ts`
- [x] T041 [P] [US3] Implement collapse state in the global store `src/store/index.ts` (per-block `expandedBlockIds`, `collapseEnabled` toggle, `toggleBlock`, `expandAll`) — chosen over a `useCollapse` hook to keep all app state in one store
- [x] T042 [P] [US3] Implement `CollapsedBlock` (button, `aria-expanded`, "N unchanged lines hidden", 150–200ms transition) in `src/features/compare/components/CollapsedBlock.tsx`
- [x] T043 [US3] Implement `DiffControls` (collapse toggle, Expand All, context selector, changes counter) in `src/features/compare/components/DiffControls.tsx`
- [x] T044 [US3] Wire collapse state + context selector into `DiffViewer`/`CompareFeature.tsx` (recompute on context change)

**Checkpoint**: ✅ US1 + US2 + US3 all independently functional.

---

## Phase 6: User Story 4 - Clear feedback and empty/loading states (Priority: P3)

**Goal**: Friendly empty state before comparison; loading feedback for expensive compares via
Web Worker; visible feedback on all interactions.

**Independent Test**: Fresh load shows empty state + CTA; large compare shows loading and stays
responsive; controls show hover/focus/active feedback.

### Tests for User Story 4 ⚠️

- [x] T045 [P] [US4] Component test for empty state in `tests/components/EmptyState.test.tsx` (shown when result is null; CTA triggers load example)
- [x] T046 [P] [US4] Test loading/worker orchestration in `tests/components/store.loading.test.ts` (status transitions idle→computing→ready; stale results discarded; worker mocked to run engine sync)

### Implementation for User Story 4

- [x] T047 [P] [US4] Implement `EmptyState` (illustration, helper text, CTA) in `src/features/compare/components/EmptyState.tsx`; render when `result === null` in `src/features/compare/CompareFeature.tsx`
- [x] T048 [US4] Implement `diff.worker.ts` importing `computeDiffResult` (no logic duplication) in `src/features/compare/workers/diff.worker.ts` per contracts/diff-engine.md worker contract
- [x] T049 [US4] Extend the store's `compare` to offload above a size threshold to the worker with `status` (idle/computing/ready) and request-id correlation in `src/store/index.ts`
- [x] T050 [US4] Add loading feedback (disabled Compare + spinner) in `EditorToolbar` and viewer in `src/features/compare/components/EditorToolbar.tsx` / `src/features/compare/components/DiffViewer.tsx`
- [x] T051 [P] [US4] Ensure hover/focus/active states + 150–200ms transitions on all `src/components/ui/` primitives

**Checkpoint**: All four user stories independently functional.

---

## Phase 6.5: User Story 5 - Load text from a file (Priority: P3)

**Goal**: Populate either editor from a local text file via an explicit Upload control and via
drag-and-drop, preserving exact content and rejecting non-text/oversized files gracefully.

**Independent Test**: Upload or drag a text file onto an editor → its exact contents appear and
can be compared; an oversized/binary file shows a non-blocking message and leaves the editor
unchanged.

### Tests for User Story 5 ⚠️

- [x] T058 [P] [US5] Unit test for the file-reading util (text extraction, size + type guards, error messages) in `tests/unit/files/readTextFile.test.ts`
- [x] T059 [P] [US5] Component test for upload + drag-and-drop in `tests/components/FileUpload.test.tsx` (file input populates the editor; invalid file shows a message and leaves content unchanged)

### Implementation for User Story 5

- [x] T060 [US5] Implement `readTextFile` util (validate type/size, read as text, normalize errors to a typed result) in `src/features/compare/files/readTextFile.ts`
- [x] T061 [US5] Add an Upload control (button triggering a hidden `<input type="file">`) to `src/features/compare/components/TextEditor.tsx`, calling `onChange` with the file text
- [x] T062 [US5] Add drag-and-drop with a visible drop overlay (design tokens) to `src/features/compare/components/TextEditor.tsx`
- [x] T063 [US5] Show a per-editor, non-blocking error message for rejected files in `src/features/compare/components/TextEditor.tsx`

**Checkpoint**: File input works as an alternative to paste/type; downstream behavior unchanged.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, footer, docs, and final validation across all stories.

- [x] T052 [P] Implement `Footer` (keyboard shortcuts + navigation hints) in `src/components/layout/Footer.tsx`
- [x] T053 [US1] Add visually-hidden ARIA live region announcing "N changes" after compare in `src/features/compare/components/DiffViewer.tsx`
- [x] T054 Accessibility pass: keyboard nav order, `aria-label`s on icon buttons, focus visible, `prefers-reduced-motion`; skip link + reduced-motion handling across the app
- [x] T055 [P] Performance: native row windowing (CSS `content-visibility`) in `DiffViewer` rows for very large results (preserves scroll sync + line numbers) per research D6
- [x] T056 [P] Add theme toggle behavior (dark default; optional light) wired to `Header` in `src/components/layout/Header.tsx` + `src/theme/base.css` + `src/store`
- [x] T057 [P] Write `README.md` (setup with yarn, design decisions, architecture overview, future improvements) at `view_diff/README.md`
- [x] T064 Run `quickstart.md` validation scenarios V1–V6; ensure `yarn test` green and `yarn build` passes with strict TS

---

## Phase 8: User Story 6 - Syntax highlighting for code (Priority: P4)

**Goal**: Optional, toggleable syntax highlighting as a display layer over the diff, with an
"Auto" language mode plus explicit language selection, correct multi-line tokenization, WCAG-AA
token colors in both themes, and off-main-thread tokenization for large inputs.

**Independent Test**: Paste code, pick a language (or "Auto"), enable highlighting → tokens are
colored on both sides while change backgrounds and `+ / - / ~` signs stay intact; toggling off
restores plain monospace text; unsupported/undetected languages fall back cleanly.

**Decisions (defaults)**: highlight.js via `lowlight` (AST tokens + auto-detect); explicit
language dropdown with an "Auto" default in `DiffControls`; whole-document tokenization mapped to
per-line spans; syntax token colors defined as design tokens (dark) with light overrides.

### Tests for User Story 6 ⚠️

- [ ] T065 [P] [US6] Unit test for `tokenizeToLines` (whole-doc highlight → per-line token arrays; multi-line constructs; unknown/undetected language falls back to a single plain token) in `tests/unit/highlight/tokenizeToLines.test.ts`
- [ ] T066 [P] [US6] Component test for syntax highlighting in `tests/components/SyntaxHighlight.test.tsx` (spans rendered when enabled; toggle off → plain text; language selector switches grammar; change signs/backgrounds preserved)

### Implementation for User Story 6

- [ ] T067 [US6] Add `lowlight` (+ `highlight.js`) dependency and a curated common-language set in `package.json`
- [ ] T068 [US6] Implement `tokenizeToLines` (highlight whole text with the chosen/auto grammar, flatten the AST, split by newline into per-line `{ text, className }[]`, plain-text fallback) in `src/features/compare/highlight/tokenizeToLines.ts`
- [ ] T069 [US6] Define syntax token colors as design tokens (dark) + light overrides in `src/theme/tokens.css` / `src/theme/base.css`, verified WCAG AA on default and changed-row backgrounds
- [ ] T070 [US6] Extend the diff worker + client to compute per-line tokens alongside the diff (behind a flag) in `src/features/compare/workers/*`
- [ ] T071 [US6] Add syntax state to the store: `syntaxEnabled` (default on) + `language` ('auto' + explicit), recompute on change, in `src/store/index.ts`
- [ ] T072 [US6] Render tokens as spans (preserving whitespace + change signs; fallback to plain text when disabled/unavailable) in `src/features/compare/components/DiffRow.tsx`
- [ ] T073 [US6] Add a language selector + syntax on/off toggle to `src/features/compare/components/DiffControls.tsx`

**Checkpoint**: Code diffs are syntax-highlighted without affecting the diff result or accessibility.

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
- US5: after US1 (populates the editors via file input); no engine changes.
- US6: after US1 + US4 (renders over `DiffRow`; reuses the worker for tokenization). Independent of US5.

### Within Each User Story

- Tests written first and failing → then implementation.
- Pure engine (`src/features/compare/diff/`, `src/lib/`) before hooks before components before feature/`App.tsx` wiring.

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
Task: "Implement TextEditor in src/features/compare/components/TextEditor.tsx"
Task: "Implement DiffRow in src/features/compare/components/DiffRow.tsx"
Task: "Implement DiffPanelHeader in src/features/compare/components/DiffPanelHeader.tsx"
Task: "Implement DiffLegend in src/features/compare/components/DiffLegend.tsx"
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
- Keep the engine (`src/features/compare/diff/`) and `src/lib/` pure (no React/DOM) so it runs in the worker and under Vitest identically.
- Consume design tokens only — no raw hex — per constitution Principle III.
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.

**Total tasks**: 73 | US1: 17 (T014–T030) · US2: 6 (T031–T036) · US3: 8 (T037–T044) · US4: 7 (T045–T051) · US5: 6 (T058–T063) · US6: 9 (T065–T073) · Setup: 8 · Foundational: 5 · Polish: 7 (T052–T057, T064)
