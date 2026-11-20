/* MySuite — Concierge daily log (table + important notes).
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, daily-log-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeShift = suggestShift();
let shiftContentAnimation = null;
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
  const fullDate = formatDateLabel(currentDate());
  if (label) label.textContent = formatDateLabel(currentDate());
  const button = document.querySelector('#date-pill-btn');
  if (button) {
    button.setAttribute('aria-label', `Choose log date: ${fullDate}`);
    button.title = fullDate;
  }
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
  heading.textContent = `${shiftLabel(activeShift)} Shift Journal`;
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

function hideNoteComposer() {
  const form = document.querySelector('#note-composer-form');
  const toggle = document.querySelector('#note-add-toggle');
  if (form) {
    form.hidden = true;
    form.reset();
  }
  if (toggle) toggle.hidden = false;
}

function showNoteComposer() {
  const form = document.querySelector('#note-composer-form');
  const toggle = document.querySelector('#note-add-toggle');
  if (toggle) toggle.hidden = true;
  if (!form) return;
  form.hidden = false;
  document.querySelector('#note-composer-text')?.focus();
}

function refreshNotes() {
  const notes = getOpenImportantNotes();
  const tbody = document.querySelector('#notes-tbody');
  const empty = document.querySelector('#notes-empty');
  inlineNoteEdit = null;
  if (!tbody) return;

  if (notes.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.hidden = false;
  } else {
    if (empty) empty.hidden = true;
    tbody.innerHTML = notes.map(renderImportantNoteRow).join('');
    renderIcons(tbody);
  }
}

function updateShiftIndicator() {
  const tabs = document.querySelector('.log-card-top .shift-tabs');
  const selected = tabs?.querySelector('.shift-tab[aria-selected="true"]');
  if (!tabs || !selected) return;
  const groupRect = tabs.getBoundingClientRect();
  const selectedRect = selected.getBoundingClientRect();
  tabs.style.setProperty('--shift-x', `${selectedRect.left - groupRect.left - tabs.clientLeft}px`);
  tabs.style.setProperty('--shift-y', `${selectedRect.top - groupRect.top - tabs.clientTop}px`);
  tabs.style.setProperty('--shift-width', `${selectedRect.width}px`);
  tabs.style.setProperty('--shift-height', `${selectedRect.height}px`);
  tabs.classList.add('has-shift-indicator');
}
window.addEventListener('resize', updateShiftIndicator);
document.fonts?.ready.then(updateShiftIndicator);

function setShift(shift) {
  const nextShift = DAILY_LOG_SHIFTS.includes(shift) ? shift : suggestShift();
  const changed = nextShift !== activeShift;
  activeShift = nextShift;
  document.querySelectorAll('.shift-tab').forEach(btn => {
    const on = btn.dataset.shift === activeShift;
    btn.setAttribute('aria-selected', String(on));
  });
  updateShiftIndicator();
  resetComposer();
  refreshLogTable();
  shiftContentAnimation?.cancel();
  if (changed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const content = document.querySelector('.log-card .log-table-wrap');
    shiftContentAnimation = content?.animate?.(
      [{ opacity: .45, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 180, easing: 'ease-out' }
    );
  }
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
  const { id, originalBody } = inlineNoteEdit;
  const row = document.querySelector(`#notes-tbody tr[data-note-id="${CSS.escape(id)}"]`);
  const bodyInput = row?.querySelector('.note-edit-body');
  if (!bodyInput) {
    inlineNoteEdit = null;
    refreshNotes();
    return;
  }

  const nextBody = bodyInput.value.trim();
  if (!nextBody) {
    toast('Write a note before saving.');
    bodyInput.focus();
    return;
  }

  inlineNoteEdit = null;
  if (nextBody === originalBody) {
    refreshNotes();
    return;
  }

  const short = nextBody.length > 52 ? `${nextBody.slice(0, 52).trim()}…` : nextBody;
  const updated = updateImportantNote(id, { title: short, body: nextBody });
  refreshNotes();
  if (!silent && updated) toast('Note updated.');
}

function beginInlineNoteEdit(id) {
  const note = findImportantNoteById(id);
  if (!note) return;
  const normalized = normalizeImportantNote(note);

  if (inlineNoteEdit) {
    if (inlineNoteEdit.id === id) {
      document.querySelector(`#notes-tbody tr[data-note-id="${CSS.escape(id)}"] .note-edit-body`)?.focus();
      return;
    }
    commitInlineNoteEdit({ silent: true });
  }
  if (inlineEdit) commitInlineEdit({ silent: true });

  const row = document.querySelector(`#notes-tbody tr[data-note-id="${CSS.escape(id)}"]`);
  if (!row) return;

  inlineNoteEdit = {
    id,
    originalBody: normalized.body || ''
  };
  row.innerHTML = `
    <td colspan="3">
      <div class="log-inline-edit">
        <label class="sr-only" for="note-edit-body-${escapeLogHtml(id)}">Note</label>
        <textarea id="note-edit-body-${escapeLogHtml(id)}" class="note-edit-body log-edit-notes" rows="3" required>${escapeLogHtml(normalized.body || '')}</textarea>
        <div class="log-edit-actions">
          <button type="button" class="button outline compact" data-cancel-note="${escapeLogHtml(id)}">Cancel</button>
          <button type="button" class="button compact" data-save-note="${escapeLogHtml(id)}">Save</button>
        </div>
      </div>
    </td>`;
  const bodyInput = row.querySelector('.note-edit-body');
  bodyInput?.focus();
  bodyInput?.setSelectionRange(bodyInput.value.length, bodyInput.value.length);
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

const notesPanel = document.querySelector('.notes-card');

function askDeleteNoteConfirm(id) {
  const note = findImportantNoteById(id);
  if (!note) return;
  const normalized = normalizeImportantNote(note);
  const preview = (normalized.body || normalized.title || 'this note').trim();
  const short = preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;
  openModal(
    'Delete important note',
    `<p>Remove this note?</p>
     <p><strong>${escapeLogHtml(short)}</strong></p>
     <div class="dialog-actions">
       <button class="button full" data-action="confirm-delete-note" data-note-id="${escapeLogHtml(note.id)}">Delete note</button>
     </div>`
  );
}

notesPanel?.addEventListener('click', event => {
  const saveBtn = event.target.closest('[data-save-note]');
  if (saveBtn) {
    commitInlineNoteEdit();
    return;
  }
  const cancelBtn = event.target.closest('[data-cancel-note]');
  if (cancelBtn) {
    cancelInlineNoteEdit();
    return;
  }
  const editBtn = event.target.closest('[data-edit-note]');
  if (editBtn) {
    beginInlineNoteEdit(editBtn.dataset.editNote);
    return;
  }
  const deleteBtn = event.target.closest('[data-delete-note]');
  if (deleteBtn) {
    askDeleteNoteConfirm(deleteBtn.dataset.deleteNote);
  }
});

document.querySelector('#note-add-toggle')?.addEventListener('click', () => {
  if (inlineNoteEdit) commitInlineNoteEdit({ silent: true });
  if (inlineEdit) commitInlineEdit({ silent: true });
  showNoteComposer();
});

document.querySelector('#note-composer-cancel')?.addEventListener('click', () => {
  hideNoteComposer();
});

document.querySelector('#note-composer-form')?.addEventListener('submit', event => {
  event.preventDefault();
  if (inlineNoteEdit) commitInlineNoteEdit({ silent: true });
  if (inlineEdit) commitInlineEdit({ silent: true });

  const text = document.querySelector('#note-composer-text')?.value.trim();
  if (!text) {
    toast('Write a note before saving.');
    document.querySelector('#note-composer-text')?.focus();
    return;
  }

  const short = text.length > 52 ? `${text.slice(0, 52).trim()}…` : text;
  addImportantNote(short, text);
  document.querySelector('#note-composer-form')?.reset();
  document.querySelector('#note-composer-text')?.focus();
  refreshNotes();
  toast('Important note saved.');
});

seedDailyLogAuthorExamples(toDateInputValue(), activeShift);
document.querySelector('#log-date').value = toDateInputValue();
syncDateLabel();
renderIcons(document.querySelector('.log-card-top'));
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
  } else if (action === 'confirm-delete-note') {
    const id = button.dataset.noteId;
    modal.close();
    if (inlineNoteEdit?.id === id) inlineNoteEdit = null;
    if (deleteImportantNote(id)) {
      refreshNotes();
      toast('Note deleted.');
    }
  } else if (action === 'help') {
    openModal(
      'Daily log help',
      '<p>Use the arrows or date pill to change the day. Pick a <strong>shift</strong> above the log, then add entries at the bottom.</p><p>Click your own entry to expand it, then <strong>Save</strong>. Entries from another concierge show as <strong>Read only</strong>.</p>'
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

// One compact action menu stays open at a time, above scrolling table containers.
(function initEntryMenus() {
  let open = null;
  function closeMenu(restoreFocus = false) {
    if (!open) return;
    const { trigger, panel } = open;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    open = null;
    if (restoreFocus && trigger.isConnected) trigger.focus();
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-entry-menu-toggle]');
    if (trigger) {
      const same = open?.trigger === trigger;
      closeMenu();
      if (same) return;
      const panel = trigger.parentElement.querySelector('[data-entry-menu-options]');
      if (!panel) return;
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const rect = trigger.getBoundingClientRect();
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      panel.style.left = `${Math.max(8, Math.min(rect.right - width, innerWidth - width - 8))}px`;
      panel.style.top = `${Math.max(8, rect.bottom + height + 5 <= innerHeight - 8 ? rect.bottom + 5 : rect.top - height - 5)}px`;
      open = { trigger, panel };
      return;
    }
    if (!open) return;
    if (event.target.closest('[data-edit-log], [data-delete-log], [data-edit-note], [data-delete-note]')) {
      if (!event.target.closest('button')?.disabled) closeMenu();
    } else if (!open.panel.contains(event.target)) closeMenu();
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  document.addEventListener('focusin', event => {
    if (open && event.target !== open.trigger && !open.panel.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => closeMenu());
  document.addEventListener('scroll', () => closeMenu(), true);
})();

document.addEventListener('keydown', event => {
  const current = event.target.closest('.shift-tabs .shift-tab');
  if (!current || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...document.querySelectorAll('.shift-tabs .shift-tab')];
  const index = tabs.indexOf(current);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  tabs[next].focus();
  tabs[next].click();
});
