import type { DiffResult } from '../types'

/** Message sent to the diff worker. `id` correlates the response. */
export interface DiffRequest {
  id: number
  originalText: string
  modifiedText: string
  contextLines: number
}

/** Message returned by the diff worker. */
export interface DiffResponse {
  id: number
  result: DiffResult
}
