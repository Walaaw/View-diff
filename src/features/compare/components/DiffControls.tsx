import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui'
import { pluralize } from '@/lib/utils'
import { useAppStore } from '@/store'
import { CONTEXT_LINE_OPTIONS, type DiffResult } from '../types'

export interface DiffControlsProps {
  result: DiffResult
}

/**
 * Toolbar above the diff: changes counter + per-type badges, context-lines
 * selector, the collapse-unchanged toggle, and Expand All.
 */
export function DiffControls({ result }: DiffControlsProps) {
  const { stats, blocks, isIdentical } = result

  const contextLines = useAppStore((s) => s.contextLines)
  const collapseEnabled = useAppStore((s) => s.collapseEnabled)
  const expandedBlockIds = useAppStore((s) => s.expandedBlockIds)
  const setContextLines = useAppStore((s) => s.setContextLines)
  const setCollapseEnabled = useAppStore((s) => s.setCollapseEnabled)
  const expandAll = useAppStore((s) => s.expandAll)

  const collapsible = blocks.filter((b) => b.collapsible)
  const hasCollapsible = collapsible.length > 0
  const allExpanded = collapsible.every((b) => expandedBlockIds.has(b.id))
  const canExpandAll = collapseEnabled && hasCollapsible && !allExpanded

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-default bg-surface px-3 py-2">
      {/* Changes summary (announced via the sr-only live region in DiffViewer) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-text-secondary">
          {isIdentical ? 'No changes' : pluralize(stats.totalChanges, 'change')}
        </span>
        {stats.additions > 0 && <Badge variant="added">+{stats.additions}</Badge>}
        {stats.removals > 0 && <Badge variant="removed">-{stats.removals}</Badge>}
        {stats.modifications > 0 && (
          <Badge variant="modified">~{stats.modifications}</Badge>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          Context
          <Select
            value={String(contextLines)}
            onValueChange={(v) => setContextLines(Number(v))}
          >
            <SelectTrigger className="h-8 w-20" aria-label="Context lines">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTEXT_LINE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label
          htmlFor="collapse-toggle"
          className="flex items-center gap-2 text-xs text-text-secondary"
        >
          Collapse unchanged
          <Switch
            id="collapse-toggle"
            checked={collapseEnabled}
            onCheckedChange={setCollapseEnabled}
            aria-label="Collapse unchanged sections"
          />
        </label>

        <Button
          variant="ghost"
          size="sm"
          onClick={expandAll}
          disabled={!canExpandAll}
        >
          Expand all
        </Button>
      </div>
    </div>
  )
}
