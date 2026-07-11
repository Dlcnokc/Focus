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
      } satisfies Card
    })
    .filter((c): c is Card => c !== null)

  // Re-pack orders per column so gaps stay clean after load
  return reindexOrders(partial)
}

/** Assign 0..n-1 order within each column (stable by current order). */
export function reindexOrders(cards: Card[]): Card[] {
  const byColumn = new Map<ColumnId, Card[]>()
  for (const id of COLUMN_IDS) {
    byColumn.set(id, [])
  }
  for (const card of cards) {
    byColumn.get(card.column)?.push(card)
  }

  const next: Card[] = []
  for (const id of COLUMN_IDS) {
    const list = (byColumn.get(id) ?? []).slice().sort((a, b) => a.order - b.order)
    list.forEach((card, index) => {
      next.push({ ...card, order: index })
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

export function cardsInColumn(cards: Card[], columnId: ColumnId): Card[] {
  return cards
    .filter((c) => c.column === columnId)
    .slice()
    .sort((a, b) => a.order - b.order)
}
