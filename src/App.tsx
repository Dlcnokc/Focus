import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { ArchiveConfirmModal } from './components/ArchiveConfirmModal'
import { ArchiveListModal } from './components/ArchiveListModal'
import { Board } from './components/Board'
import { CardFormPanel } from './components/CardFormPanel'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { ImportBoardModal } from './components/ImportBoardModal'
import { ImportErrorModal } from './components/ImportErrorModal'
import { DEFAULT_NEW_COLUMN } from './data/placeholderBoard'
import { useBoard } from './hooks/useBoard'
import { downloadBoardJson, parseBoardFileJson } from './lib/boardFile'
import { listArchivedCards } from './lib/storage'
import type { Card, ColumnId, EditorMode } from './types'

/**
 * Solo board: CRUD, archive, localStorage, drag, export/import, title search.
 */
function App() {
  const {
    cards,
    loadError,
    dismissLoadError,
    addCard,
    updateCard,
    deleteCard,
    archiveCard,
    restoreCard,
    replaceBoard,
    mergeBoard,
    previewMove,
    beginDrag,
    commitDrag,
    cancelDrag,
    getCard,
  } = useBoard()
  const [editor, setEditor] = useState<EditorMode>({ type: 'closed' })
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null)
  const [archiveListOpen, setArchiveListOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<Card[] | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [titleQuery, setTitleQuery] = useState('')
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const headerMoreRef = useRef<HTMLDivElement>(null)

  const archivedCards = useMemo(() => listArchivedCards(cards), [cards])
  const activeCardCount = useMemo(
    () => cards.filter((card) => !card.archived).length,
    [cards],
  )
  const searchActive = titleQuery.trim().length > 0

  /** Active board only; title filter is display-only. */
  const visibleCards = useMemo(() => {
    const active = cards.filter((card) => !card.archived)
    const q = titleQuery.trim().toLowerCase()
    if (!q) return active
    return active.filter((card) => card.title.toLowerCase().includes(q))
  }, [cards, titleQuery])

  function closeOverlays() {
    setPendingDeleteId(null)
    setPendingArchiveId(null)
    setPendingImport(null)
    setImportError(null)
    setArchiveListOpen(false)
    setHeaderMenuOpen(false)
  }

  function openCreate(column: ColumnId = DEFAULT_NEW_COLUMN) {
    closeOverlays()
    setEditor({ type: 'create', column })
  }

  function openEdit(cardId: string) {
    closeOverlays()
    setEditor({ type: 'edit', cardId })
  }

  function closeEditor() {
    setEditor({ type: 'closed' })
  }

  function requestDelete(cardId: string) {
    setEditor({ type: 'closed' })
    setPendingArchiveId(null)
    setPendingImport(null)
    setImportError(null)
    // Keep archive list open when deleting from it; confirm stacks on top
    setPendingDeleteId(cardId)
  }

  function cancelDelete() {
    setPendingDeleteId(null)
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      deleteCard(pendingDeleteId)
      setPendingDeleteId(null)
    }
  }

  function requestArchive(cardId: string) {
    setEditor({ type: 'closed' })
    setPendingDeleteId(null)
    setArchiveListOpen(false)
    setPendingImport(null)
    setImportError(null)
    setPendingArchiveId(cardId)
  }

  function cancelArchive() {
    setPendingArchiveId(null)
  }

  function confirmArchive() {
    if (pendingArchiveId) {
      archiveCard(pendingArchiveId)
      setPendingArchiveId(null)
    }
  }

  function openArchiveList() {
    setEditor({ type: 'closed' })
    setPendingDeleteId(null)
    setPendingArchiveId(null)
    setPendingImport(null)
    setImportError(null)
    setArchiveListOpen(true)
  }

  function handleExport() {
    downloadBoardJson(cards)
  }

  function openImportPicker() {
    setEditor({ type: 'closed' })
    setPendingDeleteId(null)
    setPendingArchiveId(null)
    setArchiveListOpen(false)
    setImportError(null)
    setPendingImport(null)
    fileInputRef.current?.click()
  }

  async function onImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Allow re-selecting the same file later
    event.target.value = ''
    if (!file) return

    let text: string
    try {
      text = await file.text()
    } catch {
      setImportError('Could not read that file.')
      return
    }

    const result = parseBoardFileJson(text)
    if (!result.ok) {
      setImportError(result.error)
      return
    }

    setPendingImport(result.cards)
  }

  function cancelImport() {
    setPendingImport(null)
  }

  function confirmReplace() {
    if (!pendingImport) return
    replaceBoard(pendingImport)
    setPendingImport(null)
  }

  function confirmMerge() {
    if (!pendingImport) return
    mergeBoard(pendingImport)
    setPendingImport(null)
  }

  const editingCard =
    editor.type === 'edit' ? getCard(editor.cardId) : undefined
  const pendingDeleteCard = pendingDeleteId
    ? getCard(pendingDeleteId)
    : undefined
  const pendingArchiveCard = pendingArchiveId
    ? getCard(pendingArchiveId)
    : undefined

  useEffect(() => {
    if (editor.type === 'edit' && !editingCard) {
      setEditor({ type: 'closed' })
    }
  }, [editor, editingCard])

  useEffect(() => {
    if (pendingDeleteId && !pendingDeleteCard) {
      setPendingDeleteId(null)
    }
  }, [pendingDeleteId, pendingDeleteCard])

  useEffect(() => {
    if (pendingArchiveId && !pendingArchiveCard) {
      setPendingArchiveId(null)
    }
  }, [pendingArchiveId, pendingArchiveCard])

  /** Close mobile header menu on outside click or Escape. */
  useEffect(() => {
    if (!headerMenuOpen) return

    function onPointerDown(event: MouseEvent | PointerEvent) {
      const root = headerMoreRef.current
      if (!root) return
      if (event.target instanceof Node && !root.contains(event.target)) {
        setHeaderMenuOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setHeaderMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [headerMenuOpen])

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__mark" aria-hidden="true" />
          <h1 className="app__title">Focus</h1>
        </div>
        <label className="app__search">
          <span className="visually-hidden">Search cards by title</span>
          <input
            type="search"
            className="app__search-input"
            placeholder="Search titles…"
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="app__header-actions">
          {/*
            Desktop CSS: hide toggle, show panel buttons as a horizontal row.
            Mobile CSS: show toggle + Add; panel is a dropdown when .is-open.
          */}
          <div
            ref={headerMoreRef}
            className={`app__header-more${headerMenuOpen ? ' is-open' : ''}`}
          >
            <button
              type="button"
              className="btn btn--ghost btn--icon app__header-more-toggle"
              aria-expanded={headerMenuOpen}
              aria-haspopup="true"
              aria-label="More actions"
              title="More"
              onClick={() => setHeaderMenuOpen((v) => !v)}
            >
              <span aria-hidden="true">···</span>
            </button>
            <div
              className="app__header-more-panel"
              role="group"
              aria-label="Board file actions"
            >
              <button
                type="button"
                className="btn btn--ghost app__header-secondary"
                onClick={() => {
                  openArchiveList()
                  setHeaderMenuOpen(false)
                }}
                title="View archived cards"
              >
                Archive
                {archivedCards.length > 0
                  ? ` (${archivedCards.length})`
                  : ''}
              </button>
              <button
                type="button"
                className="btn btn--ghost app__header-secondary"
                onClick={() => {
                  handleExport()
                  setHeaderMenuOpen(false)
                }}
                title="Download board as JSON"
              >
                Export
              </button>
              <button
                type="button"
                className="btn btn--ghost app__header-secondary"
                onClick={() => {
                  openImportPicker()
                  setHeaderMenuOpen(false)
                }}
                title="Import board from JSON"
              >
                Import
              </button>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary app__header-add"
            onClick={() => openCreate(DEFAULT_NEW_COLUMN)}
          >
            Add card
          </button>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => void onImportFileChange(e)}
      />

      {loadError ? (
        <div className="app__banner" role="status">
          <p className="app__banner-text">{loadError}</p>
          <button
            type="button"
            className="btn btn--ghost btn--compact"
            onClick={dismissLoadError}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <main className="app__main">
        <Board
          cards={visibleCards}
          dragDisabled={searchActive}
          onAdd={openCreate}
          onEdit={openEdit}
          onRequestDelete={requestDelete}
          onRequestArchive={requestArchive}
          onBeginDrag={beginDrag}
          onPreviewMove={previewMove}
          onCommitDrag={commitDrag}
          onCancelDrag={cancelDrag}
        />
      </main>

      {editor.type === 'create' ? (
        <CardFormPanel
          key={`create-${editor.column}`}
          mode="create"
          column={editor.column}
          onClose={closeEditor}
          onSubmit={({ title, notes, column }) => {
            const result = addCard({ title, notes, column })
            return result.ok ? null : result.error
          }}
        />
      ) : null}

      {editor.type === 'edit' && editingCard ? (
        <CardFormPanel
          key={`edit-${editingCard.id}`}
          mode="edit"
          card={editingCard}
          onClose={closeEditor}
          onSubmit={({ title, notes }) => {
            const result = updateCard({
              id: editingCard.id,
              title,
              notes,
            })
            return result.ok ? null : result.error
          }}
        />
      ) : null}

      {pendingArchiveCard ? (
        <ArchiveConfirmModal
          cardTitle={pendingArchiveCard.title}
          onConfirm={confirmArchive}
          onCancel={cancelArchive}
        />
      ) : null}

      {archiveListOpen ? (
        <ArchiveListModal
          cards={archivedCards}
          onRestore={restoreCard}
          onRequestDelete={requestDelete}
          onClose={() => setArchiveListOpen(false)}
        />
      ) : null}

      {pendingDeleteCard ? (
        <DeleteConfirmModal
          cardTitle={pendingDeleteCard.title}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      ) : null}

      {pendingImport ? (
        <ImportBoardModal
          importCount={pendingImport.length}
          activeCount={activeCardCount}
          archivedCount={archivedCards.length}
          onReplace={confirmReplace}
          onMerge={confirmMerge}
          onCancel={cancelImport}
        />
      ) : null}

      {importError ? (
        <ImportErrorModal
          message={importError}
          onClose={() => setImportError(null)}
        />
      ) : null}
    </div>
  )
}

export default App
