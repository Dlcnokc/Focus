import { ModalShell } from './ModalShell'

type Props = {
  message: string
  onClose: () => void
}

/** Error after a failed import parse. */
export function ImportErrorModal({ message, onClose }: Props) {
  return (
    <ModalShell
      role="alertdialog"
      ariaLabelledBy="import-error-title"
      ariaDescribedBy="import-error-desc"
      onClose={onClose}
      className="modal--confirm"
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
    </ModalShell>
  )
}
