/* Resident — book elevator.
   Requires: icons.js, utils.js, mockdata.js, elevator-booking-data.js */

renderIcons();
const residentAccount = applyLoggedInUser('resident');
let elevatorTab = 'create';
const elevatorTabs = [...document.querySelectorAll('[data-elevator-tab]')];
const escapeBookingHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function selectElevatorTab(key) {
  if (!['create', 'open', 'past'].includes(key)) return;
  elevatorTab = key;
  renderMyBookings();
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

function renderMyBookings() {
  const listEl = document.querySelector('#booking-list');
  const emptyEl = document.querySelector('#booking-empty');
  if (!listEl) return;

  const suite = residentAccount?.suite || '';
  const all = getBookingsForSuite(suite);
  const open = all.filter(booking => !isBookingPast(booking));
  const past = all.filter(booking => isBookingPast(booking)).reverse();
  const rows = elevatorTab === 'past' ? past : open;
  elevatorTabs.forEach(tab => {
    const key = tab.dataset.elevatorTab;
    const selected = key === elevatorTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (key !== 'create') tab.querySelector('[data-tab-count]').textContent = key === 'open' ? open.length : past.length;
  });
  document.querySelector('#elevator-create-panel').hidden = elevatorTab !== 'create';
  const panel = document.querySelector('#elevator-requests-panel');
  panel.hidden = elevatorTab === 'create';
  panel.setAttribute('aria-labelledby', `elevator-tab-${elevatorTab === 'past' ? 'past' : 'open'}`);
  document.querySelector('#elevator-list-title').textContent = elevatorTab === 'past' ? 'Request history' : 'Open requests';
  emptyEl.textContent = elevatorTab === 'past' ? 'You have no past elevator requests.' : 'You have no open elevator requests.';

  if (rows.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = rows.map(b => {
    const notes = b.notes ? `<span>${escapeBookingHtml(b.notes)}</span>` : '';
    return `<article class="booking-row">
      <strong>${escapeBookingHtml(formatBookingDate(b.date))} · ${escapeBookingHtml(formatBookingTimeRange(b))}</strong>
      <span>${escapeBookingHtml(b.reason)} · ${escapeBookingHtml(b.elevator || 'Service')}</span>
      ${notes}
    </article>`;
  }).join('');
}

document.querySelector('#elevator-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const result = createBooking({
    ...data,
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
  selectElevatorTab('open');
  elevatorTabs.find(tab => tab.dataset.elevatorTab === 'open').focus();
  toast('Elevator booking submitted.');
});

document.addEventListener('click', event => {
  const tab = event.target.closest('[data-elevator-tab]');
  if (tab) return selectElevatorTab(tab.dataset.elevatorTab);
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
      'Book elevator help',
      '<p>Choose a date and time for the service elevator.</p><p>If that slot already has a booking, you will be asked to pick a different time.</p>'
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

document.querySelector('.elevator-tabs').addEventListener('keydown', event => {
  const index = elevatorTabs.indexOf(event.target);
  if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? elevatorTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + elevatorTabs.length) % elevatorTabs.length;
  selectElevatorTab(elevatorTabs[next].dataset.elevatorTab);
  elevatorTabs[next].focus();
});
window.addEventListener('storage', renderMyBookings);
window.addEventListener('focus', renderMyBookings);
renderMyBookings();
