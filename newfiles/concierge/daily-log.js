/* MySuite — Concierge daily log (table + important notes).
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, daily-log-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeShift = suggestShift();
let inlineEdit = null; /* { id, originalTime, originalNotes } — expanded log row */
let inlineNoteEdit = null; /* { id, original } — important note */

function closeMenu() {
  document.querySelector('.sidebar').classList.remove('open');
  document.querySelector('.scrim').classList.remove('visible');
  document.querySelector('.mobile-toggle').setAttribute('aria-expanded', 'false');
}

document.querySelector('.sidebar nav')?.addEventListener('click', event => {
  const link = event.target.closest('a.nav-item');
  if (!link) return;
  closeMenu();
  if (link.getAttribute('href') === '#') event.preventDefault();
});

function currentConciergeName() {
  return getCurrentConcierge()?.name || 'Concierge';
}

function currentDate() {
  return document.querySelector('#log-date')?.value || toDateInputValue();
}

function formatDateLabel(value) {
  const raw = value || toDateInputValue();
  const parsed = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function syncDateLabel() {
  const label = document.querySelector('#log-date-label');
  if (label) label.textContent = formatDateLabel(currentDate());
}

function openDatePicker() {
  const input = document.querySelector('#log-date');
  if (!input) return;
  try {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
  } catch {
    /* fall through */
  }
  input.focus();
  input.click();
}

function shiftLogDate(days) {
  const input = document.querySelector('#log-date');
  if (!input) return;
  const base = input.value || toDateInputValue();
  const date = new Date(`${base}T12:00:00`);
  if (Number.isNaN(date.getTime())) return;
  date.setDate(date.getDate() + days);
  input.value = toDateInputValue(date);
  onLogDateChanged();
}

function updateShiftHeading() {
  const heading = document.querySelector('#shift-heading');
  if (!heading) return;
  heading.textContent = `${shiftLabel(activeShift)} Shift`;
}

function resetComposer() {
  const now = new Date();
  document.querySelector('#composer-time').value = toTimeInputValue(now);
  document.querySelector('#composer-notes').value = '';
}

function focusComposer() {
  document.querySelector('#composer-notes')?.focus();
}

function refreshLogTable() {
  const date = currentDate();
  const rows = sortDailyLogsOldestFirst(
    filterDailyLogs(getDailyLogs(), { date, shift: activeShift })
  );
  const tbody = document.querySelector('#log-tbody');
  const empty = document.querySelector('#log-empty');
  updateShiftHeading();
  inlineEdit = null;

  if (rows.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    empty.textContent = `No entries for this ${shiftLabel(activeShift).toLowerCase()} shift yet.`;
    return;
  }

  empty.hidden = true;
  tbody.innerHTML = rows.map(entry => renderDailyLogRow(entry, currentConciergeName())).join('');
  renderIcons(tbody);
}

function refreshNotes() {
  const notes = getOpenImportantNotes();
  const tbody = document.querySelector('#notes-tbody');
  const empty = document.querySelector('#notes-empty');
  inlineNoteEdit = null;
  if (!tbody) return;

  if (notes.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  tbody.innerHTML = notes.map(renderImportantNoteRow).join('');
}

function setShift(shift) {
  activeShift = DAILY_LOG_SHIFTS.includes(shift) ? shift : suggestShift();
  document.querySelectorAll('.shift-tab').forEach(btn => {
    const on = btn.dataset.shift === activeShift;
    btn.setAttribute('aria-selected', String(on));
  });
  resetComposer();
  refreshLogTable();
}

function cancelInlineEdit() {
  if (!inlineEdit) return;
  inlineEdit = null;
  refreshLogTable();
}

function commitInlineEdit({ silent = false } = {}) {
  if (!inlineEdit) return;
  const { id, originalTime, originalNotes } = inlineEdit;
  const row = document.querySelector(`tr[data-log-id="${CSS.escape(id)}"]`);
  const timeInput = row?.querySelector('.log-edit-time');
  const notesInput = row?.querySelector('.log-edit-notes');
  const entry = findDailyLogById(id);
  if (!entry || !timeInput || !notesInput) {
    inlineEdit = null;
    refreshLogTable();
    return;
  }

  const nextTime = normalizeTimeInput(timeInput.value);
  const nextNotes = notesInput.value.trim();

  if (!nextTime) {
    toast('Enter time as HH:mm (24-hour).');
    timeInput.focus();
    return;
  }

  if (!nextNotes) {
    toast('Entry can’t be empty.');
    notesInput.focus();
    return;
  }

  const unchanged = nextTime === originalTime && nextNotes === originalNotes;
  inlineEdit = null;

  if (unchanged) {
    refreshLogTable();
    return;
  }

  const updated = updateDailyLog(id, {
    date: entry.date,
    shift: entry.shift,
    time: nextTime,
    notes: nextNotes,
    loggedBy: entry.loggedBy
  });

  refreshLogTable();
  if (!silent && updated) toast('Entry updated.');
}

function beginInlineEdit(id) {
  const entry = findDailyLogById(id);
  if (!entry) return;
  if (!canEditDailyLog(entry, currentConciergeName())) {
    toast('This entry is read only.');
    return;
  }

  if (inlineNoteEdit) commitInlineNoteEdit({ silent: true });

  if (inlineEdit) {
    if (inlineEdit.id === id) {
      document.querySelector(`tr[data-log-id="${CSS.escape(id)}"] .log-edit-notes`)?.focus();
      return;
    }
    cancelInlineEdit();
  }

  const row = document.querySelector(`tr[data-log-id="${CSS.escape(id)}"]`);
  if (!row) return;

  const originalTime = toTimeInputValue(new Date(entry.happenedAt));
  const originalNotes = entry.notes || '';
  inlineEdit = { id, originalTime, originalNotes };

  row.classList.add('is-editing');
  row.innerHTML = `
    <td colspan="4" class="log-edit-cell">
      <div class="log-edit-panel">
        <label class="log-edit-field">Time
          <input class="log-edit-time" type="text" inputmode="numeric" placeholder="HH:mm" pattern="^([01]\\d|2[0-3]):[0-5]\\d$" maxlength="5" lang="en-GB" value="${escapeLogHtml(originalTime)}" required title="Use 24-hour time, e.g. 14:30" autocomplete="off">
        </label>
        <label class="log-edit-field log-edit-field-notes">Entry
          <textarea class="log-edit-notes" rows="3" required>${escapeLogHtml(originalNotes)}</textarea>
        </label>
        <div class="log-edit-actions">
          <button type="button" class="button outline compact" data-cancel-log="${escapeLogHtml(id)}">Cancel</button>
          <button type="button" class="button compact" data-save-log="${escapeLogHtml(id)}">Save</button>
        </div>
      </div>
    </td>`;

  const notesInput = row.querySelector('.log-edit-notes');
  notesInput?.focus();
  notesInput?.setSelectionRange(notesInput.value.length, notesInput.value.length);

  row.querySelectorAll('.log-edit-time, .log-edit-notes').forEach(el => {
    el.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelInlineEdit();
      }
    });
  });
}

function cancelInlineNoteEdit() {
  if (!inlineNoteEdit) return;
  inlineNoteEdit = null;
  refreshNotes();
}

function commitInlineNoteEdit({ silent = false } = {}) {
  if (!inlineNoteEdit) return;
  const { id, original } = inlineNoteEdit;
  const row = document.querySelector(`tr[data-note-id="${CSS.escape(id)}"]`);
  const input = row?.querySelector('.log-inline-input');
  if (!input) {
    inlineNoteEdit = null;
    refreshNotes();
    return;
  }

  const nextTitle = input.value.trim();
  if (!nextTitle) {
    toast('Note can’t be empty.');
    input.focus();
    return;
  }

  inlineNoteEdit = null;
  if (nextTitle === original) {
    refreshNotes();
    return;
  }

  const updated = updateImportantNote(id, nextTitle);
  refreshNotes();
  if (!silent && updated) toast('Note updated.');
}

function beginInlineNoteEdit(id) {
  const note = findImportantNoteById(id);
  if (!note) return;

  if (inlineNoteEdit) {
    if (inlineNoteEdit.id === id) {
      document.querySelector(`tr[data-note-id="${CSS.escape(id)}"] .log-inline-input`)?.focus();
      return;
    }
    commitInlineNoteEdit({ silent: true });
  }
  if (inlineEdit) commitInlineEdit({ silent: true });

  const row = document.querySelector(`tr[data-note-id="${CSS.escape(id)}"]`);
  const cell = row?.querySelector('.log-entry');
  if (!cell) return;

  const original = note.title || '';
  inlineNoteEdit = { id, original };
  row.classList.add('is-editing');

  const input = document.createElement('input');
  input.className = 'log-inline-input';
  input.type = 'text';
  input.value = original;
  input.setAttribute('aria-label', 'Edit important note');
  cell.innerHTML = '';
  cell.appendChild(input);
  input.focus();
  input.select();

  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelInlineNoteEdit();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      input.blur();
    }
  });
}

document.querySelector('#composer-form')?.addEventListener('submit', event => {
  event.preventDefault();
  if (inlineEdit) commitInlineEdit({ silent: true });

  const time = normalizeTimeInput(document.querySelector('#composer-time')?.value);
  const notes = document.querySelector('#composer-notes')?.value.trim();
  if (!time) {
    toast('Enter time as HH:mm (24-hour).');
    document.querySelector('#composer-time')?.focus();
    return;
  }
  if (!notes) {
    toast('Write a short entry before saving.');
    focusComposer();
    return;
  }

  addDailyLog({
    date: currentDate(),
    shift: activeShift,
    time,
    notes,
    loggedBy: currentConciergeName()
  });
  resetComposer();
  refreshLogTable();
  toast('Entry saved.');
});

document.querySelector('#date-pill-btn')?.addEventListener('click', openDatePicker);

function onLogDateChanged() {
  syncDateLabel();
  resetComposer();
  refreshLogTable();
}

document.querySelector('#log-date')?.addEventListener('change', onLogDateChanged);
document.querySelector('#log-date')?.addEventListener('input', onLogDateChanged);

const logTbody = document.querySelector('#log-tbody');

function askDeleteLogConfirm(id) {
  const entry = findDailyLogById(id);
  if (!entry || !canEditDailyLog(entry, currentConciergeName())) return;
  const time = formatLogTime(entry.happenedAt) || '—';
  const preview = (entry.notes || 'this entry').trim();
  const short = preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;
  openModal(
    'Delete log entry',
    `<p>Remove this entry?</p>
     <p><strong>${escapeLogHtml(time)}</strong> · ${escapeLogHtml(short)}</p>
     <div class="dialog-options">
       <button class="button full" data-action="confirm-delete-log" data-log-id="${escapeLogHtml(entry.id)}">Delete entry</button>
       <button class="button outline full" data-action="close-modal">Cancel</button>
     </div>`
  );
}

logTbody?.addEventListener('click', event => {
  const saveBtn = event.target.closest('[data-save-log]');
  if (saveBtn) {
    commitInlineEdit();
    return;
  }

  const cancelBtn = event.target.closest('[data-cancel-log]');
  if (cancelBtn) {
    cancelInlineEdit();
    return;
  }

  const editBtn = event.target.closest('[data-edit-log]');
  if (editBtn) {
    beginInlineEdit(editBtn.dataset.editLog);
    return;
  }

  const deleteBtn = event.target.closest('[data-delete-log]');
  if (deleteBtn) {
    askDeleteLogConfirm(deleteBtn.dataset.deleteLog);
    return;
  }

  const trigger = event.target.closest('[data-inline-edit]');
  if (!trigger) return;
  const row = trigger.closest('tr[data-log-id]');
  if (!row || row.classList.contains('is-readonly')) return;
  beginInlineEdit(row.dataset.logId);
});

const notesTbody = document.querySelector('#notes-tbody');

notesTbody?.addEventListener('click', event => {
  const trigger = event.target.closest('[data-inline-note]');
  if (!trigger) return;
  const row = trigger.closest('tr[data-note-id]');
  if (!row) return;
  beginInlineNoteEdit(row.dataset.noteId);
});

notesTbody?.addEventListener('focusout', event => {
  if (!inlineNoteEdit) return;
  if (!event.target.classList.contains('log-inline-input')) return;
  const row = event.target.closest('tr[data-note-id]');
  if (row && row.contains(event.relatedTarget)) return;
  commitInlineNoteEdit();
});

document.querySelector('#note-composer-form')?.addEventListener('submit', event => {
  event.preventDefault();
  if (inlineNoteEdit) commitInlineNoteEdit({ silent: true });
  if (inlineEdit) commitInlineEdit({ silent: true });

  const title = document.querySelector('#note-composer-text')?.value.trim();
  if (!title) {
    toast('Write a note before saving.');
    document.querySelector('#note-composer-text')?.focus();
    return;
  }

  addImportantNote(title);
  document.querySelector('#note-composer-text').value = '';
  refreshNotes();
  toast('Important note saved.');
});

document.querySelector('#log-date').value = toDateInputValue();
syncDateLabel();
renderIcons(document.querySelector('.log-toolbar'));
renderIcons(document.querySelector('.notes-card'));
setShift(activeShift);
refreshNotes();

document.addEventListener('click', event => {
  const shiftTab = event.target.closest('.shift-tab');
  if (shiftTab) {
    if (inlineEdit) commitInlineEdit({ silent: true });
    if (inlineNoteEdit) commitInlineNoteEdit({ silent: true });
    setShift(shiftTab.dataset.shift);
    return;
  }

  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.closest('.sidebar')) closeMenu();
  const action = button.dataset.action;

  if (action === 'menu') {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  } else if (action === 'close-menu') {
    closeMenu();
  } else if (action === 'close-modal') {
    modal.close();
  } else if (action === 'prev-day') {
    if (inlineEdit) commitInlineEdit({ silent: true });
    if (inlineNoteEdit) commitInlineNoteEdit({ silent: true });
    shiftLogDate(-1);
  } else if (action === 'next-day') {
    if (inlineEdit) commitInlineEdit({ silent: true });
    if (inlineNoteEdit) commitInlineNoteEdit({ silent: true });
    shiftLogDate(1);
  } else if (action === 'confirm-delete-log') {
    const id = button.dataset.logId;
    modal.close();
    const entry = findDailyLogById(id);
    if (!entry || !canEditDailyLog(entry, currentConciergeName())) {
      toast('You can only delete your own entries.');
      return;
    }
    if (inlineEdit?.id === id) inlineEdit = null;
    deleteDailyLog(id);
    refreshLogTable();
    toast('Entry deleted.');
  } else if (action === 'help') {
    openModal(
      'Daily log help',
      '<p>Use the arrows or date pill to change the day. Pick a <strong>shift</strong> above the log, then add entries at the bottom. Your name is saved automatically under Logged by.</p><p>Click <strong>Edit</strong> on your own entry to expand it, then <strong>Save</strong>. Entries from another concierge show as <strong>Read only</strong>.</p>'
    );
  }
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (inlineEdit) cancelInlineEdit();
    if (inlineNoteEdit) cancelInlineNoteEdit();
    closeMenu();
  }
});

const lightingPicker = document.querySelector('#header-lighting');
const lightingOptions = ['morning', 'afternoon', 'evening', 'night'];
const savedLighting = readSaved('mysuite-header-lighting', 'afternoon');
function setLighting(value) {
  const selected = lightingOptions.includes(value) ? value : 'afternoon';
  document.body.dataset.time = selected;
  lightingPicker.value = selected;
}
setLighting(savedLighting);
lightingPicker.addEventListener('change', () => {
  setLighting(lightingPicker.value);
  save('mysuite-header-lighting', lightingPicker.value);
});
