/* Concierge — long-term absence view (read-only).
   Requires: icons.js, utils.js, mockdata.js, absence-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeTab = 'current';

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

function statusMeta(absence) {
  if (isAbsenceActive(absence)) return { label: 'Active', className: 'is-active' };
  if (isAbsenceUpcoming(absence)) return { label: 'Upcoming', className: '' };
  return { label: 'Past', className: '' };
}

function updateTabLabels(currentCount, pastCount) {
  const currentTab = document.querySelector('#tab-current');
  const pastTab = document.querySelector('#tab-past');
  if (currentTab) currentTab.textContent = `Current (${currentCount})`;
  if (pastTab) pastTab.textContent = `Past (${pastCount})`;
}

function setActiveTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.pkg-tab').forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', String(on));
  });
  renderTable();
}

function renderTable() {
  const tbody = document.querySelector('#absence-tbody');
  const empty = document.querySelector('#absence-empty');
  if (!tbody) return;

  const all = sortAbsencesByAway(getAbsences());
  const current = all.filter(a => !isAbsencePast(a));
  const past = all.filter(a => isAbsencePast(a)).reverse();
  updateTabLabels(current.length, past.length);

  const rows = activeTab === 'past' ? past : current;
  if (rows.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  tbody.innerHTML = rows.map(a => {
    const status = statusMeta(a);
    const checks = formatAbsenceChecks(a);
    const detail = [...checks, a.notes].filter(Boolean).join(' · ') || '—';
    return `<tr>
      <td><span class="status-pill ${status.className}">${status.label}</span></td>
      <td>${formatAbsenceDate(a.awayFrom)} – ${formatAbsenceDate(a.returnDate)}</td>
      <td>${a.suite}</td>
      <td>${a.residentName || '—'}</td>
      <td>${a.emergencyName}<br>${a.emergencyPhone}</td>
      <td>${detail}</td>
    </tr>`;
  }).join('');
}

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
      '<p><strong>Current</strong> shows active and upcoming absences.</p><p><strong>Past</strong> shows notices that have already ended.</p>'
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

renderTable();
