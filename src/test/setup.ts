import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { useAppStore } from '@/store'

// Snapshot the store's initial state so we can restore it between tests
// (Zustand stores are module singletons and would otherwise leak state).
const initialAppState = useAppStore.getState()

afterEach(() => {
  cleanup()
  useAppStore.setState(initialAppState, true)
})
