import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type FormEvent,
} from 'react'
import { useModalChrome } from '../hooks/useModalChrome'
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

/**
 * Modal for creating or editing a card.
 * Title is required (validated on submit).
 * Remount via parent `key` when target changes so form state resets cleanly.
 */
export function CardFormPanel(props: Props) {
  const titleId = useId()
  const notesId = useId()
  const errorId = useId()
  const shakeRafRef = useRef<number | null>(null)

  const [title, setTitle] = useState(
    props.mode === 'edit' ? props.card.title : '',
  )
  const [notes, setNotes] = useState(
    props.mode === 'edit' ? props.card.notes : '',
  )
  const [error, setError] = useState<string | null>(null)
  /** True only while the title field shake/red flash runs. */
  const [titleShaking, setTitleShaking] = useState(false)

  const heading = props.mode === 'create' ? 'New card' : 'Edit card'
  const { onClose } = props
  const onEscape = useCallback(() => onClose(), [onClose])
  useModalChrome(onEscape)

  // Backup if animationend is skipped (e.g. reduced motion / interrupted)
  useEffect(() => {
    if (!titleShaking) return
    const t = window.setTimeout(() => setTitleShaking(false), 500)
    return () => window.clearTimeout(t)
  }, [titleShaking])

  // Cancel pending shake rAF on unmount
  useEffect(() => {
    return () => {
      if (shakeRafRef.current != null) {
        cancelAnimationFrame(shakeRafRef.current)
      }
    }
  }, [])

  function flashTitleError(message: string) {
    setError(message)
    // Drop the class then re-add next frame so re-submit restarts the animation
    setTitleShaking(false)
    if (shakeRafRef.current != null) {
      cancelAnimationFrame(shakeRafRef.current)
    }
    shakeRafRef.current = requestAnimationFrame(() => {
      shakeRafRef.current = requestAnimationFrame(() => {
        shakeRafRef.current = null
        setTitleShaking(true)
      })
    })
  }

  function handleTitleAnimationEnd(event: AnimationEvent<HTMLInputElement>) {
    if (event.animationName !== 'field-shake') return
    setTitleShaking(false)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      flashTitleError('Title is required.')
      return
    }

    const result =
      props.mode === 'create'
        ? props.onSubmit({ title, notes, column: props.column })
        : props.onSubmit({ title, notes })

    if (result) {
      flashTitleError(result)
      return
    }

    setError(null)
    setTitleShaking(false)
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
            </label>
            <input
              id={titleId}
              className={`field__input${titleShaking ? ' field__input--shake' : ''}`}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
                if (titleShaking) setTitleShaking(false)
              }}
              onAnimationEnd={handleTitleAnimationEnd}
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
