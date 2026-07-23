import { AppLayout } from '@/components/layout'
import { CompareFeature } from '@/features/compare'
import { useAppStore } from '@/store'

/**
 * App is the composition root: it assembles the app chrome and the feature.
 * The Header's Reset is wired to the global store's reset action; Header stays
 * generic and App holds no feature logic.
 */
function App() {
  const reset = useAppStore((s) => s.reset)
  return (
    <AppLayout onReset={reset}>
      <CompareFeature />
    </AppLayout>
  )
}

export default App
