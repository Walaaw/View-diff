import { useState } from 'react'
import { EditorToolbar, TextEditor } from '@/components/editors'
import { DiffLegend, DiffViewer } from '@/components/diff'
import { Separator } from '@/components/ui'
import { useDiff } from '@/hooks'

/**
 * App composes the diff feature: two editors, the compare action, and the
 * side-by-side viewer. Chrome (Header/Footer/providers) lives in AppLayout.
 */
function App() {
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

export default App
