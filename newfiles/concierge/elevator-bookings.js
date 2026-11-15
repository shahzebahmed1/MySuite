/* Concierge — elevator bookings view (read-only).
   Requires: icons.js, utils.js, mockdata.js, elevator-booking-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeTab = 'upcoming';

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

function updateTabLabels(upcomingCount, pastCount) {
  const upcomingTab = document.querySelector('#tab-upcoming');
  const pastTab = document.querySelector('#tab-past');
  if (upcomingTab) upcomingTab.textContent = `Upcoming (${upcomingCount})`;
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
  const tbody = document.querySelector('#booking-tbody');
  const empty = document.querySelector('#booking-empty');
  if (!tbody) return;

  const all = sortBookingsSoonestFirst(getElevatorBookings());
  const upcoming = all.filter(b => !isBookingPast(b));
  const past = all.filter(b => isBookingPast(b)).reverse();
  updateTabLabels(upcoming.length, past.length);

  const rows = activeTab === 'past' ? past : upcoming;
  if (rows.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  tbody.innerHTML = rows.map(b => `<tr>
    <td>${formatBookingDate(b.date)}<br>${formatBookingTimeRange(b)}</td>
    <td>${b.suite}</td>
    <td>${b.residentName || '—'}</td>
    <td>${b.reason || '—'}</td>
    <td>${b.elevator || 'Service'}</td>
    <td>${b.notes || '—'}</td>
  </tr>`).join('');
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
      'Elevator bookings help',
      '<p>This list shows elevator reservations submitted by residents.</p><p>Use <strong>Upcoming</strong> for today’s and future bookings, and <strong>Past</strong> for finished ones.</p>'
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
