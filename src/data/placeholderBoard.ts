import type { ColumnDef, ColumnId } from '../types'

/** Column labels — product decision from PRODUCT.md */
export const COLUMNS: ColumnDef[] = [
  {
    id: 'ideas',
    label: 'Ideas',
    hint: 'Not figured out yet',
  },
  {
    id: 'ready',
    label: 'Ready',
    hint: 'Clear, not started',
  },
  {
    id: 'focus',
    label: 'Focus',
    hint: 'Working on this',
  },
  {
    id: 'done',
    label: 'Done',
    hint: 'Finished',
  },
]

/** Global “Add card” places new cards here by default. */
export const DEFAULT_NEW_COLUMN: ColumnId = 'ideas'
