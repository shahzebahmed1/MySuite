/* Concierge daily log + important notes (localStorage).
   Requires: shared/utils.js, shared/mockdata.js */

const DAILY_LOG_STORAGE_KEY = 'mysuite-concierge-daily-log-v4';
const DAILY_LOG_NOTES_KEY = 'mysuite-concierge-daily-log-notes-v4';
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

function getShiftReliefConcierges() {
  return MOCK_DATA.accounts.filter(account => account.role === 'concierge').sort((a, b) => a.name.localeCompare(b.name));
}

function addShiftStart(fields) {
  const relievedAccountId = String(fields.relievedAccountId || '');
  const relieved = getShiftReliefConcierges().find(account => account.id === relievedAccountId);
  if (!relieved && relievedAccountId !== 'not-applicable') return { error: 'Select the concierge you relieved, or choose N/A.' };
  const relievedName = relieved?.name || 'N/A';
  const equipmentOptions = ['Phone', 'Master Keys', 'Radio', 'Tablet', 'Other'];
  if (fields.equipment !== undefined && !Array.isArray(fields.equipment)) return { error: 'Choose valid equipment options.' };
  const equipment = [...new Set(fields.equipment || [])];
  if (equipment.some(item => !equipmentOptions.includes(item))) return { error: 'Choose valid equipment options.' };
  const otherEquipment = String(fields.otherEquipment || '').trim();
  const shiftNotes = String(fields.shiftNotes || '').trim();
  if (shiftNotes.length > 1000) return { error: 'Keep shift notes within 1,000 characters.' };
  if (otherEquipment.length > 200) return { error: 'Keep other equipment details within 200 characters.' };
  if (otherEquipment && !equipment.includes('Other')) equipment.push('Other');
  if (equipment.includes('Other') && !otherEquipment) return { error: 'Enter the other equipment received.' };
  const equipmentNames = equipment.map(item => item === 'Other' ? otherEquipment : item);
  const equipmentText = equipmentNames.length ? ` Equipment received: ${equipmentNames.join(', ')}${equipmentNames[equipmentNames.length - 1].endsWith('.') ? '' : '.'}` : '';
  const startedAt = new Date(fields.startedAt);
  const endsAt = new Date(fields.endsAt);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fields.startedAt || '') || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fields.endsAt || '') || !Number.isFinite(startedAt.getTime()) || !Number.isFinite(endsAt.getTime())) return { error: 'Enter a valid start and end date and time.' };
  if (endsAt <= startedAt) return { error: 'The scheduled end must be after the shift start. For overnight shifts, choose the following date.' };
  const actor = getCurrentConcierge();
  const time = endsAt.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endDate = toDateInputValue(startedAt) === toDateInputValue(endsAt) ? '' : ` on ${endsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const scheduledEnd = `${time}${endDate}`;
  const entry = {
    id: `log-shift-${crypto.randomUUID()}`, source: 'shift-start',
    date: toDateInputValue(startedAt), shift: suggestShift(startedAt), happenedAt: startedAt.toISOString(),
    notes: `Shift started. ${relieved ? `Relieved ${relievedName}${relievedName.endsWith('.') ? '' : '.'}` : 'Relieved: N/A.'} Scheduled end: ${scheduledEnd}${scheduledEnd.endsWith('.') ? '' : '.'}${equipmentText}${shiftNotes ? ` Notes: ${shiftNotes}` : ''}`,
    loggedBy: actor?.name || 'Concierge', loggedById: actor?.id || null,
    shiftDetails: { relievedAccountId: relieved?.id || null, relievedName, startedAt: startedAt.toISOString(), scheduledEndAt: endsAt.toISOString(), equipmentReceived: equipment, otherEquipment, notes: shiftNotes },
    createdAt: new Date().toISOString(), updatedAt: null
  };
  const logs = getDailyLogs();
  try {
    localStorage.setItem(DAILY_LOG_STORAGE_KEY, JSON.stringify([...logs, entry]));
  } catch {
    return { error: 'The shift could not be saved. Your details are still here; please try again.' };
  }
  return { entry };
}

function packageActivityCount(count) {
  const small = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  if (count < 20) return small[count];
  if (count < 100) return ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'][Math.floor(count / 10)] + (count % 10 ? `-${small[count % 10]}` : '');
  if (count < 1000) return `${small[Math.floor(count / 100)]} hundred${count % 100 ? ` and ${packageActivityCount(count % 100)}` : ''}`;
  if (count < 1000000) return `${packageActivityCount(Math.floor(count / 1000))} thousand${count % 1000 ? ` ${packageActivityCount(count % 1000)}` : ''}`;
  return `a total of ${count.toLocaleString('en-US')}`;
}

function formatPackageReleaseActivity(items) {
  const groups = new Map();
  items.forEach(item => {
    const collector = String(item.pickedUpBy || '').trim().replace(/\s+/g, ' ');
    const key = JSON.stringify([item.suite, item.method, item.method === 'picked-up' ? collector.normalize('NFKC').toLowerCase() : '']);
    if (!groups.has(key)) groups.set(key, { ...item, collector, count: 0 });
    groups.get(key).count++;
  });
  return [...groups.values()].map(group => {
    const subject = group.count === 1 ? 'A package' : `Multiple packages (${group.count})`;
    const start = subject[0].toUpperCase() + subject.slice(1);
    const verb = group.count === 1 ? 'was' : 'were';
    if (group.method === 'delivered') return `${start} ${verb} delivered to Suite ${group.suite}.`;
    const names = group.collector.split(/\s+/);
    const label = names.length > 1 ? `${names[0]} ${Array.from(names[names.length - 1])[0]}.` : group.collector;
    return `${start} for Suite ${group.suite} ${verb} picked up by ${label}` + (label.endsWith('.') ? '' : '.');
  }).join(' ');
}

function createPackageReleaseLogEntry(release) {
  const happenedAt = new Date(release.releasedAt);
  return {
    id: `log-${release.id}`, releaseId: release.id, source: 'package-release',
    date: toDateInputValue(happenedAt), shift: suggestShift(happenedAt),
    happenedAt: release.releasedAt, notes: formatPackageReleaseActivity(release.items),
    loggedBy: release.recordedBy, loggedById: release.recordedById,
    createdAt: release.releasedAt, updatedAt: null
  };
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

function renderDailyEntryMenu(kind, rawId, editable = true) {
  const id = escapeLogHtml(rawId);
  const noun = kind === 'note' ? 'note' : 'entry';
  const disabled = editable ? '' : ' disabled title="Only the author can change this entry"';
  return `<div class="daily-entry-menu">
    <button type="button" class="daily-entry-menu-toggle" data-entry-menu-toggle aria-expanded="false" aria-label="Actions for ${noun}"><span aria-hidden="true">&#8942;</span></button>
    <div class="daily-entry-menu-options" data-entry-menu-options hidden role="group" aria-label="${noun} actions">
      <button type="button" data-edit-${kind}="${id}"${disabled}><i data-icon="pencil"></i>Edit ${noun}</button>
      <button type="button" class="is-danger" data-delete-${kind}="${id}"${disabled}><i data-icon="trash"></i>Delete ${noun}</button>
    </div>
  </div>`;
}

function seedDailyLogAuthorExamples(date, shift) {
  const key = `mysuite-log-author-examples-${date}-${shift}-v1`;
  if (readSaved(key, false)) return;
  const labels = ['Logged by:', 'Written by:', 'Authored by:', 'Recorded by:', 'Added by:', 'By'];
  const descriptions = [
    'Completed perimeter walk. All exterior doors secure, no unusual activity.',
    'Light rain started. Set entrance door to weather mode and checked mats.',
    'Received office supplies and stored the delivery in the receiving room.',
    'Elevator 2 briefly stopped at the fourth floor. Reset and tested successfully.',
    'Garage inspection complete. Lighting and gates are working properly.',
    'Checked the pool and common area. Both spaces are tidy and ready for residents.'
  ];
  const start = shift === 'night' ? 0 : shift === 'morning' ? 8 : 16;
  const examples = labels.map((authorLabel, index) => {
    const time = `${String(start + index).padStart(2, '0')}:${index % 2 ? '30' : '15'}`;
    const happenedAt = combineDateAndTime(date, time);
    return { id: `author-example-${date}-${shift}-${index}`, date, shift, happenedAt,
      createdAt: happenedAt, updatedAt: happenedAt, notes: descriptions[index],
      loggedBy: 'Shahzeb', authorLabel };
  });
  const current = getDailyLogs();
  const ids = new Set(current.map(entry => entry.id));
  setDailyLogs([...current, ...examples.filter(entry => !ids.has(entry.id))]);
  save(key, true);
}

function renderDailyLogRow(entry, currentName) {
  const notes = escapeLogHtml(entry.notes || '');
  const author = escapeLogHtml(entry.loggedBy || 'Concierge');
  const authorMarkup = `<span class="log-author-inline is-author-outline"><small class="log-entry-author">${author}</small></span>`;
  const time = escapeLogHtml(formatLogTime(entry.happenedAt));
  const timeValue = escapeLogHtml(toTimeInputValue(new Date(entry.happenedAt)));
  const own = canEditDailyLog(entry, currentName);
  const id = escapeLogHtml(entry.id);

  const timeCell = own
    ? `<button type="button" class="log-cell-btn" data-inline-edit="time" data-time-value="${timeValue}" title="Click to edit time">${time}</button>`
    : `<span>${time}</span>`;
  const entryCell = own
    ? `<button type="button" class="log-cell-btn" data-inline-edit="notes" title="Click to edit entry">${notes}</button>`
    : `<span>${notes}</span>`;
  const actions = renderDailyEntryMenu('log', entry.id, own);

  return `<tr class="log-row${own ? '' : ' is-readonly'}" data-log-id="${id}">
    <td class="log-time">${timeCell}</td>
    <td class="log-entry"><div class="log-entry-content">${entryCell}</div></td>
    <td class="log-author-column">${authorMarkup}</td>
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

function normalizeImportantNote(note) {
  const rawTitle = String(note?.title || '').trim();
  const rawBody = String(note?.body || '').trim();
  if (rawBody) {
    return {
      ...note,
      title: rawTitle || 'Note',
      body: rawBody,
      createdBy: note?.createdBy || 'Concierge',
      createdAt: note?.createdAt || ''
    };
  }
  /* Legacy notes stored the full text in title only */
  const short = rawTitle.length > 52 ? `${rawTitle.slice(0, 52).trim()}…` : (rawTitle || 'Note');
  return {
    ...note,
    title: short,
    body: rawTitle,
    createdBy: note?.createdBy || 'Concierge',
    createdAt: note?.createdAt || ''
  };
}

function formatNoteCardDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

function addImportantNote(title, body) {
  const concierge = getCurrentConcierge();
  const note = {
    id: `note-${Date.now()}`,
    title: String(title || '').trim(),
    body: String(body || '').trim(),
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

function updateImportantNote(id, fields = {}) {
  const list = getImportantNotes();
  const index = list.findIndex(n => n.id === id);
  if (index < 0) return null;
  const current = normalizeImportantNote(list[index]);
  const nextTitle = String(fields.title ?? current.title).trim();
  const nextBody = String(fields.body ?? current.body).trim();
  if (!nextTitle || !nextBody) return null;
  list[index] = {
    ...list[index],
    title: nextTitle,
    body: nextBody
  };
  setImportantNotes(list);
  return list[index];
}

function deleteImportantNote(id) {
  const list = getImportantNotes();
  const next = list.filter(n => n.id !== id);
  if (next.length === list.length) return false;
  setImportantNotes(next);
  return true;
}

function renderImportantNoteCard(note) {
  const normalized = normalizeImportantNote(note);
  const id = escapeLogHtml(normalized.id);
  const title = escapeLogHtml(normalized.title || '');
  const body = escapeLogHtml(normalized.body || '');
  const who = escapeLogHtml(normalized.createdBy || 'Concierge');
  const when = escapeLogHtml(formatNoteCardDate(normalized.createdAt));
  const meta = when ? `By ${who} · ${when}` : `By ${who}`;
  return `<article class="note-item" data-note-id="${id}">
    <div class="note-item-top">
      <h3 class="note-item-title">${title}</h3>
      <div class="note-item-actions">${renderDailyEntryMenu('note', normalized.id)}</div>
    </div>
    <p class="note-item-body">${body}</p>
    <p class="note-item-meta">${meta}</p>
  </article>`;
}

function renderImportantNoteRow(note) {
  const normalized = normalizeImportantNote(note);
  const id = escapeLogHtml(normalized.id);
  const text = escapeLogHtml(normalized.body || normalized.title || '');
  const who = escapeLogHtml(normalized.createdBy || 'Concierge');
  return `<tr data-note-id="${id}">
    <td class="log-entry">
      <button type="button" class="log-cell-btn" data-edit-note="${id}" title="Click to edit note">${text}</button>
    </td>
    <td class="log-author-column"><span class="log-author-inline is-author-outline"><small class="log-entry-author">${who}</small></span></td>
    <td class="log-actions">
      ${renderDailyEntryMenu('note', normalized.id)}
    </td>
  </tr>`;
}
