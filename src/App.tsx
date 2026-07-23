import { DiffLegend } from '@/components/diff'
import { Separator } from '@/components/ui'

/**
 * App is pure feature content — the editors and diff regions.
 * The chrome (Header/Footer/providers) lives in AppLayout, which wraps App
 * in main.tsx. Editors and the diff viewer are added to their regions in
 * later phases.
 */
function App() {
  return (
    <>
      <section aria-label="Text editors" className="grid gap-4 md:grid-cols-2">
        {/* TextEditor components mount here in Phase 3 */}
      </section>

      <Separator className="my-6" />

      <section aria-label="Diff viewer" className="space-y-3">
        <DiffLegend />
        {/* DiffControls + DiffViewer mount here in later phases */}
      </section>
    </>
  )
}

export default App
