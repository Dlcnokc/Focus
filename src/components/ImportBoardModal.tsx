type Props = {
  importCount: number
  currentCount: number
  onReplace: () => void
  onMerge: () => void
  onCancel: () => void
}

/**
 * Choose how to apply an imported JSON board: replace everything or merge.
 */
export function ImportBoardModal({
  importCount,
  currentCount,
  onReplace,
  onMerge,
  onCancel,
}: Props) {
  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        aria-describedby="import-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="import-modal-title" className="modal__title">
          Import board?
        </h2>
        <p id="import-modal-desc" className="modal__body">
          File has <strong>{importCount}</strong> card
          {importCount === 1 ? '' : 's'}. Your board currently has{' '}
          <strong>{currentCount}</strong> card{currentCount === 1 ? '' : 's'}.
        </p>
        <ul className="modal__list">
          <li>
            <strong>Replace</strong> — wipe the board and use only the file.
          </li>
          <li>
            <strong>Merge</strong> — keep current cards; same id is updated from
            the file; new cards are added.
          </li>
        </ul>
        <div className="modal__actions modal__actions--wrap">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn--ghost" onClick={onMerge}>
            Merge
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onReplace}
            autoFocus
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  )
}
