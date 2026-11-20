/* Concierge elevator bookings: create and review reservations.
   Requires: icons.js, utils.js, mockdata.js, elevator-booking-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeTab = 'upcoming';
const bookingSearch = { upcoming: '', past: '' };
const bookingPages = { upcoming: 1, past: 1 };
const bookingPageSize = 5;

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

function resetConciergeBookingForm() {
  const form = document.querySelector('#concierge-elevator-form');
  form.reset();
  const today = new Date();
  const pad = value => String(value).padStart(2, '0');
  const date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  document.querySelector('#booking-date').min = date;
  document.querySelector('#booking-date').value = date;
  const message = document.querySelector('#booking-form-message');
  message.hidden = true;
  message.textContent = '';
}

document.querySelector('#booking-suite').addEventListener('change', event => {
  const suite = event.target.value.trim();
  const resident = DEMO_RESIDENTS.find(person => String(person.suite) === suite);
  document.querySelector('#booking-resident').value = resident?.name || '';
});

document.querySelector('#concierge-elevator-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const result = createBooking(Object.fromEntries(new FormData(form)));
  if (!result.ok) {
    const message = document.querySelector('#booking-form-message');
    message.textContent = result.message;
    message.hidden = false;
    message.focus();
    return;
  }
  resetConciergeBookingForm();
  bookingSearch.upcoming = '';
  bookingPages.upcoming = 1;
  setActiveTab('upcoming');
  toast('Elevator booking created.');
});

function escapeBookingHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function updateTabLabels(upcomingCount) {
  document.querySelector('#tab-upcoming').innerHTML = `Upcoming <span class="booking-count">${upcomingCount}</span>`;
  document.querySelector('#tab-past').textContent = 'Past';
}

function setActiveTab(tab) {
  if (!['upcoming', 'past'].includes(tab)) return;
  activeTab = tab;
  document.querySelectorAll('.pkg-tab').forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', String(on));
    btn.tabIndex = on ? 0 : -1;
  });
  document.querySelector('#booking-panel').setAttribute('aria-labelledby', `tab-${tab}`);
  document.querySelector('#booking-search').value = bookingSearch[tab];
  renderTable();
}

function renderBookingRecord(booking) {
  const escape = escapeBookingHtml;
  const past = isBookingPast(booking);
  return `<article class="booking-record">
    <div class="booking-who"><strong>Suite ${escape(booking.suite)}</strong><span>${escape(booking.residentName || 'Unknown resident')}</span></div>
    <div class="booking-detail">
      <div class="booking-heading"><i data-icon="elevator" aria-hidden="true"></i><strong>${escape(booking.elevator || 'Service')} elevator</strong><span class="booking-reason">${escape(booking.reason || 'Reservation')}</span></div>
      <dl class="booking-meta"><div><dt>Date</dt><dd>${escape(formatBookingDate(booking.date))}</dd></div><div><dt>Time</dt><dd>${escape(formatBookingTimeRange(booking))}</dd></div></dl>
      ${booking.notes ? `<p class="booking-note">${escape(booking.notes)}</p>` : ''}
    </div>
    <span class="booking-status${past ? ' is-past' : ''}">${past ? 'Past booking' : 'Reserved'}</span>
  </article>`;
}

function renderTable() {
  const all = sortBookingsSoonestFirst(getElevatorBookings());
  const now = new Date();
  const upcoming = all.filter(b => !isBookingPast(b, now));
  const past = all.filter(b => isBookingPast(b, now)).reverse();
  updateTabLabels(upcoming.length);
  const query = bookingSearch[activeTab].trim().toLowerCase();
  const rows = (activeTab === 'past' ? past : upcoming).filter(b =>
    !query || [b.suite, b.residentName, b.reason, b.elevator, b.notes].some(value => String(value || '').toLowerCase().includes(query))
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / bookingPageSize));
  bookingPages[activeTab] = Math.min(Math.max(1, bookingPages[activeTab]), pageCount);
  const page = bookingPages[activeTab];
  const start = (page - 1) * bookingPageSize;
  const list = document.querySelector('#booking-list');
  list.innerHTML = rows.slice(start, start + bookingPageSize).map(renderBookingRecord).join('');
  renderIcons(list);
  const empty = document.querySelector('#booking-empty');
  empty.hidden = rows.length > 0;
  empty.textContent = query ? 'No bookings match your search.' : activeTab === 'past' ? 'No past elevator bookings.' : 'No upcoming elevator bookings.';
  document.querySelector('#booking-range').textContent = rows.length ? `Showing ${start + 1}\u2013${Math.min(start + bookingPageSize, rows.length)} of ${rows.length}` : 'Showing 0 of 0';
  document.querySelector('#booking-page').innerHTML = Array.from({ length: pageCount }, (_, i) => `<option value="${i + 1}"${i + 1 === page ? ' selected' : ''}>Page ${i + 1} of ${pageCount}</option>`).join('');
  document.querySelector('#booking-previous').disabled = page <= 1;
  document.querySelector('#booking-next').disabled = page >= pageCount;
}

document.querySelector('#booking-search').addEventListener('input', event => {
  bookingSearch[activeTab] = event.target.value;
  bookingPages[activeTab] = 1;
  renderTable();
});
document.querySelector('#booking-page').addEventListener('change', event => {
  const page = Number(event.target.value);
  if (!Number.isInteger(page) || page < 1) return;
  bookingPages[activeTab] = page;
  renderTable();
});
for (const [id, offset] of [['booking-previous', -1], ['booking-next', 1]]) {
  document.querySelector(`#${id}`).addEventListener('click', () => {
    bookingPages[activeTab] += offset;
    renderTable();
  });
}
document.querySelector('.pkg-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tab = event.key === 'Home' ? 'upcoming' : event.key === 'End' ? 'past' : activeTab === 'upcoming' ? 'past' : 'upcoming';
  setActiveTab(tab);
  document.querySelector(`#tab-${tab}`).focus();
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
      'Elevator bookings help',
      '<p>Use the booking form to reserve the service elevator for a resident. Times cannot overlap another reservation.</p><p>Use <strong>Upcoming</strong> for today’s and future bookings, and <strong>Past</strong> for finished ones.</p>'
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

resetConciergeBookingForm();
renderTable();
