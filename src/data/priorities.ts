import type { Card, Priority } from '../types'

/** Lowest → highest. Array position doubles as the sort rank. */
export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium-low', label: 'Medium Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium-high', label: 'Medium High' },
  { value: 'high', label: 'High' },
  { value: 'immediate', label: 'Immediate' },
]

/** Sensible middle default when a card needs a priority but none was picked. */
export const DEFAULT_PRIORITY: Priority = 'medium'

const RANK = new Map(PRIORITY_OPTIONS.map((opt, index) => [opt.value, index]))

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && RANK.has(value as Priority)
}

export function priorityLabel(priority: Priority): string {
  return PRIORITY_OPTIONS.find((opt) => opt.value === priority)?.label ?? priority
}

/**
 * Priority column display order: Immediate first, ties keep manual order.
 * Cards without a priority (e.g. old imports) sink to the bottom.
 */
export function comparePriorityThenOrder(a: Card, b: Card): number {
  const rankA = a.priority != null ? (RANK.get(a.priority) ?? -1) : -1
  const rankB = b.priority != null ? (RANK.get(b.priority) ?? -1) : -1
  if (rankA !== rankB) return rankB - rankA
  return a.order - b.order
}
