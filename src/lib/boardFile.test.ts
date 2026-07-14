import { describe, expect, it } from 'vitest'
import type { Card } from '../types'
import { mergeCardLists, parseBoardFileJson } from './boardFile'

const sampleCard = {
  id: 'card-1',
  title: 'Hello',
  notes: 'n',
  column: 'ideas',
  order: 0,
  archived: false,
}

describe('parseBoardFileJson', () => {
  it('accepts a versioned envelope', () => {
    const text = JSON.stringify({
      version: 1,
      exportedAt: '2026-07-13T00:00:00.000Z',
      cards: [sampleCard],
    })
    const result = parseBoardFileJson(text)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.cards).toHaveLength(1)
      expect(result.cards[0].id).toBe('card-1')
      expect(result.cards[0].title).toBe('Hello')
    }
  })

  it('accepts a bare card array', () => {
    const result = parseBoardFileJson(JSON.stringify([sampleCard]))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.cards[0].id).toBe('card-1')
    }
  })

  it('rejects invalid JSON', () => {
    const result = parseBoardFileJson('{ not json')
    expect(result).toEqual({
      ok: false,
      error: 'That file is not valid JSON.',
    })
  })

  it('rejects objects without a cards array', () => {
    const result = parseBoardFileJson(JSON.stringify({ version: 1 }))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/cards/i)
    }
  })

  it('rejects files where every card is invalid', () => {
    const result = parseBoardFileJson(
      JSON.stringify([{ id: 'ideas', title: 'Clash', column: 'ready' }]),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/No valid cards/i)
    }
  })
})

describe('mergeCardLists', () => {
  it('overwrites the same id with the imported card', () => {
    const current: Card[] = [
      {
        id: 'a',
        title: 'Old',
        notes: '',
        column: 'ideas',
        order: 0,
        archived: false,
      },
      {
        id: 'b',
        title: 'Keep',
        notes: '',
        column: 'ready',
        order: 0,
        archived: false,
      },
    ]
    const imported: Card[] = [
      {
        id: 'a',
        title: 'New',
        notes: 'updated',
        column: 'focus',
        order: 0,
        archived: false,
        priority: 'high',
      },
      {
        id: 'c',
        title: 'Added',
        notes: '',
        column: 'ideas',
        order: 0,
        archived: false,
      },
    ]
    const merged = mergeCardLists(current, imported)
    const byId = Object.fromEntries(merged.map((c) => [c.id, c]))
    expect(byId.a.title).toBe('New')
    expect(byId.a.column).toBe('focus')
    expect(byId.b.title).toBe('Keep')
    expect(byId.c.title).toBe('Added')
    expect(merged).toHaveLength(3)
  })
})
