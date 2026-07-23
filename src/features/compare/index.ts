// Public API of the compare feature.
export { CompareFeature } from './CompareFeature'

// Re-export the engine, hooks, and domain types for tests and future features.
export * from './types'
export { computeDiffResult, computeLineOps, computeStats, alignRows } from './diff'
export { useDiff, useScrollSync, type UseDiffResult } from './hooks'
