import {
  closestCorners,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core'
import { isColumnId } from '../data/placeholderBoard'
import type { ColumnId } from '../types'

/** Prefix for phone column-tab droppables (must not clash with card or column ids). */
export const COLUMN_TAB_PREFIX = 'tab:'

/** Droppable id for a mobile column tab. */
export function columnTabId(columnId: ColumnId): string {
  return `${COLUMN_TAB_PREFIX}${columnId}`
}

/**
 * Resolve a droppable id to a column: bare column id, `tab:ideas`, etc.
 * Card ids return null (caller looks those up separately).
 */
export function columnIdFromDroppableId(id: string): ColumnId | null {
  if (isColumnId(id)) return id
  if (id.startsWith(COLUMN_TAB_PREFIX)) {
    const col = id.slice(COLUMN_TAB_PREFIX.length)
    if (isColumnId(col)) return col
  }
  return null
}

/** True for column body or mobile tab droppables (not cards). */
export function isColumnLikeDroppableId(id: string): boolean {
  return columnIdFromDroppableId(id) != null
}

/**
 * Prefer "pointer is inside this rect" so a column activates as soon as the
 * cursor enters it — not only when near the center (closestCorners).
 */
export const boardCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)

  if (pointerHits.length > 0) {
    // Cards first so reorder targets win when the pointer is over a card;
    // column / tab droppables still count when the pointer is in empty space.
    const cardHits = pointerHits.filter(
      (c) => !isColumnLikeDroppableId(String(c.id)),
    )
    if (cardHits.length > 0) return cardHits
    return pointerHits
  }

  // Slightly forgiving fallback near edges
  const rectHits = rectIntersection(args)
  if (rectHits.length > 0) {
    const cardHits = rectHits.filter(
      (c) => !isColumnLikeDroppableId(String(c.id)),
    )
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
  const fromDroppable = columnIdFromDroppableId(overId)
  if (fromDroppable) return fromDroppable
  return findCardColumn(overId) ?? null
}

/** Droppable data attached to each column container. */
export function columnDroppableData(columnId: ColumnId) {
  return { type: 'column' as const, columnId }
}

/** Droppable data attached to mobile column tabs. */
export function columnTabDroppableData(columnId: ColumnId) {
  return { type: 'column-tab' as const, columnId }
}
