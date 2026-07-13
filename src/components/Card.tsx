import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from 'react'
import { columnDef } from '../data/placeholderBoard'
import { formatIsoDate } from '../lib/dates'
import type { Card as CardType } from '../types'
import { PriorityBadge } from './PriorityBadge'

type Props = {
  card: CardType
  dragDisabled?: boolean
  onEdit: (cardId: string) => void
  onRequestDelete: (cardId: string) => void
  /** Done column only — opens archive confirm. */
  onRequestArchive?: (cardId: string) => void
}

/** True when notes paint taller than the 2-line collapsed preview. */
function notesExceedTwoLines(el: HTMLElement, expanded: boolean): boolean {
  if (expanded) {
    // Full height is visible — compare against two line-heights
    const styles = getComputedStyle(el)
    let lineHeight = parseFloat(styles.lineHeight)
    if (Number.isNaN(lineHeight)) {
      lineHeight = parseFloat(styles.fontSize) * 1.55
    }
    return el.scrollHeight > lineHeight * 2 + 1
  }
  // Collapsed (line-clamp): overflow means more than 2 lines
  return el.scrollHeight > el.clientHeight + 1
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
  const canArchive =
    columnDef(card.column).allowsArchive && !card.archived && onRequestArchive
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
  const [expanded, setExpanded] = useState(false)
  /** Measured: notes wrap past the 2-line clamp (not character count). */
  const [notesOverflow, setNotesOverflow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRootRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(t)
  }, [copied])

  useEffect(() => {
    if (isDragging) setActionsOpen(false)
  }, [isDragging])

  useEffect(() => {
    setActionsOpen(false)
    setExpanded(false)
  }, [card.id, card.notes])

  /** Collapse any notes that actually paint past 2 lines (wrapping or newlines). */
  useLayoutEffect(() => {
    if (!hasNotes) {
      setNotesOverflow(false)
      return
    }

    const el = notesRef.current
    if (!el) return

    function measure() {
      const node = notesRef.current
      if (!node) return
      setNotesOverflow(notesExceedTwoLines(node, expanded))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [hasNotes, card.notes, expanded, card.id])

  /** Phone ··· menu: close on outside tap or Escape (matches header menu). */
  useEffect(() => {
    if (!actionsOpen) return

    function onPointerDown(event: PointerEvent) {
      const root = actionsRootRef.current
      if (!root) return
      if (event.target instanceof Node && !root.contains(event.target)) {
        setActionsOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActionsOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [actionsOpen])

  // DnD-kit needs transform/transition inline; opacity lives on .card--dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  async function copyNotes() {
    if (!card.notes) return
    setActionsOpen(false)
    const ok = await writeClipboard(card.notes)
    if (ok) setCopied(true)
  }

  // Keep the 2-line clamp while collapsed so measurement and wrapping match the UI.
  // Expand only appears when content actually overflows those two lines.
  const clampNotes = hasNotes && !expanded
  const showNotesToggle = notesOverflow || expanded

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
        <div
          ref={actionsRootRef}
          className={`card__actions${actionsOpen ? ' is-open' : ''}`}
        >
          <button
            type="button"
            className="btn btn--ghost btn--icon card__actions-toggle"
            aria-expanded={actionsOpen}
            aria-haspopup="true"
            aria-label="Card actions"
            title="Actions"
            onClick={() => setActionsOpen((v) => !v)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span aria-hidden="true">···</span>
          </button>
          <div className="card__actions-panel" role="group" aria-label="Card actions">
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
                className="btn btn--ghost btn--icon btn--archive"
                onClick={() => {
                  setActionsOpen(false)
                  onRequestArchive(card.id)
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Archive card"
                title="Archive"
              >
                <IconArchive />
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn--ghost btn--icon btn--edit"
              onClick={() => {
                setActionsOpen(false)
                onEdit(card.id)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Edit card"
              title="Edit"
            >
              <IconEdit />
            </button>
            <button
              type="button"
              className="btn btn--danger-ghost btn--icon"
              onClick={() => {
                setActionsOpen(false)
                onRequestDelete(card.id)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Delete card"
              title="Delete"
            >
              <IconTrash />
            </button>
          </div>
        </div>
      </div>
      {card.priority ? <PriorityBadge priority={card.priority} /> : null}
      {card.completedAt ? (
        <span className="card__completed">
          Completed {formatIsoDate(card.completedAt)}
        </span>
      ) : null}
      {hasNotes ? (
        <div className="card__notes-block">
          <p
            ref={notesRef}
            className={`card__notes${clampNotes ? ' card__notes--collapsed' : ''}`}
          >
            {card.notes}
          </p>
          {showNotesToggle ? (
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
