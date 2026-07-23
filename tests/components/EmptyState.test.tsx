import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from '@/features/compare/components'

describe('EmptyState', () => {
  it('renders an illustration, hint text, and a call to action', () => {
    render(<EmptyState onLoadExample={() => {}} />)

    expect(screen.getByText(/nothing to compare yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /load example/i }),
    ).toBeInTheDocument()
  })

  it('invokes onLoadExample when the CTA is clicked', async () => {
    const user = userEvent.setup()
    const onLoadExample = vi.fn()
    render(<EmptyState onLoadExample={onLoadExample} />)

    await user.click(screen.getByRole('button', { name: /load example/i }))

    expect(onLoadExample).toHaveBeenCalledTimes(1)
  })
})
