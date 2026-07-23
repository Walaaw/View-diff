/** Maximum file size accepted for text loading (5 MB). */
export const MAX_FILE_BYTES = 5 * 1024 * 1024

/** Human-readable form of the size limit, for messages. */
export const MAX_FILE_LABEL = '5 MB'

/**
 * File extensions treated as text even when the browser reports no/!text MIME
 * type (common for code files). Not exhaustive — ambiguous files still fall
 * back to a binary-content check after reading.
 */
const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'log', 'csv', 'tsv', 'json', 'jsonc', 'xml', 'yaml',
  'yml', 'toml', 'ini', 'env', 'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'html',
  'htm', 'css', 'scss', 'less', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'c', 'h',
  'cpp', 'hpp', 'cs', 'php', 'sh', 'bash', 'zsh', 'sql', 'svg', 'vue', 'svelte',
])

/** MIME types (beyond `text/*`) that are known to be textual. */
const TEXT_MIME_ALLOWLIST = new Set([
  'application/json',
  'application/xml',
  'application/javascript',
  'application/x-javascript',
  'application/xhtml+xml',
  'image/svg+xml',
])

/** MIME type prefixes that are definitely not text. */
const BINARY_MIME_PREFIXES = ['image/', 'audio/', 'video/', 'font/']
const BINARY_MIME_EXACT = new Set([
  'application/pdf',
  'application/zip',
  'application/gzip',
  'application/octet-stream',
])

export type ReadTextFileResult =
  | { ok: true; text: string }
  | { ok: false; error: string }

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

/**
 * Decide whether a file looks textual from its metadata alone. Returns:
 * - `true`  → clearly text (read it)
 * - `false` → clearly binary (reject)
 * - `null`  → ambiguous (read, then check content for NUL bytes)
 */
export function classifyFile(file: File): boolean | null {
  const type = file.type.toLowerCase()
  const ext = extensionOf(file.name)

  if (type.startsWith('text/')) return true
  if (TEXT_MIME_ALLOWLIST.has(type)) return true
  if (TEXT_EXTENSIONS.has(ext)) return true

  if (BINARY_MIME_PREFIXES.some((p) => type.startsWith(p))) return false
  if (BINARY_MIME_EXACT.has(type)) return false

  return null // unknown extension + empty/unknown MIME → verify by content
}

/** True when decoded text contains a NUL byte, a strong signal of binary data. */
function looksBinary(text: string): boolean {
  return text.includes('\u0000')
}

/**
 * Read a file's text with size and type guards. Never throws: failures are
 * returned as `{ ok: false, error }` so callers can show a non-blocking message
 * and leave the editor unchanged.
 */
export async function readTextFile(file: File): Promise<ReadTextFileResult> {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `File is too large (max ${MAX_FILE_LABEL}).` }
  }

  const kind = classifyFile(file)
  if (kind === false) {
    return { ok: false, error: 'That file is not a text file.' }
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { ok: false, error: 'Could not read the file.' }
  }

  if (looksBinary(text)) {
    return { ok: false, error: 'That file is not a text file.' }
  }

  return { ok: true, text }
}
