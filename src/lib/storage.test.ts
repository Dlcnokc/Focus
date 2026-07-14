import { describe, expect, it } from 'vitest'
import type { Card } from '../types'
import {
  cardsInColumn,
  normalizeCards,
  reindexOrders,
} from './storage'

describe('normalizeCards', () => {
  it('returns empty for non-arrays', () => {
    expect(normalizeCards(null)).toEqual({ cards: [], skippedInvalid: 0 })
    expect(normalizeCards({})).toEqual({ cards: [], skippedInvalid: 0 })
  })

  it('drops empty titles and whitespace-only titles', () => {
    const { cards, skippedInvalid } = normalizeCards([
      { id: 'a', title: '', column: 'ideas', order: 0 },
      { id: 'b', title: '   ', column: 'ideas', order: 1 },
      { id: 'c', title: 'ok', column: 'ideas', order: 2 },
    ])
    expect(skippedInvalid).toBe(2)
    expect(cards.map((c) => c.id)).toEqual(['c'])
  })

  it('drops reserved column ids as card ids', () => {
    const { cards, skippedInvalid } = normalizeCards([
      { id: 'ideas', title: 'Bad', column: 'ready', order: 0 },
      { id: 'focus', title: 'Also bad', column: 'ready', order: 1 },
      { id: 'card-1', title: 'Good', column: 'ready', order: 2 },
    ])
    expect(skippedInvalid).toBe(2)
    expect(cards.map((c) => c.id)).toEqual(['card-1'])
  })

  it('drops reserved tab: droppable ids as card ids', () => {
    const { cards, skippedInvalid } = normalizeCards([
      { id: 'tab:ideas', title: 'Bad tab', column: 'ready', order: 0 },
      { id: 'tab:done', title: 'Also bad', column: 'ready', order: 1 },
      { id: 'card-2', title: 'Good', column: 'ready', order: 2 },
    ])
    expect(skippedInvalid).toBe(2)
    expect(cards.map((c) => c.id)).toEqual(['card-2'])
  })

  it('clamps long titles on load', () => {
    const long = 'abcdefghijklmnopqrstuvwxyz'
    const { cards } = normalizeCards([
      { id: 'long', title: long, column: 'ideas', order: 0 },
    ])
    expect(cards[0].title).toBe('abcdefghijklmnopqrst')
    expect(cards[0].title.length).toBe(20)
  })

  it('Completed strips priority and keeps valid completedAt', () => {
    const { cards } = normalizeCards([
      {
        id: 'done-1',
        title: 'Finished',
        column: 'done',
        order: 0,
        priority: 'high',
        completedAt: '2024-06-15',
      },
      {
        id: 'done-2',
        title: 'Bad date',
        column: 'done',
        order: 1,
        priority: 'low',
        completedAt: '2024-02-30',
      },
    ])
    const d1 = cards.find((c) => c.id === 'done-1')!
    const d2 = cards.find((c) => c.id === 'done-2')!
    expect(d1.priority).toBeUndefined()
    expect(d1.completedAt).toBe('2024-06-15')
    expect(d2.priority).toBeUndefined()
    expect(d2.completedAt).toBeUndefined()
  })

  it('Priority defaults unranked cards to medium', () => {
    const { cards } = normalizeCards([
      { id: 'p1', title: 'Rank me', column: 'focus', order: 0 },
      {
        id: 'p2',
        title: 'Already high',
        column: 'focus',
        order: 1,
        priority: 'high',
      },
    ])
    expect(cards.find((c) => c.id === 'p1')!.priority).toBe('medium')
    expect(cards.find((c) => c.id === 'p2')!.priority).toBe('high')
  })

  it('does not default priority outside Priority column', () => {
    const { cards } = normalizeCards([
      { id: 'i1', title: 'Idea', column: 'ideas', order: 0 },
    ])
    expect(cards[0].priority).toBeUndefined()
  })

  it('duplicate ids keep the last write', () => {
    const { cards } = normalizeCards([
      { id: 'dup', title: 'First', column: 'ideas', order: 0 },
      { id: 'dup', title: 'Second', column: 'ready', order: 0 },
    ])
    expect(cards).toHaveLength(1)
    expect(cards[0].title).toBe('Second')
    expect(cards[0].column).toBe('ready')
  })
})

describe('reindexOrders', () => {
  it('assigns 0..n-1 per column for active and archived separately', () => {
    const input: Card[] = [
      {
        id: 'a',
        title: 'A',
        notes: '',
        column: 'ideas',
        order: 10,
        archived: false,
      },
      {
        id: 'b',
        title: 'B',
        notes: '',
        column: 'ideas',
        order: 3,
        archived: false,
      },
      {
        id: 'c',
        title: 'C',
        notes: '',
        column: 'ideas',
        order: 1,
        archived: true,
      },
      {
        id: 'd',
        title: 'D',
        notes: '',
        column: 'ideas',
        order: 99,
        archived: true,
      },
      {
        id: 'e',
        title: 'E',
        notes: '',
        column: 'ready',
        order: 5,
        archived: false,
      },
    ]

    const next = reindexOrders(input)
    const ideasActive = next
      .filter((c) => c.column === 'ideas' && !c.archived)
      .sort((a, b) => a.order - b.order)
    const ideasArchived = next
      .filter((c) => c.column === 'ideas' && c.archived)
      .sort((a, b) => a.order - b.order)
    const ready = next.filter((c) => c.column === 'ready')

    expect(ideasActive.map((c) => [c.id, c.order])).toEqual([
      ['b', 0],
      ['a', 1],
    ])
    expect(ideasArchived.map((c) => [c.id, c.order])).toEqual([
      ['c', 0],
      ['d', 1],
    ])
    expect(ready.map((c) => [c.id, c.order])).toEqual([['e', 0]])
  })
})

describe('cardsInColumn', () => {
  it('returns only active cards in the column sorted by order', () => {
    const cards: Card[] = [
      {
        id: 'a',
        title: 'A',
        notes: '',
        column: 'ready',
        order: 2,
        archived: false,
      },
      {
        id: 'b',
        title: 'B',
        notes: '',
        column: 'ready',
        order: 0,
        archived: false,
      },
      {
        id: 'c',
        title: 'C',
        notes: '',
        column: 'ready',
        order: 1,
        archived: true,
      },
      {
        id: 'd',
        title: 'D',
        notes: '',
        column: 'ideas',
        order: 0,
        archived: false,
      },
    ]
    expect(cardsInColumn(cards, 'ready').map((c) => c.id)).toEqual(['b', 'a'])
  })
})
