import type { ColumnDef, ColumnId } from '../types'

/**
 * Column labels and behavior — product decisions from PRODUCT.md.
 * Ids are stable storage keys; only labels changed in the
 * Focus → Priority / Done → Completed rename (saved boards keep working).
 * The flags are the single home for per-column rules — check them instead
 * of comparing ids.
 */
export const COLUMNS: ColumnDef[] = [
  {
    id: 'ideas',
    label: 'Ideas',
    hint: 'Not figured out yet',
    newLabel: 'New Idea',
    requiresPriority: false,
    clearsPriority: false,
    allowsDirectAdd: true,
    allowsArchive: false,
    tracksCompletedDate: false,
  },
  {
    id: 'ready',
    label: 'Waiting',
    hint: 'Clear, not started',
    newLabel: 'New Waiting Task',
    requiresPriority: false,
    clearsPriority: false,
    allowsDirectAdd: true,
    allowsArchive: false,
    tracksCompletedDate: false,
  },
  {
    id: 'focus',
    label: 'Priority',
    hint: 'Ranked by importance',
    newLabel: 'New Priority Task',
    requiresPriority: true,
    clearsPriority: false,
    allowsDirectAdd: true,
    allowsArchive: false,
    tracksCompletedDate: false,
  },
  {
    id: 'done',
    label: 'Completed',
    hint: 'Finished',
    newLabel: 'New Completed Task',
    requiresPriority: false,
    clearsPriority: true,
    allowsDirectAdd: false,
    allowsArchive: true,
    tracksCompletedDate: true,
  },
]

export const COLUMN_IDS: ColumnId[] = COLUMNS.map((c) => c.id)

export function isColumnId(value: unknown): value is ColumnId {
  return typeof value === 'string' && COLUMN_IDS.includes(value as ColumnId)
}

const BY_ID = new Map(COLUMNS.map((c) => [c.id, c]))

/** Definition (labels + behavior flags) for a column id. */
export function columnDef(id: ColumnId): ColumnDef {
  const def = BY_ID.get(id)
  if (!def) throw new Error(`Unknown column id: ${id}`)
  return def
}

/** Global "Add card" places new cards here by default. */
export const DEFAULT_NEW_COLUMN: ColumnId = 'ideas'
