import { useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { CompareFeature } from '@/features/compare'
import { useAppStore } from '@/store'

/**
 * App is the composition root: it assembles the app chrome and the feature.
 * The Header's Reset/theme are wired to the global store; Header stays generic
 * and App holds no feature logic.
 */
function App() {
  const reset = useAppStore((s) => s.reset)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  // Reflect the theme on <html> so token overrides (theme/base.css) apply.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
    root.style.colorScheme = theme
    // Clear the anti-flash inline background so CSS tokens drive it.
    root.style.backgroundColor = ''
  }, [theme])

  return (
    <AppLayout theme={theme} onToggleTheme={toggleTheme} onReset={reset}>
      <CompareFeature />
    </AppLayout>
  )
}

export default App
