import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Card } from '../types'
import { applyColumnTransitionRules } from './columnRules'

function card(
  partial: Partial<Card> & Pick<Card, 'id' | 'column'>,
): Card {
  return {
    title: partial.title ?? partial.id,
    notes: '',
    order: partial.order ?? 0,
    archived: partial.archived ?? false,
    ...partial,
  }
}

describe('applyColumnTransitionRules', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 13, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('entering completed clears priority and stamps date if missing', () => {
    const snapshot = [
      card({ id: 'x', column: 'focus', priority: 'high' }),
    ]
    const cards = [card({ id: 'x', column: 'done', priority: 'high' })]
    const { cards: next, priorityPromptCardId } =
      applyColumnTransitionRules(cards, snapshot)

    expect(priorityPromptCardId).toBeNull()
    expect(next[0].priority).toBeUndefined()
    expect(next[0].completedAt).toBe('2026-07-13')
  })

  it('preserves existing completedAt on re-enter', () => {
    const snapshot = [
      card({
        id: 'x',
        column: 'ready',
        completedAt: '2024-01-02',
      }),
    ]
    // Unusual but valid during a move: card already carries a completion date.
    const cards = [
      card({
        id: 'x',
        column: 'done',
        completedAt: '2024-01-02',
      }),
    ]
    const { cards: next } = applyColumnTransitionRules(cards, snapshot)
    expect(next[0].completedAt).toBe('2024-01-02')
  })

  it('re-stamps invalid completedAt when entering Completed', () => {
    const snapshot = [
      card({ id: 'x', column: 'ready', completedAt: '2024-02-30' }),
    ]
    const cards = [
      card({ id: 'x', column: 'done', completedAt: '2024-02-30' }),
    ]
    const { cards: next } = applyColumnTransitionRules(cards, snapshot)
    expect(next[0].completedAt).toBe('2026-07-13')
  })

  it('returns the same array reference when nothing changes', () => {
    const board = [card({ id: 'a', column: 'ideas' })]
    const { cards: next } = applyColumnTransitionRules(board, board)
    expect(next).toBe(board)
  })

  it('leaving completed clears the date', () => {
    const snapshot = [
      card({ id: 'x', column: 'done', completedAt: '2025-05-05' }),
    ]
    const cards = [
      card({ id: 'x', column: 'ready', completedAt: '2025-05-05' }),
    ]
    const { cards: next } = applyColumnTransitionRules(cards, snapshot)
    expect(next[0].completedAt).toBeUndefined()
  })

  it('returns priority prompt id when unranked card enters Priority', () => {
    const snapshot = [card({ id: 'p', column: 'ready' })]
    const cards = [card({ id: 'p', column: 'focus' })]
    const { cards: next, priorityPromptCardId } =
      applyColumnTransitionRules(cards, snapshot)

    expect(priorityPromptCardId).toBe('p')
    // Transition rules do not default priority — the prompt UI does that.
    expect(next[0].priority).toBeUndefined()
  })

  it('does not prompt when ranked card enters Priority', () => {
    const snapshot = [
      card({ id: 'p', column: 'ready', priority: 'low' }),
    ]
    const cards = [card({ id: 'p', column: 'focus', priority: 'low' })]
    const { priorityPromptCardId } = applyColumnTransitionRules(
      cards,
      snapshot,
    )
    expect(priorityPromptCardId).toBeNull()
  })

  it('leaves cards unchanged when column did not change', () => {
    const board = [
      card({ id: 'a', column: 'done', completedAt: '2024-01-01', priority: 'high' }),
    ]
    const { cards: next, priorityPromptCardId } =
      applyColumnTransitionRules(board, board)
    expect(next).toEqual(board)
    expect(priorityPromptCardId).toBeNull()
  })
})
