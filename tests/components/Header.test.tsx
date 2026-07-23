import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('reset (US2)', () => {
  it('clears both inputs and the diff result', async () => {
    const user = userEvent.setup()
    render(<App />)

    const original = screen.getByLabelText('Original') as HTMLTextAreaElement
    const modified = screen.getByLabelText('Modified') as HTMLTextAreaElement

    await user.type(original, 'a\nb')
    await user.type(modified, 'a\nc')
    await user.click(screen.getByRole('button', { name: /compare/i }))

    // Diff is showing.
    expect(
      screen.getByRole('table', { name: /side-by-side diff/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reset/i }))

    // Inputs cleared and the diff is gone (empty state returns).
    expect(original).toHaveValue('')
    expect(modified).toHaveValue('')
    expect(
      screen.queryByRole('table', { name: /side-by-side diff/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/click Compare to see the diff/i)).toBeInTheDocument()
  })
})
