/* MySuite — Concierge dashboard.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, packages-data.js */

renderIcons();
applyLoggedInUser('concierge');

/* ── Render dashboard cards from MOCK_DATA ─────────────────── */
(function renderHomePackages() {
  const listEl = document.querySelector('#home-package-list');
  const viewAll = document.querySelector('#home-package-view-all');
  if (!listEl) return;
  const pending = sortPackagesNewestFirst(getPackages()).filter(p => p.status === 'pending');
  if (viewAll) viewAll.textContent = `View all pending (${pending.length})`;
  if (pending.length === 0) {
    listEl.innerHTML = `
      <div class="pkg-empty-state">
        <p>No packages needing to be delivered.</p>
      </div>`;
    return;
  }
  listEl.innerHTML = pending.slice(0, 3).map(pkg => renderPackageRow(pkg)).join('');
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

function renderSchedule() {
  const listEl = document.querySelector('#schedule-list');
  if (!listEl) return;
  const items = liveAmenityBookings().slice(0, 3);
  if (items.length === 0) {
    listEl.innerHTML = '<p class="muted" style="padding:12px 0 0;font-size:14px">No upcoming bookings right now.</p>';
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

(function renderMaintenance() {
  const listEl = document.querySelector('#maint-list');
  const viewAll = document.querySelector('#home-maint-view-all');
  if (!listEl) return;
  const pending = sortMaintenanceNewestFirst(getMaintenance()).filter(m => m.status === 'pending');
  if (viewAll) viewAll.textContent = `View all pending (${pending.length})`;
  const items = pending.slice(0, 3);
  if (items.length === 0) {
    listEl.innerHTML = '<p class="muted" style="padding:12px 0 0">No pending maintenance requests.</p>';
    return;
  }
  listEl.innerHTML = items.map(item => `
    <button class="queue-row" data-maint="${item.id}" type="button">
      <span class="queue-meta">
        <strong>${item.suite}</strong>
        <span class="queue-issue">${maintenanceSummary(item)}</span>
      </span>
      <span class="badge pending-badge">Pending</span>
    </button>`).join('');
})();

(function renderHomeAnnouncements() {
  const listEl = document.querySelector('#home-announcement-list');
  if (!listEl) return;
  const items = sortAnnouncementsNewestFirst(getAnnouncements()).slice(0, 3);
  if (items.length === 0) {
    listEl.innerHTML = '<p class="muted" style="padding:12px 0 0">No recent announcements.</p>';
    return;
  }
  listEl.innerHTML = items.map(renderAnnouncementRow).join('');
  renderIcons(listEl);
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

  notifications: () => openModal('Notifications', '<p>No new notifications.</p>'),
  profile: () => {
    const concierge = getCurrentConcierge();
    openModal(concierge?.name || 'Concierge', `<p>${concierge?.title || 'Concierge'}${concierge?.station ? ` · ${concierge.station}` : ''}<br>${MOCK_DATA.building.name}</p><div class="dialog-info">${concierge?.shift ? `Shift: ${concierge.shift} · ` : ''}Concierge portal</div>`);
  },

  help: () => openModal('Concierge help', '<p>Manage packages, maintenance, and building updates from your concierge dashboard.</p><p>Concierge can review announcements; managers and board members create them.</p>')
};

/* ── Event delegation ─────────────────────────────────────── */
document.addEventListener('click', event => {
  const maint = event.target.closest('[data-maint]');
  if (maint) {
    const item = getMaintenance().find(m => m.id === maint.dataset.maint);
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

/* ── Resident lookup form ─────────────────────────────────── */
document.addEventListener('submit', event => {
  if (event.target.id === 'lookup-form') {
    event.preventDefault();
    const query = document.querySelector('#lookup-input').value.trim().toLowerCase();
    const resultsEl = document.querySelector('#lookup-results');
    const matches = DEMO_RESIDENTS.filter(r =>
      r.suite.includes(query) || r.name.toLowerCase().includes(query)
    );
    if (!query) {
      resultsEl.innerHTML = '<p class="muted">Enter a suite number or resident name.</p>';
      return;
    }
    if (matches.length === 0) {
      resultsEl.innerHTML = '<p class="muted">No residents match that search.</p>';
      return;
    }
    resultsEl.innerHTML = matches.map(r =>
      `<div class="lookup-result-item"><span class="tile-icon" style="width:36px;height:36px;font-size:14px;font-weight:650">${r.suite}</span><span><strong>${r.name}</strong><small>${r.role} · Suite ${r.suite}</small></span></div>`
    ).join('');
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
