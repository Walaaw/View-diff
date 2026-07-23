/**
 * App shell — Phase 1 setup checkpoint.
 * Renders a minimal dark, token-driven layout to verify the toolchain
 * (Vite + React 19 + Tailwind v4 + design tokens). The full Header / editors /
 * diff viewer / footer are implemented in later phases.
 */
function App() {
  return (
    <div className="flex min-h-svh flex-col bg-app text-text-primary">
      <header className="border-b border-border-default px-6 py-4">
        <h1 className="font-heading text-xl font-bold tracking-tight">
          View&nbsp;Diff
        </h1>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="rounded-card border border-border-default bg-surface px-8 py-10 text-center shadow-lg">
          <p className="font-heading text-2xl font-bold text-text-primary">
            Side-by-Side Text Diff Viewer
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Project setup complete — editors and diff viewer coming next.
          </p>
          <code className="mt-4 inline-block rounded-input bg-elevated px-3 py-1 font-mono text-xs text-text-secondary">
            Phase 1: Setup ✓
          </code>
        </div>
      </main>

      <footer className="border-t border-border-default px-6 py-3 text-center text-xs text-text-muted">
        Dark-first · WCAG AA · 8px grid
      </footer>
    </div>
  )
}

export default App
