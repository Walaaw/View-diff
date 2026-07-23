# View Diff — Side-by-Side Text Diff Viewer

A fast, accessible, dark-first web app for comparing two blocks of text side by side. Paste,
type, or load files into two editors and get a clear, aligned, line-by-line diff with change
counts, collapsible unchanged sections, and a light/dark theme.

## Features

- **Side-by-side diff** with per-side line numbers and aligned rows.
- **Change classification** — added / removed / modified / unchanged, distinguishable by color
  **and** a sign (`+ / - / ~`) so color is never the only cue.
- **Change counts** and a legend.
- **Collapsible unchanged blocks** with an adjustable number of context lines and Expand All.
- **File input** — per-editor Upload button and drag-and-drop, with a loaded-file chip
  (name + size), size/type guards, and clear error messages.
- **Large inputs stay responsive** — big compares run in a Web Worker; the UI shows loading
  feedback and remains interactive.
- **Editor conveniences** — clear, swap, load example, live line/character counts, and
  `Ctrl` / `⌘` + `Enter` to compare.
- **Themes** — dark by default (per the design constitution) with an optional light theme,
  persisted across sessions.
- **Accessible** — keyboard-operable, visible focus, skip link, ARIA live announcements of
  results, and `prefers-reduced-motion` support.

## Getting started

Requires Node 20+ and [Yarn](https://classic.yarnpkg.com/) (Yarn 1.x).

```bash
yarn install      # install dependencies
yarn dev          # start the dev server (Vite)
yarn build        # type-check + production build to dist/
yarn preview      # preview the production build
yarn lint         # run ESLint
yarn test         # run the unit + component tests (Vitest)
yarn test:watch   # tests in watch mode
yarn coverage     # tests with coverage
```

## Tech stack

- **React 19** + **TypeScript** (strict), built with **Vite**.
- **Tailwind CSS v4** (CSS-first `@theme` tokens) with **shadcn/ui**-style primitives.
- **jsdiff** for the diff algorithm.
- **Zustand** for global state.
- **Vitest** + **React Testing Library** for tests.

## Architecture

The app is organized **feature-first**. Shared, cross-feature code stays global; everything
specific to comparing lives under `src/features/compare/`.

```
src/
  App.tsx                     # composition root: chrome + feature, theme effect
  main.tsx                    # React entry
  store/                      # global Zustand store (state + actions)
  components/
    ui/                       # design-system primitives (button, textarea, select, …)
    layout/                   # app chrome: AppLayout, Header, Footer (+ skip link)
  features/compare/
    CompareFeature.tsx        # the feature root (editors + toolbar + viewer)
    components/               # TextEditor, EditorToolbar, DiffViewer, DiffControls, …
    diff/                     # pure diff engine (align, stats, collapse) — no React/DOM
    files/                    # readTextFile (upload/drop parsing + guards)
    hooks/                    # useScrollSync
    workers/                  # diff.worker + client (off-main-thread compares)
    types.ts                  # domain model
  theme/
    tokens.css                # @theme design tokens (dark) + light overrides in base.css
    base.css                  # base styles, focus, reduced motion, perf, light theme
  lib/                        # pure helpers (cn, line utils, formatBytes, example)
tests/
  unit/                       # pure engine + util tests
  components/                 # component / store behavior tests
```

### Key design decisions

- **Pure engine, thin UI.** `features/compare/diff/` and `lib/` contain no React or DOM code,
  so the exact same functions run on the main thread, in the Web Worker, and under Vitest.
- **One global store, ready to split.** The app is a single feature today, so state lives in
  one Zustand store (`src/store`). Components only ever touch `useAppStore`, so a future split
  into per-feature slices won't reach into feature code. Fine-grained selectors keep re-renders
  minimal.
- **Worker offload with staleness safety.** Compares above a character threshold run in a
  worker; each request is tagged with a monotonic id so superseded (stale) results are
  discarded, and the UI reports `idle → computing → ready`.
- **Design tokens only.** Components consume CSS-variable-based utilities (e.g. `bg-surface`),
  never raw hex. The light theme is purely token overrides under `html.light`, so no component
  code changes are needed to re-theme.
- **Accessibility is not color-only.** Change types carry a sign and label in addition to color;
  focus is always visible; results are announced via an ARIA live region.
- **Native windowing for scale.** Off-screen diff rows use CSS `content-visibility` to skip
  layout/paint while preserving scroll position and line numbers — no JS virtualization needed.

## Keyboard shortcuts

- `Ctrl` / `⌘` + `Enter` — Compare (from within an editor)
- `Tab` / `Shift`+`Tab` — move between controls
- Drag & drop a file onto an editor to load it

## Possible future improvements

- Character-level (intra-line) highlighting for modified lines.
- Unified (inline) diff view in addition to side-by-side.
- Export/share a diff (URL or file).
- Syntax-aware highlighting for code inputs.
- Multi-file / folder comparison.
