/* Concierge absence notices: create and review.
   Requires: icons.js, utils.js, mockdata.js, absence-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeTab = 'current';
const deskSearch = { current: '', past: '' };
const deskPages = { current: 1, past: 1 };
const deskPageSize = 5;

function closeMenu() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.scrim')?.classList.remove('visible');
  document.querySelector('.mobile-toggle')?.setAttribute('aria-expanded', 'false');
}

document.querySelector('.sidebar nav')?.addEventListener('click', event => {
  const link = event.target.closest('a.nav-item');
  if (!link) return;
  closeMenu();
  if (link.getAttribute('href') === '#') event.preventDefault();
});

function escapeAbsenceHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function statusMeta(absence) {
  if (isAbsenceActive(absence)) return { label: 'Active', className: 'is-active' };
  if (isAbsenceUpcoming(absence)) return { label: 'Upcoming', className: '' };
  return { label: 'Past', className: 'is-past' };
}

function setActiveTab(tab) {
  if (!['current', 'past'].includes(tab)) return;
  activeTab = tab;
  document.querySelectorAll('.pkg-tab').forEach(button => {
    const selected = button.dataset.tab === tab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#absence-panel').setAttribute('aria-labelledby', `tab-${tab}`);
  document.querySelector('#absence-search').value = deskSearch[tab];
  renderTable();
}

function renderAbsenceRecord(absence) {
  const escape = escapeAbsenceHtml;
  const status = statusMeta(absence);
  const checks = formatAbsenceChecks(absence);
  return `<article class="desk-record"><div class="desk-who"><strong>Suite ${escape(absence.suite)}</strong><span>${escape(absence.residentName)}</span></div><div class="desk-detail"><div class="desk-heading"><i data-icon="suitcase"></i><strong>${escape(formatAbsenceDate(absence.awayFrom))} &ndash; ${escape(formatAbsenceDate(absence.returnDate))}</strong></div><dl class="desk-meta"><div><dt>Emergency contact</dt><dd>${escape(absence.emergencyName)}</dd></div><div><dt>Phone</dt><dd>${escape(absence.emergencyPhone)}</dd></div></dl>${checks.length ? `<p class="desk-note">${checks.map(escape).join(' &middot; ')}</p>` : ''}${absence.notes ? `<p class="desk-note">${escape(absence.notes)}</p>` : ''}</div><span class="desk-status ${status.className}">${status.label}</span></article>`;
}

function renderTable() {
  const all = sortAbsencesByAway(getAbsences());
  const current = all.filter(absence => !isAbsencePast(absence));
  const past = all.filter(absence => isAbsencePast(absence)).reverse();
  document.querySelector('#tab-current').innerHTML = `Current <span class="desk-count">${current.length}</span>`;
  document.querySelector('#tab-past').textContent = 'Past';
  const query = deskSearch[activeTab].trim().toLowerCase();
  const rows = (activeTab === 'past' ? past : current).filter(absence => !query || [absence.suite, absence.residentName, absence.emergencyName, absence.emergencyPhone, absence.notes].some(value => String(value || '').toLowerCase().includes(query)));
  const pageCount = Math.max(1, Math.ceil(rows.length / deskPageSize));
  deskPages[activeTab] = Math.min(Math.max(1, deskPages[activeTab]), pageCount);
  const page = deskPages[activeTab];
  const offset = (page - 1) * deskPageSize;
  document.querySelector('#absence-range').textContent = rows.length ? `Showing ${offset + 1}\u2013${Math.min(offset + deskPageSize, rows.length)} of ${rows.length}` : 'Showing 0 of 0';
  document.querySelector('#absence-page').innerHTML = Array.from({ length: pageCount }, (_, index) => `<option value="${index + 1}"${index + 1 === page ? ' selected' : ''}>Page ${index + 1} of ${pageCount}</option>`).join('');
  document.querySelector('#absence-previous').disabled = page <= 1;
  document.querySelector('#absence-next').disabled = page >= pageCount;
  const list = document.querySelector('#absence-list');
  list.innerHTML = rows.slice(offset, offset + deskPageSize).map(renderAbsenceRecord).join('');
  renderIcons(list);
  const empty = document.querySelector('#absence-empty');
  empty.hidden = rows.length > 0;
  empty.textContent = query ? 'No absence notices match your search.' : activeTab === 'past' ? 'No past absence notices.' : 'No active or upcoming absences.';
}

function resetAbsenceForm() {
  document.querySelector('#concierge-absence-form').reset();
  document.querySelector('#absence-return').min = '';
  document.querySelector('#absence-form-message').hidden = true;
}

document.querySelector('#absence-suite').addEventListener('change', event => {
  const resident = DEMO_RESIDENTS.find(person => String(person.suite) === event.target.value.trim());
  document.querySelector('#absence-resident').value = resident?.name || '';
});
document.querySelector('#absence-from').addEventListener('change', event => {
  document.querySelector('#absence-return').min = event.target.value;
});
document.querySelector('#concierge-absence-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const result = createAbsence(Object.fromEntries(new FormData(form)));
  if (!result.ok) {
    const message = document.querySelector('#absence-form-message');
    message.textContent = result.message;
    message.hidden = false;
    message.focus();
    return;
  }
  resetAbsenceForm();
  const tab = isAbsencePast(result.absence) ? 'past' : 'current';
  deskSearch[tab] = '';
  deskPages[tab] = 1;
  setActiveTab(tab);
  toast('Absence notice recorded.');
});

document.querySelector('#absence-search').addEventListener('input', event => {
  deskSearch[activeTab] = event.target.value;
  deskPages[activeTab] = 1;
  renderTable();
});
document.querySelector('#absence-page').addEventListener('change', event => {
  const page = Number(event.target.value);
  if (!Number.isInteger(page) || page < 1) return;
  deskPages[activeTab] = page;
  renderTable();
});
for (const [id, offset] of [['absence-previous', -1], ['absence-next', 1]]) {
  document.querySelector(`#${id}`).addEventListener('click', () => { deskPages[activeTab] += offset; renderTable(); });
}
document.querySelector('.pkg-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tab = event.key === 'Home' ? 'current' : event.key === 'End' ? 'past' : activeTab === 'current' ? 'past' : 'current';
  setActiveTab(tab);
  document.querySelector(`[data-tab="${tab}"]`).focus();
});
document.querySelector('.pkg-tabs')?.addEventListener('click', event => {
  const tab = event.target.closest('[data-tab]');
  if (!tab) return;
  setActiveTab(tab.dataset.tab);
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'menu') {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  } else if (action === 'close-menu') {
    closeMenu();
  } else if (action === 'close-modal') {
    modal.close();
  } else if (action === 'help') {
    openModal(
      'Long-term absence help',
      '<p>Use the form to record a resident absence, emergency contact and handling instructions.</p><p><strong>Current</strong> shows active and upcoming absences.</p><p><strong>Past</strong> shows notices that have already ended.</p>'
    );
  }
});

const lightingPicker = document.querySelector('#header-lighting');
const lightingOptions = ['morning', 'afternoon', 'evening', 'night'];
const savedLighting = readSaved('mysuite-header-lighting', 'afternoon');
function setLighting(value) {
  const selected = lightingOptions.includes(value) ? value : 'afternoon';
  document.body.dataset.time = selected;
  if (lightingPicker) lightingPicker.value = selected;
}
setLighting(savedLighting);
lightingPicker?.addEventListener('change', () => {
  setLighting(lightingPicker.value);
  save('mysuite-header-lighting', lightingPicker.value);
});

resetAbsenceForm();
renderTable();
