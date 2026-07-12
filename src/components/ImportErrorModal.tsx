import { useCallback } from 'react'
import { useModalChrome } from '../hooks/useModalChrome'

type Props = {
  message: string
  onClose: () => void
}

/** Error after a failed import parse. */
export function ImportErrorModal({ message, onClose }: Props) {
  const onEscape = useCallback(() => onClose(), [onClose])
  useModalChrome(onEscape)

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="import-error-title"
        aria-describedby="import-error-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="import-error-title" className="modal__title">
          Could not import
        </h2>
        <p id="import-error-desc" className="modal__body">
          {message}
        </p>
        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onClose}
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
