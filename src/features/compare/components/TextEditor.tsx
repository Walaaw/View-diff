import { X } from 'lucide-react'
import { Button, Textarea } from '@/components/ui'

export interface TextEditorProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  /** Optional per-editor clear action (wired in US2). */
  onClear?: () => void
  placeholder?: string
}

/**
 * A labeled monospace editor. Supports typing and paste, preserves whitespace,
 * and shows a visible focus ring. Clear button appears when `onClear` is given.
 */
export function TextEditor({
  id,
  label,
  value,
  onChange,
  onClear,
  placeholder,
}: TextEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-heading text-sm font-bold text-text-secondary"
        >
          {label}
        </label>
        {onClear ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={value.length === 0}
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            <X />
            Clear
          </Button>
        ) : null}
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-56 resize-y"
        aria-label={label}
      />
    </div>
  )
}
