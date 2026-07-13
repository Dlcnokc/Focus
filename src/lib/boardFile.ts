import type { Card } from '../types'
import { normalizeCards } from './storage'

/** Envelope written by Export. Import also accepts a bare card array. */
export type BoardExportFile = {
  version: 1
  exportedAt: string
  cards: Card[]
}

export type ParseBoardFileResult =
  | { ok: true; cards: Card[] }
  | { ok: false; error: string }

/**
 * Build a versioned JSON payload for download.
 */
export function buildExportPayload(cards: Card[]): BoardExportFile {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: cards.map((c) => ({ ...c })),
  }
}

/**
 * Parse JSON text from an import file into normalized cards.
 */
export function parseBoardFileJson(text: string): ParseBoardFileResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }

  let rawCards: unknown
  if (Array.isArray(data)) {
    rawCards = data
  } else if (data && typeof data === 'object') {
    const rec = data as Record<string, unknown>
    if (!('cards' in rec)) {
      return {
        ok: false,
        error: 'JSON must be a card array or an object with a "cards" array.',
      }
    }
    if (!Array.isArray(rec.cards)) {
      return { ok: false, error: 'The "cards" field must be an array.' }
    }
    rawCards = rec.cards
  } else {
    return {
      ok: false,
      error: 'JSON must be a card array or an object with a "cards" array.',
    }
  }

  const { cards } = normalizeCards(rawCards)
  if (cards.length === 0 && Array.isArray(rawCards) && rawCards.length > 0) {
    return {
      ok: false,
      error:
        'No valid cards found. Each card needs a unique id (not a column name), title, and a valid column.',
    }
  }

  return { ok: true, cards }
}

/**
 * Merge imported cards into the current board.
 * Same id → imported card wins. New ids are added. Orders reindexed by caller.
 */
export function mergeCardLists(current: Card[], imported: Card[]): Card[] {
  const byId = new Map<string, Card>()
  for (const card of current) {
    byId.set(card.id, card)
  }
  for (const card of imported) {
    byId.set(card.id, card)
  }
  return [...byId.values()]
}

/** Safe download filename, e.g. focus-board-2026-07-11.json */
export function exportFilename(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `focus-board-${y}-${m}-${d}.json`
}

/** Trigger a browser download of the board JSON. */
export function downloadBoardJson(cards: Card[]): void {
  const payload = buildExportPayload(cards)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = exportFilename()
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
