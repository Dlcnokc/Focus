import { useCallback } from 'react'
import { useModalChrome } from '../hooks/useModalChrome'

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
  const onEscape = useCallback(() => onCancel(), [onCancel])
  useModalChrome(onEscape)

  const boardSummary =
    archivedCount > 0
      ? `${activeCount} on the board and ${archivedCount} archived`
      : `${activeCount} card${activeCount === 1 ? '' : 's'} on the board`

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
          <button type="button" className="btn btn--primary" onClick={onReplace}>
            Replace
          </button>
        </div>
      </div>
    </div>
  )
}
