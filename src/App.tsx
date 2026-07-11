import { useEffect, useState } from 'react'
import { Board } from './components/Board'
import { CardFormPanel } from './components/CardFormPanel'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { DEFAULT_NEW_COLUMN } from './data/placeholderBoard'
import { useBoard } from './hooks/useBoard'
import type { ColumnId, EditorMode } from './types'

/**
 * Phase 3: create / edit / delete + localStorage save + drag reorder.
 */
function App() {
  const {
    cards,
    addCard,
    updateCard,
    deleteCard,
    previewMove,
    beginDrag,
    commitDrag,
    cancelDrag,
    getCard,
  } = useBoard()
  const [editor, setEditor] = useState<EditorMode>({ type: 'closed' })
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  function openCreate(column: ColumnId = DEFAULT_NEW_COLUMN) {
    setPendingDeleteId(null)
    setEditor({ type: 'create', column })
  }

  function openEdit(cardId: string) {
    setPendingDeleteId(null)
    setEditor({ type: 'edit', cardId })
  }

  function closeEditor() {
    setEditor({ type: 'closed' })
  }

  function requestDelete(cardId: string) {
    setEditor({ type: 'closed' })
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

  const editingCard =
    editor.type === 'edit' ? getCard(editor.cardId) : undefined
  const pendingDeleteCard = pendingDeleteId
    ? getCard(pendingDeleteId)
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

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__mark" aria-hidden="true" />
          <h1 className="app__title">Focus</h1>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => openCreate(DEFAULT_NEW_COLUMN)}
        >
          Add card
        </button>
      </header>

      <main className="app__main">
        <Board
          cards={cards}
          onAdd={openCreate}
          onEdit={openEdit}
          onRequestDelete={requestDelete}
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

      {pendingDeleteCard ? (
        <DeleteConfirmModal
          cardTitle={pendingDeleteCard.title}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      ) : null}
    </div>
  )
}

export default App
