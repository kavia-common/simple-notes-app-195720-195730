const DEFAULT_BASE_URL = 'http://localhost:3001';

/**
 * Normalize an HTTP error into a user-friendly Error instance.
 * Keeps server-provided details when available.
 */
function buildHttpError(response, payload) {
  const maybeDetail =
    payload && typeof payload === 'object'
      ? payload.detail || payload.message || payload.error
      : null;

  const message = maybeDetail || `Request failed with status ${response.status}`;
  const err = new Error(message);
  err.status = response.status;
  err.payload = payload;
  return err;
}

/**
 * Safely parse a response body as JSON (returns null when empty).
 */
async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getBaseUrl() {
  // CRA supports REACT_APP_* variables.
  // If not provided, it falls back to localhost for local development.
  return process.env.REACT_APP_NOTES_API_BASE_URL || DEFAULT_BASE_URL;
}

/**
 * Generic JSON request helper.
 */
async function request(path, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await safeJson(response);

  if (!response.ok) {
    throw buildHttpError(response, payload);
  }
  return payload;
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** List notes. Expected backend endpoint: GET /notes */
  return request('/notes', { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  /** Get a single note by ID. Expected backend endpoint: GET /notes/{id} */
  return request(`/notes/${encodeURIComponent(id)}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function createNote(note) {
  /** Create a note. Expected backend endpoint: POST /notes */
  return request('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });
}

// PUBLIC_INTERFACE
export async function updateNote(id, note) {
  /** Update a note. Expected backend endpoint: PUT /notes/{id} */
  return request(`/notes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note. Expected backend endpoint: DELETE /notes/{id} */
  return request(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
