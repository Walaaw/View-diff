import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

// The empty state also offers a "Load example" CTA, so scope toolbar actions
// to the labeled toolbar to keep queries unambiguous.
const toolbar = () => within(screen.getByRole('toolbar', { name: /editor actions/i }))

const getOriginal = () => screen.getByLabelText('Original') as HTMLTextAreaElement
const getModified = () => screen.getByLabelText('Modified') as HTMLTextAreaElement

describe('editor input actions (US2)', () => {
  it('loads the built-in example into both editors', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(toolbar().getByRole('button', { name: /load example/i }))

    expect(getOriginal().value).toContain("function Greeting({ name })")
    expect(getModified().value).toContain("greeting = 'Hello'")
  })

  it('swaps the contents of the two editors', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(getOriginal(), 'AAA')
    await user.type(getModified(), 'BBB')
    await user.click(toolbar().getByRole('button', { name: /swap/i }))

    expect(getOriginal()).toHaveValue('BBB')
    expect(getModified()).toHaveValue('AAA')
  })

  it('clears only the targeted editor', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(getOriginal(), 'AAA')
    await user.type(getModified(), 'BBB')
    await user.click(screen.getByRole('button', { name: /clear original/i }))

    expect(getOriginal()).toHaveValue('')
    expect(getModified()).toHaveValue('BBB')
  })
})
