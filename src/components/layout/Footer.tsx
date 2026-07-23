import type { ReactNode } from 'react'

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border-default bg-elevated px-1.5 py-0.5 font-mono text-[0.7rem] leading-none text-text-secondary">
      {children}
    </kbd>
  )
}

/**
 * Application footer: keyboard shortcuts and navigation hints.
 */
export function Footer() {
  return (
    <footer className="border-t border-border-default">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 text-xs text-text-muted sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5">
            <Kbd>Ctrl</Kbd>
            <span aria-hidden="true">/</span>
            <Kbd>⌘</Kbd>
            <span aria-hidden="true">+</span>
            <Kbd>Enter</Kbd>
            <span className="ml-1">Compare</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Tab</Kbd>
            <span className="ml-1">Move between controls</span>
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span>Drag &amp; drop a file onto an editor to load it</span>
          </span>
        </div>
        <span className="font-mono">Dark-first · WCAG AA</span>
      </div>
    </footer>
  )
}
