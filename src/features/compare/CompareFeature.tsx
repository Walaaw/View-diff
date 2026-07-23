import type { KeyboardEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui'
import {
  DiffControls,
  DiffLegend,
  DiffViewer,
  EditorToolbar,
  EmptyState,
  TextEditor,
} from './components'
import { useAppStore, selectCanCompare } from '@/store'

/**
 * Compare feature (US1 + US2): two editors with per-editor clear, a toolbar
 * (Compare / Swap / Load example), and the side-by-side viewer. State and
 * actions come from the global store via fine-grained selectors.
 */
export function CompareFeature() {
  const original = useAppStore((s) => s.original)
  const modified = useAppStore((s) => s.modified)
  const result = useAppStore((s) => s.result)
  const status = useAppStore((s) => s.status)
  const canCompare = useAppStore(selectCanCompare)

  const setOriginal = useAppStore((s) => s.setOriginal)
  const setModified = useAppStore((s) => s.setModified)
  const compare = useAppStore((s) => s.compare)
  const clearOriginal = useAppStore((s) => s.clearOriginal)
  const clearModified = useAppStore((s) => s.clearModified)
  const swap = useAppStore((s) => s.swap)
  const loadExample = useAppStore((s) => s.loadExample)

  // Ctrl/Cmd+Enter from within either editor triggers Compare.
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canCompare) {
      e.preventDefault()
      compare()
    }
  }

  return (
    <>
      <section
        aria-label="Text editors"
        className="grid gap-4 md:grid-cols-2"
        onKeyDown={handleKeyDown}
      >
        <TextEditor
          id="editor-original"
          label="Original"
          value={original}
          onChange={setOriginal}
          onClear={clearOriginal}
          placeholder="Paste or type the original text…"
        />
        <TextEditor
          id="editor-modified"
          label="Modified"
          value={modified}
          onChange={setModified}
          onClear={clearModified}
          placeholder="Paste or type the modified text…"
        />
      </section>

      <div className="mt-4">
        <EditorToolbar
          onCompare={compare}
          canCompare={canCompare}
          isComputing={status === 'computing'}
          onSwap={swap}
          onLoadExample={loadExample}
        />
      </div>

      <Separator className="my-6" />

      <section aria-label="Diff viewer" className="space-y-3">
        <DiffLegend />
        {result ? (
          <>
            <DiffControls result={result} />
            <DiffViewer result={result} />
          </>
        ) : status === 'computing' ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-default bg-surface/50 text-sm text-text-muted"
          >
            <Loader2 className="size-6 animate-spin text-accent" />
            Comparing…
          </div>
        ) : (
          <EmptyState onLoadExample={loadExample} />
        )}
      </section>
    </>
  )
}
