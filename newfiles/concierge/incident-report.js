/* MySuite — Concierge incident report: form + historic list.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, incident-report-data.js */

renderIcons();
applyLoggedInUser('concierge');

let formWired = false;
let selectedYear = new Date().getFullYear();

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

function toDatetimeLocalValue(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function stampOccurredTime() {
  const el = document.querySelector('#inc-occurred');
  if (el) el.value = toDatetimeLocalValue();
}

function currentConciergeName() {
  return getCurrentConcierge()?.name || 'Concierge';
}

function availableYears() {
  return getIncidentYears(getIncidents());
}

function clampYear(year) {
  const years = availableYears();
  if (years.length === 0) return new Date().getFullYear();
  const min = years[0];
  const max = years[years.length - 1];
  const y = Number(year);
  if (!Number.isFinite(y)) return max;
  return Math.min(max, Math.max(min, y));
}

function syncYearControls() {
  const years = availableYears();
  selectedYear = clampYear(selectedYear);

  const label = document.querySelector('#year-label');
  if (label) label.textContent = String(selectedYear);

  const select = document.querySelector('#year-select');
  if (select) {
    select.innerHTML = years.map(y =>
      `<option value="${y}"${y === selectedYear ? ' selected' : ''}>${y}</option>`
    ).join('');
  }

  const prev = document.querySelector('[data-action="prev-year"]');
  const next = document.querySelector('[data-action="next-year"]');
  const min = years[0];
  const max = years[years.length - 1];
  if (prev) prev.disabled = selectedYear <= min;
  if (next) next.disabled = selectedYear >= max;
}

function shiftYear(delta) {
  const years = availableYears();
  const idx = years.indexOf(selectedYear);
  if (idx === -1) {
    selectedYear = clampYear(selectedYear + delta);
  } else {
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= years.length) return;
    selectedYear = years[nextIdx];
  }
  refreshHistory();
}

function openYearPicker() {
  const select = document.querySelector('#year-select');
  if (!select) return;
  try {
    if (typeof select.showPicker === 'function') {
      select.showPicker();
      return;
    }
  } catch {
    /* fall through */
  }
  select.focus();
  select.click();
}

function wireFormHandlers() {
  if (formWired) return;
  const form = document.querySelector('#incident-form');
  if (!form) return;
  formWired = true;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const entry = addIncident(data);
    const year = incidentYear(entry);
    if (year != null) selectedYear = year;
    resetForm();
    refreshHistory();
    toast(`${entry.type} incident logged · ${entry.location}.`);
  });
}

function ensureFormMounted() {
  const slot = document.querySelector('#form-slot-panel');
  let form = document.querySelector('#incident-form');
  if (!form) {
    const template = document.querySelector('#incident-form-template');
    slot.appendChild(template.content.cloneNode(true));
    form = document.querySelector('#incident-form');
    formWired = false;
    wireFormHandlers();
    renderIcons(form);
  }
  return form;
}

function resetForm() {
  const form = document.querySelector('#incident-form');
  if (!form) return;
  form.reset();
  const reported = form.querySelector('input[name="reportedBy"]');
  if (reported) reported.value = currentConciergeName();
  const type = form.querySelector('select[name="type"]');
  if (type) type.value = 'Other';
  stampOccurredTime();
}

function refreshHistory() {
  syncYearControls();
  const all = getIncidents();
  const incidents = sortIncidentsNewestFirst(filterIncidentsByYear(all, selectedYear));
  const list = document.querySelector('#incident-list');
  const empty = document.querySelector('#incident-empty');
  const count = document.querySelector('#history-count');

  if (count) count.textContent = `${incidents.length} report${incidents.length === 1 ? '' : 's'}`;

  if (incidents.length === 0) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = `No incident reports for ${selectedYear}.`;
    return;
  }

  empty.hidden = true;
  list.innerHTML = incidents.map(renderIncidentRow).join('');
}

ensureFormMounted();
resetForm();
selectedYear = clampYear(new Date().getFullYear());
refreshHistory();
renderIcons(document.querySelector('.history-card-top'));

document.querySelector('#year-select')?.addEventListener('change', event => {
  selectedYear = clampYear(event.target.value);
  refreshHistory();
});

document.querySelector('#year-pill-btn')?.addEventListener('click', () => {
  openYearPicker();
});

document.addEventListener('click', event => {
  if (event.target.closest('[data-cancel-log]')) {
    resetForm();
    document.querySelector('#inc-occurred')?.focus();
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
  } else if (action === 'prev-year') {
    shiftYear(-1);
  } else if (action === 'next-year') {
    shiftYear(1);
  } else if (action === 'help') {
    openModal(
      'Incident report help',
      '<p>Use the <strong>Report an incident</strong> card to log what happened, when, and where.</p><p>Past reports on the right can be filtered by year with the arrows or the year button.</p>'
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
  if (event.key === 'Escape') closeMenu();
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
