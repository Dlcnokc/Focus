import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState, type ReactNode, type SVGProps } from 'react'
import type { Card as CardType } from '../types'

type Props = {
  card: CardType
  dragDisabled?: boolean
  onEdit: (cardId: string) => void
  onRequestDelete: (cardId: string) => void
  /** Done column only — opens archive confirm. */
  onRequestArchive?: (cardId: string) => void
}

/** Long enough that full notes would crowd the column. */
function notesAreLong(notes: string): boolean {
  return notes.length > 120 || notes.split('\n').length > 3
}

const iconSvgProps: SVGProps<SVGSVGElement> = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function Icon({ children }: { children: ReactNode }) {
  return <svg {...iconSvgProps}>{children}</svg>
}

function IconCopy() {
  return (
    <Icon>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  )
}

function IconCheck() {
  return (
    <Icon>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  )
}

function IconEdit() {
  return (
    <Icon>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  )
}

function IconTrash() {
  return (
    <Icon>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Icon>
  )
}

function IconArchive() {
  return (
    <Icon>
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </Icon>
  )
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

export function Card({
  card,
  dragDisabled = false,
  onEdit,
  onRequestDelete,
  onRequestArchive,
}: Props) {
  const canArchive = card.column === 'done' && !card.archived && onRequestArchive
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: dragDisabled,
    data: { type: 'card', cardId: card.id, column: card.column },
  })

  const hasNotes = Boolean(card.notes)
  const longNotes = hasNotes && notesAreLong(card.notes)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(t)
  }, [copied])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Keep layout space while DragOverlay shows the floating card
    opacity: isDragging ? 0.4 : undefined,
  }

  async function copyNotes() {
    if (!card.notes) return
    const ok = await writeClipboard(card.notes)
    if (ok) setCopied(true)
  }

  const notesCollapsed = longNotes && !expanded

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`card${isDragging ? ' card--dragging' : ''}${dragDisabled ? ' card--no-drag' : ''}`}
      aria-label={card.title}
      {...attributes}
      {...(dragDisabled ? {} : listeners)}
    >
      <div className="card__top">
        <h3 className="card__title">{card.title}</h3>
        <div className="card__actions">
          {hasNotes ? (
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={() => void copyNotes()}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={copied ? 'Notes copied' : 'Copy notes to clipboard'}
              title={copied ? 'Copied' : 'Copy notes'}
            >
              {copied ? <IconCheck /> : <IconCopy />}
            </button>
          ) : null}
          {canArchive ? (
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={() => onRequestArchive(card.id)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Archive card"
              title="Archive"
            >
              <IconArchive />
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost btn--icon"
            onClick={() => onEdit(card.id)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Edit card"
            title="Edit"
          >
            <IconEdit />
          </button>
          <button
            type="button"
            className="btn btn--danger-ghost btn--icon"
            onClick={() => onRequestDelete(card.id)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Delete card"
            title="Delete"
          >
            <IconTrash />
          </button>
        </div>
      </div>
      {hasNotes ? (
        <div className="card__notes-block">
          <p
            className={`card__notes${notesCollapsed ? ' card__notes--collapsed' : ''}`}
          >
            {card.notes}
          </p>
          {longNotes ? (
            <button
              type="button"
              className="card__notes-toggle"
              onClick={() => setExpanded((v) => !v)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-expanded={expanded}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
