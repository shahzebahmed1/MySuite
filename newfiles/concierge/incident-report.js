/* MySuite — Concierge incident report: log incident dialog + history table.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, incident-report-data.js */

renderIcons();
applyLoggedInUser('concierge');

let formWired = false;
let selectedYear = 'all';
let incidentPage = 1;
const incidentTabs = [...document.querySelectorAll('[data-incident-tab]')];
let incidentTab = 'open';
let incidentSearch = '';
const incidentPageSize = 5;
const incidentLogModal = document.querySelector('#incident-log-modal');

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
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const entry = addIncident(data);
    const year = incidentYear(entry);
    if (year != null && selectedYear !== 'all') selectedYear = year;
    incidentPage = 1;
    incidentSearch = '';
    document.querySelector('#incident-search').value = '';
    resetForm();
    incidentLogModal.close();
    refreshHistory();
    toast(`${entry.type} incident logged · ${entry.location}.`);
  });
}

function ensureFormMounted() {
  const slot = document.querySelector('#incident-form-slot-modal');
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

function openIncidentLog() {
  setIncidentYearMenu(false);
  ensureFormMounted();
  resetForm();
  if (!incidentLogModal.open) incidentLogModal.showModal();
  document.querySelector('#inc-location')?.focus();
}

function renderIncidentTableRow(incident) {
  const escape = escapeIncidentHtml;
  const occurred = new Date(incident.occurredAt);
  const validDate = !Number.isNaN(occurred.getTime());
  const date = validDate ? occurred.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date unavailable';
  const time = validDate ? occurred.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace('AM', 'a.m.').replace('PM', 'p.m.') : '';
  const description = String(incident.description || 'No description provided.');
  return `<tr class="incident-table-row" data-incident-id="${escape(incident.id)}">
    <td class="incident-table-when">${validDate ? `<time datetime="${escape(incident.occurredAt)}">${escape(date)} &middot; ${escape(time)}</time>` : escape(date)}</td>
    <td class="incident-table-incident">
      <strong class="incident-table-heading">${escape(incident.type || 'Other')} &middot; ${escape(incident.location || 'Unspecified')}</strong>
      <span class="incident-table-summary" id="incident-details-${escape(incident.id)}">${escape(description)}</span>
      ${incident.peopleInvolved ? `<dl class="incident-expanded-meta incident-inline-people" hidden><div><dt>People involved</dt><dd>${escape(incident.peopleInvolved)}</dd></div></dl>` : ''}
    </td>
    <td class="incident-table-reporter">${escape(incident.reportedBy || 'Concierge')}</td>
    <td class="incident-table-action"><button type="button" class="incident-view-report" data-action="view-incident-report" data-incident-id="${escape(incident.id)}" aria-expanded="false" aria-controls="incident-details-${escape(incident.id)}" aria-label="View ${escape(incident.type || 'incident')} report at ${escape(incident.location || 'unspecified location')}"><span data-incident-details-label>Details</span><svg class="incident-details-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></td>
  </tr>`;
}

function toggleIncidentReport(button) {
  const row = button.closest('.incident-table-row');
  const details = row?.querySelector('.incident-table-summary');
  if (!details || details.id !== button.getAttribute('aria-controls')) return;
  const open = button.getAttribute('aria-expanded') !== 'true';
  row.classList.toggle('is-expanded', open);
  const people = row.querySelector('.incident-inline-people');
  if (people) people.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', `${open ? 'Hide' : 'View'} incident details`);
  button.querySelector('[data-incident-details-label]').textContent = open ? 'Hide details' : 'Details';
}

function setIncidentTab(tab) {
  incidentTab = tab;
  incidentPage = 1;
  incidentTabs.forEach(button => {
    const selected = button.dataset.incidentTab === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#incident-tabpanel')?.setAttribute('aria-labelledby', `incident-tab-${tab}`);
  refreshHistory();
}

function refreshHistory() {
  syncYearControls();
  const all = getIncidents();
  const byTab = incidentTab === 'all' ? all : all.filter(incident => (incident.status || 'open') === incidentTab);
  const filtered = selectedYear === 'all' ? byTab : filterIncidentsByYear(byTab, selectedYear);
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
  empty.textContent = query ? 'No incident reports match your search.' : selectedYear === 'all' ? `No ${incidentTab === 'all' ? '' : `${incidentTab} `}incident reports yet.` : `No incident reports for ${selectedYear}.`;
  list.innerHTML = incidents.slice(offset, offset + incidentPageSize).map(renderIncidentTableRow).join('');
}

ensureFormMounted();
resetForm();
refreshHistory();
renderIcons(document.querySelector('.incidents-history-card'));

incidentTabs.forEach(button => {
  button.addEventListener('click', () => setIncidentTab(button.dataset.incidentTab));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = incidentTabs.indexOf(button);
    const next = event.key === 'Home' ? incidentTabs[0]
      : event.key === 'End' ? incidentTabs[incidentTabs.length - 1]
        : event.key === 'ArrowLeft' ? incidentTabs[(index - 1 + incidentTabs.length) % incidentTabs.length]
          : incidentTabs[(index + 1) % incidentTabs.length];
    next.click(); next.focus();
  });
});

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
  } else if (action === 'open-incident-log') {
    openIncidentLog();
  } else if (action === 'close-incident-log') {
    incidentLogModal.close();
  } else if (action === 'view-incident-report') {
    setIncidentYearMenu(false);
    toggleIncidentReport(button);
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
      '<p>Choose <strong>+ Log incident</strong> to record what happened, when, and where. Use the <strong>&rarr;</strong> button on any row to expand the full description and people involved.</p><p>Switch between <strong>Open</strong>, <strong>All reports</strong>, and <strong>Archived</strong> tabs, or use <strong>Filter by Year</strong> and search to narrow results.</p>'
    );
  }
});

incidentLogModal.addEventListener('click', event => {
  if (event.target !== incidentLogModal) return;
  const bounds = incidentLogModal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) incidentLogModal.close();
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

// Open the existing incident form when arriving from an Activity Log shortcut.
const incidentShortcutUrl = new URL(window.location.href);
if (incidentShortcutUrl.searchParams.get('action') === 'log-incident') {
  openIncidentLog();
  incidentShortcutUrl.searchParams.delete('action');
  window.history.replaceState(window.history.state, '', incidentShortcutUrl.href);
}
