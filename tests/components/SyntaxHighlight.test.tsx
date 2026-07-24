import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

async function compareCode() {
  const user = userEvent.setup()
  const { container } = render(<App />)
  await user.type(screen.getByLabelText('Original'), 'const x = 1')
  await user.type(screen.getByLabelText('Modified'), 'const x = 2')
  await user.click(screen.getByRole('button', { name: /compare/i }))
  return { user, container }
}

describe('syntax highlighting (US6)', () => {
  it('renders highlighted tokens in the diff by default', async () => {
    const { container } = await compareCode()
    expect(container.querySelector('[class*="hljs-"]')).not.toBeNull()
  })

  it('removes highlighting when the syntax toggle is turned off', async () => {
    const { user, container } = await compareCode()
    expect(container.querySelector('[class*="hljs-"]')).not.toBeNull()

    await user.click(screen.getByRole('switch', { name: /syntax highlighting/i }))

    expect(container.querySelector('[class*="hljs-"]')).toBeNull()
    // Content is still present as plain text.
    expect(screen.getAllByText(/const x = 1/).length).toBeGreaterThan(0)
  })
})
