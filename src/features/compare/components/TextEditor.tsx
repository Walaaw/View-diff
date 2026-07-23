import { useId, useRef, useState } from 'react'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { Button, Textarea } from '@/components/ui'
import { formatBytes } from '@/lib/utils'
import { readTextFile } from '../files/readTextFile'

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
 * A labeled monospace editor. Supports typing, paste, and loading text from a
 * local file (Upload button or drag-and-drop; US5). Preserves whitespace and
 * shows a visible focus ring. Clear appears when `onClear` is given.
 */
export function TextEditor({
  id,
  label,
  value,
  onChange,
  onClear,
  placeholder,
}: TextEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedFile, setLoadedFile] = useState<{
    name: string
    size: number
    text: string
  } | null>(null)
  const errorId = useId()

  const loadFile = async (file: File | undefined | null) => {
    if (!file) return
    setIsReading(true)
    try {
      const result = await readTextFile(file)
      if (result.ok) {
        onChange(result.text)
        setLoadedFile({ name: file.name, size: file.size, text: result.text })
        setError(null)
      } else {
        setError(result.error)
      }
    } finally {
      setIsReading(false)
    }
  }

  const lower = label.toLowerCase()
  // Only show the chip while the editor still holds exactly what we loaded;
  // any manual edit, swap, clear, or reset changes `value` and hides it.
  const showChip = loadedFile !== null && loadedFile.text === value

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <label
            htmlFor={id}
            className="font-heading text-sm font-bold text-text-secondary"
          >
            {label}
          </label>
          {showChip ? (
            <span
              className="flex min-w-0 items-center gap-1.5 rounded-btn border border-border-default bg-elevated px-2 py-0.5 text-xs text-text-muted"
              title={`${loadedFile.name} (${formatBytes(loadedFile.size)})`}
            >
              <FileText className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-40">{loadedFile.name}</span>
              <span className="shrink-0 text-text-secondary">
                {formatBytes(loadedFile.size)}
              </span>
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isReading}
            aria-label={`Upload file to ${lower}`}
          >
            {isReading ? <Loader2 className="animate-spin" /> : <Upload />}
            {isReading ? 'Reading…' : 'Upload'}
          </Button>
          {onClear ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={value.length === 0}
              aria-label={`Clear ${lower}`}
            >
              <X />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="relative"
        onDragEnter={(e) => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          dragDepth.current += 1
          setIsDragging(true)
        }}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1)
          if (dragDepth.current === 0) setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          dragDepth.current = 0
          setIsDragging(false)
          void loadFile(e.dataTransfer.files?.[0])
        }}
      >
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-56 resize-y"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />

        {isDragging ? (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-input border-2 border-dashed border-accent bg-accent/10 text-sm font-medium text-accent"
            aria-hidden="true"
          >
            <Upload className="size-5" />
            Drop file to load
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.markdown,.log,.csv,.tsv,.json,.xml,.yaml,.yml,.toml,.ini,.js,.jsx,.ts,.tsx,.html,.css,.py,.rb,.go,.rs,.java,.c,.h,.cpp,.cs,.php,.sh,.sql,.svg,.vue,.svelte,text/*"
          className="hidden"
          tabIndex={-1}
          onChange={(e) => {
            void loadFile(e.target.files?.[0])
            // Reset so selecting the same file again re-triggers change.
            e.target.value = ''
          }}
        />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-removed-border">
          {error}
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-text-muted">
          <Upload className="size-3 shrink-0" aria-hidden="true" />
          Drag &amp; drop a file here, or use Upload
        </p>
      )}
    </div>
  )
}
