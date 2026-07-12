import { useEffect } from 'react'

/** Nested modals share one body class via a simple refcount. */
let bodyLockCount = 0

/** Topmost Escape handler only (stacked delete-over-archive, etc.). */
const escapeStack: Array<() => void> = []

function onDocumentEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  const top = escapeStack[escapeStack.length - 1]
  if (!top) return
  event.preventDefault()
  top()
}

/**
 * Escape closes the topmost overlay; body scroll locks while any modal is open.
 * Keep handlers stable (useCallback) when possible.
 */
export function useModalChrome(onEscape: () => void, active = true): void {
  useEffect(() => {
    if (!active) return

    escapeStack.push(onEscape)
    if (escapeStack.length === 1) {
      document.addEventListener('keydown', onDocumentEscape)
    }

    bodyLockCount += 1
    document.body.classList.add('modal-open')

    return () => {
      const index = escapeStack.lastIndexOf(onEscape)
      if (index >= 0) escapeStack.splice(index, 1)
      if (escapeStack.length === 0) {
        document.removeEventListener('keydown', onDocumentEscape)
      }

      bodyLockCount = Math.max(0, bodyLockCount - 1)
      if (bodyLockCount === 0) {
        document.body.classList.remove('modal-open')
      }
    }
  }, [onEscape, active])
}
