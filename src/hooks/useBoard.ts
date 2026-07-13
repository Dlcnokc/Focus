import { useCallback, useEffect, useRef, useState } from 'react'
import { columnDef } from '../data/placeholderBoard'
import { applyCardMove, boardsEqual, type MoveHint } from '../lib/boardMove'
import { todayIsoDate } from '../lib/dates'
import { mergeCardLists } from '../lib/boardFile'
import {
  cardsInColumn,
  loadBoard,
  reindexOrders,
  saveCards,
  type LoadBoardResult,
} from '../lib/storage'
import type { Card, ColumnId, Priority } from '../types'

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const SAVE_ERROR =
  'Could not save the board to browser storage (quota or private mode). Changes stay on screen until you fix storage or Export a backup.'

export type AddCardInput = {
  title: string
  notes: string
  column: ColumnId
  priority?: Priority
}

export type UpdateCardInput = {
  id: string
  title: string
  notes: string
  priority?: Priority
  completedAt?: string
}

/** Read localStorage once per mount (not every render). */
function readInitialBoard(): LoadBoardResult {
  return loadBoard()
}

/**
 * Board state with localStorage persistence + live drag preview.
 * Drag previews stay in memory only; disk writes on commit / non-drag edits.
 */
export function useBoard() {
  const initialRef = useRef<LoadBoardResult | null>(null)
  if (initialRef.current === null) {
    initialRef.current = readInitialBoard()
  }
  const initial = initialRef.current

  const [cards, setCards] = useState<Card[]>(initial.cards)
  const [loadError, setLoadError] = useState<string | null>(initial.loadError)
  /** Card just dragged into Priority — the UI should ask for its rank. */
  const [priorityPromptCardId, setPriorityPromptCardId] = useState<
    string | null
  >(null)

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

  const reportSaveResult = useCallback((ok: boolean) => {
    if (ok) {
      setLoadError((prev) => (prev === SAVE_ERROR ? null : prev))
      return
    }
    setLoadError(SAVE_ERROR)
  }, [])

  const persistIfAllowed = useCallback(
    (next: Card[]) => {
      if (!allowPersistRef.current) return
      if (isDraggingRef.current) return
      reportSaveResult(saveCards(next))
    },
    [reportSaveResult],
  )

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
          priority: input.priority,
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
            ? {
                ...card,
                title,
                notes: input.notes.trim(),
                priority: input.priority,
                completedAt: input.completedAt,
              }
            : card,
        ),
      )
      return { ok: true as const }
    },
    [enablePersist],
  )

  /** Set just the priority (used by the drop-into-Priority prompt). */
  const setCardPriority = useCallback(
    (id: string, priority: Priority) => {
      enablePersist()
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, priority } : card)),
      )
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

  /**
   * Drop finished — apply final placement synchronously, then persist that
   * board. Optional active/over re-applies the last drop (avoids a
   * one-frame-stale save). Afterwards, column entry/exit rules run against
   * the pre-drag snapshot: an unranked card entering Priority opens the
   * rank prompt; entering Completed strips priority and stamps today's
   * completion date; leaving Completed clears the date.
   */
  const commitDrag = useCallback(
    (activeId?: string, overId?: string, hint?: MoveHint) => {
      const snapshot = dragSnapshotRef.current
      dragSnapshotRef.current = null
      isDraggingRef.current = false

      let next = cardsRef.current
      let persistsViaEffect = false
      if (activeId && overId && activeId !== overId) {
        const moved = applyCardMove(next, activeId, overId, hint)
        if (!boardsEqual(next, moved)) {
          next = moved
          cardsRef.current = next
          setCards(next)
          // Persist via the cards effect — avoid a second identical write
          persistsViaEffect = true
        }
      }

      if (!persistsViaEffect && allowPersistRef.current) {
        // Board already matched the drop (live preview); effect will not re-run
        reportSaveResult(saveCards(next))
      }

      if (snapshot) {
        const movedTo = (card: Card) => {
          const before = snapshot.find((s) => s.id === card.id)
          return before != null && before.column !== card.column
        }

        // Prompt only when a card arrives unranked in a column that requires a rank.
        const entered = next.find(
          (card) =>
            !card.archived &&
            columnDef(card.column).requiresPriority &&
            card.priority == null &&
            movedTo(card),
        )
        if (entered) {
          setPriorityPromptCardId(entered.id)
        }

        const needsRules = next.some((card) => {
          if (!movedTo(card)) return false
          const def = columnDef(card.column)
          return (
            (def.clearsPriority && card.priority != null) ||
            def.tracksCompletedDate ||
            (!def.tracksCompletedDate && card.completedAt != null)
          )
        })
        if (needsRules) {
          setCards((prev) =>
            prev.map((card) => {
              if (!movedTo(card)) return card
              const def = columnDef(card.column)
              let updated = card
              if (def.clearsPriority && updated.priority != null) {
                updated = { ...updated, priority: undefined }
              }
              if (def.tracksCompletedDate) {
                updated = { ...updated, completedAt: todayIsoDate() }
              } else if (updated.completedAt != null) {
                updated = { ...updated, completedAt: undefined }
              }
              return updated
            }),
          )
        }
      }
    },
    [reportSaveResult],
  )

  const dismissPriorityPrompt = useCallback(() => {
    setPriorityPromptCardId(null)
  }, [])

  /** Cancel drag — restore pre-drag board and persist that. */
  const cancelDrag = useCallback(() => {
    const snap = dragSnapshotRef.current
    dragSnapshotRef.current = null
    isDraggingRef.current = false
    if (snap) {
      cardsRef.current = snap
      setCards(snap)
      // setCards will persist via effect once isDragging is false
    } else if (allowPersistRef.current) {
      reportSaveResult(saveCards(cardsRef.current))
    }
  }, [reportSaveResult])

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
    priorityPromptCardId,
    dismissPriorityPrompt,
    addCard,
    updateCard,
    setCardPriority,
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
