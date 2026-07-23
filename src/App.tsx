import { CompareFeature } from '@/features/compare'

/**
 * App is the composition root: it only assembles features. Feature logic and
 * UI live inside each feature folder (e.g. `src/features/compare`).
 */
function App() {
  return <CompareFeature />
}

export default App
