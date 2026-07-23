import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('polish & cross-cutting (Phase 7)', () => {
  it('compares via Ctrl+Enter from within an editor', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Original'), 'a\nb\nc')
    await user.type(screen.getByLabelText('Modified'), 'a\nX\nc')
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(
      screen.getByRole('table', { name: /side-by-side diff/i }),
    ).toBeInTheDocument()
  })

  it('toggles between dark and light themes on <html>', async () => {
    const user = userEvent.setup()
    render(<App />)
    const root = document.documentElement

    expect(root.classList.contains('dark')).toBe(true)

    await user.click(
      screen.getByRole('button', { name: /switch to light theme/i }),
    )

    expect(root.classList.contains('light')).toBe(true)
    expect(root.classList.contains('dark')).toBe(false)
    expect(
      screen.getByRole('button', { name: /switch to dark theme/i }),
    ).toBeInTheDocument()
  })

  it('announces the change summary in a live region after comparing', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Original'), 'a\nb\nc')
    await user.type(screen.getByLabelText('Modified'), 'a\nX\nc')
    await user.click(screen.getByRole('button', { name: /compare/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/added/i)
  })

  it('shows per-editor line and character counts', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Original'), 'a\nb')

    expect(screen.getByText(/2 lines · 3 chars/i)).toBeInTheDocument()
  })
})
