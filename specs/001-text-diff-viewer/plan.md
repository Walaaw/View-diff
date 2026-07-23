# Implementation Plan: Side-by-Side Text Diff Viewer

**Branch**: `001-text-diff-viewer` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-text-diff-viewer/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a production-ready, client-side, dark-first side-by-side text diff viewer. Users paste or
type two plain-text versions, click **Compare**, and see an aligned, line-numbered comparison
that highlights added/removed/modified/unchanged lines, collapses long unchanged runs (with
adjustable context and expand controls), and stays readable and responsive on large inputs.

Technical approach: a strict separation between a pure, framework-agnostic **diff engine**
(built on `jsdiff`) that produces an aligned, row-oriented view model, and a **presentation
layer** of React 19 components styled with Tailwind CSS v4 + shadcn/ui. Diff computation runs
off the main render path (via a Web Worker for large inputs) and is memoized so React
re-renders stay minimal. All logic is unit-tested with Vitest + React Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 19, targeting ES2022 in the browser

**Primary Dependencies**: React 19, Vite 6, Tailwind CSS v4, shadcn/ui (Radix primitives),
`jsdiff` (diff), `clsx`/`tailwind-merge` for class composition, `lucide-react` for icons

**Storage**: None (fully client-side, in-memory; no persistence, accounts, or network calls)

**Testing**: Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom` environment;
`@testing-library/user-event` for interaction tests

**Target Platform**: Modern evergreen browsers (Chromium, Firefox, Safari); desktop, tablet,
mobile viewports

**Project Type**: Single-page web application (frontend only)

**Performance Goals**: Compare two 5,000+ line documents without freezing the UI; keep input
typing at 60 fps; diff computation offloaded to a Web Worker above a size threshold; virtualized
or windowed rendering avoids DOM blowup on very large diffs

**Constraints**: WCAG AA (contrast, keyboard, focus, screen readers, semantic HTML); dark-first
design system per constitution; transitions 150–200ms; 8px spacing grid; no color-only signals;
scroll-synced side-by-side panels with sticky headers

**Scale/Scope**: Single feature, ~6 screens/states in one page (empty, editing, loading,
result, collapsed, expanded); target diff sizes up to ~10k lines per side

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.0.0:

| Principle | Compliance in this plan |
|-----------|-------------------------|
| I. Dark-First & Readability | Dark theme is the only shipped theme initially; JetBrains Mono for diff content, Inter for UI; readability-first layout | ✅ |
| II. Minimal, Distraction-Free Hierarchy | Compare is the dominant action; secondary/ghost/icon button tiers; shadows only for elevation | ✅ |
| III. Design-System Fidelity (NON-NEGOTIABLE) | Tokens (colors, radii 10–14px, 8px spacing, fonts) encoded as Tailwind v4 theme tokens; components consume tokens, no ad-hoc hex | ✅ |
| IV. Accessibility Is a Requirement | Semantic HTML, keyboard nav, visible focus, ARIA labels, contrast checks; change type conveyed by icon/sign + color | ✅ |
| V. Responsive & Fast Micro-Interactions | Desktop 2-col / tablet / mobile stacked; 150–200ms transitions; reduced-motion respected; worker keeps UI responsive | ✅ |
| VI. Diff-Viewer Integrity | Aligned rows, dual line numbers, sticky headers, scroll sync, collapsible unchanged blocks, expandable context; correctness-first engine with unit tests | ✅ |

**Result**: PASS (no violations; Complexity Tracking not required).

## Project Structure

### Documentation (this feature)

```text
specs/001-text-diff-viewer/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── diff-engine.md   # Public contract of the pure diff module
│   └── ui-components.md # Component props/behavior contracts
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

The Spec Kit project root is `view_diff/`. The application is a single Vite frontend rooted
there (co-existing with the `.specify/` and `.cursor/` tooling folders).

```text
view_diff/
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts            # or test config inside vite.config.ts
├── tsconfig.json
├── tailwind.config.ts          # Tailwind v4 (CSS-first config in src/index.css)
├── components.json             # shadcn/ui config
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css               # Tailwind v4 entry + design tokens (@theme)
│   ├── types/                  # Shared TypeScript types (domain models)
│   │   └── diff.ts
│   ├── lib/                    # Pure business logic + utilities (no React)
│   │   ├── diff/
│   │   │   ├── computeDiff.ts      # jsdiff wrapper → line ops
│   │   │   ├── alignRows.ts        # pair removed/added into aligned rows + modified detection
│   │   │   ├── collapse.ts         # group unchanged runs into collapsible blocks w/ context
│   │   │   └── index.ts            # public diff engine entry (the contract surface)
│   │   ├── example.ts              # built-in example texts
│   │   └── utils.ts                # cn(), counting, misc pure helpers
│   ├── workers/
│   │   └── diff.worker.ts          # runs the diff engine off the main thread
│   ├── hooks/
│   │   ├── useDiff.ts              # orchestrates compare (worker/sync), loading state
│   │   ├── useScrollSync.ts        # sync scroll between panels
│   │   └── useCollapse.ts          # per-block + expand-all collapse state
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (button, textarea, badge, ...)
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── editors/
│   │   │   ├── TextEditor.tsx
│   │   │   └── EditorToolbar.tsx   # load example / clear / swap / compare
│   │   ├── diff/
│   │   │   ├── DiffViewer.tsx
│   │   │   ├── DiffPanelHeader.tsx # sticky column headers
│   │   │   ├── DiffRow.tsx
│   │   │   ├── CollapsedBlock.tsx
│   │   │   ├── DiffControls.tsx    # collapse toggle / expand all / context selector / counter
│   │   │   └── DiffLegend.tsx
│   │   └── states/
│   │       └── EmptyState.tsx
│   └── test/
│       └── setup.ts               # RTL/jest-dom setup
└── tests/                          # (co-located *.test.ts(x) also allowed under src)
    ├── unit/                       # diff engine, alignment, collapse, utils
    └── components/                 # component/interaction tests
```

**Structure Decision**: Single-project frontend (Option 1 flavor for a web SPA). The critical
architectural rule is the **`src/lib/` (pure logic) vs `src/components/` (presentation)**
separation mandated by the spec's Performance/Architecture sections and constitution Principle
VI. The diff engine in `src/lib/diff/` is pure, dependency-light (only `jsdiff`), and fully
unit-testable without React; the Web Worker simply imports and calls it; React components render
the resulting view model.

## Complexity Tracking

> No constitution violations — this section intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
