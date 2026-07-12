import {
  COLUMN_IDS,
  columnDef,
  isColumnId,
} from '../data/placeholderBoard'
import { DEFAULT_PRIORITY, isPriority } from '../data/priorities'
import { isIsoDate } from './dates'
import type { Card, ColumnId } from '../types'

export const BOARD_STORAGE_KEY = 'focus.board.v1'
/** Last good raw payload when the main key fails to parse. */
export const BOARD_STORAGE_BACKUP_KEY = 'focus.board.v1.bak'

/** Apply column priority rules to a raw stored value. */
function priorityFor(
  column: ColumnId,
  raw: unknown,
): { priority?: Card['priority'] } {
  const def = columnDef(column)
  if (def.clearsPriority) return {}
  if (isPriority(raw)) return { priority: raw }
  return def.requiresPriority ? { priority: DEFAULT_PRIORITY } : {}
}

/**
 * Parse and normalize stored board data.
 * Older cards without `order` / `archived` get defaults.
 * Empty titles dropped; duplicate ids keep the last occurrence.
 * Column priority rules are enforced here too, so imports and old saves
 * can't sneak past them: Completed strips priority, Priority defaults
 * unranked cards to Medium.
 */
export function normalizeCards(raw: unknown): Card[] {
  if (!Array.isArray(raw)) return []

  const partial = raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      if (typeof rec.id !== 'string' || typeof rec.title !== 'string') return null
      if (!isColumnId(rec.column)) return null

      const title = rec.title.trim()
      if (!title) return null

      return {
        id: rec.id,
        title,
        notes: typeof rec.notes === 'string' ? rec.notes : '',
        column: rec.column,
        order:
          typeof rec.order === 'number' && Number.isFinite(rec.order)
            ? rec.order
            : index,
        archived: rec.archived === true,
        ...(priorityFor(rec.column, rec.priority)),
        // Completion date only means something in a column that tracks it
        ...(columnDef(rec.column).tracksCompletedDate &&
        isIsoDate(rec.completedAt)
          ? { completedAt: rec.completedAt }
          : {}),
      } satisfies Card
    })
    .filter((c): c is Card => c !== null)

  // Last write wins on duplicate ids
  const byId = new Map<string, Card>()
  for (const card of partial) {
    byId.set(card.id, card)
  }

  return reindexOrders([...byId.values()])
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

export type LoadBoardResult = {
  cards: Card[]
  /**
   * When false, do not write `cards` back to storage yet —
   * load failed and saving would wipe recoverable data.
   */
  allowPersist: boolean
  /** Human-readable reason when allowPersist is false. */
  loadError: string | null
}

function backupRaw(raw: string): void {
  try {
    localStorage.setItem(BOARD_STORAGE_BACKUP_KEY, raw)
  } catch {
    // Ignore backup failures
  }
}

/**
 * Load board from localStorage without overwriting corrupt data.
 */
export function loadBoard(): LoadBoardResult {
  try {
    const raw = localStorage.getItem(BOARD_STORAGE_KEY)
    if (raw == null || raw === '') {
      return { cards: [], allowPersist: true, loadError: null }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      backupRaw(raw)
      return {
        cards: [],
        allowPersist: false,
        loadError:
          'Saved board data could not be read (invalid JSON). A backup was kept so a blank save will not overwrite it. Use Import to restore a file, or add cards to start fresh.',
      }
    }

    if (!Array.isArray(parsed)) {
      backupRaw(raw)
      return {
        cards: [],
        allowPersist: false,
        loadError:
          'Saved board data was not a card list. A backup was kept. Use Import or add cards to start fresh.',
      }
    }

    const cards = normalizeCards(parsed)
    if (parsed.length > 0 && cards.length === 0) {
      backupRaw(raw)
      return {
        cards: [],
        allowPersist: false,
        loadError:
          'Saved board had entries, but none were valid cards. A backup was kept. Use Import or add cards to start fresh.',
      }
    }

    return { cards, allowPersist: true, loadError: null }
  } catch {
    return {
      cards: [],
      allowPersist: false,
      loadError:
        'Could not access browser storage. The board may not save until storage is available.',
    }
  }
}

export function saveCards(cards: Card[]): boolean {
  try {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(cards))
    return true
  } catch {
    // Quota / private mode — fail quietly; board still works in-session
    return false
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
    .sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
    )
}
