import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import NoteEditor from '../components/NoteEditor';
import NotesList from '../components/NotesList';
import { createNote, deleteNote, listNotes, updateNote } from '../api/notesApi';
import './NotesPage.css';

function normalizeNotesList(payload) {
  // Backend not implemented yet; be permissive:
  // - allow an array response
  // - allow {items: [...]}
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray(payload.items)) return payload.items;
  return [];
}

function toErrorMessage(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  return err.message || 'Request failed';
}

// PUBLIC_INTERFACE
export default function NotesPage() {
  /** Main page: lists notes and allows creating/editing/deleting notes via backend API. */
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  async function refreshNotes({ keepSelection = true } = {}) {
    setLoadError('');
    setIsLoading(true);
    try {
      const payload = await listNotes();
      const list = normalizeNotesList(payload);
      setNotes(list);

      if (!keepSelection) {
        setSelectedId(null);
      } else if (selectedId != null && !list.some((n) => n.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setLoadError(toErrorMessage(err));
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNewNote() {
    setEditorMode('create');
    setSelectedId(null);
    setSaveError('');
  }

  function handleSelect(id) {
    setSelectedId(id);
    setEditorMode('edit');
    setSaveError('');
    setDeleteError('');
  }

  async function handleDelete(id) {
    setDeleteError('');
    setDeletingId(id);
    try {
      await deleteNote(id);
      // If we deleted the selected note, clear selection.
      const keepSelection = selectedId !== id;
      await refreshNotes({ keepSelection });
      if (!keepSelection) {
        setEditorMode('create');
        setSelectedId(null);
      }
    } catch (err) {
      setDeleteError(toErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(noteDraft) {
    setIsSaving(true);
    setSaveError('');
    try {
      if (editorMode === 'edit' && selectedId != null) {
        await updateNote(selectedId, noteDraft);
      } else {
        const created = await createNote(noteDraft);
        // Attempt to keep selection on the newly created item if backend returns it.
        const createdId = created && typeof created === 'object' ? created.id : null;
        await refreshNotes({ keepSelection: true });
        if (createdId != null) {
          setSelectedId(createdId);
          setEditorMode('edit');
        } else {
          // If we can't infer ID, stay in create mode but show latest list.
          setEditorMode('create');
          setSelectedId(null);
        }
      }
    } catch (err) {
      setSaveError(toErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  const pageSubtitle = `${notes.length} note${notes.length === 1 ? '' : 's'}`;

  return (
    <div className="NotesApp">
      <Header onNewNote={handleNewNote} />

      <main className="NotesMain">
        <div className="NotesMain__inner">
          <section className="Panel" aria-label="Notes panel">
            <div className="Panel__header">
              <div>
                <h1 className="Panel__title">Your notes</h1>
                <div className="Panel__subtitle">{pageSubtitle}</div>
              </div>

              <button type="button" className="Button Button--ghost" onClick={() => refreshNotes()}>
                Refresh
              </button>
            </div>

            {loadError ? (
              <div className="Alert Alert--error" role="alert">
                <div className="Alert__title">Couldn’t load notes</div>
                <div className="Alert__body">{loadError}</div>
                <div className="Alert__body Alert__body--small">
                  Ensure the backend is reachable at <code>http://localhost:3001</code> (or set{' '}
                  <code>REACT_APP_NOTES_API_BASE_URL</code>).
                </div>
              </div>
            ) : null}

            {deleteError ? (
              <div className="Alert Alert--error" role="alert">
                <div className="Alert__title">Couldn’t delete</div>
                <div className="Alert__body">{deleteError}</div>
              </div>
            ) : null}

            {isLoading ? (
              <div className="Skeleton" role="status" aria-live="polite">
                <div className="Skeleton__line Skeleton__line--lg" />
                <div className="Skeleton__line" />
                <div className="Skeleton__line" />
                <div className="Skeleton__line" />
              </div>
            ) : (
              <NotesList
                notes={notes}
                selectedId={selectedId}
                onSelect={handleSelect}
                onDelete={handleDelete}
                isDeletingId={deletingId}
              />
            )}
          </section>

          <NoteEditor
            mode={editorMode}
            initialNote={editorMode === 'edit' ? selectedNote : null}
            onCancel={handleNewNote}
            onSubmit={handleSubmit}
            isSaving={isSaving}
            error={saveError}
          />
        </div>
      </main>
    </div>
  );
}
