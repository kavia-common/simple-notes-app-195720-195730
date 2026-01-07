import React, { useEffect, useMemo, useState } from 'react';
import './NoteEditor.css';

function normalizeInitialNote(note) {
  if (!note) return { title: '', content: '' };
  return {
    title: typeof note.title === 'string' ? note.title : '',
    content: typeof note.content === 'string' ? note.content : '',
  };
}

// PUBLIC_INTERFACE
export default function NoteEditor({
  mode, // 'create' | 'edit'
  initialNote,
  onCancel,
  onSubmit,
  isSaving,
  error,
}) {
  /**
   * Note editor used for both creating and editing.
   * Controlled inputs; calls onSubmit({title, content}) when valid.
   */
  const start = useMemo(() => normalizeInitialNote(initialNote), [initialNote]);
  const [title, setTitle] = useState(start.title);
  const [content, setContent] = useState(start.content);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setTitle(start.title);
    setContent(start.content);
    setTouched(false);
  }, [start.title, start.content]);

  const titleError = touched && title.trim().length === 0 ? 'Title is required.' : '';
  const contentError = touched && content.trim().length === 0 ? 'Content is required.' : '';
  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const heading = mode === 'edit' ? 'Edit note' : 'New note';
  const submitLabel = mode === 'edit' ? 'Save changes' : 'Create note';

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!isValid || isSaving) return;

    // Keep frontend validation aligned with backend constraints (content min_length=1).
    onSubmit({ title: title.trim(), content: content.trim() });
  }

  return (
    <section className="Editor" aria-label={heading}>
      <div className="Editor__card">
        <div className="Editor__top">
          <div>
            <h2 className="Editor__title">{heading}</h2>
            <p className="Editor__hint">Use a short title and any details you need.</p>
          </div>

          <button type="button" className="Button Button--ghost" onClick={onCancel} disabled={isSaving}>
            Close
          </button>
        </div>

        {error ? (
          <div className="Alert Alert--error" role="alert">
            <div className="Alert__title">Couldn’t save</div>
            <div className="Alert__body">{error}</div>
          </div>
        ) : null}

        <form className="Editor__form" onSubmit={handleSubmit}>
          <label className="Field">
            <span className="Field__label">Title</span>
            <input
              className="Field__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g., Meeting notes"
              disabled={isSaving}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'title-error' : undefined}
            />
            {titleError ? (
              <span id="title-error" className="Field__error">
                {titleError}
              </span>
            ) : null}
          </label>

          <label className="Field">
            <span className="Field__label">Content</span>
            <textarea
              className="Field__textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Write your note..."
              disabled={isSaving}
              rows={10}
              aria-invalid={Boolean(contentError)}
              aria-describedby={contentError ? 'content-error' : undefined}
            />
            {contentError ? (
              <span id="content-error" className="Field__error">
                {contentError}
              </span>
            ) : null}
          </label>

          <div className="Editor__actions">
            <button type="button" className="Button Button--secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="Button Button--primary" disabled={!isValid || isSaving}>
              {isSaving ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
