import { priorityLabel } from '../data/priorities'
import type { Priority } from '../types'

/** Colored pill showing a card's priority rank (card face + drag overlay). */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`card__priority card__priority--${priority}`}>
      {priorityLabel(priority)}
    </span>
  )
}
