/** Shared shapes for board data. */

export type ColumnId = 'ideas' | 'ready' | 'focus' | 'done'

export type Card = {
  id: string
  title: string
  notes: string
  column: ColumnId
  /** Lower = higher in the column. Used for drag reorder. */
  order: number
}

export type ColumnDef = {
  id: ColumnId
  label: string
  hint: string
}

/** What the card form modal is doing right now. */
export type EditorMode =
  | { type: 'closed' }
  | { type: 'create'; column: ColumnId }
  | { type: 'edit'; cardId: string }
