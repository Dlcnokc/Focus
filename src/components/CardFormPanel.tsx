import {
  useEffect,
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type FormEvent,
} from 'react'
import { columnDef } from '../data/placeholderBoard'
import { DEFAULT_PRIORITY, PRIORITY_OPTIONS_DESC } from '../data/priorities'
import {
  clampCardTitle,
  MAX_CARD_TITLE_LENGTH,
  validateCardTitle,
} from '../lib/cardTitle'
import type { Card, ColumnId, Priority } from '../types'
import { ModalShell } from './ModalShell'

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
    completedAt?: string
  }) => string | null
  onClose: () => void
}

type Props = CreateProps | EditProps

/** Select value for "no priority" (empty string keeps <select> simple). */
const NO_PRIORITY = ''

/**
 * Modal for creating or editing a card.
 * Title is required and max 20 characters (validated on submit like empty title).
 * Priority is pickable in any column; in the Priority column it is
 * always set (no "none" choice there).
 * Remount via parent `key` when target changes so form state resets cleanly.
 */
export function CardFormPanel(props: Props) {
  const titleId = useId()
  const notesId = useId()
  const priorityId = useId()
  const completedId = useId()
  const errorId = useId()
  const titleCounterId = useId()
  const formTitleId = useId()
  const shakeRafRef = useRef<number | null>(null)

  const targetColumn: ColumnId =
    props.mode === 'create' ? props.column : props.card.column
  const targetDef = columnDef(targetColumn)
  // Priority column: always ranked. Completed: past prioritizing, no field.
  const priorityRequired = targetDef.requiresPriority
  const priorityHidden = targetDef.clearsPriority
  // Completed cards get an editable completion date instead.
  const showCompletedDate = props.mode === 'edit' && targetDef.tracksCompletedDate

  // Clamp on open so legacy long titles can be saved without a false error
  const [title, setTitle] = useState(
    props.mode === 'edit' ? clampCardTitle(props.card.title) : '',
  )
  const [notes, setNotes] = useState(
    props.mode === 'edit' ? props.card.notes : '',
  )
  const [priority, setPriority] = useState<Priority | ''>(() => {
    if (props.mode === 'edit' && props.card.priority) return props.card.priority
    return priorityRequired ? DEFAULT_PRIORITY : NO_PRIORITY
  })
  const [completedAt, setCompletedAt] = useState(
    props.mode === 'edit' ? (props.card.completedAt ?? '') : '',
  )
  const [error, setError] = useState<string | null>(null)
  /** True only while the title field shake/red flash runs. */
  const [titleShaking, setTitleShaking] = useState(false)
  /** Locks the form after a successful submit until the modal unmounts. */
  const [submitting, setSubmitting] = useState(false)

  const heading = props.mode === 'create' ? targetDef.newLabel : 'Edit card'

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
    if (submitting) return

    const titleError = validateCardTitle(title)
    if (titleError) {
      flashTitleError(titleError)
      return
    }

    const chosenPriority: Priority | undefined = priorityHidden
      ? undefined
      : priority === NO_PRIORITY
        ? priorityRequired
          ? DEFAULT_PRIORITY
          : undefined
        : priority

    // Only Completed cards carry a date; an emptied field means "no date"
    // (the card sorts below dated ones until it gets one).
    const chosenCompletedAt = showCompletedDate
      ? completedAt || undefined
      : props.mode === 'edit'
        ? props.card.completedAt
        : undefined

    const result =
      props.mode === 'create'
        ? props.onSubmit({
            title,
            notes,
            column: props.column,
            priority: chosenPriority,
          })
        : props.onSubmit({
            title,
            notes,
            priority: chosenPriority,
            completedAt: chosenCompletedAt,
          })

    if (result) {
      flashTitleError(result)
      return
    }

    setSubmitting(true)
    setError(null)
    setTitleShaking(false)
    props.onClose()
  }

  const titleOverLimit = title.trim().length > MAX_CARD_TITLE_LENGTH
  const titleDescribedBy = [titleCounterId, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <ModalShell
      role="dialog"
      ariaLabelledBy={formTitleId}
      onClose={props.onClose}
      className="modal--form"
    >
      <header className="modal__header">
        <h2 id={formTitleId} className="modal__title">
          {heading}
        </h2>
        <button
          type="button"
          className="btn btn--ghost btn--icon modal__close"
          onClick={props.onClose}
          aria-label="Close"
          title="Close"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <form className="modal__form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <div className="field__label-row">
            <label className="field__label" htmlFor={titleId}>
              Title
              <span className="field__asterisk" aria-hidden="true">
                *
              </span>
            </label>
            <span
              id={titleCounterId}
              className={`field__counter${titleOverLimit ? ' field__counter--over' : ''}`}
              aria-live="polite"
            >
              {title.trim().length}/{MAX_CARD_TITLE_LENGTH}
            </span>
          </div>
          <input
            id={titleId}
            className={`field__input${titleShaking ? ' field__input--shake' : ''}`}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value.slice(0, MAX_CARD_TITLE_LENGTH))
              if (error) setError(null)
              if (titleShaking) setTitleShaking(false)
            }}
            onAnimationEnd={handleTitleAnimationEnd}
            placeholder="What needs doing?"
            autoFocus
            required
            maxLength={MAX_CARD_TITLE_LENGTH}
            aria-required="true"
            aria-invalid={error || titleOverLimit ? true : undefined}
            aria-describedby={titleDescribedBy || undefined}
            disabled={submitting}
          />
          {error ? (
            <p id={errorId} className="field__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="field field--grow">
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
            disabled={submitting}
          />
        </div>

        {showCompletedDate ? (
          <div className="field">
            <label className="field__label" htmlFor={completedId}>
              Completed date
            </label>
            <input
              id={completedId}
              className="field__input field__input--date"
              type="date"
              value={completedAt}
              onChange={(e) => setCompletedAt(e.target.value)}
              disabled={submitting}
            />
          </div>
        ) : null}

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
              disabled={submitting}
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
          <button
            type="button"
            className="btn btn--ghost"
            onClick={props.onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {props.mode === 'create' ? 'Add card' : 'Save'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
