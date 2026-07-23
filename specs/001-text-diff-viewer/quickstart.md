# Quickstart & Validation Guide: Side-by-Side Text Diff Viewer

**Feature**: `001-text-diff-viewer` | **Date**: 2026-07-23

This guide explains how to run and validate the feature end-to-end. It references the
[data model](./data-model.md) and [contracts](./contracts/) rather than duplicating them.
Implementation code belongs in `tasks.md` / the implementation phase — this is a run/validate
guide only.

## Prerequisites

- Node.js ≥ 20 (Node 22 verified in this environment)
- Yarn (Classic 1.x verified)
- Project root: `view_diff/` (contains `.specify/` and the Vite app)

## Setup

```bash
cd view_diff
yarn install
```

Expected key dependencies (installed during implementation): `react@19`, `react-dom@19`, `vite`,
`typescript`, `tailwindcss@4`, shadcn/ui primitives, `diff` (jsdiff), and dev deps `vitest`,
`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`.

## Run the app

```bash
yarn dev        # start Vite dev server (default http://localhost:5173)
yarn build      # production build
yarn preview    # preview the production build
```

## Run the tests

```bash
yarn test           # run Vitest once
yarn test --watch   # watch mode
yarn coverage       # coverage report (if configured)
```

## Manual validation scenarios

Each scenario maps to spec acceptance criteria / success criteria. Perform them in the running
app (`yarn dev`).

### V1 — Core compare (US1, FR-007..FR-013)
1. Type/paste different text in the left and right editors.
2. Click **Compare**.
3. Expect: side-by-side view with green (added), red (removed), amber (modified), neutral
   (unchanged) rows; dual line numbers; aligned rows; a changes counter; visible legend.

### V2 — Input management (US2, FR-001..FR-006)
1. Click **Load Example** → both editors populate.
2. Click **Clear** on the left editor → only the left empties.
3. Click **Swap** → left/right contents exchange.
4. Click **Reset** (header) → app returns to initial empty state.

### V3 — Collapse / expand / context (US3, FR-014..FR-018)
1. Load two long texts sharing a large identical middle; Compare.
2. Expect the middle collapsed as "N unchanged lines hidden".
3. Expand that block → hidden rows appear; collapse it again → they hide.
4. Click **Expand All** → all hidden sections appear.
5. Change the **context** selector → surrounding context around changes updates.

### V4 — Empty / loading states (US4, FR-019, FR-020, FR-021)
1. Fresh load → empty state with helper text + CTA is shown (no diff viewer yet).
2. Paste two very large texts (5,000+ lines) and Compare → loading feedback appears; UI stays
   responsive; results render (SC-003).
3. Hover/focus/press any control → visible feedback.

### V5 — Edge cases (SC-002; see contracts/diff-engine.md table)
Verify via the app and/or unit tests: both empty, one empty, identical, completely different,
consecutive insertions, consecutive deletions, trailing whitespace, multiple blank lines,
Unicode, very long lines, large inputs.

### V6 — Accessibility (FR-025, FR-026, SC-005)
1. Operate the entire flow using only the keyboard (Tab/Shift+Tab/Enter/Space); focus is always
   visible.
2. Confirm change types are distinguishable without color (icon/sign + label in rows and legend).
3. Run an automated contrast/a11y check (e.g., axe DevTools) → no WCAG-AA violations on tokens.

## Automated validation (maps to Testing section)

- **Unit** (`tests/unit/`): diff engine per [contracts/diff-engine.md](./contracts/diff-engine.md)
  — `computeDiffResult` edge-case table, `alignRows`, `buildBlocks` thresholds, `computeStats`.
- **Component** (`tests/components/`): interactions per
  [contracts/ui-components.md](./contracts/ui-components.md) — compare, clear/swap/load-example,
  collapse/expand/expand-all, context change, scroll sync, keyboard reachability.

## Definition of done (feature-level)

- [ ] All manual validation scenarios V1–V6 pass.
- [ ] `yarn test` green; unit + component contracts covered.
- [ ] `yarn build` succeeds with strict TypeScript, no type errors.
- [ ] No WCAG-AA violations in automated a11y check.
- [ ] README documents setup, design decisions, architecture, and future improvements.
