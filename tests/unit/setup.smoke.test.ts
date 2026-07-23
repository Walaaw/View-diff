import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

/**
 * Phase 1 smoke test: confirms the Vitest + path-alias + jsdom toolchain works.
 * Real diff-engine and component tests arrive in later phases.
 */
describe('toolchain setup', () => {
  it('resolves the @/* path alias and merges classes with cn()', () => {
    const hidden = false
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-app', hidden && 'hidden', 'font-mono')).toContain('font-mono')
  })

  it('has a jsdom document available', () => {
    expect(typeof document).toBe('object')
    expect(document.createElement('div')).toBeInstanceOf(HTMLElement)
  })
})
