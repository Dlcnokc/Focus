import type { Card, ColumnId } from '../types'

export const BOARD_STORAGE_KEY = 'focus.board.v1'

const COLUMN_IDS: ColumnId[] = ['ideas', 'ready', 'focus', 'done']

function isColumnId(value: unknown): value is ColumnId {
  return typeof value === 'string' && COLUMN_IDS.includes(value as ColumnId)
}

/**
 * Parse and normalize stored board data.
 * Older cards without `order` get stable orders assigned.
 */
export function normalizeCards(raw: unknown): Card[] {
  if (!Array.isArray(raw)) return []

  const partial = raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      if (typeof rec.id !== 'string' || typeof rec.title !== 'string') return null
      if (!isColumnId(rec.column)) return null

      return {
        id: rec.id,
        title: rec.title,
        notes: typeof rec.notes === 'string' ? rec.notes : '',
        column: rec.column,
        order: typeof rec.order === 'number' && Number.isFinite(rec.order) ? rec.order : index,
        archived: rec.archived === true,
      } satisfies Card
    })
    .filter((c): c is Card => c !== null)

  // Re-pack orders per column so gaps stay clean after load
  return reindexOrders(partial)
}

/** Assign 0..n-1 order within each column (active and archived separately). */
export function reindexOrders(cards: Card[]): Card[] {
  const next: Card[] = []
  for (const id of COLUMN_IDS) {
    const inCol = cards.filter((c) => c.column === id)
    const active = inCol
      .filter((c) => !c.archived)
      .slice()
      .sort((a, b) => a.order - b.order)
    const archived = inCol
      .filter((c) => c.archived)
      .slice()
      .sort((a, b) => a.order - b.order)

    active.forEach((card, index) => {
      next.push({ ...card, order: index, archived: false })
    })
    archived.forEach((card, index) => {
      next.push({ ...card, order: index, archived: true })
    })
  }
  return next
}

export function loadCards(): Card[] {
  try {
    const raw = localStorage.getItem(BOARD_STORAGE_KEY)
    if (!raw) return []
    return normalizeCards(JSON.parse(raw))
  } catch {
    return []
  }
}

export function saveCards(cards: Card[]): void {
  try {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(cards))
  } catch {
    // Quota / private mode — fail quietly; board still works in-session
  }
}

/** Active (non-archived) cards in a column, sorted by order. */
export function cardsInColumn(cards: Card[], columnId: ColumnId): Card[] {
  return cards
    .filter((c) => c.column === columnId && !c.archived)
    .slice()
    .sort((a, b) => a.order - b.order)
}

/** Soft-archived cards (any column), title sort for a stable list UI. */
export function listArchivedCards(cards: Card[]): Card[] {
  return cards
    .filter((c) => c.archived)
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
}
