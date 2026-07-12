import {
  closestCorners,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core'
import type { ColumnId } from '../types'

export const COLUMN_IDS: ColumnId[] = ['ideas', 'ready', 'focus', 'done']

export function isColumnId(id: string): id is ColumnId {
  return COLUMN_IDS.includes(id as ColumnId)
}

/**
 * Prefer "pointer is inside this rect" so a column activates as soon as the
 * cursor enters it — not only when near the center (closestCorners).
 */
export const boardCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)

  if (pointerHits.length > 0) {
    // Cards first so reorder targets win when the pointer is over a card;
    // column droppables still count when the pointer is in empty column space.
    const cardHits = pointerHits.filter((c) => !isColumnId(String(c.id)))
    if (cardHits.length > 0) return cardHits
    return pointerHits
  }

  // Slightly forgiving fallback near edges
  const rectHits = rectIntersection(args)
  if (rectHits.length > 0) {
    const cardHits = rectHits.filter((c) => !isColumnId(String(c.id)))
    if (cardHits.length > 0) return cardHits
    return rectHits
  }

  return closestCorners(args)
}

export function resolveColumnFromOverId(
  overId: string | null | undefined,
  findCardColumn: (cardId: string) => ColumnId | undefined,
): ColumnId | null {
  if (!overId) return null
  if (isColumnId(overId)) return overId
  return findCardColumn(overId) ?? null
}
