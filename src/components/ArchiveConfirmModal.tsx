import { ModalShell } from './ModalShell'

type Props = {
  cardTitle: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirm before archiving a Done card (soft remove).
 * Cancel is focused first (safer default).
 */
export function ArchiveConfirmModal({ cardTitle, onConfirm, onCancel }: Props) {
  return (
    <ModalShell
      role="alertdialog"
      ariaLabelledBy="archive-modal-title"
      ariaDescribedBy="archive-modal-desc"
      onClose={onCancel}
      className="modal--confirm"
    >
      <h2 id="archive-modal-title" className="modal__title">
        Archive card?
      </h2>
      <p id="archive-modal-desc" className="modal__body">
        Archive “{cardTitle}”? It leaves the board but stays in Archive so you
        can restore it later.
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
          Archive
        </button>
      </div>
    </ModalShell>
  )
}
