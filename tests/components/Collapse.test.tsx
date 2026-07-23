import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import { useAppStore } from '@/store'

// A change, then a 5-line unchanged run, then a change.
const ORIGINAL = 'A\nu1\nu2\nu3\nu4\nu5\nZ'
const MODIFIED = 'B\nu1\nu2\nu3\nu4\nu5\nW'

async function setupCollapsedDiff(user: ReturnType<typeof userEvent.setup>) {
  render(<App />)
  await user.type(screen.getByLabelText('Original'), ORIGINAL)
  await user.type(screen.getByLabelText('Modified'), MODIFIED)
  await user.click(screen.getByRole('button', { name: /compare/i }))
  // Shrink context so the 5-line unchanged middle collapses (5 > 2*1+1).
  act(() => useAppStore.getState().setContextLines(1))
}

describe('collapse / expand (US3)', () => {
  it('collapses a long unchanged run and shows the hidden count', async () => {
    const user = userEvent.setup()
    await setupCollapsedDiff(user)

    expect(screen.getByText(/3 unchanged lines hidden/i)).toBeInTheDocument()
    // The middle hidden line is not rendered.
    expect(screen.queryByText('u3')).not.toBeInTheDocument()
  })

  it('expands a single block when its divider is clicked', async () => {
    const user = userEvent.setup()
    await setupCollapsedDiff(user)

    await user.click(screen.getByRole('button', { name: /expand .*hidden/i }))

    expect(screen.getAllByText('u3').length).toBeGreaterThan(0)
    expect(screen.queryByText(/unchanged lines hidden/i)).not.toBeInTheDocument()
  })

  it('reveals everything via Expand all', async () => {
    const user = userEvent.setup()
    await setupCollapsedDiff(user)

    await user.click(screen.getByRole('button', { name: /expand all/i }))

    expect(screen.getAllByText('u3').length).toBeGreaterThan(0)
    expect(screen.queryByText(/unchanged lines hidden/i)).not.toBeInTheDocument()
  })

  it('the collapse toggle expands all, then restores collapsing', async () => {
    const user = userEvent.setup()
    await setupCollapsedDiff(user)

    const toggle = screen.getByRole('switch', { name: /collapse unchanged/i })

    await user.click(toggle) // off → everything expanded
    expect(screen.getAllByText('u3').length).toBeGreaterThan(0)

    await user.click(toggle) // on → auto-collapse restored
    expect(screen.queryByText('u3')).not.toBeInTheDocument()
  })

  it('recomputes collapsing when the context lines change', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Original'), ORIGINAL)
    await user.type(screen.getByLabelText('Modified'), MODIFIED)
    await user.click(screen.getByRole('button', { name: /compare/i }))

    // Default context (3) leaves the 5-line run expanded.
    expect(screen.queryByText(/unchanged lines hidden/i)).not.toBeInTheDocument()

    act(() => useAppStore.getState().setContextLines(1))

    expect(screen.getByText(/unchanged lines hidden/i)).toBeInTheDocument()
  })
})
