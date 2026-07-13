import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { comparePriorityThenOrder } from '../data/priorities'
import { compareCompletedDateThenOrder } from '../lib/dates'
import type { Card as CardType, ColumnDef } from '../types'
import { Card } from './Card'

type Props = {
  column: ColumnDef
  cards: CardType[]
  dragDisabled?: boolean
  /** Light up as a valid drop target while dragging (includes source column). */
  showDropHighlight: boolean
  /** Phone: which single column is visible (tabs); ignored by desktop CSS. */
  mobileActive?: boolean
  onAdd: (columnId: ColumnDef['id']) => void
  onEdit: (cardId: string) => void
  onRequestDelete: (cardId: string) => void
  onRequestArchive: (cardId: string) => void
}

export function Column({
  column,
  cards,
  dragDisabled = false,
  showDropHighlight,
  mobileActive = false,
  onAdd,
  onEdit,
  onRequestDelete,
  onRequestArchive,
}: Props) {
  // Whole column is the droppable so the cursor anywhere inside counts.
  const { setNodeRef } = useDroppable({ id: column.id })

  // Parent passes cardsInColumn (order-sorted); the policy sort still runs
  // here: Completed sorts by completion date (newest first); every other
  // column auto-sorts by importance. Undated/unranked cards keep manual
  // drag order below the sorted ones.
  const sorted = cards
    .slice()
    .sort(
      column.tracksCompletedDate
        ? compareCompletedDateThenOrder
        : comparePriorityThenOrder,
    )
  const itemIds = sorted.map((c) => c.id)
  const canAdd = column.allowsDirectAdd

  return (
    <section
      ref={setNodeRef}
      className={`column${showDropHighlight ? ' column--over' : ''}${mobileActive ? ' column--mobile-active' : ''}`}
      aria-label={column.label}
    >
      <header className="column__header">
        <div className="column__heading">
          <div className="column__heading-text">
            <h2 className="column__label">{column.label}</h2>
            <span className="column__count" aria-label={`${cards.length} cards`}>
              {cards.length}
            </span>
          </div>
          {canAdd ? (
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={() => onAdd(column.id)}
              aria-label={`Add card to ${column.label}`}
              title={`Add to ${column.label}`}
            >
              +
            </button>
          ) : (
            <span className="column__add-slot" aria-hidden="true" />
          )}
        </div>
        <p className="column__hint">{column.hint}</p>
      </header>

      <div className="column__body">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {sorted.length === 0 ? (
            <div className="column__empty">
              <p className="column__empty-text">Nothing here yet</p>
              {canAdd ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--compact"
                  onClick={() => onAdd(column.id)}
                >
                  Add card
                </button>
              ) : null}
            </div>
          ) : (
            sorted.map((card) => (
              <Card
                key={card.id}
                card={card}
                dragDisabled={dragDisabled}
                onEdit={onEdit}
                onRequestDelete={onRequestDelete}
                onRequestArchive={
                  column.allowsArchive ? onRequestArchive : undefined
                }
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  )
}
