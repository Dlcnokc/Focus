import { useId, useState, type FormEvent } from 'react'
import { columnDef } from '../data/placeholderBoard'
import { DEFAULT_PRIORITY, PRIORITY_OPTIONS_DESC } from '../data/priorities'
import type { Card, ColumnId, Priority } from '../types'

type CreateProps = {
  mode: 'create'
  column: ColumnId
  onSubmit: (values: {
    title: string
    notes: string
    column: ColumnId
    priority?: Priority
  }) => string | null
  onClose: () => void
}

type EditProps = {
  mode: 'edit'
  card: Card
  onSubmit: (values: {
    title: string
    notes: string
    priority?: Priority
  }) => string | null
  onClose: () => void
}

type Props = CreateProps | EditProps

/** Select value for "no priority" (empty string keeps <select> simple). */
const NO_PRIORITY = ''

/**
 * Centered modal for creating or editing a card.
 * Title is required (validated on submit, marked with a red asterisk).
 * Priority is pickable in any column; in the Priority column it is
 * always set (no "none" choice there).
 * Remount via parent `key` when target changes so form state resets cleanly.
 */
export function CardFormPanel(props: Props) {
  const titleId = useId()
  const notesId = useId()
  const priorityId = useId()
  const errorId = useId()

  const targetColumn: ColumnId =
    props.mode === 'create' ? props.column : props.card.column
  const targetDef = columnDef(targetColumn)
  // Priority column: always ranked. Completed: past prioritizing, no field.
  const priorityRequired = targetDef.requiresPriority
  const priorityHidden = targetDef.clearsPriority

  const [title, setTitle] = useState(
    props.mode === 'edit' ? props.card.title : '',
  )
  const [notes, setNotes] = useState(
    props.mode === 'edit' ? props.card.notes : '',
  )
  const [priority, setPriority] = useState<Priority | ''>(() => {
    if (props.mode === 'edit' && props.card.priority) return props.card.priority
    return priorityRequired ? DEFAULT_PRIORITY : NO_PRIORITY
  })
  const [error, setError] = useState<string | null>(null)

  const heading = props.mode === 'create' ? targetDef.newLabel : 'Edit card'

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    const chosenPriority: Priority | undefined = priorityHidden
      ? undefined
      : priority === NO_PRIORITY
        ? priorityRequired
          ? DEFAULT_PRIORITY
          : undefined
        : priority

    const result =
      props.mode === 'create'
        ? props.onSubmit({
            title,
            notes,
            column: props.column,
            priority: chosenPriority,
          })
        : props.onSubmit({ title, notes, priority: chosenPriority })

    if (result) {
      setError(result)
      return
    }

    setError(null)
    props.onClose()
  }

  return (
    <div className="modal-backdrop" onClick={props.onClose} role="presentation">
      <div
        className="modal modal--form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <h2 id="card-form-title" className="modal__title">
            {heading}
          </h2>
        </header>

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor={titleId}>
              Title
              <span className="field__asterisk" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id={titleId}
              className={`field__input${error ? ' field__input--error' : ''}`}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
              }}
              placeholder="What needs doing?"
              autoFocus
              required
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            {error ? (
              <p id={errorId} className="field__error" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={notesId}>
              Notes
            </label>
            <textarea
              id={notesId}
              className="field__textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Details, links, thoughts…"
              rows={5}
            />
          </div>

          {priorityHidden ? null : (
            <div className="field">
              <label className="field__label" htmlFor={priorityId}>
                Priority
                {priorityRequired ? (
                  <span className="field__asterisk" aria-hidden="true">
                    *
                  </span>
                ) : null}
              </label>
              <select
                id={priorityId}
                className="field__select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority | '')}
                aria-required={priorityRequired ? 'true' : undefined}
              >
                {priorityRequired ? null : (
                  <option value={NO_PRIORITY}>No priority</option>
                )}
                {PRIORITY_OPTIONS_DESC.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={props.onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {props.mode === 'create' ? 'Add card' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
