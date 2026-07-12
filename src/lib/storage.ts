import type { Card, ColumnId } from '../types'
import { COLUMN_IDS, isColumnId } from './dnd'

export const BOARD_STORAGE_KEY = 'focus.board.v1'
/** Last good raw payload when the main key fails to parse or drops rows. */
export const BOARD_STORAGE_BACKUP_KEY = 'focus.board.v1.bak'

export type NormalizeResult = {
  cards: Card[]
  /** Rows skipped as invalid (bad shape, empty title, reserved id, etc.). */
  skippedInvalid: number
  /** Duplicate ids collapsed (last occurrence kept). */
  skippedDuplicate: number
}

/**
 * Parse and normalize stored board data.
 * Older cards without `order` / `archived` get defaults.
 * Empty titles dropped; reserved column ids cannot be card ids; duplicate ids keep last.
 */
export function normalizeCards(raw: unknown): NormalizeResult {
  if (!Array.isArray(raw)) {
    return { cards: [], skippedInvalid: 0, skippedDuplicate: 0 }
  }

  let skippedInvalid = 0
  const partial: Card[] = []

  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      skippedInvalid += 1
      return
    }
    const rec = item as Record<string, unknown>
    if (typeof rec.id !== 'string' || typeof rec.title !== 'string') {
      skippedInvalid += 1
      return
    }

    const id = rec.id.trim()
    // Empty or reserved ids clash with column droppables in @dnd-kit
    if (!id || isColumnId(id)) {
      skippedInvalid += 1
      return
    }

    if (typeof rec.column !== 'string' || !isColumnId(rec.column)) {
      skippedInvalid += 1
      return
    }
    const column = rec.column

    const title = rec.title.trim()
    if (!title) {
      skippedInvalid += 1
      return
    }

    partial.push({
      id,
      title,
      notes: typeof rec.notes === 'string' ? rec.notes : '',
      column,
      order:
        typeof rec.order === 'number' && Number.isFinite(rec.order)
          ? rec.order
          : index,
      archived: rec.archived === true,
    })
  })

  // Last write wins on duplicate ids
  const byId = new Map<string, Card>()
  for (const card of partial) {
    byId.set(card.id, card)
  }
  const skippedDuplicate = partial.length - byId.size

  return {
    cards: reindexOrders([...byId.values()]),
    skippedInvalid,
    skippedDuplicate,
  }
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
  /** Human-readable reason when load had problems. */
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

    const { cards, skippedInvalid } = normalizeCards(parsed)

    if (parsed.length > 0 && cards.length === 0) {
      backupRaw(raw)
      return {
        cards: [],
        allowPersist: false,
        loadError:
          'Saved board had entries, but none were valid cards. A backup was kept. Use Import or add cards to start fresh.',
      }
    }

    // Partial invalid: keep valid cards, backup original, warn (still allow save)
    if (skippedInvalid > 0) {
      backupRaw(raw)
      return {
        cards,
        allowPersist: true,
        loadError: `Skipped ${skippedInvalid} invalid saved entr${skippedInvalid === 1 ? 'y' : 'ies'}. A backup of the original data was kept.`,
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
    // Quota / private mode — caller may surface a banner
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
