import { useState } from 'react'
import { Separator } from '@/components/ui'
import {
  DiffLegend,
  DiffViewer,
  EditorToolbar,
  TextEditor,
} from './components'
import { useDiff } from './hooks'

/**
 * Compare feature (US1): two editors, the Compare action, and the side-by-side
 * viewer. Self-contained — owns its input state and diff wiring.
 */
export function CompareFeature() {
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')
  const { result, status, compare } = useDiff()

  const canCompare = original.length > 0 || modified.length > 0

  return (
    <>
      <section aria-label="Text editors" className="grid gap-4 md:grid-cols-2">
        <TextEditor
          id="editor-original"
          label="Original"
          value={original}
          onChange={setOriginal}
          placeholder="Paste or type the original text…"
        />
        <TextEditor
          id="editor-modified"
          label="Modified"
          value={modified}
          onChange={setModified}
          placeholder="Paste or type the modified text…"
        />
      </section>

      <div className="mt-4">
        <EditorToolbar
          onCompare={() => compare(original, modified)}
          canCompare={canCompare}
          isComputing={status === 'computing'}
        />
      </div>

      <Separator className="my-6" />

      <section aria-label="Diff viewer" className="space-y-3">
        <DiffLegend />
        {result ? (
          <DiffViewer result={result} />
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-card border border-dashed border-border-default bg-surface/50 text-sm text-text-muted">
            Enter text in both editors and click Compare to see the diff.
          </div>
        )}
      </section>
    </>
  )
}
