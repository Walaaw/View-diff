import { Badge } from '@/components/ui'

/**
 * Legend identifying the four diff states. Each item pairs a color with a
 * text label and sign (+/-/~) so meaning is never conveyed by color alone
 * (constitution Principle IV, FR-026).
 */
export function DiffLegend() {
  return (
    <ul aria-label="Diff legend" className="flex flex-wrap items-center gap-2">
      <li>
        <Badge variant="added">+ Added</Badge>
      </li>
      <li>
        <Badge variant="removed">- Removed</Badge>
      </li>
      <li>
        <Badge variant="modified">~ Modified</Badge>
      </li>
      <li>
        <Badge variant="neutral">Unchanged</Badge>
      </li>
    </ul>
  )
}
