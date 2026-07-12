import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { comparePriorityThenOrder } from '../data/priorities'
import type { Card as CardType, ColumnDef } from '../types'
import { Card } from './Card'

type Props = {
  column: ColumnDef
  cards: CardType[]
  dragDisabled?: boolean
  /** Light up as a valid drop target while dragging (includes source column). */
  showDropHighlight: boolean
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
  onAdd,
  onEdit,
  onRequestDelete,
  onRequestArchive,
}: Props) {
  // Whole column is the droppable so the cursor anywhere inside counts.
  const { setNodeRef } = useDroppable({ id: column.id })

  // Every column auto-sorts by importance first; cards without a priority
  // stay below ranked ones and keep manual drag order among themselves.
  const sorted = cards.slice().sort(comparePriorityThenOrder)
  const itemIds = sorted.map((c) => c.id)
  // Completed only receives cards by dragging them in — no direct add.
  const canAdd = column.id !== 'done'

  return (
    <section
      ref={setNodeRef}
      className={`column${showDropHighlight ? ' column--over' : ''}`}
      aria-labelledby={`col-${column.id}`}
    >
      <header className="column__header">
        <div className="column__heading">
          <div className="column__heading-left">
            <h2 id={`col-${column.id}`} className="column__label">
              {column.label}
            </h2>
            <span className="column__count" aria-label={`${sorted.length} cards`}>
              {sorted.length}
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
          ) : null}
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
                  column.id === 'done' ? onRequestArchive : undefined
                }
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  )
}
