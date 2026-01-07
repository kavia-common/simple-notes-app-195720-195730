import React from 'react';
import './NotesList.css';

function formatPreview(content) {
  if (!content) return '';
  const text = String(content).replace(/\s+/g, ' ').trim();
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedId,
  onSelect,
  onDelete,
  isDeletingId,
}) {
  /** Notes list with selectable rows and per-row delete actions. */
  if (!notes || notes.length === 0) {
    return (
      <div className="EmptyState" role="status">
        <div className="EmptyState__title">No notes yet</div>
        <div className="EmptyState__body">Create your first note to get started.</div>
      </div>
    );
  }

  return (
    <div className="NotesList" role="list" aria-label="Notes list">
      {notes.map((n) => {
        const id = n.id;
        const title = n.title || 'Untitled';
        const preview = formatPreview(n.content);

        const isSelected = selectedId === id;
        const isDeleting = isDeletingId === id;

        return (
          <div
            key={id}
            className={`NoteRow ${isSelected ? 'NoteRow--selected' : ''}`}
            role="listitem"
          >
            <button
              type="button"
              className="NoteRow__main"
              onClick={() => onSelect(id)}
              aria-current={isSelected ? 'true' : 'false'}
            >
              <div className="NoteRow__title">{title}</div>
              <div className="NoteRow__preview">{preview}</div>
            </button>

            <button
              type="button"
              className="Button Button--danger Button--small"
              onClick={() => onDelete(id)}
              disabled={isDeleting}
              aria-label={`Delete note ${title}`}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
