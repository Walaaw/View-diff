import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Badge primitive for change counts / line counts, with diff-aware variants.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral:
          'border-border-default bg-elevated text-text-secondary',
        accent: 'border-transparent bg-accent text-accent-fg',
        added:
          'border-added-border/40 bg-added-bg text-added-text',
        removed:
          'border-removed-border/40 bg-removed-bg text-removed-text',
        modified:
          'border-modified-border/40 bg-modified-bg text-modified-text',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  )
}

export { Badge, badgeVariants }
