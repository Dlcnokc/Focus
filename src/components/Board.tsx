import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDroppable,
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
  columnTabDroppableData,
  columnTabId,
  resolveColumnFromOverId,
} from '../lib/dnd'
import { cardsInColumn } from '../lib/storage'
import type { Card, ColumnDef, ColumnId } from '../types'
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
  onCommitDrag: (
    activeId?: string,
    overId?: string,
    hint?: MoveHint,
  ) => void
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

/** Phone-only column tab — droppable so drag can move cards between columns. */
function BoardColumnTab({
  column,
  count,
  isActive,
  onSelect,
}: {
  column: ColumnDef
  count: number
  isActive: boolean
  onSelect: (columnId: ColumnId) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnTabId(column.id),
    data: columnTabDroppableData(column.id),
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`board-nav__tab${isActive ? ' is-active' : ''}${isOver ? ' is-over' : ''}`}
      aria-label={`${column.label}, ${count} cards`}
      aria-current={isActive ? 'true' : undefined}
      onClick={() => onSelect(column.id)}
    >
      <span className="board-nav__tab-label">{column.label}</span>
      <span className="board-nav__tab-count" aria-hidden="true">
        {count}
      </span>
    </button>
  )
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
  /** Which column tab is selected on phone (CSS-hidden on desktop). */
  const [mobileColumnId, setMobileColumnId] = useState<ColumnId>('ideas')

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
      // Long-press so vertical list scroll can win first; huge delay when drag off
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
    if (card) setMobileColumnId(card.column)
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

    // On phone: reveal the column under the pointer (tab or cards) so drop works
    if (nextOverColumn) {
      setMobileColumnId((prev) =>
        prev === nextOverColumn ? prev : nextOverColumn,
      )
    }

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
    const hint = moveHintFromEvent(event)

    const destColumn = resolveColumnFromOverId(overIdStr, columnOfCard)
    if (destColumn) setMobileColumnId(destColumn)

    // Final move applied inside commitDrag (sync) so disk matches drop position
    onCommitDrag(
      activeIdStr === overIdStr ? undefined : activeIdStr,
      activeIdStr === overIdStr ? undefined : overIdStr,
      hint,
    )
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
        {COLUMNS.map((column) => (
          <BoardColumnTab
            key={column.id}
            column={column}
            count={cardsInColumn(cards, column.id).length}
            isActive={mobileColumnId === column.id}
            onSelect={setMobileColumnId}
          />
        ))}
      </nav>

      <div className="board" data-mobile-column={mobileColumnId}>
        {COLUMNS.map((column) => {
          const showDropHighlight =
            activeId !== null && overColumnId === column.id
          const isMobileActive = mobileColumnId === column.id

          return (
            <Column
              key={column.id}
              column={column}
              cards={cardsInColumn(cards, column.id)}
              dragDisabled={dragDisabled}
              showDropHighlight={showDropHighlight}
              mobileActive={isMobileActive}
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
