import { describe, expect, it } from 'vitest'
import type { Card } from '../types'
import {
  compareCompletedDateThenOrder,
  isIsoDate,
  todayIsoDate,
} from './dates'

function card(partial: Partial<Card> & Pick<Card, 'id'>): Card {
  return {
    title: partial.title ?? partial.id,
    notes: '',
    column: partial.column ?? 'done',
    order: partial.order ?? 0,
    archived: partial.archived ?? false,
    ...partial,
  }
}

describe('isIsoDate', () => {
  it('accepts valid YYYY-MM-DD dates', () => {
    expect(isIsoDate('2024-01-01')).toBe(true)
    expect(isIsoDate('2024-02-29')).toBe(true) // leap year
    expect(isIsoDate('2026-07-13')).toBe(true)
  })

  it('rejects invalid calendar dates and garbage', () => {
    expect(isIsoDate('2024-02-30')).toBe(false)
    expect(isIsoDate('2024-13-01')).toBe(false)
    expect(isIsoDate('2023-02-29')).toBe(false) // non-leap
    expect(isIsoDate('garbage')).toBe(false)
    expect(isIsoDate('2024/01/01')).toBe(false)
    expect(isIsoDate('')).toBe(false)
    expect(isIsoDate(null)).toBe(false)
    expect(isIsoDate(20240101)).toBe(false)
  })
})

describe('todayIsoDate', () => {
  it('formats a Date as YYYY-MM-DD in local time', () => {
    const d = new Date(2026, 6, 13) // July 13, 2026 local
    expect(todayIsoDate(d)).toBe('2026-07-13')
  })

  it('zero-pads month and day', () => {
    expect(todayIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('compareCompletedDateThenOrder', () => {
  it('sorts newest completedAt first', () => {
    const older = card({ id: 'a', completedAt: '2024-01-01', order: 0 })
    const newer = card({ id: 'b', completedAt: '2025-06-01', order: 1 })
    expect(compareCompletedDateThenOrder(older, newer)).toBeGreaterThan(0)
    expect(compareCompletedDateThenOrder(newer, older)).toBeLessThan(0)
  })

  it('sinks undated cards below dated ones', () => {
    const dated = card({ id: 'd', completedAt: '2024-01-01', order: 5 })
    const undated = card({ id: 'u', order: 0 })
    expect(compareCompletedDateThenOrder(dated, undated)).toBeLessThan(0)
    expect(compareCompletedDateThenOrder(undated, dated)).toBeGreaterThan(0)
  })

  it('breaks ties with manual order', () => {
    const first = card({ id: 'a', completedAt: '2024-01-01', order: 0 })
    const second = card({ id: 'b', completedAt: '2024-01-01', order: 2 })
    expect(compareCompletedDateThenOrder(first, second)).toBeLessThan(0)
    expect(compareCompletedDateThenOrder(second, first)).toBeGreaterThan(0)
  })
})
