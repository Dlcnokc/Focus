import type { Card } from '../types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Valid YYYY-MM-DD string (the shape <input type="date"> produces). */
export function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ISO_DATE.test(value) &&
    !Number.isNaN(Date.parse(value))
  )
}

/** Local date as YYYY-MM-DD. */
export function todayIsoDate(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Human-readable form, e.g. "Jul 11, 2026". */
export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Completed column display order: most recent completion first.
 * Undated cards (old saves/imports) sink to the bottom; ties keep
 * manual drag order. ISO strings compare correctly as plain strings.
 */
export function compareCompletedDateThenOrder(a: Card, b: Card): number {
  const da = a.completedAt ?? ''
  const db = b.completedAt ?? ''
  if (da !== db) return da > db ? -1 : 1
  return a.order - b.order
}
