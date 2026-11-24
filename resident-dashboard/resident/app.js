/* MySuite — Resident dashboard.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, packages-data.js */

renderIcons();
applyLoggedInUser('resident');

/* ── Render dashboard cards from MOCK_DATA ─────────────────── */
(function renderHomePackages() {
  const listEl = document.querySelector('#home-package-list');
  const viewAll = document.querySelector('#home-package-view-all');
  if (!listEl) return;
  const pending = sortPackagesNewestFirst(getPackages()).filter(p => p.status === 'pending');
  if (viewAll) viewAll.textContent = `View All (${pending.length})`;
  if (pending.length === 0) {
    listEl.innerHTML = `
      <div class="pkg-empty-state">
        <p>No packages waiting for you right now.</p>
      </div>`;
    return;
  }
  listEl.innerHTML = pending.slice(0, 3).map(pkg => renderPackageRow(pkg)).join('');
  listEl.querySelectorAll('.package-row > .badge').forEach(badge => badge.remove());
})();

const BOOKING_SOON_MS = 15 * 60 * 1000;
const BOOKING_REFRESH_MS = 30 * 1000;

function bookingDayLabel(dateStr, now = new Date()) {
  const target = new Date(`${dateStr}T12:00:00`);
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseBookingTimeParts(timeStr) {
  const match = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

function parseDurationMs(durationStr) {
  const raw = String(durationStr || '').trim().toLowerCase();
  const hours = raw.match(/(\d+(?:\.\d+)?)\s*hours?/);
  const minutes = raw.match(/(\d+(?:\.\d+)?)\s*min/);
  const shortHour = raw.match(/^(\d+(?:\.\d+)?)\s*h$/);
  let ms = 0;
  if (hours) ms += Number(hours[1]) * 60 * 60 * 1000;
  if (minutes) ms += Number(minutes[1]) * 60 * 1000;
  if (!ms && shortHour) ms = Number(shortHour[1]) * 60 * 60 * 1000;
  return ms || (60 * 60 * 1000);
}

function bookingWindow(row) {
  const parts = parseBookingTimeParts(row.time);
  if (!parts || !row.date) return null;
  const [y, mo, d] = String(row.date).split('-').map(Number);
  const start = new Date(y, mo - 1, d, parts.hour, parts.minute, 0, 0);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + parseDurationMs(row.duration));
  return { start, end };
}

/** Derive live status from the clock. Returns null when the booking has ended. */
function bookingLiveStatus(row, now = new Date()) {
  const window = bookingWindow(row);
  if (!window) return null;
  const { start, end } = window;
  const t = now.getTime();
  if (t >= end.getTime()) return null;
  if (t >= start.getTime()) {
    return { label: 'Active', pill: 'active-badge' };
  }
  if (start.getTime() - t <= BOOKING_SOON_MS) {
    return { label: 'Starting soon', pill: 'soon-badge' };
  }
  return { label: 'Upcoming', pill: 'pending-badge' };
}

function formatBookingClock(date) {
  try {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function liveAmenityBookings(now = new Date()) {
  return (MOCK_DATA.amenitySchedule || [])
    .map(row => {
      const window = bookingWindow(row);
      const status = bookingLiveStatus(row, now);
      if (!window || !status) return null;
      return { row, status, start: window.start, end: window.end };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);
}

const HOME_DAY_START_MINUTES = 8 * 60;
const HOME_DAY_END_MINUTES = 22 * 60;
const HOME_SUGGESTION_MINUTES = 90;

function homeMinutesLabel(minutes) {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const hour = hour24 % 12 || 12;
  return `${hour}:${String(minute).padStart(2, '0')} ${hour24 >= 12 ? 'PM' : 'AM'}`;
}

/** First free 90-minute window left today, so an empty card still offers a next step. */
function nextFreeWindow(now = new Date()) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const from = Math.max(HOME_DAY_START_MINUTES, Math.ceil((nowMinutes + 14) / 15) * 15);
  if (from + HOME_SUGGESTION_MINUTES > HOME_DAY_END_MINUTES) return null;
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  for (const name of ['Pool', 'Common room', 'Gym']) {
    const busy = [];
    for (const row of MOCK_DATA.amenitySchedule || []) {
      if (String(row.amenity || '').toLowerCase() !== name.toLowerCase()) continue;
      const window = bookingWindow(row);
      if (!window) continue;
      const day = new Date(window.start);
      day.setHours(12, 0, 0, 0);
      if (day.getTime() !== today.getTime()) continue;
      busy.push([
        window.start.getHours() * 60 + window.start.getMinutes(),
        window.end.getHours() * 60 + window.end.getMinutes()
      ]);
    }
    busy.sort((a, b) => a[0] - b[0]);
    let cursor = from;
    for (const [start, end] of busy) {
      if (cursor + HOME_SUGGESTION_MINUTES <= start) break;
      cursor = Math.max(cursor, end);
    }
    if (cursor + HOME_SUGGESTION_MINUTES <= HOME_DAY_END_MINUTES) {
      return { name, start: cursor, end: cursor + HOME_SUGGESTION_MINUTES };
    }
  }
  return null;
}

function freeWindowSuggestionHtml(now = new Date()) {
  const slot = nextFreeWindow(now);
  const partOfDay = now.getHours() >= 17 ? 'tonight' : 'today';
  const detail = slot
    ? `${slot.name} is free ${partOfDay} ${homeMinutesLabel(slot.start)} – ${homeMinutesLabel(slot.end)}.`
    : 'Choose a space and time that suits you.';
  return `<div class="home-suggest">
    <span class="home-suggest-icon"><i data-icon="calendar"></i></span>
    <span class="home-suggest-copy">
      <strong>No upcoming bookings</strong>
      <span>${detail}</span>
    </span>
    <a class="home-suggest-action" href="amenities.html">Book a space</a>
  </div>`;
}

function renderSchedule() {
  const listEl = document.querySelector('#schedule-list');
  if (!listEl) return;
  const items = liveAmenityBookings().slice(0, 3);
  if (items.length === 0) {
    listEl.innerHTML = freeWindowSuggestionHtml();
    renderIcons(listEl);
    return;
  }
  listEl.innerHTML = items.map(({ row, status, end }) => {
    const name = row.residentName || 'Resident';
    return `
    <div class="schedule-row">
      <div class="schedule-when">
        <span class="schedule-day">${bookingDayLabel(row.date)}</span>
        <span class="schedule-start">${row.time}</span>
      </div>
      <div class="schedule-body">
        <strong>${row.amenity}</strong>
        <span>${name}</span>
        <span>Suite ${row.suite}</span>
      </div>
      <div class="schedule-meta">
        <span class="badge ${status.pill}">${status.label}</span>
        <span class="schedule-ends">Ends at ${formatBookingClock(end)}</span>
      </div>
    </div>`;
  }).join('');
}

renderSchedule();
setInterval(renderSchedule, BOOKING_REFRESH_MS);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') renderSchedule();
});

const HOME_COMPLETED_MAINTENANCE = { id:'home-completed-maintenance-demo', suite:'204', title:'Hallway light replaced', note:'Replaced the faulty light fixture outside the suite.', status:'completed', reportedAt:'2026-11-18T10:00:00' };

(function renderMaintenance() {
  const listEl = document.querySelector('#maint-list');
  const viewAll = document.querySelector('#home-maint-view-all');
  if (!listEl) return;
  const requests = sortMaintenanceNewestFirst(getMaintenance());
  const completed = requests.find(item => item.status === 'completed') || HOME_COMPLETED_MAINTENANCE;
  const items = [...requests.filter(item => item.status === 'pending').slice(0, 2), completed];
  if (viewAll) viewAll.textContent = `View All (${requests.length})`;
  if (items.length === 0) {
    listEl.innerHTML = '<p class="muted" style="padding:12px 0 0">No maintenance requests to show.</p>';
    return;
  }
  listEl.innerHTML = items.map(item => `
    <button class="queue-row" data-maint="${item.id}" type="button">
      <span class="queue-meta">
        <strong>${escapeAnnouncementHtml(maintenanceSummary(item))}</strong>
        <span class="queue-issue">${escapeAnnouncementHtml(item.note || '')}</span>
        <small class="queue-suite">Suite ${escapeAnnouncementHtml(String(item.suite))}</small>
        <span class="maintenance-status ${item.status === 'completed' ? 'is-completed' : 'is-pending'}">${item.status === 'completed' ? 'Completed' : 'Pending'}</span>
      </span>
    </button>`).join('');
})();

/* ── Sidebar ──────────────────────────────────────────────── */
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

/* ── Actions ──────────────────────────────────────────────── */
const actions = {
  menu() {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  },
  'close-menu': closeMenu,
  'close-modal': () => modal.close(),

  'view-payments': () => openModal('Payments', typeof homePaymentsDialog === 'function' ? homePaymentsDialog() : '<p>Payments are unavailable right now.</p>'),
  notifications: () => openModal('Notifications', typeof homeNotificationsDialog === 'function' ? homeNotificationsDialog() : '<p>Nothing new right now.</p>'),
  profile: () => {
    const resident = getCurrentResident();
    const suite = resident?.suite ? `Suite ${resident.suite}` : '';
    openModal(resident?.name || 'Resident', `<p>${[resident?.title || 'Resident', suite].filter(Boolean).join(' · ')}<br>${MOCK_DATA.building.name}</p><div class="dialog-info">Resident portal · Track updates in your building</div>`);
  },

  shop: () => openModal('Fobs & essentials', '<p>A preview of the essentials available through your building.</p><div class="dialog-info">Entry fobs · Batteries · Everyday supplies</div><p>Ordering is not available yet.</p>'),
  help: () => openModal('Resident help', '<p>See packages, maintenance, bookings, and building announcements for your home.</p><p>Use this dashboard to stay on top of what is happening in your condominium.</p>')
};

/* ── Event delegation ─────────────────────────────────────── */
document.addEventListener('click', event => {
  const maint = event.target.closest('[data-maint]');
  if (maint) {
    const item = getMaintenance().find(m => m.id === maint.dataset.maint) || (maint.dataset.maint === HOME_COMPLETED_MAINTENANCE.id ? HOME_COMPLETED_MAINTENANCE : null);
    if (item) {
      const when = formatMaintenanceWhen(item.reportedAt);
      const note = item.note ? `<p>${item.note}</p>` : '';
      openModal(maintenanceSummary(item), `<div class="dialog-info">${item.suite}${when ? ` · ${when}` : ''}</div>${note}<p><a class="button compact" href="maintenance.html">Open maintenance</a></p>`);
    }
    return;
  }

  const ann = event.target.closest('[data-announcement]');
  if (ann) {
    const item = findAnnouncementById(ann.dataset.announcement);
    if (item) openModal(item.title, `${announcementDetailHtml(item)}<p><a class="button compact" href="announcements.html">View all</a></p>`);
    return;
  }

  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.closest('.sidebar')) closeMenu();
  actions[button.dataset.action]?.();
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
