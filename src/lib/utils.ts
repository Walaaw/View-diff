import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and resolve conflicting Tailwind utilities.
 * Standard shadcn/ui helper used across all components.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Normalize line endings to `\n` only. Everything else (including trailing
 * whitespace and Unicode) is preserved. Used before diffing.
 */
export function normalizeEol(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

/**
 * Split text into lines after EOL normalization, preserving all content.
 * An empty string yields an empty array (treated as "no content").
 */
export function toLines(text: string): string[] {
  if (text === '') return []
  return normalizeEol(text).split('\n')
}

/** True when a string has no content (empty or undefined). */
export function isBlankInput(text: string | null | undefined): boolean {
  return !text || text.length === 0
}

/** Pluralize a noun based on count (simple English "s"). */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}
