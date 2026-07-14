import { useCallback, useEffect, useRef, useState } from 'react'
import { columnDef } from '../data/placeholderBoard'
import { applyCardMove, boardsEqual, type MoveHint } from '../lib/boardMove'
import { normalizeCardTitle, validateCardTitle } from '../lib/cardTitle'
import { applyColumnTransitionRules } from '../lib/columnRules'
import { isIsoDate } from '../lib/dates'
import { mergeCardLists } from '../lib/boardFile'
import {
  BOARD_STORAGE_KEY,
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

const OTHER_TAB_MSG =
  'Board was updated in another tab. Reload to see those changes.'

type AddCardInput = {
  title: string
  notes: string
  column: ColumnId
  priority?: Priority
}

type UpdateCardInput = {
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

  // Soft multi-tab notice — never auto-overwrite local state
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== BOARD_STORAGE_KEY) return
      setLoadError(OTHER_TAB_MSG)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addCard = useCallback(
    (input: AddCardInput) => {
      const titleError = validateCardTitle(input.title)
      if (titleError) {
        return { ok: false as const, error: titleError }
      }
      const title = normalizeCardTitle(input.title)

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
      const titleError = validateCardTitle(input.title)
      if (titleError) {
        return { ok: false as const, error: titleError }
      }
      const title = normalizeCardTitle(input.title)
      const completedAt =
        input.completedAt != null && isIsoDate(input.completedAt)
          ? input.completedAt
          : undefined

      enablePersist()
      setCards((prev) =>
        prev.map((card) =>
          card.id === input.id
            ? {
                ...card,
                title,
                notes: input.notes.trim(),
                priority: input.priority,
                completedAt,
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

  /** Soft-remove from the board (recoverable). Only columns that allow archive. */
  const archiveCard = useCallback(
    (id: string) => {
      enablePersist()
      setCards((prev) => {
        const card = prev.find((c) => c.id === id)
        if (!card || card.archived) return prev
        if (!columnDef(card.column).allowsArchive) return prev
        return reindexOrders(
          prev.map((c) => (c.id === id ? { ...c, archived: true } : c)),
        )
      })
    },
    [enablePersist],
  )

  /** Put an archived card back on the board (same column, end of actives). */
  const restoreCard = useCallback(
    (id: string) => {
      enablePersist()
      setCards((prev) => {
        const target = prev.find((c) => c.id === id)
        if (!target || !target.archived) return prev

        const actives = prev.filter(
          (c) => c.column === target.column && !c.archived,
        )
        const order =
          actives.length === 0
            ? 0
            : Math.max(...actives.map((c) => c.order)) + 1

        return reindexOrders(
          prev.map((card) =>
            card.id === id ? { ...card, archived: false, order } : card,
          ),
        )
      })
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
   * Drop finished — clear drag state, optionally re-apply the last drop,
   * run column entry/exit rules once against the pre-drag snapshot, then
   * commit a single board (priority/date fields included). Never persist a
   * pre-rules intermediate. Disk: cards effect when setCards runs; one
   * explicit save when the preview already matched the final board.
   */
  const commitDrag = useCallback(
    (activeId?: string, overId?: string, hint?: MoveHint) => {
      const snapshot = dragSnapshotRef.current
      dragSnapshotRef.current = null
      isDraggingRef.current = false

      let next = cardsRef.current

      if (activeId && overId && activeId !== overId) {
        const moved = applyCardMove(next, activeId, overId, hint)
        if (!boardsEqual(next, moved)) {
          next = moved
        }
      }

      let promptId: string | null = null
      if (snapshot) {
        const rules = applyColumnTransitionRules(next, snapshot)
        next = rules.cards
        promptId = rules.priorityPromptCardId
      }

      if (promptId) {
        setPriorityPromptCardId(promptId)
      }

      // A finished drop is an intentional board change (also re-enables save
      // after a blocked corrupt load).
      enablePersist()

      if (next !== cardsRef.current) {
        cardsRef.current = next
        setCards(next)
        // Persist via the cards effect once isDragging is false
        return
      }

      // Preview already matched final board (incl. no rule changes) —
      // effect will not re-run; write disk once now.
      reportSaveResult(saveCards(next))
    },
    [enablePersist, reportSaveResult],
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
