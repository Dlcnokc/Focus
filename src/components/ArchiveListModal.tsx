import { useMemo, useState } from 'react'
import type { Card } from '../types'
import { ModalShell } from './ModalShell'

type Props = {
  cards: Card[]
  onRestore: (cardId: string) => void
  onRequestDelete: (cardId: string) => void
  onClose: () => void
}

/**
 * List of archived cards — restore or permanently delete.
 * Title search filters the list only (does not change stored data).
 */
export function ArchiveListModal({
  cards,
  onRestore,
  onRequestDelete,
  onClose,
}: Props) {
  const [titleQuery, setTitleQuery] = useState('')

  const visibleCards = useMemo(() => {
    const q = titleQuery.trim().toLowerCase()
    if (!q) return cards
    return cards.filter((card) => card.title.toLowerCase().includes(q))
  }, [cards, titleQuery])

  const hasArchive = cards.length > 0
  const queryActive = titleQuery.trim().length > 0

  return (
    <ModalShell
      role="dialog"
      ariaLabelledBy="archive-list-title"
      onClose={onClose}
      className="modal--archive"
    >
      <h2 id="archive-list-title" className="modal__title">
        Archive
      </h2>
      <p className="modal__body">
        Soft-removed cards. Restore puts them back on the board; Delete is
        permanent.
      </p>

      {hasArchive ? (
        <label className="archive-list__search">
          <span className="visually-hidden">Search archived cards by title</span>
          <input
            type="search"
            className="app__search-input"
            placeholder="Search titles…"
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      ) : null}

      {!hasArchive ? (
        <p className="archive-list__empty">No archived cards.</p>
      ) : visibleCards.length === 0 ? (
        <p className="archive-list__empty">
          {queryActive
            ? 'No archived cards match that title.'
            : 'No archived cards.'}
        </p>
      ) : (
        <ul className="archive-list">
          {visibleCards.map((card) => (
            <li key={card.id} className="archive-list__item">
              <div className="archive-list__text">
                <span className="archive-list__title">{card.title}</span>
                {card.notes ? (
                  <span className="archive-list__notes">{card.notes}</span>
                ) : null}
              </div>
              <div className="archive-list__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--compact"
                  onClick={() => onRestore(card.id)}
                >
                  Restore
                </button>
                <button
                  type="button"
                  className="btn btn--danger-ghost btn--compact"
                  onClick={() => onRequestDelete(card.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="modal__actions">
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  )
}
