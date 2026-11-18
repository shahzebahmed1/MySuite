/* MySuite — Resident dashboard.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js */

renderIcons();
applyLoggedInUser('resident');

/* ── Vote state ───────────────────────────────────────────── */
let savedVote = readSaved('mysuite-vote', null);
if (savedVote) document.querySelector('#vote-button').textContent = 'View your vote';

/* ── Calendar ─────────────────────────────────────────────── */
let shownMonth = new Date(2026, 10, 1);
function renderCalendar() {
  const year = shownMonth.getFullYear(), month = shownMonth.getMonth();
  const label = shownMonth.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
  document.querySelector('#calendar-title').textContent = label;
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const isDemoMonth = year === 2026 && month === 10;
  document.querySelector('#calendar-days').innerHTML =
    Array.from({ length: first }, () => '<span></span>').join('') +
    Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      return `<button type="button" data-date="${n}" class="${isDemoMonth && n === 14 ? 'event-day' : ''}" aria-label="${label} ${n}${isDemoMonth && n === 14 ? ', Community social' : ''}">${n}</button>`;
    }).join('');
  document.querySelector('#calendar-events').innerHTML = isDemoMonth
    ? '<button data-action="announcement-social"><span class="event-dot light"></span><span><strong>Nov 14</strong> · Community social</span></button>'
    : '<p class="muted">No events this month.</p>';
}
renderCalendar();

/* ── Sidebar ──────────────────────────────────────────────── */
function closeMenu() {
  document.querySelector('.sidebar').classList.remove('open');
  document.querySelector('.scrim').classList.remove('visible');
  document.querySelector('.mobile-toggle').setAttribute('aria-expanded', 'false');
}
// Sidebar links are separate page redirects (not wired to the dashboard). Fill in real hrefs later.
document.querySelector('.sidebar nav')?.addEventListener('click', event => {
  const link = event.target.closest('a.nav-item');
  if (!link) return;
  closeMenu();
  if (link.getAttribute('href') === '#') event.preventDefault();
});

/* ── Actions ──────────────────────────────────────────────── */
const actions = {
  menu() {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  },
  'close-menu': closeMenu,
  'close-modal': () => modal.close(),
  notifications: () => openModal('You\u2019re all caught up', '<p>You have two new community announcements.</p><div class="dialog-options"><button class="button outline" data-action="announcement-pool">Pool maintenance</button><button class="button outline" data-action="announcement-social">Community social</button></div>'),
  profile: () => {
    const account = getSessionAccount('resident');
    openModal(account?.name || 'Resident', `<p>${accountSubtitle(account)}<br>${MOCK_DATA.building.name}</p><div class="dialog-info">Resident portal access.</div>`);
  },
  'announcement-pool': () => openModal('Pool maintenance', '<p>The pool will be closed on Friday, November 6 for scheduled maintenance.</p><p>Thank you for your patience while we keep our amenities in great shape.</p><div class="dialog-info">Announcement · Building management</div>'),
  'announcement-social': () => openModal('Community social', '<p>Join your neighbours in the common room on Saturday, November 14, 2026, from 3:00\u20135:00 PM.</p><p>Drop by for coffee, conversation, and a chance to meet the community.</p><button class="button full" data-action="rsvp">RSVP</button>'),
  rsvp() { save('mysuite-rsvp', true); modal.close(); toast('Your RSVP has been saved.'); },
  maintenance: () => openModal('Bedroom window latch', '<div class="dialog-info">#M-4802 · Scheduled</div><p><strong>Nov 8 · Request received</strong><br>Window latch in the bedroom sticks and does not close fully.</p><p><strong>Nov 10 · Scheduled</strong><br>Technician visit booked for Nov 13, 10:00 AM.</p>'),
  vote() {
    openModal('Lobby refresh', savedVote
      ? `<p>Your selection has been saved: <strong>${savedVote === 'warm' ? 'Warm natural finishes' : 'Contemporary neutral finishes'}</strong>.</p><button class="button outline full" data-action="change-vote">Change selection</button>`
      : '<p>Which direction would you prefer for our lobby refresh?</p><div class="dialog-options"><button class="button outline" data-vote="warm">Warm natural finishes</button><button class="button outline" data-vote="neutral">Contemporary neutral finishes</button></div>');
  },
  'change-vote'() { savedVote = null; save('mysuite-vote', null); document.querySelector('#vote-button').textContent = 'Vote now'; actions.vote(); },
  meeting: () => actions['announcement-social'](),
  documents: () => openModal('Condo documents', '<p>No documents are available here yet.</p>'),
  shop: () => openModal('Fobs & essentials', '<p>A preview of the essentials available through your building.</p><div class="dialog-info">Entry fobs · Batteries · Everyday supplies</div><p>Ordering is not available yet.</p>'),
  help: () => openModal('A little help, close to home', '<p>Use the dashboard to view bookings, maintenance requests, and community updates.</p><p>Use the contact directory to reach your concierge or management team.</p>')
};

/* ── Event delegation ─────────────────────────────────────── */
function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action],[data-scroll],[data-book],[data-month],[data-date],[data-vote]');
  if (!button) return;
  if (button.dataset.scroll) {
    closeMenu();
    document.getElementById(button.dataset.scroll).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    return;
  }
  if (button.dataset.month) {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + Number(button.dataset.month), 1);
    renderCalendar();
    return;
  }
  if (button.dataset.date) {
    const n = Number(button.dataset.date), demo = shownMonth.getFullYear() === 2026 && shownMonth.getMonth() === 10;
    if (demo && n === 14) actions['announcement-social']();
    else toast(`No events on ${shownMonth.toLocaleDateString('en-CA', { month: 'long' })} ${n}.`);
    return;
  }
  if (button.dataset.book) {
    const amenity = button.dataset.book;
    openModal(`Reserve the ${amenity.toLowerCase()}`, `<p>Choose a date and time for your booking.</p><form id="booking-form"><input type="hidden" name="amenity" value="${amenity}"><label>Date<input type="date" name="date" required min="${localDate()}"></label><label>Time<select name="time"><option>9:00 AM</option><option>11:00 AM</option><option>1:00 PM</option><option>3:00 PM</option><option>5:00 PM</option></select></label><button class="button full">Save booking</button></form>`);
    return;
  }
  if (button.dataset.vote) {
    savedVote = button.dataset.vote;
    save('mysuite-vote', savedVote);
    document.querySelector('#vote-button').textContent = 'View your vote';
    modal.close();
    toast('Your selection has been saved.');
    return;
  }
  if (button.dataset.action) {
    if (button.closest('.sidebar')) closeMenu();
    actions[button.dataset.action]?.();
  }
});

document.addEventListener('submit', event => {
  if (event.target.id === 'booking-form') {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    save('mysuite-booking', data);
    modal.close();
    toast(`${data.amenity} booking saved for ${data.date}, ${data.time}.`);
  }
  if (event.target.id === 'ai-form') {
    event.preventDefault();
    const input = document.querySelector('#ai-input');
    const answer = document.querySelector('#ai-answer');
    answer.hidden = false;
    answer.textContent = 'Policy answers are not available yet. Please contact your concierge or management team for help with building policies.';
    input.value = '';
  }
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

/* ── Lighting picker ──────────────────────────────────────── */
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
