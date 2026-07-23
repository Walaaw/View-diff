// Public API of the compare feature.
export { CompareFeature } from './CompareFeature'

// Engine, hooks, and domain types (shared with the global store and tests).
export * from './types'
export { computeDiffResult, computeLineOps, computeStats, alignRows } from './diff'
export { useScrollSync } from './hooks'
