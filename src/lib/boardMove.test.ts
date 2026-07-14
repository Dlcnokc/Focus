import { describe, expect, it } from 'vitest'
import type { Card } from '../types'
import { applyCardMove, boardsEqual } from './boardMove'

function makeCards(
  specs: Array<{
    id: string
    column: Card['column']
    order: number
    archived?: boolean
    title?: string
  }>,
): Card[] {
  return specs.map((s) => ({
    id: s.id,
    title: s.title ?? s.id,
    notes: '',
    column: s.column,
    order: s.order,
    archived: s.archived ?? false,
  }))
}

describe('applyCardMove', () => {
  it('reorders within the same column over another card', () => {
    const prev = makeCards([
      { id: 'a', column: 'ideas', order: 0 },
      { id: 'b', column: 'ideas', order: 1 },
      { id: 'c', column: 'ideas', order: 2 },
    ])
    const next = applyCardMove(prev, 'a', 'c')
    expect(next.map((card) => card.id)).toEqual(['b', 'c', 'a'])
    expect(next.map((card) => card.order)).toEqual([0, 1, 2])
  })

  it('appends to another column when dropping on column chrome', () => {
    const prev = makeCards([
      { id: 'a', column: 'ideas', order: 0 },
      { id: 'b', column: 'ready', order: 0 },
    ])
    const next = applyCardMove(prev, 'a', 'ready')
    const ready = next
      .filter((c) => c.column === 'ready')
      .sort((x, y) => x.order - y.order)
    expect(ready.map((c) => c.id)).toEqual(['b', 'a'])
    expect(ready.find((c) => c.id === 'a')!.order).toBe(1)
  })

  it('appends via mobile tab droppable id', () => {
    const prev = makeCards([
      { id: 'a', column: 'ideas', order: 0 },
      { id: 'b', column: 'focus', order: 0 },
    ])
    const next = applyCardMove(prev, 'a', 'tab:focus')
    expect(next.find((c) => c.id === 'a')!.column).toBe('focus')
    expect(next.find((c) => c.id === 'a')!.order).toBe(1)
  })

  it('is a no-op when dropping on same-column chrome', () => {
    const prev = makeCards([
      { id: 'a', column: 'ideas', order: 0 },
      { id: 'b', column: 'ideas', order: 1 },
    ])
    const next = applyCardMove(prev, 'a', 'ideas')
    expect(next).toBe(prev)
  })

  it('is a no-op when dropping on same-column tab chrome', () => {
    const prev = makeCards([{ id: 'a', column: 'ready', order: 0 }])
    expect(applyCardMove(prev, 'a', 'tab:ready')).toBe(prev)
  })

  it('returns same reference when active equals over', () => {
    const prev = makeCards([{ id: 'a', column: 'ideas', order: 0 }])
    expect(applyCardMove(prev, 'a', 'a')).toBe(prev)
  })

  it('inserts before a card in another column', () => {
    const prev = makeCards([
      { id: 'a', column: 'ideas', order: 0 },
      { id: 'b', column: 'ready', order: 0 },
      { id: 'c', column: 'ready', order: 1 },
    ])
    const next = applyCardMove(prev, 'a', 'b')
    const ready = next
      .filter((c) => c.column === 'ready')
      .sort((x, y) => x.order - y.order)
    expect(ready.map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('boardsEqual', () => {
  it('compares layout only (id, column, order, archived)', () => {
    const a = makeCards([{ id: 'x', column: 'ideas', order: 0 }])
    const b: Card[] = [
      {
        ...a[0],
        title: 'Different title',
        notes: 'notes',
        priority: 'high',
      },
    ]
    expect(boardsEqual(a, b)).toBe(true)
  })

  it('detects column or order changes', () => {
    const a = makeCards([{ id: 'x', column: 'ideas', order: 0 }])
    const b = makeCards([{ id: 'x', column: 'ready', order: 0 }])
    const c = makeCards([{ id: 'x', column: 'ideas', order: 1 }])
    expect(boardsEqual(a, b)).toBe(false)
    expect(boardsEqual(a, c)).toBe(false)
  })

  it('returns true for the same reference', () => {
    const a = makeCards([{ id: 'x', column: 'ideas', order: 0 }])
    expect(boardsEqual(a, a)).toBe(true)
  })
})
