# Feature Specification: Side-by-Side Text Diff Viewer

**Feature Branch**: `001-text-diff-viewer`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Build a production-ready side-by-side text diff viewer for comparing two versions of plain text."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compare two texts side by side (Priority: P1)

A user pastes or types an original version of some text into a left editor and a modified
version into a right editor, clicks **Compare**, and immediately sees a side-by-side view
that highlights what was added, removed, modified, and left unchanged, with line numbers on
both sides and related lines aligned across the two panels.

**Why this priority**: This is the core value of the product. Without a correct, readable
side-by-side comparison, nothing else matters. It alone constitutes a viable MVP.

**Independent Test**: Enter two differing texts, click Compare, and verify the viewer shows
aligned rows with correct added/removed/modified/unchanged styling and accurate line numbers.

**Acceptance Scenarios**:

1. **Given** two non-empty texts that differ, **When** the user clicks Compare, **Then** a
   side-by-side view appears with added lines styled green, removed lines styled red,
   modified lines styled amber, and unchanged lines styled neutral.
2. **Given** the two texts are identical, **When** the user clicks Compare, **Then** every
   line is shown as unchanged and the changes counter reports zero changes.
3. **Given** a comparison has been rendered, **When** the user reads any row, **Then** the
   left and right line numbers are visible and related lines sit on the same visual row.
4. **Given** a comparison result, **When** the user scrolls one panel, **Then** the other
   panel scrolls in sync and the column headers remain visible (sticky).
5. **Given** whitespace-only or blank-line differences, **When** the user compares, **Then**
   whitespace and blank lines are preserved and represented faithfully in the result.

---

### User Story 2 - Edit, load example, clear, and swap inputs (Priority: P1)

A user manages the two inputs efficiently: typing or pasting text, loading a built-in example
to explore the tool, clearing either editor independently, and swapping the two sides so the
original and modified contents trade places.

**Why this priority**: Getting text into and out of the editors is a prerequisite for any
comparison and is part of the minimum usable experience.

**Independent Test**: Load the example, verify both editors populate; clear the left editor
and verify only it empties; swap and verify contents exchange sides.

**Acceptance Scenarios**:

1. **Given** an empty editor, **When** the user types or pastes text, **Then** the editor
   displays the exact content including whitespace.
2. **Given** the app just opened, **When** the user clicks Load Example, **Then** both editors
   populate with representative sample text ready to compare.
3. **Given** both editors contain text, **When** the user clicks Clear on one editor, **Then**
   only that editor is emptied and the other is unchanged.
4. **Given** both editors contain distinct text, **When** the user clicks Swap, **Then** the
   left content moves to the right and the right content moves to the left.

---

### User Story 3 - Collapse and expand unchanged sections (Priority: P2)

When comparing long documents with large runs of identical text, the viewer automatically
collapses long unchanged blocks into a compact summary showing how many lines are hidden. The
user can expand a single collapsed block, collapse it again, or expand all hidden sections at
once, and can adjust how many context lines surround changes.

**Why this priority**: Essential for readability on real-world documents, but the tool is
still usable for short inputs without it, so it ranks just below the core comparison.

**Independent Test**: Compare two long texts with a big identical middle section and verify
the middle collapses with a hidden-line count, then expand/collapse it and use Expand All.

**Acceptance Scenarios**:

1. **Given** a long run of unchanged lines beyond the context threshold, **When** the result
   renders, **Then** that run is collapsed into a single summary showing the hidden line count.
2. **Given** a collapsed block, **When** the user expands it, **Then** the hidden lines become
   visible in place; **When** the user collapses it again, **Then** they hide again.
3. **Given** one or more collapsed blocks, **When** the user clicks Expand All, **Then** all
   hidden sections become visible.
4. **Given** a context selector, **When** the user changes the number of context lines, **Then**
   the amount of surrounding unchanged context shown around each change updates accordingly.

---

### User Story 4 - Clear feedback and empty/loading states (Priority: P3)

Before any comparison the user sees a friendly empty state explaining what to do. Every
interaction gives visible feedback, and if a comparison is expensive the user sees loading
feedback rather than an unresponsive interface.

**Why this priority**: Improves polish, trust, and perceived performance, but the tool
functions without it.

**Independent Test**: Open the app and verify the empty state and call-to-action appear;
trigger a large comparison and verify loading feedback appears until results render.

**Acceptance Scenarios**:

1. **Given** no comparison has been run, **When** the app loads, **Then** an empty state with
   helper text and a clear call-to-action is shown in place of the diff viewer.
2. **Given** an expensive comparison, **When** the user clicks Compare, **Then** loading
   feedback is shown and the interface remains responsive until results appear.
3. **Given** any interactive control, **When** the user hovers, focuses, or activates it,
   **Then** clear visual feedback is provided.

---

### User Story 5 - Load text from a file (Priority: P3)

Instead of pasting, the user can bring text in from a local file — either by clicking an Upload
control on an editor or by dragging a file onto it. This makes comparing real files fast without
manual copy-paste.

**Why this priority**: A convenience input path that complements paste/type; the tool is fully
usable without it, but it removes friction for the common "compare two files" workflow.

**Independent Test**: Click Upload on an editor and choose a text file, or drag a file onto an
editor; the file's text populates that editor exactly and can be compared.

**Acceptance Scenarios**:

1. **Given** an editor, **When** the user clicks Upload and selects a text file, **Then** the
   editor is populated with the file's exact contents (whitespace and line breaks preserved).
2. **Given** an editor, **When** the user drags a file over it, **Then** a clear drop target is
   indicated; **When** the file is dropped, **Then** the editor is populated with its contents.
3. **Given** a file that is too large or not text, **When** the user tries to load it, **Then**
   a clear, non-blocking message is shown and the editor contents are left unchanged.
4. **Given** a loaded file, **When** the user edits, clears, swaps, or resets, **Then** the
   contents behave exactly as manually entered text (no special-casing downstream).

---

### User Story 6 - Syntax highlighting for code (Priority: P4)

When comparing source code, the user can have each line's syntax highlighted (keywords, strings,
comments, etc.) so code is easier to read inside the diff. Highlighting is a display layer over
the existing diff and can be toggled off.

**Why this priority**: A readability enhancement for code inputs; the tool is fully functional
without it, and it must never obscure the diff's change coloring or accessibility signals.

**Independent Test**: Paste code, pick a language (or leave "Auto"), enable syntax highlighting,
and verify tokens are colored on both sides while added/removed/modified styling and signs remain
intact; toggling it off restores plain monospace text.

**Acceptance Scenarios**:

1. **Given** code in both editors, **When** syntax highlighting is enabled, **Then** each line's
   tokens are colored according to the selected language while the diff's row backgrounds and
   `+ / - / ~` signs remain clearly visible.
2. **Given** the language selector set to "Auto", **When** a comparison runs, **Then** the
   language is detected and applied; **When** a specific language is chosen, **Then** that grammar
   is used instead.
3. **Given** multi-line constructs (block comments, template strings), **When** highlighting is
   applied, **Then** tokens are correct across line boundaries (highlighting derives from the
   whole document, not isolated lines).
4. **Given** an unsupported/undetected language or highlighting disabled, **When** the diff
   renders, **Then** content falls back to plain monospace text with no errors.
5. **Given** either theme, **When** highlighting is on, **Then** token colors meet WCAG AA
   contrast on default and on changed-row backgrounds.

---

### Edge Cases

- **Both inputs empty**: Comparing shows an empty/neutral result (or empty state) with zero
  changes and no error.
- **One document empty**: All lines from the non-empty side are shown as added or removed as
  appropriate, aligned against blanks on the empty side.
- **Completely different documents**: Every line is shown as removed on the left and added on
  the right, with no false "unchanged" matches.
- **Identical documents**: Every line is unchanged; the changes counter reads zero.
- **Large text inputs**: The comparison completes and renders without freezing the interface;
  loading feedback is shown while it computes.
- **Consecutive insertions / deletions**: Runs of added-only or removed-only lines are grouped
  and styled correctly without misalignment.
- **Trailing whitespace**: Trailing spaces are preserved and, where they are the only
  difference, the line is reported as changed rather than unchanged.
- **Multiple blank lines**: Consecutive empty lines are preserved and counted individually.
- **Unicode characters**: Multi-byte and non-Latin characters render and compare correctly.
- **Very long lines**: Long single lines are handled without breaking layout or scroll sync.

## Requirements *(mandatory)*

### Functional Requirements

**Text input management**

- **FR-001**: Users MUST be able to type text manually into both an original (left) and a
  modified (right) editor.
- **FR-002**: Users MUST be able to paste text into either editor, preserving exact content
  including whitespace and line breaks.
- **FR-003**: Users MUST be able to clear each editor independently without affecting the other.
- **FR-004**: Users MUST be able to swap the contents of the two editors.
- **FR-005**: Users MUST be able to load a built-in example into both editors for demonstration.
- **FR-006**: Users MUST be able to reset the entire application to its initial state.
- **FR-006a**: Users MUST be able to load text into either editor from a local file, both via an
  explicit Upload control and via drag-and-drop onto that editor.
- **FR-006b**: File loading MUST preserve the file's exact text content (whitespace, line breaks,
  Unicode) and MUST replace only the targeted editor.
- **FR-006c**: The system MUST reject non-text or oversized files with a clear, non-blocking
  message and leave the editor contents unchanged.

**Comparison behavior**

- **FR-007**: The system MUST compute and display the comparison only after the user explicitly
  activates a Compare action (not automatically on every keystroke).
- **FR-008**: The system MUST classify each line of the result as added, removed, modified, or
  unchanged.
- **FR-009**: The system MUST align related lines so corresponding original and modified lines
  appear on the same visual row in the side-by-side view.
- **FR-010**: The system MUST preserve whitespace, indentation, blank lines, and Unicode
  characters exactly in both inputs and results.
- **FR-011**: The system MUST display line numbers for both the original and modified sides.
- **FR-012**: The system MUST display a count of changes (e.g., additions, removals,
  modifications) for the current comparison.
- **FR-013**: The system MUST provide a legend identifying the added, removed, modified, and
  unchanged styles.

**Collapsible sections**

- **FR-014**: The system MUST automatically collapse long unchanged blocks into a compact
  summary.
- **FR-015**: Each collapsed block MUST display the number of hidden lines.
- **FR-016**: Users MUST be able to expand an individual collapsed block and collapse it again.
- **FR-017**: Users MUST be able to expand all collapsed sections at once.
- **FR-018**: Users MUST be able to adjust the number of context lines shown around changes.

**Feedback & states**

- **FR-019**: The system MUST present a helpful empty state with a call-to-action before any
  comparison has been made.
- **FR-020**: The system MUST show loading feedback when a comparison is expensive, keeping the
  interface responsive.
- **FR-021**: The system MUST provide clear visual feedback (hover, focus, active/press) for
  every interactive control.
- **FR-022**: The diff viewer MUST keep column headers visible (sticky) and MUST synchronize
  scrolling between the two panels.

**Presentation & platform**

- **FR-023**: The interface MUST use a dark-first theme with readability prioritized over
  decoration, following the project constitution's design system.
- **FR-024**: The layout MUST be responsive: two-column on desktop, side-by-side with reduced
  spacing on tablet, and stacked editors with the diff below on mobile.
- **FR-025**: The application MUST meet WCAG AA, including keyboard navigation, visible focus
  indicators, screen-reader support, semantic markup, and sufficient color contrast.
- **FR-026**: Added/removed/modified/unchanged states MUST be distinguishable by more than
  color alone (e.g., label, icon, or sign).

**Syntax highlighting**

- **FR-027**: The system MUST optionally highlight the syntax of each line's content as a display
  layer over the diff, toggleable on/off, and MUST NOT alter the underlying diff result.
- **FR-028**: The system MUST support an "Auto" language mode (detection) and explicit language
  selection, and MUST derive highlighting from the whole document so multi-line constructs are
  tokenized correctly.
- **FR-029**: Highlighting MUST preserve whitespace and the added/removed/modified backgrounds and
  `+ / - / ~` signs; token colors MUST meet WCAG AA on default and changed-row backgrounds in both
  themes, and MUST fall back to plain text when a language is unavailable or highlighting is off.
- **FR-030**: Highlighting MUST NOT block the UI — tokenization of large inputs runs off the main
  thread (alongside the diff worker).

### Key Entities *(include if feature involves data)*

- **Document**: One side of a comparison (original or modified). Represented as ordered lines,
  each preserving exact text and whitespace.
- **Diff Line**: A single row in the result, carrying its change type (added, removed,
  modified, unchanged), the original and/or modified line content, and the corresponding line
  numbers on each side.
- **Diff Block**: A contiguous group of diff lines of the same nature; unchanged blocks may be
  collapsible and carry a hidden-line count and expanded/collapsed state.
- **Comparison Result**: The full ordered set of diff blocks plus summary counts (added,
  removed, modified) for the current comparison.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For two texts that differ, a user can produce a correct, readable side-by-side
  comparison in a single Compare action.
- **SC-002**: 100% of the enumerated edge cases (empty, one-empty, identical, completely
  different, consecutive insertions/deletions, trailing whitespace, multiple blank lines,
  Unicode, very long lines, large inputs) produce correct results without errors or layout
  breakage.
- **SC-003**: Comparing two documents of at least 5,000 lines each renders results without the
  interface becoming unresponsive, with loading feedback shown while computing.
- **SC-004**: Long unchanged regions are collapsed by default, and a user can reveal any hidden
  region (single or all) within one action each.
- **SC-005**: The interface passes WCAG AA checks for contrast and is fully operable using the
  keyboard alone, with visible focus at every step.
- **SC-006**: 90% of first-time users can complete a comparison (input two texts and view the
  result) without external guidance.

## Assumptions

- The tool compares plain text only; rich text, binary files, images, and file uploads are out
  of scope for this version (input is via typing/pasting into editors).
- Comparison is line-oriented; intra-line/word-level highlighting within a modified line is a
  desirable enhancement but not required for MVP correctness.
- All processing happens client-side in the browser; there is no persistence, accounts, or
  server-side storage, and no network dependency for comparing text.
- "Modified" lines are derived from adjacent removed/added pairs at the same position; the
  underlying diff is computed with a standard text-diff algorithm.
- The technical stack is fixed by the requester (React 19, Vite, TypeScript, Tailwind CSS v4,
  shadcn/ui, jsdiff, Vitest, React Testing Library) and will be detailed during planning; it
  does not change the user-facing behavior described here.
- Default collapse/context behavior uses a small number of context lines around each change,
  adjustable by the user via the context selector.
