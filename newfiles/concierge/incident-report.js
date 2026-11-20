/* MySuite — Concierge incident report: form + historic list.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, incident-report-data.js */

renderIcons();
applyLoggedInUser('concierge');

let formWired = false;
let selectedYear = 'all';
let incidentPage = 1;
let incidentSearch = '';
const incidentPageSize = 5;

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

function syncYearControls() {
  const years = availableYears();
  if (selectedYear !== 'all' && !years.includes(Number(selectedYear))) selectedYear = 'all';
  document.querySelector('#incident-year-label').textContent = selectedYear === 'all' ? 'Filter by Year' : String(selectedYear);
  document.querySelector('#incident-year-toggle').dataset.active = String(selectedYear !== 'all');
  document.querySelector('#incident-year-options').innerHTML = ['all', ...years.slice().reverse()].map(year => `<label><input type="radio" name="incident-year" value="${year}"${String(year) === String(selectedYear) ? ' checked' : ''}>${year === 'all' ? 'All years' : year}</label>`).join('');
}

function setIncidentYearMenu(open, restoreFocus = false) {
  document.querySelector('#incident-year-menu').hidden = !open;
  document.querySelector('#incident-year-toggle').setAttribute('aria-expanded', String(open));
  if (restoreFocus) document.querySelector('#incident-year-toggle').focus();
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
    if (year != null && selectedYear !== 'all') selectedYear = year;
    incidentPage = 1;
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
  const filtered = selectedYear === 'all' ? all : filterIncidentsByYear(all, selectedYear);
  const query = incidentSearch.trim().toLowerCase();
  const incidents = sortIncidentsNewestFirst(filtered).filter(incident => !query || [incident.type, incident.location, incident.description, incident.peopleInvolved, incident.reportedBy].some(value => String(value || '').toLowerCase().includes(query)));
  const pageCount = Math.max(1, Math.ceil(incidents.length / incidentPageSize));
  incidentPage = Math.max(1, Math.min(incidentPage, pageCount));
  const offset = (incidentPage - 1) * incidentPageSize;
  const list = document.querySelector('#incident-list');
  const empty = document.querySelector('#incident-empty');
  const count = document.querySelector('#history-count');
  count.textContent = incidents.length ? `Showing ${offset + 1}\u2013${Math.min(offset + incidentPageSize, incidents.length)} of ${incidents.length}` : 'Showing 0 of 0';
  document.querySelector('#incident-page-select').innerHTML = Array.from({ length: pageCount }, (_, index) => `<option value="${index + 1}"${index + 1 === incidentPage ? ' selected' : ''}>Page ${index + 1} of ${pageCount}</option>`).join('');
  document.querySelector('[data-action="previous-incident-page"]').disabled = incidentPage === 1;
  document.querySelector('[data-action="next-incident-page"]').disabled = incidentPage === pageCount;
  empty.hidden = incidents.length > 0;
  empty.textContent = query ? 'No incident reports match your search.' : selectedYear === 'all' ? 'No incident reports yet.' : `No incident reports for ${selectedYear}.`;
  list.innerHTML = incidents.slice(offset, offset + incidentPageSize).map(renderIncidentRow).join('');
}

ensureFormMounted();
resetForm();
refreshHistory();
renderIcons(document.querySelector('.incidents-history-card'));

document.querySelector('#incident-search').addEventListener('input', event => {
  incidentSearch = event.target.value;
  incidentPage = 1;
  refreshHistory();
});

document.querySelector('#incident-page-select').addEventListener('change', event => {
  const page = Number(event.target.value);
  if (!Number.isInteger(page) || page < 1) return;
  incidentPage = page;
  refreshHistory();
  document.querySelector('#incident-page-select').focus();
});

document.addEventListener('click', event => {
  if (!event.target.closest('.incident-year-filter')) setIncidentYearMenu(false);
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
  } else if (action === 'toggle-incident-year') {
    const open = document.querySelector('#incident-year-menu').hidden;
    if (open) syncYearControls();
    setIncidentYearMenu(open);
    if (open) document.querySelector('input[name="incident-year"]:checked')?.focus();
  } else if (action === 'apply-incident-year') {
    const value = document.querySelector('input[name="incident-year"]:checked')?.value || 'all';
    selectedYear = value === 'all' ? 'all' : Number(value);
    incidentPage = 1;
    setIncidentYearMenu(false, true);
    refreshHistory();
  } else if (action === 'previous-incident-page' || action === 'next-incident-page') {
    incidentPage += action === 'next-incident-page' ? 1 : -1;
    refreshHistory();
  } else if (action === 'help') {
    openModal(
      'Incident report help',
      '<p>Use the <strong>Report an incident</strong> card to log what happened, when, and where.</p><p>Use <strong>Filter by year</strong> to narrow past reports. The page selector and arrows show five reports at a time.</p>'
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
    closeMenu();
    if (!document.querySelector('#incident-year-menu').hidden) setIncidentYearMenu(false, true);
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
