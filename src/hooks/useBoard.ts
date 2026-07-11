import { useCallback, useEffect, useRef, useState } from 'react'
import { applyCardMove, boardsEqual, type MoveHint } from '../lib/boardMove'
import { mergeCardLists } from '../lib/boardFile'
import {
  cardsInColumn,
  loadCards,
  reindexOrders,
  saveCards,
} from '../lib/storage'
import type { Card, ColumnId } from '../types'

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export type AddCardInput = {
  title: string
  notes: string
  column: ColumnId
}

export type UpdateCardInput = {
  id: string
  title: string
  notes: string
}

/**
 * Board state with localStorage persistence + live drag preview.
 */
export function useBoard() {
  const [cards, setCards] = useState<Card[]>(() => loadCards())
  /** Always mirrors latest cards for sync snapshot on drag start. */
  const cardsRef = useRef(cards)
  cardsRef.current = cards
  /** Snapshot at drag start so Escape / cancel can restore. */
  const dragSnapshotRef = useRef<Card[] | null>(null)

  useEffect(() => {
    saveCards(cards)
  }, [cards])

  const addCard = useCallback((input: AddCardInput) => {
    const title = input.title.trim()
    if (!title) {
      return { ok: false as const, error: 'Title is required.' }
    }

    setCards((prev) => {
      const inCol = cardsInColumn(prev, input.column)
      const order =
        inCol.length === 0 ? 0 : Math.max(...inCol.map((c) => c.order)) + 1
      const card: Card = {
        id: newId(),
        title,
        notes: input.notes.trim(),
        column: input.column,
        order,
        archived: false,
      }
      return [...prev, card]
    })

    return { ok: true as const }
  }, [])

  const updateCard = useCallback((input: UpdateCardInput) => {
    const title = input.title.trim()
    if (!title) {
      return { ok: false as const, error: 'Title is required.' }
    }

    setCards((prev) =>
      prev.map((card) =>
        card.id === input.id
          ? { ...card, title, notes: input.notes.trim() }
          : card,
      ),
    )
    return { ok: true as const }
  }, [])

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => reindexOrders(prev.filter((card) => card.id !== id)))
  }, [])

  /** Soft-remove from the board (recoverable). */
  const archiveCard = useCallback((id: string) => {
    setCards((prev) =>
      reindexOrders(
        prev.map((card) =>
          card.id === id ? { ...card, archived: true } : card,
        ),
      ),
    )
  }, [])

  /** Put an archived card back on the board (same column). */
  const restoreCard = useCallback((id: string) => {
    setCards((prev) =>
      reindexOrders(
        prev.map((card) =>
          card.id === id ? { ...card, archived: false } : card,
        ),
      ),
    )
  }, [])

  /** Import: wipe board and use only the imported list. */
  const replaceBoard = useCallback((next: Card[]) => {
    setCards(reindexOrders(next.map((c) => ({ ...c }))))
  }, [])

  /** Import: keep current cards; same id overwritten; new ids added. */
  const mergeBoard = useCallback((imported: Card[]) => {
    setCards((prev) => reindexOrders(mergeCardLists(prev, imported)))
  }, [])

  const beginDrag = useCallback(() => {
    dragSnapshotRef.current = cardsRef.current.map((c) => ({ ...c }))
  }, [])

  /**
   * Live preview while dragging — other cards shift to show insert position.
   */
  const previewMove = useCallback(
    (activeId: string, overId: string, hint?: MoveHint) => {
      setCards((prev) => {
        const next = applyCardMove(prev, activeId, overId, hint)
        return boardsEqual(prev, next) ? prev : next
      })
    },
    [],
  )

  /** Drop finished — keep current layout, clear snapshot. */
  const commitDrag = useCallback(() => {
    dragSnapshotRef.current = null
  }, [])

  /** Cancel drag — restore pre-drag board. */
  const cancelDrag = useCallback(() => {
    const snap = dragSnapshotRef.current
    dragSnapshotRef.current = null
    if (snap) {
      setCards(snap)
    }
  }, [])

  const getCard = useCallback(
    (id: string) => cards.find((card) => card.id === id),
    [cards],
  )

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
    archiveCard,
    restoreCard,
    replaceBoard,
    mergeBoard,
    previewMove,
    beginDrag,
    commitDrag,
    cancelDrag,
    getCard,
  }
}
