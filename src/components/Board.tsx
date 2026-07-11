import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { useRef, useState } from 'react'
import { COLUMNS } from '../data/placeholderBoard'
import { priorityLabel } from '../data/priorities'
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

  /** Skip preview updates that would not change placement (stops update loops). */
  const lastPreviewSigRef = useRef<string | null>(null)
  const cardsRef = useRef(cards)
  cardsRef.current = cards

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Huge distance effectively disables drag while search is filtering
      activationConstraint: {
        distance: dragDisabled ? 99999 : 8,
      },
    }),
  )

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
            {overlayCard.priority ? (
              <span
                className={`card__priority card__priority--${overlayCard.priority}`}
              >
                {priorityLabel(overlayCard.priority)}
              </span>
            ) : null}
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
