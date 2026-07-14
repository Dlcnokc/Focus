import { ModalShell } from './ModalShell'

type Props = {
  cardTitle: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Delete confirmation — themed, no browser alert.
 * Cancel is focused first (safer default for destructive actions).
 */
export function DeleteConfirmModal({ cardTitle, onConfirm, onCancel }: Props) {
  return (
    <ModalShell
      role="alertdialog"
      ariaLabelledBy="delete-modal-title"
      ariaDescribedBy="delete-modal-desc"
      onClose={onCancel}
      className="modal--confirm"
    >
      <h2 id="delete-modal-title" className="modal__title">
        Delete card?
      </h2>
      <p id="delete-modal-desc" className="modal__body">
        Delete “{cardTitle}”? This cannot be undone.
      </p>
      <div className="modal__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          autoFocus
        >
          Cancel
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>
          Delete
        </button>
      </div>
    </ModalShell>
  )
}
