import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { useEffect, useRef, useState } from 'react'
import { COLUMNS } from '../data/placeholderBoard'
import {
  moveSignature,
  type MoveHint,
} from '../lib/boardMove'
import {
  boardCollisionDetection,
  resolveColumnFromOverId,
} from '../lib/dnd'
import { cardsInColumn } from '../lib/storage'
import type { Card, ColumnId } from '../types'
import { Column } from './Column'

type Props = {
  cards: Card[]
  /** When true, cards are not draggable (e.g. title search is active). */
  dragDisabled?: boolean
  onAdd: (columnId: ColumnId) => void
  onEdit: (cardId: string) => void
  onRequestDelete: (cardId: string) => void
  onRequestArchive: (cardId: string) => void
  onBeginDrag: () => void
  onPreviewMove: (activeId: string, overId: string, hint?: MoveHint) => void
  onCommitDrag: () => void
  onCancelDrag: () => void
}

function moveHintFromEvent(
  event: DragOverEvent | DragEndEvent,
): MoveHint | undefined {
  const over = event.over
  if (!over) return undefined

  // Prefer pointer from activator + transform when translated rect is missing
  const translated = event.active.rect.current.translated
  const initial = event.active.rect.current.initial
  const rect = translated ?? initial
  const pointerY =
    rect != null ? rect.top + rect.height / 2 : undefined

  return {
    pointerY,
    overTop: over.rect.top,
    overHeight: over.rect.height,
  }
}

export function Board({
  cards,
  dragDisabled = false,
  onAdd,
  onEdit,
  onRequestDelete,
  onRequestArchive,
  onBeginDrag,
  onPreviewMove,
  onCommitDrag,
  onCancelDrag,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null)
  const [overlayCard, setOverlayCard] = useState<Card | null>(null)
  /** Which column is centered in the phone horizontal scroller (CSS-hidden on desktop). */
  const [snapIndex, setSnapIndex] = useState(0)

  /** Skip preview updates that would not change placement (stops update loops). */
  const lastPreviewSigRef = useRef<string | null>(null)
  const cardsRef = useRef(cards)
  cardsRef.current = cards

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Huge distance effectively disables drag while search is filtering
      activationConstraint: {
        distance: dragDisabled ? 99999 : 8,
      },
    }),
    useSensor(TouchSensor, {
      // Long-press so column swipe / scroll can win first; huge delay when drag off
      activationConstraint: dragDisabled
        ? { delay: 99999, tolerance: 8 }
        : { delay: 220, tolerance: 8 },
    }),
  )

  useEffect(() => {
    if (activeId) document.body.classList.add('is-dragging')
    else document.body.classList.remove('is-dragging')
    return () => document.body.classList.remove('is-dragging')
  }, [activeId])

  /** Track horizontal snap for phone column dots (main is the scrollport). */
  useEffect(() => {
    const main = document.querySelector('.app__main')
    if (!(main instanceof HTMLElement)) return

    function updateSnap() {
      if (!(main instanceof HTMLElement)) return
      const cols = main.querySelectorAll('.column')
      if (!cols.length) return
      const mainRect = main.getBoundingClientRect()
      const centerX = mainRect.left + mainRect.width / 2
      let best = 0
      let bestDist = Infinity
      cols.forEach((col, i) => {
        const r = col.getBoundingClientRect()
        const c = r.left + r.width / 2
        const d = Math.abs(c - centerX)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      setSnapIndex((prev) => (prev === best ? prev : best))
    }

    updateSnap()
    main.addEventListener('scroll', updateSnap, { passive: true })
    window.addEventListener('resize', updateSnap)
    return () => {
      main.removeEventListener('scroll', updateSnap)
      window.removeEventListener('resize', updateSnap)
    }
  }, [cards])

  function scrollToColumn(index: number) {
    const main = document.querySelector('.app__main')
    if (!(main instanceof HTMLElement)) return
    const col = main.querySelectorAll('.column')[index]
    if (col instanceof HTMLElement) {
      col.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    }
  }

  function columnOfCard(cardId: string): ColumnId | undefined {
    return cardsRef.current.find((c) => c.id === cardId)?.column
  }

  function handleDragStart(event: DragStartEvent) {
    if (dragDisabled) return
    const id = String(event.active.id)
    const card = cardsRef.current.find((c) => c.id === id) ?? null
    lastPreviewSigRef.current = null
    setActiveId(id)
    setOverlayCard(card)
    setOverColumnId(card?.column ?? null)
    onBeginDrag()
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) {
      setOverColumnId(null)
      return
    }

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    const nextOverColumn = resolveColumnFromOverId(overIdStr, columnOfCard)
    setOverColumnId((prev) =>
      prev === nextOverColumn ? prev : nextOverColumn,
    )

    if (activeIdStr === overIdStr) return

    const hint = moveHintFromEvent(event)
    const sig = moveSignature(
      cardsRef.current,
      activeIdStr,
      overIdStr,
      hint,
    )

    if (lastPreviewSigRef.current === sig) return
    lastPreviewSigRef.current = sig

    onPreviewMove(activeIdStr, overIdStr, hint)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverColumnId(null)
    setOverlayCard(null)
    lastPreviewSigRef.current = null

    if (!over) {
      onCancelDrag()
      return
    }

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)
    if (activeIdStr !== overIdStr) {
      onPreviewMove(activeIdStr, overIdStr, moveHintFromEvent(event))
    }
    onCommitDrag()
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverColumnId(null)
    setOverlayCard(null)
    lastPreviewSigRef.current = null
    onCancelDrag()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <nav className="board-nav" aria-label="Board columns">
        {COLUMNS.map((column, index) => (
          <button
            key={column.id}
            type="button"
            className={`board-nav__dot${snapIndex === index ? ' is-active' : ''}`}
            aria-label={column.label}
            aria-current={snapIndex === index ? 'true' : undefined}
            onClick={() => scrollToColumn(index)}
          />
        ))}
      </nav>

      <div className="board">
        {COLUMNS.map((column) => {
          const showDropHighlight =
            activeId !== null && overColumnId === column.id

          return (
            <Column
              key={column.id}
              column={column}
              cards={cardsInColumn(cards, column.id)}
              dragDisabled={dragDisabled}
              showDropHighlight={showDropHighlight}
              onAdd={onAdd}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
              onRequestArchive={onRequestArchive}
            />
          )
        })}
      </div>

      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {overlayCard ? (
          <div className="card card--overlay">
            <div className="card__top">
              <h3 className="card__title">{overlayCard.title}</h3>
            </div>
            {overlayCard.notes ? (
              <div className="card__notes-block">
                <p className="card__notes card__notes--collapsed">
                  {overlayCard.notes}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
