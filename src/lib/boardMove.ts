import { arrayMove } from '@dnd-kit/sortable'
import type { Card, ColumnId } from '../types'
import { COLUMN_IDS, isColumnId } from './dnd'
import { cardsInColumn } from './storage'

function rebuildFromLists(lists: Record<ColumnId, Card[]>): Card[] {
  const next: Card[] = []
  for (const id of COLUMN_IDS) {
    lists[id].forEach((card, index) => {
      next.push({ ...card, column: id, order: index })
    })
  }
  return next
}

function listsFromCards(cards: Card[]): Record<ColumnId, Card[]> {
  const lists: Record<ColumnId, Card[]> = {
    ideas: [],
    ready: [],
    focus: [],
    done: [],
  }
  for (const id of COLUMN_IDS) {
    lists[id] = cardsInColumn(cards, id)
  }
  return lists
}

export type MoveHint = {
  pointerY?: number
  overTop?: number
  overHeight?: number
}

/**
 * Pure move for live drag preview and final drop.
 * Returns the same array reference when nothing changes.
 */
export function applyCardMove(
  prev: Card[],
  activeId: string,
  overId: string,
  hint?: MoveHint,
): Card[] {
  const active = prev.find((c) => c.id === activeId)
  if (!active || activeId === overId) return prev

  const lists = listsFromCards(prev)

  // Dropping on a column container (empty space / column body)
  if (isColumnId(overId)) {
    const target = overId

    // Already in this column and hovering column chrome — do not reshuffle
    // (avoids jump-to-end loops that can freeze React).
    if (active.column === target) {
      return prev
    }

    lists[active.column] = lists[active.column].filter((c) => c.id !== activeId)
    lists[target] = [
      ...lists[target].filter((c) => c.id !== activeId),
      { ...active, column: target },
    ]
    return rebuildFromLists(lists)
  }

  const overCard = prev.find((c) => c.id === overId)
  if (!overCard) return prev

  const targetColumn = overCard.column

  // Same column: reorder with arrayMove
  if (active.column === targetColumn) {
    const list = lists[targetColumn]
    const oldIndex = list.findIndex((c) => c.id === activeId)
    const newIndex = list.findIndex((c) => c.id === overId)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev
    lists[targetColumn] = arrayMove(list, oldIndex, newIndex)
    return rebuildFromLists(lists)
  }

  // Cross-column: insert before/after hovered card
  lists[active.column] = lists[active.column].filter((c) => c.id !== activeId)
  const targetList = lists[targetColumn].filter((c) => c.id !== activeId)
  let insertAt = targetList.findIndex((c) => c.id === overId)

  if (insertAt < 0) {
    targetList.push({ ...active, column: targetColumn })
  } else {
    if (
      hint?.pointerY !== undefined &&
      hint.overTop !== undefined &&
      hint.overHeight !== undefined &&
      hint.pointerY > hint.overTop + hint.overHeight / 2
    ) {
      insertAt += 1
    }
    targetList.splice(insertAt, 0, { ...active, column: targetColumn })
  }

  lists[targetColumn] = targetList
  return rebuildFromLists(lists)
}

export function boardsEqual(a: Card[], b: Card[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].column !== b[i].column ||
      a[i].order !== b[i].order
    ) {
      return false
    }
  }
  return true
}

/** Stable key for “where would this drop?” to skip redundant previews. */
export function moveSignature(
  cards: Card[],
  activeId: string,
  overId: string,
  hint?: MoveHint,
): string {
  const next = applyCardMove(cards, activeId, overId, hint)
  const active = next.find((c) => c.id === activeId)
  if (!active) return `${activeId}>gone`
  return `${activeId}>${active.column}:${active.order}`
}
