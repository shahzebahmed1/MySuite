/* MySuite — Resident home brief.
   Ranks what needs the resident today, then fills the building-status panel,
   the payments card, and the notifications feed from the same local records the
   dedicated pages already use. Load after app.js. */

function homeBriefEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function homeBriefMoney(cents) {
  const value = Number(cents);
  if (!Number.isFinite(value)) return '';
  return `$${(value / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function homeBriefDate(iso) {
  const parsed = new Date(`${iso}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function homeBriefShortDate(iso) {
  const date = homeBriefDate(iso);
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
}

function homeBriefRelativeDay(iso, now = new Date()) {
  const date = homeBriefDate(iso);
  if (!date) return '';
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const days = Math.round((date - today) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

function homePaymentsList() {
  return (MOCK_DATA.payments || [])
    .slice()
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
}

function homeNextPayment() {
  return homePaymentsList().find(payment => payment.status === 'due') || null;
}

/* ── What needs you ───────────────────────────────────────── */
function homeBriefItems(now = new Date()) {
  const items = [];

  const payment = homeNextPayment();
  if (payment) {
    items.push({
      rank: 1,
      icon: 'dollar',
      tone: 'needs',
      pill: 'Needs you',
      title: `Condo fee due ${homeBriefShortDate(payment.dueDate)}`,
      meta: `${homeBriefMoney(payment.amountCents)} · ${payment.autopay ? 'autopay on' : 'autopay off'}`,
      action: 'view-payments'
    });
  }

  let booking = null;
  if (typeof liveAmenityBookings === 'function') {
    try { booking = liveAmenityBookings(now)[0] || null; } catch { booking = null; }
  }
  if (booking) {
    const when = typeof bookingDayLabel === 'function'
      ? bookingDayLabel(booking.row.date, now)
      : homeBriefShortDate(booking.row.date);
    const soon = ['Active', 'Starting soon'].includes(booking.status.label);
    items.push({
      rank: 2,
      icon: 'calendar',
      tone: soon ? 'needs' : 'progress',
      pill: booking.status.label === 'Upcoming' ? 'Booked' : booking.status.label,
      title: `${booking.row.amenity} · ${when} ${booking.row.time || ''}`.trim(),
      meta: [booking.row.duration, booking.row.suite ? `Suite ${booking.row.suite}` : ''].filter(Boolean).join(' · '),
      href: 'amenities.html'
    });
  }

  if (typeof getPackages === 'function' && typeof sortPackagesNewestFirst === 'function') {
    const pending = sortPackagesNewestFirst(getPackages().filter(pkg => pkg.status === 'pending'));
    if (pending.length) {
      const resident = typeof getCurrentResident === 'function' ? getCurrentResident() : null;
      const mine = pending.filter(pkg => String(pkg.suite) === String(resident?.suite || ''));
      const shown = mine.length ? mine[0] : pending[0];
      const time = typeof formatPackageTime === 'function' ? formatPackageTime(shown.receivedAt) : '';
      items.push({
        rank: 3,
        icon: 'package',
        tone: 'progress',
        pill: 'At the desk',
        title: mine.length
          ? `${mine.length} package${mine.length === 1 ? '' : 's'} for Suite ${mine[0].suite}`
          : `${pending.length} packages at the desk`,
        meta: [shown.carrier || 'Other', time].filter(Boolean).join(' · '),
        href: 'packages.html'
      });
    }
  }

  if (typeof getMaintenance === 'function' && typeof sortMaintenanceNewestFirst === 'function') {
    const open = sortMaintenanceNewestFirst(getMaintenance()).filter(item => item.status !== 'completed');
    if (open.length) {
      const first = open[0];
      items.push({
        rank: 4,
        icon: 'wrench',
        tone: 'progress',
        pill: open.length > 1 ? `${open.length} open` : 'In progress',
        title: typeof maintenanceSummary === 'function' ? maintenanceSummary(first) : 'Maintenance request',
        meta: [
          `Suite ${first.suite}`,
          typeof formatMaintenanceWhen === 'function' && first.reportedAt
            ? `reported ${formatMaintenanceWhen(first.reportedAt)}`
            : ''
        ].filter(Boolean).join(' · '),
        href: 'maintenance.html'
      });
    }
  }

  return items.sort((a, b) => a.rank - b.rank).slice(0, 4);
}

function homeBriefRowHtml(item) {
  const body = `<span class="home-brief-icon"><i data-icon="${homeBriefEscape(item.icon || 'info')}"></i></span>`
    + `<span class="home-brief-copy"><strong>${homeBriefEscape(item.title)}</strong><span>${homeBriefEscape(item.meta)}</span></span>`
    + `<span class="home-pill is-${homeBriefEscape(item.tone)}">${homeBriefEscape(item.pill)}</span>`;
  if (item.href) return `<a class="home-need" href="${homeBriefEscape(item.href)}">${body}</a>`;
  return `<button class="home-need" type="button" data-action="${homeBriefEscape(item.action || '')}">${body}</button>`;
}

function renderHomeBrief() {
  const list = document.querySelector('#home-brief-list');
  if (!list) return;
  let items = [];
  try { items = homeBriefItems(); } catch { items = []; }
  if (items.length) {
    list.innerHTML = items.map(item => `<li class="home-brief-item">${homeBriefRowHtml(item)}</li>`).join('');
  } else {
    list.innerHTML = `<li class="home-brief-item">
      <div class="home-need is-empty">
        <span class="home-brief-icon"><i data-icon="check"></i></span>
        <span class="home-brief-copy"><strong>Nothing needs you today</strong><span>Bookings, packages, and requests are all up to date.</span></span>
      </div>
    </li>`;
  }
  renderIcons(list);
}

function renderHomeBriefDate() {
  const el = document.querySelector('#home-brief-date');
  if (!el) return;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const building = MOCK_DATA.building?.name || 'Your building';
  el.textContent = `${today} · ${building}`;
}

/* ── Building status ──────────────────────────────────────── */
function renderHomeStatus() {
  const list = document.querySelector('#home-status-list');
  if (!list) return;
  const status = Array.isArray(MOCK_DATA.buildingStatus) ? MOCK_DATA.buildingStatus : [];
  list.innerHTML = status.length
    ? status.map(item => `<li class="home-status-item">
        <i data-icon="${homeBriefEscape(item.icon || 'info')}"></i>
        <span><strong>${homeBriefEscape(item.title)}</strong><span>${homeBriefEscape(item.detail)}</span></span>
      </li>`).join('')
    : `<li class="home-status-item">
        <i data-icon="check"></i>
        <span><strong>All systems normal</strong><span>No closures or planned work today.</span></span>
      </li>`;
  renderIcons(list);

  const desk = document.querySelector('#home-desk-line');
  if (!desk) return;
  const info = MOCK_DATA.frontDesk;
  if (!info) { desk.hidden = true; return; }
  const phone = String(info.phone || '');
  const afterHours = String(info.afterHours || '');
  desk.hidden = false;
  desk.innerHTML = `Front desk ${homeBriefEscape(info.hours || '')}`
    + (phone ? ` · <a href="tel:${homeBriefEscape(phone.replace(/[^\d+]/g, ''))}">${homeBriefEscape(phone)}</a>` : '')
    + (afterHours ? `<br>After hours ${homeBriefEscape(afterHours)}` : '');
}

/* ── Payments ─────────────────────────────────────────────── */
function renderHomePayments() {
  const panel = document.querySelector('#home-payments-panel');
  if (!panel) return;
  const payment = homeNextPayment();
  if (!payment) {
    panel.innerHTML = '<div class="dashboard-payments-panel"><span>No upcoming payments to display.</span></div>';
    return;
  }
  const paid = homePaymentsList().filter(item => item.status === 'paid').pop();
  panel.innerHTML = `<button class="home-payment" type="button" data-action="view-payments">
    <span class="home-payment-amount">${homeBriefEscape(homeBriefMoney(payment.amountCents))}</span>
    <span class="home-payment-copy">
      <strong>${homeBriefEscape(payment.label || 'Upcoming payment')}</strong>
      <span>Due ${homeBriefEscape(homeBriefShortDate(payment.dueDate))} · ${homeBriefEscape(homeBriefRelativeDay(payment.dueDate))}</span>
      <span class="home-payment-flags">
        <span class="home-pill is-${payment.autopay ? 'done' : 'needs'}">${payment.autopay ? 'Autopay on' : 'Autopay off'}</span>
        ${paid ? `<span class="home-payment-last">Last paid ${homeBriefEscape(homeBriefShortDate(paid.paidOn || paid.dueDate))}</span>` : ''}
      </span>
    </span>
  </button>`;
}

/* ── Dialogs used by the topbar bell and the payments card ── */
function homePaymentsDialog() {
  try {
    const rows = homePaymentsList().slice().reverse().map(payment => {
      const paid = payment.status === 'paid';
      const when = paid
        ? `Paid ${homeBriefShortDate(payment.paidOn || payment.dueDate)}`
        : `Due ${homeBriefShortDate(payment.dueDate)} · ${homeBriefRelativeDay(payment.dueDate)}`;
      return `<li class="home-feed-row">
        <span class="home-feed-icon"><i data-icon="dollar"></i></span>
        <span class="home-feed-copy">
          <strong>${homeBriefEscape(payment.label || 'Charge')}</strong>
          <span>${homeBriefEscape(when)} · ${homeBriefEscape(homeBriefMoney(payment.amountCents))}</span>
        </span>
        <span class="home-pill is-${paid ? 'done' : 'needs'}">${paid ? 'Paid' : 'Due'}</span>
      </li>`;
    }).join('');
    const account = typeof getCurrentResident === 'function' ? getCurrentResident() : null;
    const suite = account?.suite ? ` for Suite ${homeBriefEscape(account.suite)}` : '';
    return `<div class="dialog-info">Charges${suite} from your building ledger</div>
      <ul class="home-feed">${rows}</ul>
      <p>Card and bank payments are not connected in this preview. The front desk can take payment in the meantime.</p>`;
  } catch {
    return '<p>Payments could not be loaded right now. Please try again.</p>';
  }
}

function homeNotificationsDialog() {
  const items = [];
  try {
    const payment = homeNextPayment();
    if (payment) {
      items.push({
        icon: 'dollar',
        title: `Condo fee due ${homeBriefShortDate(payment.dueDate)}`,
        meta: `${homeBriefMoney(payment.amountCents)} · ${homeBriefRelativeDay(payment.dueDate)}`
      });
    }
    sortPackagesNewestFirst(getPackages().filter(pkg => pkg.status === 'pending')).slice(0, 3).forEach(pkg => {
      items.push({
        icon: 'package',
        title: `Package for Suite ${pkg.suite}`,
        meta: [pkg.carrier || 'Other', pkg.parcelType || 'Package', formatPackageTime(pkg.receivedAt)].filter(Boolean).join(' · ')
      });
    });
    sortMaintenanceNewestFirst(getMaintenance()).filter(item => item.status !== 'completed').slice(0, 3).forEach(item => {
      items.push({
        icon: 'wrench',
        title: maintenanceSummary(item),
        meta: [`Suite ${item.suite}`, formatMaintenanceWhen(item.reportedAt)].filter(Boolean).join(' · ')
      });
    });
    sortAnnouncementsNewestFirst(getAnnouncements()).slice(0, 3).forEach(item => {
      items.push({
        icon: 'megaphone',
        title: item.title,
        meta: [item.category, formatAnnouncementWhen(item.postedAt)].filter(Boolean).join(' · ')
      });
    });
  } catch { /* Show whatever did load. */ }

  if (!items.length) return '<p>Nothing new right now.</p>';
  return `<div class="dialog-info">Recent activity across packages, requests, and notices</div>
    <ul class="home-feed">${items.map(item => `<li class="home-feed-row">
      <span class="home-feed-icon"><i data-icon="${homeBriefEscape(item.icon)}"></i></span>
      <span class="home-feed-copy"><strong>${homeBriefEscape(item.title)}</strong><span>${homeBriefEscape(item.meta)}</span></span>
    </li>`).join('')}</ul>`;
}

/* ── Init ─────────────────────────────────────────────────── */
function homeBriefRefresh() {
  renderHomeBrief();
  renderHomePayments();
}

renderHomeBriefDate();
renderHomeStatus();
homeBriefRefresh();
window.addEventListener('focus', homeBriefRefresh);
window.addEventListener('storage', homeBriefRefresh);
setInterval(renderHomeBrief, 60 * 1000);
