import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('compare flow (US1)', () => {
  it('renders a diff with styled changes after clicking Compare', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Empty state before comparing.
    expect(screen.getByText(/click Compare to see the diff/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText('Original'), 'a\nb\nc')
    await user.type(screen.getByLabelText('Modified'), 'a\nX\nc')
    await user.click(screen.getByRole('button', { name: /compare/i }))

    const table = screen.getByRole('table', { name: /side-by-side diff/i })
    expect(table).toBeInTheDocument()
    // "b" removed/modified into "X" — both present in the rendered diff.
    expect(within(table).getByText('X')).toBeInTheDocument()
    // Changes counter reflects the number of changes.
    expect(within(table.parentElement!.parentElement!).getByText(/^\d+ changes?$/i)).toBeInTheDocument()
  })

  it('reports no changes for identical inputs', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Original'), 'same\nlines')
    await user.type(screen.getByLabelText('Modified'), 'same\nlines')
    await user.click(screen.getByRole('button', { name: /compare/i }))

    expect(screen.getByText(/no changes/i)).toBeInTheDocument()
  })
})
