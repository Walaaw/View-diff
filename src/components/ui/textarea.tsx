import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Textarea primitive for the editors: monospace, whitespace-preserving,
 * focus ring, radius 10px. Auto-resize/scroll behavior is applied by callers.
 */
function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-40 w-full rounded-input border border-border-default bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted',
        'transition-colors duration-150 hover:border-border-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      spellCheck={false}
      {...props}
    />
  )
}

export { Textarea }
