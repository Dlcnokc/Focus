import { arrayMove } from '@dnd-kit/sortable'
import { COLUMN_IDS } from '../data/placeholderBoard'
import type { Card, ColumnId } from '../types'
import { columnIdFromDroppableId } from './dnd'
import { cardsInColumn, reindexOrders } from './storage'

function rebuildFromLists(lists: Record<ColumnId, Card[]>): Card[] {
  const next: Card[] = []
  for (const id of COLUMN_IDS) {
    lists[id].forEach((card, index) => {
      next.push({ ...card, column: id, order: index, archived: false })
    })
  }
  return next
}

/** Active cards only — archived stay out of drag lists. */
function listsFromCards(cards: Card[]): Record<ColumnId, Card[]> {
  const lists = {} as Record<ColumnId, Card[]>
  for (const id of COLUMN_IDS) {
    lists[id] = cardsInColumn(cards, id)
  }
  return lists
}

function mergeActiveWithArchived(prev: Card[], nextActive: Card[]): Card[] {
  const archived = prev.filter((c) => c.archived)
  if (archived.length === 0) return nextActive
  return reindexOrders([...nextActive, ...archived])
}

export type MoveHint = {
  pointerY?: number
  overTop?: number
  overHeight?: number
}

/** True when pointer is in the lower half of the over rect (insert after). */
function insertAfterFromHint(hint?: MoveHint): boolean {
  if (
    hint?.pointerY === undefined ||
    hint.overTop === undefined ||
    hint.overHeight === undefined ||
    hint.overHeight <= 0
  ) {
    return false
  }
  return hint.pointerY > hint.overTop + hint.overHeight / 2
}

/**
 * Pure move for live drag preview and final drop.
 * Returns the same array reference when nothing changes.
 * Archived cards are preserved and not part of drag reordering.
 */
export function applyCardMove(
  prev: Card[],
  activeId: string,
  overId: string,
  hint?: MoveHint,
): Card[] {
  const active = prev.find((c) => c.id === activeId)
  if (!active || active.archived || activeId === overId) return prev

  const lists = listsFromCards(prev)

  // Dropping on a column container or mobile column tab
  const targetFromDroppable = columnIdFromDroppableId(overId)
  if (targetFromDroppable) {
    const target = targetFromDroppable

    // Already in this column and hovering column/tab chrome — do not reshuffle
    // (avoids jump-to-end loops that can freeze React).
    if (active.column === target) {
      return prev
    }

    lists[active.column] = lists[active.column].filter((c) => c.id !== activeId)
    lists[target] = [
      ...lists[target].filter((c) => c.id !== activeId),
      { ...active, column: target, archived: false },
    ]
    return mergeActiveWithArchived(prev, rebuildFromLists(lists))
  }

  const overCard = prev.find((c) => c.id === overId && !c.archived)
  if (!overCard) return prev

  const targetColumn = overCard.column

  // Same column: reorder with arrayMove
  if (active.column === targetColumn) {
    const list = lists[targetColumn]
    const oldIndex = list.findIndex((c) => c.id === activeId)
    const newIndex = list.findIndex((c) => c.id === overId)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev
    lists[targetColumn] = arrayMove(list, oldIndex, newIndex)
    return mergeActiveWithArchived(prev, rebuildFromLists(lists))
  }

  // Cross-column: insert before/after hovered card
  lists[active.column] = lists[active.column].filter((c) => c.id !== activeId)
  const targetList = lists[targetColumn].filter((c) => c.id !== activeId)
  let insertAt = targetList.findIndex((c) => c.id === overId)

  if (insertAt < 0) {
    targetList.push({ ...active, column: targetColumn, archived: false })
  } else {
    if (insertAfterFromHint(hint)) {
      insertAt += 1
    }
    targetList.splice(insertAt, 0, {
      ...active,
      column: targetColumn,
      archived: false,
    })
  }

  lists[targetColumn] = targetList
  return mergeActiveWithArchived(prev, rebuildFromLists(lists))
}

/** Layout equality for drag previews (id / column / order / archived only). */
export function boardsEqual(a: Card[], b: Card[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].column !== b[i].column ||
      a[i].order !== b[i].order ||
      a[i].archived !== b[i].archived
    ) {
      return false
    }
  }
  return true
}

/**
 * Cheap attempt key for drag-over dedupe — does not run applyCardMove.
 * Board still applies the move once via previewMove when the sig changes.
 * Format: activeId>overId:above|below| (empty half when no pointer hint).
 */
export function moveSignature(
  _cards: Card[],
  activeId: string,
  overId: string,
  hint?: MoveHint,
): string {
  let half = ''
  if (
    hint?.pointerY !== undefined &&
    hint.overTop !== undefined &&
    hint.overHeight !== undefined &&
    hint.overHeight > 0
  ) {
    half = insertAfterFromHint(hint) ? 'below' : 'above'
  }
  return `${activeId}>${overId}:${half}`
}
