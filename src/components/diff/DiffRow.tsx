import { cn } from '@/lib/utils'
import type { ChangeType, DiffCell } from '@/types/diff'

interface SideCellProps {
  cell: DiffCell
  type: ChangeType
  side: 'left' | 'right'
}

/** Sign shown for a populated cell — conveys change type without color. */
function signFor(type: ChangeType, side: 'left' | 'right'): string {
  if (type === 'modified') return '~'
  if (side === 'left' && type === 'removed') return '-'
  if (side === 'right' && type === 'added') return '+'
  return ''
}

/** Whether this side visually carries the change styling. */
function isActiveSide(type: ChangeType, side: 'left' | 'right'): boolean {
  if (type === 'modified') return true
  if (type === 'unchanged') return false
  return side === 'left' ? type === 'removed' : type === 'added'
}

function SideCell({ cell, type, side }: SideCellProps) {
  const populated = cell.content !== null
  const active = populated && isActiveSide(type, side)

  const tone = active
    ? type === 'added'
      ? 'bg-added-bg text-added-text'
      : type === 'removed'
        ? 'bg-removed-bg text-removed-text'
        : 'bg-modified-bg text-modified-text' // modified
    : populated
      ? 'text-text-primary'
      : 'bg-surface/40'

  return (
    <div className={cn('grid grid-cols-[3rem_1rem_1fr]', tone)}>
      <span
        aria-hidden={!populated}
        className="select-none border-r border-border-default/60 px-2 text-right text-xs leading-6 text-text-muted"
      >
        {cell.lineNumber ?? ''}
      </span>
      <span
        aria-hidden="true"
        className="select-none text-center text-xs leading-6 opacity-80"
      >
        {populated ? signFor(type, side) : ''}
      </span>
      <pre className="overflow-x-auto whitespace-pre px-2 font-mono text-sm leading-6">
        {cell.content ?? ''}
      </pre>
    </div>
  )
}

/**
 * A single aligned row rendering both sides. Whitespace is preserved (`pre`),
 * change type is conveyed by color AND a sign (+/-/~) for accessibility.
 */
export function DiffRow({ row }: { row: import('@/types/diff').DiffRow }) {
  return (
    <div className="grid grid-cols-2 border-b border-border-default/40">
      <div className="border-r border-border-default">
        <SideCell cell={row.left} type={row.type} side="left" />
      </div>
      <SideCell cell={row.right} type={row.type} side="right" />
    </div>
  )
}
