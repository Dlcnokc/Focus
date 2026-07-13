/** Max card title length — keeps titles single-line on the board. */
export const MAX_CARD_TITLE_LENGTH = 20

const TITLE_REQUIRED_ERROR = 'Title is required.'
const TITLE_TOO_LONG_ERROR = `Title must be ${MAX_CARD_TITLE_LENGTH} characters or fewer.`

/**
 * Validate a card title for create/edit.
 * Returns an error message, or null when the title is acceptable.
 */
export function validateCardTitle(raw: string): string | null {
  const title = raw.trim()
  if (!title) return TITLE_REQUIRED_ERROR
  if (title.length > MAX_CARD_TITLE_LENGTH) return TITLE_TOO_LONG_ERROR
  return null
}

/** Trim only (no silent truncate) — call after validateCardTitle passes. */
export function normalizeCardTitle(raw: string): string {
  return raw.trim()
}

/**
 * Trim and clamp for load/import only — legacy or external data with long
 * titles is shortened so the board stays clean without rejecting whole cards.
 */
export function clampCardTitle(raw: string): string {
  return raw.trim().slice(0, MAX_CARD_TITLE_LENGTH)
}
