/** Shared shapes for board data. */

export type ColumnId = 'ideas' | 'ready' | 'focus' | 'done'

/** Importance rank. Cards in the Priority column always have one. */
export type Priority =
  | 'low'
  | 'medium-low'
  | 'medium'
  | 'medium-high'
  | 'high'
  | 'immediate'

export type Card = {
  id: string
  title: string
  notes: string
  column: ColumnId
  /** Lower = higher in the column. Used for drag reorder (active cards). */
  order: number
  /** Soft-removed from the board; only Completed is archived in v1 UI. */
  archived: boolean
  /** Optional everywhere except the Priority column (set on create or on drop). */
  priority?: Priority
  /** ISO date (YYYY-MM-DD) set when the card enters Completed; editable there. */
  completedAt?: string
}

export type ColumnDef = {
  id: ColumnId
  label: string
  hint: string
  /** Heading for the create-card modal, e.g. "New Idea". */
  newLabel: string
  /** Cards here must always carry a priority (defaulted/prompted on entry). */
  requiresPriority: boolean
  /** Entering this column removes a card's priority. */
  clearsPriority: boolean
  /** Show the column + and empty-state Add card buttons. */
  allowsDirectAdd: boolean
  /** Cards here can be archived. */
  allowsArchive: boolean
  /** Entering this column stamps `completedAt` (today); leaving clears it. */
  tracksCompletedDate: boolean
}

/** What the card form modal is doing right now. */
export type EditorMode =
  | { type: 'closed' }
  | { type: 'create'; column: ColumnId }
  | { type: 'edit'; cardId: string }
