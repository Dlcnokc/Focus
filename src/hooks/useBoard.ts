import { useCallback, useEffect, useRef, useState } from 'react'
import { applyCardMove, boardsEqual, type MoveHint } from '../lib/boardMove'
import { mergeCardLists } from '../lib/boardFile'
import {
  cardsInColumn,
  loadBoard,
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
 * Drag previews stay in memory only; disk writes on commit / non-drag edits.
 */
export function useBoard() {
  const initial = loadBoard()
  const [cards, setCards] = useState<Card[]>(() => initial.cards)
  const [loadError, setLoadError] = useState<string | null>(
    () => initial.loadError,
  )

  /** Always mirrors latest cards for sync snapshot on drag start. */
  const cardsRef = useRef(cards)
  cardsRef.current = cards
  /** Snapshot at drag start so Escape / cancel can restore. */
  const dragSnapshotRef = useRef<Card[] | null>(null)
  /** Skip disk writes while a drag preview is live. */
  const isDraggingRef = useRef(false)
  /**
   * After a corrupt load, block saves until the user intentionally changes
   * the board (so we never write [] over recoverable data).
   */
  const allowPersistRef = useRef(initial.allowPersist)

  const enablePersist = useCallback(() => {
    allowPersistRef.current = true
    setLoadError(null)
  }, [])

  const persistIfAllowed = useCallback((next: Card[]) => {
    if (!allowPersistRef.current) return
    if (isDraggingRef.current) return
    saveCards(next)
  }, [])

  useEffect(() => {
    persistIfAllowed(cards)
  }, [cards, persistIfAllowed])

  const addCard = useCallback(
    (input: AddCardInput) => {
      const title = input.title.trim()
      if (!title) {
        return { ok: false as const, error: 'Title is required.' }
      }

      enablePersist()
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
    },
    [enablePersist],
  )

  const updateCard = useCallback(
    (input: UpdateCardInput) => {
      const title = input.title.trim()
      if (!title) {
        return { ok: false as const, error: 'Title is required.' }
      }

      enablePersist()
      setCards((prev) =>
        prev.map((card) =>
          card.id === input.id
            ? { ...card, title, notes: input.notes.trim() }
            : card,
        ),
      )
      return { ok: true as const }
    },
    [enablePersist],
  )

  const deleteCard = useCallback(
    (id: string) => {
      enablePersist()
      setCards((prev) => reindexOrders(prev.filter((card) => card.id !== id)))
    },
    [enablePersist],
  )

  /** Soft-remove from the board (recoverable). */
  const archiveCard = useCallback(
    (id: string) => {
      enablePersist()
      setCards((prev) =>
        reindexOrders(
          prev.map((card) =>
            card.id === id ? { ...card, archived: true } : card,
          ),
        ),
      )
    },
    [enablePersist],
  )

  /** Put an archived card back on the board (same column). */
  const restoreCard = useCallback(
    (id: string) => {
      enablePersist()
      setCards((prev) =>
        reindexOrders(
          prev.map((card) =>
            card.id === id ? { ...card, archived: false } : card,
          ),
        ),
      )
    },
    [enablePersist],
  )

  /** Import: wipe board and use only the imported list. */
  const replaceBoard = useCallback(
    (next: Card[]) => {
      enablePersist()
      setCards(reindexOrders(next.map((c) => ({ ...c }))))
    },
    [enablePersist],
  )

  /** Import: keep current cards; same id overwritten; new ids added. */
  const mergeBoard = useCallback(
    (imported: Card[]) => {
      enablePersist()
      setCards((prev) => reindexOrders(mergeCardLists(prev, imported)))
    },
    [enablePersist],
  )

  const beginDrag = useCallback(() => {
    isDraggingRef.current = true
    dragSnapshotRef.current = cardsRef.current.map((c) => ({ ...c }))
  }, [])

  /**
   * Live preview while dragging — other cards shift to show insert position.
   * Not written to localStorage until commitDrag.
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

  /** Drop finished — keep layout and persist. */
  const commitDrag = useCallback(() => {
    dragSnapshotRef.current = null
    isDraggingRef.current = false
    if (allowPersistRef.current) {
      saveCards(cardsRef.current)
    }
  }, [])

  /** Cancel drag — restore pre-drag board and persist that. */
  const cancelDrag = useCallback(() => {
    const snap = dragSnapshotRef.current
    dragSnapshotRef.current = null
    isDraggingRef.current = false
    if (snap) {
      setCards(snap)
      // setCards will persist via effect once isDragging is false
    } else if (allowPersistRef.current) {
      saveCards(cardsRef.current)
    }
  }, [])

  const getCard = useCallback(
    (id: string) => cards.find((card) => card.id === id),
    [cards],
  )

  const dismissLoadError = useCallback(() => {
    setLoadError(null)
  }, [])

  return {
    cards,
    loadError,
    dismissLoadError,
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
