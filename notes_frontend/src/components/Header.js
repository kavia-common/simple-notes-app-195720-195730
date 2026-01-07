import React from 'react';
import './Header.css';

// PUBLIC_INTERFACE
export default function Header({ onNewNote }) {
  /** Application header with branding and a "New note" action. */
  return (
    <header className="Header" role="banner">
      <div className="Header__inner">
        <div className="Header__brand">
          <div className="Header__logo" aria-hidden="true">
            N
          </div>
          <div>
            <div className="Header__title">Notes</div>
            <div className="Header__subtitle">Simple, fast, and organized</div>
          </div>
        </div>

        <div className="Header__actions">
          <button type="button" className="Button Button--primary" onClick={onNewNote}>
            New note
          </button>
        </div>
      </div>
    </header>
  );
}
