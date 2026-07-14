import { columnDef } from '../data/placeholderBoard'
import type { Card } from '../types'
import { isIsoDate, todayIsoDate } from './dates'

export type ColumnTransitionResult = {
  cards: Card[]
  /** Unranked card that just entered a requiresPriority column, if any. */
  priorityPromptCardId: string | null
}

/**
 * Apply column entry/exit rules after a committed drag (or any move that
 * compares the current board to a pre-move snapshot).
 *
 * - Entering a requiresPriority column unranked → priority prompt id
 * - Entering clearsPriority → strip priority
 * - Entering tracksCompletedDate → stamp today only if completedAt is missing/invalid
 * - Leaving tracksCompletedDate → clear completedAt
 *
 * Returns the same `cards` array reference when nothing changes.
 */
export function applyColumnTransitionRules(
  cards: Card[],
  snapshot: Card[],
): ColumnTransitionResult {
  const beforeById = new Map(snapshot.map((s) => [s.id, s]))

  const movedTo = (card: Card) => {
    const before = beforeById.get(card.id)
    return before != null && before.column !== card.column
  }

  let priorityPromptCardId: string | null = null
  let changed = false

  const nextCards = cards.map((card) => {
    if (!movedTo(card)) return card

    const def = columnDef(card.column)
    let updated = card

    if (
      !card.archived &&
      def.requiresPriority &&
      card.priority == null &&
      priorityPromptCardId == null
    ) {
      priorityPromptCardId = card.id
    }

    if (def.clearsPriority && updated.priority != null) {
      updated = { ...updated, priority: undefined }
    }

    if (def.tracksCompletedDate) {
      if (!isIsoDate(updated.completedAt)) {
        updated = { ...updated, completedAt: todayIsoDate() }
      }
    } else if (updated.completedAt != null) {
      updated = { ...updated, completedAt: undefined }
    }

    if (updated !== card) changed = true
    return updated
  })

  return {
    cards: changed ? nextCards : cards,
    priorityPromptCardId,
  }
}
