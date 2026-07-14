import { ModalShell } from './ModalShell'

type Props = {
  importCount: number
  /** Active (non-archived) cards currently on the board. */
  activeCount: number
  /** Soft-archived cards (also replaced/merged on import). */
  archivedCount: number
  onReplace: () => void
  onMerge: () => void
  onCancel: () => void
}

/**
 * Choose how to apply an imported JSON board: replace everything or merge.
 * Cancel is focused first (safer default for Replace).
 */
export function ImportBoardModal({
  importCount,
  activeCount,
  archivedCount,
  onReplace,
  onMerge,
  onCancel,
}: Props) {
  const boardSummary =
    archivedCount > 0
      ? `${activeCount} on the board and ${archivedCount} archived`
      : `${activeCount} card${activeCount === 1 ? '' : 's'} on the board`

  return (
    <ModalShell
      role="dialog"
      ariaLabelledBy="import-modal-title"
      ariaDescribedBy="import-modal-desc"
      onClose={onCancel}
      className="modal--confirm"
    >
      <h2 id="import-modal-title" className="modal__title">
        Import board?
      </h2>
      <p id="import-modal-desc" className="modal__body">
        File has <strong>{importCount}</strong> card
        {importCount === 1 ? '' : 's'}. You currently have {boardSummary}.
      </p>
      <ul className="modal__list">
        <li>
          <strong>Replace</strong> — wipe the board and archive, then use only
          the file.
        </li>
        <li>
          <strong>Merge</strong> — keep current cards; same id is updated from
          the file; new cards are added.
        </li>
      </ul>
      <div className="modal__actions modal__actions--wrap">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          autoFocus
        >
          Cancel
        </button>
        <button type="button" className="btn btn--ghost" onClick={onMerge}>
          Merge
        </button>
        <button type="button" className="btn btn--danger" onClick={onReplace}>
          Replace
        </button>
      </div>
    </ModalShell>
  )
}
