/* Concierge daily log + important notes (localStorage).
   Requires: shared/utils.js, shared/mockdata.js */

const DAILY_LOG_STORAGE_KEY = 'mysuite-concierge-daily-log-v4';
const DAILY_LOG_NOTES_KEY = 'mysuite-concierge-daily-log-notes-v3';
const DAILY_LOG_SHIFTS = ['night', 'morning', 'evening'];

function escapeLogHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shiftLabel(shift) {
  if (shift === 'night') return 'Night';
  if (shift === 'morning') return 'Morning';
  if (shift === 'evening') return 'Evening';
  return shift || '—';
}

function suggestShift(date = new Date()) {
  const hour = date.getHours();
  if (hour < 8) return 'night';
  if (hour < 16) return 'morning';
  return 'evening';
}

function toDateInputValue(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function combineDateAndTime(dateStr, timeStr) {
  const datePart = String(dateStr || toDateInputValue()).trim();
  const timePart = String(timeStr || '00:00').trim() || '00:00';
  const parsed = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function formatLogTime(iso) {
  try {
    return toTimeInputValue(new Date(iso));
  } catch {
    return '';
  }
}

function normalizeTimeInput(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatNoteWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const today = toDateInputValue();
    const day = toDateInputValue(d);
    const time = d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
    if (day === today) return `Today at ${time}`;
    const date = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
    return `${date} at ${time}`;
  } catch {
    return '';
  }
}

/* ── Log entries ─────────────────────────────────────────── */

function getDailyLogs() {
  const stored = readSaved(DAILY_LOG_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seed = (typeof DAILY_LOG_SEED !== 'undefined' ? DAILY_LOG_SEED : []).map(e => ({ ...e }));
    save(DAILY_LOG_STORAGE_KEY, seed);
    return seed;
  }
  return stored;
}

function setDailyLogs(list) {
  save(DAILY_LOG_STORAGE_KEY, list);
}

function sortDailyLogsOldestFirst(list) {
  return [...list].sort((a, b) => new Date(a.happenedAt) - new Date(b.happenedAt));
}

function filterDailyLogs(list, { date, shift, query } = {}) {
  const q = String(query || '').trim().toLowerCase();
  return list.filter(entry => {
    if (date && entry.date !== date) return false;
    if (shift && shift !== 'all' && entry.shift !== shift) return false;
    if (q && !String(entry.notes || '').toLowerCase().includes(q)) return false;
    return true;
  });
}

function findDailyLogById(id) {
  return getDailyLogs().find(e => e.id === id) || null;
}

function addDailyLog(fields) {
  const concierge = getCurrentConcierge();
  const date = String(fields.date || toDateInputValue()).trim();
  const shift = DAILY_LOG_SHIFTS.includes(fields.shift) ? fields.shift : suggestShift();
  const entry = {
    id: `log-${Date.now()}`,
    date,
    shift,
    happenedAt: combineDateAndTime(date, fields.time),
    notes: String(fields.notes || '').trim(),
    loggedBy: (fields.loggedBy || concierge?.name || 'Concierge').trim(),
    updatedAt: null
  };
  const list = getDailyLogs();
  list.push(entry);
  setDailyLogs(list);
  return entry;
}

function updateDailyLog(id, fields) {
  const list = getDailyLogs();
  const index = list.findIndex(e => e.id === id);
  if (index < 0) return null;
  const current = list[index];
  const date = String(fields.date || current.date).trim();
  const shift = DAILY_LOG_SHIFTS.includes(fields.shift) ? fields.shift : current.shift;
  const next = {
    ...current,
    date,
    shift,
    happenedAt: combineDateAndTime(date, fields.time || toTimeInputValue(new Date(current.happenedAt))),
    notes: String(fields.notes ?? current.notes).trim(),
    loggedBy: (fields.loggedBy || current.loggedBy || 'Concierge').trim(),
    updatedAt: new Date().toISOString()
  };
  list[index] = next;
  setDailyLogs(list);
  return next;
}

function deleteDailyLog(id) {
  const list = getDailyLogs();
  const next = list.filter(e => e.id !== id);
  if (next.length === list.length) return false;
  setDailyLogs(next);
  return true;
}

function canEditDailyLog(entry, currentName) {
  return String(entry?.loggedBy || '').trim() === String(currentName || '').trim();
}

function renderDailyLogRow(entry, currentName) {
  const notes = escapeLogHtml(entry.notes || '');
  const time = escapeLogHtml(formatLogTime(entry.happenedAt));
  const who = escapeLogHtml(entry.loggedBy || 'Concierge');
  const timeValue = escapeLogHtml(toTimeInputValue(new Date(entry.happenedAt)));
  const own = canEditDailyLog(entry, currentName);
  const id = escapeLogHtml(entry.id);

  const timeCell = own
    ? `<button type="button" class="log-cell-btn" data-inline-edit="time" data-time-value="${timeValue}" title="Click to edit time">${time}</button>`
    : `<span>${time}</span>`;
  const entryCell = own
    ? `<button type="button" class="log-cell-btn" data-inline-edit="notes" title="Click to edit entry">${notes}</button>`
    : `<span>${notes}</span>`;
  const actions = own
    ? `<div class="log-row-actions">
         <button type="button" class="row-action" data-edit-log="${id}"><i data-icon="pencil"></i>Edit</button>
         <button type="button" class="row-action is-danger" data-delete-log="${id}"><i data-icon="trash"></i>Delete</button>
       </div>`
    : `<span class="log-readonly">Read only</span>`;

  return `<tr class="log-row${own ? '' : ' is-readonly'}" data-log-id="${id}">
    <td class="log-time">${timeCell}</td>
    <td class="log-entry">${entryCell}</td>
    <td class="log-concierge">${who}</td>
    <td class="log-actions">${actions}</td>
  </tr>`;
}

/* ── Important notes ─────────────────────────────────────── */

function getImportantNotes() {
  const stored = readSaved(DAILY_LOG_NOTES_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seed = (typeof DAILY_LOG_NOTES_SEED !== 'undefined' ? DAILY_LOG_NOTES_SEED : []).map(n => ({ ...n }));
    save(DAILY_LOG_NOTES_KEY, seed);
    return seed;
  }
  return stored;
}

function setImportantNotes(list) {
  save(DAILY_LOG_NOTES_KEY, list);
}

function getOpenImportantNotes() {
  return getImportantNotes()
    .filter(n => n.status !== 'resolved')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function findImportantNoteById(id) {
  return getImportantNotes().find(n => n.id === id) || null;
}

function addImportantNote(title) {
  const concierge = getCurrentConcierge();
  const note = {
    id: `note-${Date.now()}`,
    title: String(title || '').trim(),
    status: 'open',
    createdBy: concierge?.name || 'Concierge',
    createdAt: new Date().toISOString(),
    readAt: null,
    resolvedAt: null
  };
  const list = getImportantNotes();
  list.push(note);
  setImportantNotes(list);
  return note;
}

function updateImportantNote(id, title) {
  const list = getImportantNotes();
  const index = list.findIndex(n => n.id === id);
  if (index < 0) return null;
  const nextTitle = String(title ?? list[index].title).trim();
  if (!nextTitle) return null;
  list[index] = {
    ...list[index],
    title: nextTitle
  };
  setImportantNotes(list);
  return list[index];
}

function renderImportantNoteRow(note) {
  const title = escapeLogHtml(note.title || '');
  const who = escapeLogHtml(note.createdBy || 'Concierge');
  return `<tr class="log-row" data-note-id="${escapeLogHtml(note.id)}">
    <td class="log-entry">
      <button type="button" class="log-cell-btn" data-inline-note="title" title="Click to edit note">${title}</button>
    </td>
    <td class="log-concierge">${who}</td>
  </tr>`;
}
