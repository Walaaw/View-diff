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
        'flex min-h-40 w-full rounded-input border border-border-default bg-surface px-3.5 py-2.5 font-mono text-sm leading-6 text-text-primary placeholder:text-text-muted',
        'shadow-sm [tab-size:2]',
        'transition-[color,border-color,box-shadow] duration-150 hover:border-border-hover',
        'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      spellCheck={false}
      {...props}
    />
  )
}

export { Textarea }
