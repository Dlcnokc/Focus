type Props = {
  cardTitle: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Centered delete confirmation — themed, no browser alert.
 */
export function DeleteConfirmModal({ cardTitle, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal modal--confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-modal-title" className="modal__title">
          Delete card?
        </h2>
        <p id="delete-modal-desc" className="modal__body">
          Delete “{cardTitle}”? This cannot be undone.
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
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
