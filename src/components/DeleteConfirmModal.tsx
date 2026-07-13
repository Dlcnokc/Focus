import { useCallback } from 'react'
import { useModalChrome } from '../hooks/useModalChrome'

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
  const onEscape = useCallback(() => onCancel(), [onCancel])
  useModalChrome(onEscape)

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
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
