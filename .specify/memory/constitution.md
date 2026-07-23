<!--
SYNC IMPACT REPORT
==================
Version change: (template, unversioned) → 1.0.0
Rationale: Initial ratification of the project constitution from the provided UI & UX Direction.

Modified principles: N/A (initial adoption)
Added principles:
  - I. Dark-First & Readability Above All
  - II. Minimal, Distraction-Free Hierarchy
  - III. Design-System Fidelity (NON-NEGOTIABLE)
  - IV. Accessibility Is a Requirement, Not a Feature
  - V. Responsive & Fast Micro-Interactions
  - VI. Diff-Viewer Integrity
Added sections:
  - Design System (Non-Negotiable Tokens)
  - Layout & Component Requirements
Removed sections: None (template placeholders replaced)

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check gate is derived dynamically; no hardcoded principles)
  - .specify/templates/spec-template.md ✅ compatible (no principle-specific sections required)
  - .specify/templates/tasks-template.md ✅ compatible (task categories remain generic)
  - .claude/skills/speckit-*/SKILL.md ✅ reviewed (no outdated agent-specific references introduced)

Deferred TODOs: None
-->

# View Diff Constitution

## Core Principles

### I. Dark-First & Readability Above All

Dark mode is the default and primary experience; any light theme is secondary and MUST NOT
degrade the dark experience. Readability is the highest priority: text, diff content, and
line numbers MUST remain legible at all supported viewport sizes and zoom levels. Color and
contrast choices MUST prioritize comfortable extended reading over decorative styling.

Rationale: The product is a developer-focused text/diff comparison tool inspired by GitHub,
VS Code, Linear, and Raycast; developers read for long sessions, so a clean, high-contrast
dark surface is the core value, not an option.

### II. Minimal, Distraction-Free Hierarchy

The interface MUST stay clean, minimal, and distraction-free. Every screen MUST express a
clear visual hierarchy: primary actions (Compare) are visually dominant, secondary actions
(Load example, Swap, Clear) are subdued, and destructive actions (Reset, Clear) are
distinguishable. Chrome, ornamentation, and effects MUST NOT compete with the diff content.
Shadows are permitted ONLY to separate elevated surfaces; heavy neumorphism or excessive
effects are prohibited.

Rationale: A fast, professional feel comes from restraint — content leads, controls support.

### III. Design-System Fidelity (NON-NEGOTIABLE)

All UI MUST be built from the defined design system tokens rather than ad-hoc values.
Spacing MUST follow the 8px grid. Colors MUST come from the defined background, border, text,
accent, and diff palettes. Border radii MUST use the defined scale (buttons/inputs 10px,
cards 14px, dialogs 16px). Typography MUST use Geist (headings), Inter (body), and JetBrains
Mono (diff content). Diff content MUST be rendered in monospace. Introducing a new token
(color, spacing, radius, font) requires updating the Design System section of this document
first.

Rationale: Consistency is what makes the product feel intentional and trustworthy; drifting
from tokens produces the "generic" look the product explicitly rejects.

### IV. Accessibility Is a Requirement, Not a Feature

The application MUST meet WCAG AA. This is non-negotiable and includes: semantic HTML,
full keyboard navigation, screen-reader support, appropriate ARIA labels, and visible focus
states on every interactive element. Color MUST NOT be the sole carrier of meaning —
added/removed/modified states MUST also be distinguishable by label, icon, or text. All
foreground/background pairings MUST satisfy WCAG AA contrast.

Rationale: Accessibility is a baseline of quality and reach; retrofitting it later is costly
and unreliable.

### V. Responsive & Fast Micro-Interactions

Layout MUST be responsive across desktop (two-column), tablet (side-by-side, reduced
spacing), and mobile (stacked editors, diff below inputs, wrapped controls). Interactions
MUST feel fast: transitions MUST fall within 150–200ms, and hover, focus-ring, button-press,
and expand/collapse feedback MUST be smooth and consistent. Animations MUST NOT block input
or delay the user's ability to read results. Motion MUST respect the user's reduced-motion
preference.

Rationale: Perceived speed and responsiveness are core to the "clean, minimal, fast"
identity; janky or slow motion undermines a developer tool.

### VI. Diff-Viewer Integrity

The diff viewer MUST present a faithful, aligned comparison. It MUST provide: side-by-side
layout, line numbers, correct line alignment across panels, sticky column headers,
synchronized scrolling between panels, collapsible unchanged blocks, and expandable context.
Added, removed, modified, and unchanged states MUST be styled per the defined diff palette
and remain readable. Correctness of alignment and change detection takes precedence over
visual embellishment.

Rationale: The diff view is the product; misalignment, broken scroll sync, or unreadable
changes are correctness failures, not cosmetic ones.

## Design System (Non-Negotiable Tokens)

These tokens are authoritative. UI MUST reference them; changes require a constitution
amendment.

**Backgrounds**: App `#0B1220`, Surface `#111827`, Elevated Surface `#1A2234`.

**Borders**: Default `#2A3448`, Hover `#3B4860`.

**Text**: Primary `#F8FAFC`, Secondary `#CBD5E1`, Muted `#94A3B8`.

**Accent**: Indigo primary; a slightly brighter indigo on hover.

**Diff — Added**: bg `#163A2D`, border `#22C55E`, text `#BBF7D0`.
**Diff — Removed**: bg `#3A1818`, border `#EF4444`, text `#FECACA`.
**Diff — Modified**: bg `#3D2E16`, border `#F59E0B`, text `#FDE68A`.
**Diff — Unchanged**: transparent background, muted text.

**Typography**: Geist (headings, bold), Inter (body), JetBrains Mono (diff content).

**Radius**: buttons/inputs 10px, cards 14px, dialogs 16px.

**Spacing**: 8px grid for all spacing and layout rhythm.

**Elevation**: subtle shadows only, used solely to separate elevated surfaces.

## Layout & Component Requirements

The application MUST provide these regions and components, styled per the design system:

- **Header**: application logo, title, theme toggle, reset button.
- **Input Section**: original and modified text editors (monospace, paste support, auto
  resize, visible focus state), load example, per-editor clear, compare, and swap-sides.
- **Diff Controls**: collapse-unchanged toggle, expand-all, context selector, legend
  (Added / Removed / Modified / Unchanged), and a changes counter.
- **Diff Viewer**: side-by-side comparison with line numbers, aligned rows, collapsible
  unchanged blocks, expandable context, sticky column headers, and scroll synchronization.
- **Footer**: keyboard shortcuts and navigation hints.
- **Component set**: buttons (primary, secondary, ghost, icon); text areas; cards (editors,
  diff viewer, empty state, tips); legend; badges (change count, line count); and a friendly
  empty state with helper text and a clear call-to-action.

## Governance

This constitution supersedes ad-hoc UI/UX and styling decisions. All pull requests and
reviews MUST verify compliance with the Core Principles and the Design System tokens; any
deviation MUST be justified in the PR description and either brought into compliance or
codified via an amendment.

Amendments MUST be made by editing this document, are subject to review, and MUST update the
version and dates below. Versioning follows semantic versioning:
- MAJOR: backward-incompatible governance or principle removals/redefinitions.
- MINOR: a new principle/section or materially expanded guidance.
- PATCH: clarifications, wording, or non-semantic refinements (including token value tweaks
  that do not change intent).

Compliance is reviewed at every design and code review. When a token or principle changes,
dependent artifacts (templates and downstream specs/plans/tasks) MUST be re-checked for
alignment before merge.

**Version**: 1.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-23
