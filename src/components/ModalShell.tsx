import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { useModalChrome } from '../hooks/useModalChrome'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function isVisibleFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') {
    return false
  }
  // Skip elements not rendered / zero-size (e.g. display:none menus)
  return el.getClientRects().length > 0
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisibleFocusable)
}

type Props = {
  role?: 'dialog' | 'alertdialog'
  ariaLabelledBy: string
  ariaDescribedBy?: string
  onClose: () => void
  /** Extra classes on the panel (e.g. `modal--form`, `modal--confirm`). */
  className?: string
  /** Prefer this element on open; falls back to autofocus / first focusable. */
  initialFocusRef?: RefObject<HTMLElement | null>
  children: ReactNode
}

/**
 * Shared modal chrome: backdrop, Escape/scroll lock, focus trap, restore focus.
 * Panel content (title, body, actions) is provided by children.
 */
export function ModalShell({
  role = 'dialog',
  ariaLabelledBy,
  ariaDescribedBy,
  onClose,
  className,
  initialFocusRef,
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Capture opener during first render (before React autoFocus moves focus inside)
  const restoreFocusRef = useRef<HTMLElement | null | undefined>(undefined)
  if (restoreFocusRef.current === undefined) {
    const prev = document.activeElement
    restoreFocusRef.current = prev instanceof HTMLElement ? prev : null
  }
  const onEscape = useCallback(() => onClose(), [onClose])
  useModalChrome(onEscape)

  // Move focus into the panel; restore opener on unmount
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const prefer = initialFocusRef?.current
    if (prefer && panel.contains(prefer) && isVisibleFocusable(prefer)) {
      prefer.focus()
    } else {
      // React autoFocus may already have focused a control before this effect
      const already =
        document.activeElement instanceof HTMLElement &&
        panel.contains(document.activeElement) &&
        document.activeElement !== panel
          ? document.activeElement
          : null
      if (already && isVisibleFocusable(already)) {
        // Keep React autoFocus (or browser default)
      } else {
        const autoEl =
          panel.querySelector<HTMLElement>('[autofocus]') ??
          panel.querySelector<HTMLElement>('[data-autofocus]')
        if (autoEl && isVisibleFocusable(autoEl)) {
          autoEl.focus()
        } else {
          const focusable = getFocusable(panel)
          if (focusable[0]) {
            focusable[0].focus()
          } else {
            panel.tabIndex = -1
            panel.focus()
          }
        }
      }
    }

    return () => {
      const el = restoreFocusRef.current
      if (el && document.contains(el)) {
        el.focus()
      }
    }
  }, [initialFocusRef])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return

    const focusable = getFocusable(panel)
    if (focusable.length === 0) {
      event.preventDefault()
      panel.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last || !panel.contains(active)) {
      event.preventDefault()
      first.focus()
    }
  }

  const panelClass = className ? `modal ${className}` : 'modal'

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className={panelClass}
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  )
}
