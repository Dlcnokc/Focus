import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card as CardType } from '../types'

type Props = {
  card: CardType
  onEdit: (cardId: string) => void
  onRequestDelete: (cardId: string) => void
}

export function Card({ card, onEdit, onRequestDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', cardId: card.id, column: card.column },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Keep layout space while DragOverlay shows the floating card
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`card${isDragging ? ' card--dragging' : ''}`}
      aria-label={card.title}
      {...attributes}
      {...listeners}
    >
      <div className="card__body">
        <h3 className="card__title">{card.title}</h3>
        {card.notes ? <p className="card__notes">{card.notes}</p> : null}
      </div>
      <div className="card__actions">
        <button
          type="button"
          className="btn btn--ghost btn--compact"
          onClick={() => onEdit(card.id)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn--danger-ghost btn--compact"
          onClick={() => onRequestDelete(card.id)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
