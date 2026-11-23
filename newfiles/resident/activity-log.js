(() => {
  renderIcons();
  const account = applyLoggedInUser('resident') || getSessionAccount('resident');
  const storageKey = `mysuite-resident-activity-v1:${account?.id || account?.email || account?.suite || 'resident'}`;
  const author = account?.name || 'Resident';
  const $ = id => document.getElementById(id);
  const dateInput = $('activity-date');
  const status = $('activity-status');
  let data = { entries: [], notes: [] };
  let editingEntry = null;
  let editingNote = null;
  function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  function nowTime() { return new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Edmonton', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); }
  function normalize(value) {
    const valid = item => item && typeof item.id === 'string' && typeof item.text === 'string' && typeof item.author === 'string';
    return {
      entries: Array.isArray(value?.entries) ? value.entries.filter(item => valid(item) && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) : [],
      notes: Array.isArray(value?.notes) ? value.notes.filter(valid) : []
    };
  }
  try { data = normalize(JSON.parse(localStorage.getItem(storageKey))); } catch { status.textContent = 'Saved activity could not be loaded in this browser.'; }
  dateInput.value = today();
  $('activity-time').value = nowTime();
  function save(next, message) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); data = next; status.textContent = message; return true; }
    catch { status.textContent = 'Your changes could not be saved. Please try again.'; return false; }
  }
  function makeCell(text, className) {
    const cell = document.createElement('td'); cell.textContent = text;
    if (className) cell.className = className;
    return cell;
  }
  function menu(item, type) {
    const cell = document.createElement('td');
    const details = document.createElement('details'); details.className = 'log-row-menu';
    const summary = document.createElement('summary'); summary.setAttribute('aria-label', `${type === 'entries' ? 'Entry' : 'Note'} options`);
    summary.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/></svg>';
    const actions = document.createElement('div');
    for (const action of ['Edit', 'Delete']) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = action;
      button.addEventListener('click', () => {
        details.open = false;
        if (action === 'Delete') {
          if (save({ ...data, [type]: data[type].filter(row => row.id !== item.id) }, `${type === 'entries' ? 'Entry' : 'Note'} deleted.`)) {
            if (type === 'entries' && editingEntry === item.id) resetEntry();
            if (type === 'notes' && editingNote === item.id) resetNote();
            render();
          }
        } else if (type === 'entries') {
          editingEntry = item.id; $('activity-entry').value = item.text; $('activity-time').value = item.time;
          $('activity-cancel').hidden = false; $('activity-entry').focus();
        } else {
          editingNote = item.id; $('note-entry').value = item.text; $('note-cancel').hidden = false; $('note-entry').focus();
        }
      });
      actions.append(button);
    }
    details.append(summary, actions); cell.append(details); return cell;
  }
  function render() {
    const entries = data.entries.filter(item => item.date === dateInput.value).sort((a,b) => a.time.localeCompare(b.time));
    $('activity-rows').replaceChildren(...entries.map(item => {
      const row = document.createElement('tr');
      row.append(makeCell(item.time, 'log-time'), makeCell(item.text, 'log-content'), makeCell(item.author, 'log-author'), menu(item, 'entries')); return row;
    }));
    $('note-rows').replaceChildren(...data.notes.map(item => {
      const row = document.createElement('tr');
      row.append(makeCell(item.text, 'log-content'), makeCell(item.author, 'log-author'), menu(item, 'notes')); return row;
    }));
    $('activity-empty').hidden = entries.length > 0;
    $('notes-empty').hidden = data.notes.length > 0;
  }
  function resetEntry() { editingEntry = null; $('activity-entry').value = ''; $('activity-time').value = nowTime(); $('activity-cancel').hidden = true; }
  function resetNote() { editingNote = null; $('note-entry').value = ''; $('note-cancel').hidden = true; }
  function id() { return crypto.randomUUID(); }
  $('activity-form').addEventListener('submit', event => {
    event.preventDefault();
    const text = $('activity-entry').value.trim();
    if (!text || !dateInput.validity.valid || !dateInput.value) { status.textContent = 'Choose a date and enter a log entry.'; return; }
    const old = data.entries.find(item => item.id === editingEntry);
    const item = { id: editingEntry || id(), text, time: $('activity-time').value, date: dateInput.value, author: old?.author || author };
    const entries = old ? data.entries.map(row => row.id === item.id ? item : row) : [...data.entries, item];
    if (save({ ...data, entries }, 'Log entry saved.')) { resetEntry(); render(); }
  });
  $('note-form').addEventListener('submit', event => {
    event.preventDefault(); const text = $('note-entry').value.trim(); if (!text) return;
    const old = data.notes.find(item => item.id === editingNote);
    const item = { id: editingNote || id(), text, author: old?.author || author };
    const notes = old ? data.notes.map(row => row.id === item.id ? item : row) : [...data.notes, item];
    if (save({ ...data, notes }, 'Important note saved.')) { resetNote(); render(); }
  });
  $('activity-cancel').addEventListener('click', resetEntry);
  $('note-cancel').addEventListener('click', resetNote);
  dateInput.addEventListener('change', () => { if (dateInput.value && dateInput.validity.valid) { resetEntry(); render(); } });
  document.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => {
    const date = new Date(`${dateInput.value || today()}T12:00:00`);
    date.setDate(date.getDate() + Number(button.dataset.day));
    dateInput.value = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    resetEntry(); render();
  }));
  function closeMenu() { document.querySelector('.sidebar').classList.remove('open'); document.querySelector('.scrim').classList.remove('visible'); document.querySelector('[data-log-menu]').setAttribute('aria-expanded','false'); }
  document.querySelector('[data-log-menu]').addEventListener('click', () => {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible',open); document.querySelector('[data-log-menu]').setAttribute('aria-expanded',String(open));
  });
  document.querySelector('[data-log-close-menu]').addEventListener('click',closeMenu);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); document.querySelectorAll('.log-row-menu[open]').forEach(menu => menu.open=false); } });
  document.addEventListener('click', event => document.querySelectorAll('.log-row-menu[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open=false; }));
  window.addEventListener('storage', event => { if (event.key === storageKey) { try { data = normalize(JSON.parse(event.newValue)); render(); } catch {} } });
  render();
})();
