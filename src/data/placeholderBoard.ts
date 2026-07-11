import type { ColumnDef, ColumnId } from '../types'

/**
 * Column labels — product decision from PRODUCT.md.
 * Ids are stable storage keys; only labels changed in the
 * Focus → Priority / Done → Completed rename (saved boards keep working).
 */
export const COLUMNS: ColumnDef[] = [
  {
    id: 'ideas',
    label: 'Ideas',
    hint: 'Not figured out yet',
    newLabel: 'New Idea',
  },
  {
    id: 'ready',
    label: 'Ready',
    hint: 'Clear, not started',
    newLabel: 'New Ready Task',
  },
  {
    id: 'focus',
    label: 'Priority',
    hint: 'Ranked by importance',
    newLabel: 'New Priority Task',
  },
  {
    id: 'done',
    label: 'Completed',
    hint: 'Finished',
    newLabel: 'New Completed Task',
  },
]

/** Global “Add card” places new cards here by default. */
export const DEFAULT_NEW_COLUMN: ColumnId = 'ideas'
