import { useId, useState, type FormEvent } from 'react'
import { COLUMNS } from '../data/placeholderBoard'
import type { Card, ColumnId } from '../types'

type CreateProps = {
  mode: 'create'
  column: ColumnId
  onSubmit: (values: {
    title: string
    notes: string
    column: ColumnId
  }) => string | null
  onClose: () => void
}

type EditProps = {
  mode: 'edit'
  card: Card
  onSubmit: (values: { title: string; notes: string }) => string | null
  onClose: () => void
}

type Props = CreateProps | EditProps

function columnLabel(id: ColumnId): string {
  return COLUMNS.find((c) => c.id === id)?.label ?? id
}

/**
 * Centered modal for creating or editing a card.
 * Title is required (validated on submit).
 * Remount via parent `key` when target changes so form state resets cleanly.
 */
export function CardFormPanel(props: Props) {
  const titleId = useId()
  const notesId = useId()
  const errorId = useId()

  const [title, setTitle] = useState(
    props.mode === 'edit' ? props.card.title : '',
  )
  const [notes, setNotes] = useState(
    props.mode === 'edit' ? props.card.notes : '',
  )
  const [error, setError] = useState<string | null>(null)

  const heading =
    props.mode === 'create'
      ? `New card · ${columnLabel(props.column)}`
      : 'Edit card'

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    const result =
      props.mode === 'create'
        ? props.onSubmit({ title, notes, column: props.column })
        : props.onSubmit({ title, notes })

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
              Title <span className="field__required">required</span>
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
              Notes <span className="field__optional">optional</span>
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
