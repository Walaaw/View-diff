import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TextEditor } from '@/features/compare/components/TextEditor'

/** Controlled wrapper so `value` reflects onChange (needed for the file chip). */
function ControlledEditor() {
  const [value, setValue] = useState('')
  return (
    <TextEditor id="editor-original" label="Original" value={value} onChange={setValue} />
  )
}

function renderEditor() {
  const onChange = vi.fn()
  const { container } = render(
    <TextEditor id="editor-original" label="Original" value="" onChange={onChange} />,
  )
  const input = container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement
  const dropzone = input.parentElement as HTMLElement
  return { onChange, input, dropzone }
}

describe('file upload (US5)', () => {
  it('loads a selected text file into the editor', async () => {
    const { onChange, input } = renderEditor()
    const file = new File(['hello\nworld'], 'a.txt', { type: 'text/plain' })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('hello\nworld'))
  })

  it('loads a file dropped onto the editor', async () => {
    const { onChange, dropzone } = renderEditor()
    const file = new File(['dropped text'], 'b.txt', { type: 'text/plain' })

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file], types: ['Files'] },
    })

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('dropped text'))
  })

  it('shows an error and leaves content unchanged for a non-text file', async () => {
    const { onChange, input } = renderEditor()
    const file = new File(['\u0089PNG'], 'img.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByRole('alert')).toHaveTextContent(/not a text file/i)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows a file chip with the name and size after loading', async () => {
    const { container } = render(<ControlledEditor />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['abcde'], 'notes.txt', { type: 'text/plain' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText('notes.txt')).toBeInTheDocument()
    expect(screen.getByText('5 B')).toBeInTheDocument()
  })

  it('reveals a drop overlay while dragging a file over the editor', () => {
    const { dropzone } = renderEditor()

    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ['Files'] } })

    expect(screen.getByText(/drop file to load/i)).toBeInTheDocument()
  })
})
