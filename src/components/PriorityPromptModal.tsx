import { useId, useState } from 'react'
import { DEFAULT_PRIORITY, PRIORITY_OPTIONS } from '../data/priorities'
import type { Priority } from '../types'

type Props = {
  cardTitle: string
  /** Card's current priority, if it already had one. */
  currentPriority?: Priority
  onConfirm: (priority: Priority) => void
  onCancel: () => void
}

/**
 * Centered prompt shown when a card is dragged into the Priority column,
 * so nothing there is ever unranked. Cancel keeps the card's existing
 * priority (the caller falls back to Medium when it had none).
 */
export function PriorityPromptModal({
  cardTitle,
  currentPriority,
  onConfirm,
  onCancel,
}: Props) {
  const selectId = useId()
  const [priority, setPriority] = useState<Priority>(
    currentPriority ?? DEFAULT_PRIORITY,
  )

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="priority-modal-title"
        aria-describedby="priority-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="priority-modal-title" className="modal__title">
          Set priority
        </h2>
        <p id="priority-modal-desc" className="modal__body">
          “{cardTitle}” moved to Priority. How important is it?
        </p>
        <div className="field">
          <label className="field__label" htmlFor={selectId}>
            Priority
          </label>
          <select
            id={selectId}
            className="field__select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            autoFocus
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onConfirm(priority)}
          >
            Set priority
          </button>
        </div>
      </div>
    </div>
  )
}
