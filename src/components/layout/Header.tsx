import { GitCompareArrows, Moon, RotateCcw, Sun } from 'lucide-react'
import { Button } from '@/components/ui'

export interface HeaderProps {
  /** Active theme; controls the toggle icon/label. */
  theme?: 'dark' | 'light'
  /** Toggle the color theme (dark is default). */
  onToggleTheme?: () => void
  /** Reset the whole application to its initial state. */
  onReset?: () => void
}

/**
 * Application header: logo, title, theme toggle, and reset.
 * Presentational — behavior is wired via props.
 */
export function Header({ theme = 'dark', onToggleTheme, onReset }: HeaderProps) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  return (
    <header className="sticky top-0 z-20 border-b border-border-default bg-app/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-btn bg-accent/15 text-accent">
            <GitCompareArrows className="size-5" />
          </span>
          <div className="leading-tight">
            <h1 className="font-heading text-base font-bold tracking-tight">
              View Diff
            </h1>
            <p className="text-xs text-text-muted">
              Side-by-side text comparison
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="icon"
            size="icon"
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? <Moon /> : <Sun />}
          </Button>
          <Button variant="secondary" size="sm" onClick={onReset}>
            <RotateCcw />
            Reset
          </Button>
        </div>
      </div>
    </header>
  )
}
