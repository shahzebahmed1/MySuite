/* Resident — book elevator.
   Requires: icons.js, utils.js, mockdata.js, elevator-booking-data.js */

renderIcons();
const residentAccount = applyLoggedInUser('resident');

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
  const rows = getBookingsForSuite(suite);

  if (rows.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = rows.map(b => {
    const past = isBookingPast(b) ? ' · Past' : '';
    const notes = b.notes ? `<span>${b.notes}</span>` : '';
    return `<article class="booking-row">
      <strong>${formatBookingDate(b.date)} · ${formatBookingTimeRange(b)}</strong>
      <span>${b.reason} · ${b.elevator || 'Service'}${past}</span>
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
  renderMyBookings();
  toast('Elevator booking submitted.');
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

renderMyBookings();
