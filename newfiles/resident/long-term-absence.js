/* Resident — long-term absence notice.
   Requires: icons.js, utils.js, mockdata.js, absence-data.js */

renderIcons();
const residentAccount = applyLoggedInUser('resident');
let absenceTab = 'create';
const absenceTabs = [...document.querySelectorAll('[data-absence-tab]')];
const escapeAbsenceHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function selectAbsenceTab(key) {
  if (!['create', 'open', 'past'].includes(key)) return;
  absenceTab = key;
  renderMyAbsences();
}

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

function showFormMessage(text, isError) {
  const el = document.querySelector('#form-message');
  if (!el) return;
  if (!text) {
    el.hidden = true;
    el.textContent = '';
    el.classList.remove('is-error');
    return;
  }
  el.hidden = false;
  el.textContent = text;
  el.classList.toggle('is-error', Boolean(isError));
}

function absenceStatusLabel(absence) {
  if (isAbsenceActive(absence)) return 'Active';
  if (isAbsenceUpcoming(absence)) return 'Upcoming';
  return 'Past';
}

function exampleResidentAbsences() {
  if (!residentAccount?.suite) return [];
  return [
    { awayFrom: '2026-11-10', returnDate: '2026-11-24', holdPackages: true, checkResidence: true, waterOff: true, notes: 'Away visiting family. Please hold packages until I return.' },
    { awayFrom: '2026-12-03', returnDate: '2026-12-18', holdPackages: true, checkResidence: false, waterOff: true, notes: 'Holiday travel. My emergency contact has a spare key.' },
    { awayFrom: '2026-10-10', returnDate: '2026-10-25', holdPackages: true, checkResidence: true, waterOff: true, notes: 'Family trip.' },
    { awayFrom: '2026-09-01', returnDate: '2026-09-12', holdPackages: false, checkResidence: true, waterOff: true, notes: 'Out of town for work.' },
    { awayFrom: '2026-08-03', returnDate: '2026-08-15', holdPackages: true, checkResidence: false, waterOff: false, notes: 'Summer vacation.' }
  ].map((entry, index) => ({ ...entry, id: `absence-example-${residentAccount.id}-${index + 1}`, suite: residentAccount.suite,
    residentName: residentAccount.name, emergencyName: 'Elena Santos', emergencyPhone: '403-555-0128' }));
}

function renderMyAbsences() {
  const listEl = document.querySelector('#absence-list');
  const emptyEl = document.querySelector('#absence-empty');
  if (!listEl) return;

  const suite = residentAccount?.suite || '';
  const all = sortAbsencesByAway([...getAbsencesForSuite(suite), ...exampleResidentAbsences()]);
  const open = all.filter(absence => !isAbsencePast(absence));
  const past = all.filter(absence => isAbsencePast(absence)).reverse();
  const rows = absenceTab === 'past' ? past : open;
  absenceTabs.forEach(tab => {
    const key = tab.dataset.absenceTab;
    const selected = key === absenceTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (key !== 'create') tab.querySelector('[data-tab-count]').textContent = key === 'open' ? open.length : past.length;
  });
  document.querySelector('#absence-create-panel').hidden = absenceTab !== 'create';
  const panel = document.querySelector('#absence-requests-panel');
  panel.hidden = absenceTab === 'create';
  panel.setAttribute('aria-labelledby', `absence-tab-${absenceTab === 'past' ? 'past' : 'open'}`);
  document.querySelector('#absence-list-title').textContent = absenceTab === 'past' ? 'Request history' : 'Open requests';
  emptyEl.textContent = absenceTab === 'past' ? 'You have no past absence requests.' : 'You have no open absence requests.';

  if (rows.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = rows.map(a => {
    const checks = formatAbsenceChecks(a);
    const checksLine = checks.length ? `<span>${checks.map(escapeAbsenceHtml).join(' · ')}</span>` : '';
    const notes = a.notes ? `<span>${escapeAbsenceHtml(a.notes)}</span>` : '';
    return `<article class="absence-row">
      <strong>${escapeAbsenceHtml(formatAbsenceDate(a.awayFrom))} – ${escapeAbsenceHtml(formatAbsenceDate(a.returnDate))}</strong>
      <span>${absenceStatusLabel(a)} · Emergency: ${escapeAbsenceHtml(a.emergencyName)} · ${escapeAbsenceHtml(a.emergencyPhone)}</span>
      ${checksLine}
      ${notes}
    </article>`;
  }).join('');
}

document.querySelector('#absence-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const result = createAbsence({
    ...data,
    holdPackages: form.holdPackages?.checked === true,
    checkResidence: form.checkResidence?.checked === true,
    waterOff: form.waterOff?.checked === true,
    suite: residentAccount?.suite || '',
    residentName: residentAccount?.name || ''
  });

  if (!result.ok) {
    showFormMessage(result.message, true);
    toast(result.message);
    return;
  }

  showFormMessage('');
  form.reset();
  selectAbsenceTab('open');
  absenceTabs.find(tab => tab.dataset.absenceTab === 'open').focus();
  toast('Absence notice submitted.');
});

document.addEventListener('click', event => {
  const tab = event.target.closest('[data-absence-tab]');
  if (tab) return selectAbsenceTab(tab.dataset.absenceTab);
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
      '<p>Tell the desk when you will be away and who to call in an emergency.</p><p>Use the checkboxes if you want packages held, a residence check, or to note that the water is off.</p>'
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

document.querySelector('.absence-tabs').addEventListener('keydown', event => {
  const index = absenceTabs.indexOf(event.target);
  if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? absenceTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + absenceTabs.length) % absenceTabs.length;
  selectAbsenceTab(absenceTabs[next].dataset.absenceTab);
  absenceTabs[next].focus();
});
window.addEventListener('storage', renderMyAbsences);
window.addEventListener('focus', renderMyAbsences);
renderMyAbsences();
