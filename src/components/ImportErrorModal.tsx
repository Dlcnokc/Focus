type Props = {
  message: string
  onClose: () => void
}

/** Simple centered error after a failed import parse. */
export function ImportErrorModal({ message, onClose }: Props) {
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
