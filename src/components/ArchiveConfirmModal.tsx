type Props = {
  cardTitle: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Centered confirm before archiving a Done card (soft remove).
 */
export function ArchiveConfirmModal({ cardTitle, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal modal--confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="archive-modal-title"
        aria-describedby="archive-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="archive-modal-title" className="modal__title">
          Archive card?
        </h2>
        <p id="archive-modal-desc" className="modal__body">
          Archive “{cardTitle}”? It leaves the board but stays in Archive so you
          can restore it later.
        </p>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onConfirm}
            autoFocus
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  )
}
