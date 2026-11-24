/* MySuite — Resident home.
   Today band (announcements + upcoming payments), the suite record, notices that
   need acknowledgement, and violations. Reads the same local records as the
   dedicated pages. Load after app.js. */

/* ── Helpers ──────────────────────────────────────────────── */
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

/* Accepts "YYYY-MM-DD" and full timestamps alike. Appending a time to a value
   that already carries one produced an invalid date, which blanked the label. */
function homeBriefDate(iso) {
  const dateOnly = String(iso ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
  const parsed = new Date(`${dateOnly}T12:00:00`);
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

/* ── Band heading ─────────────────────────────────────────── */
/* The band is labelled with the date rather than "Today": nothing inside it is
   guaranteed to be from today, so every row states its own age instead. */
function renderHomeBriefDate() {
  const title = document.querySelector('#home-brief-title');
  const context = document.querySelector('#home-brief-date');
  const now = new Date();
  if (title) title.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  if (context) context.textContent = MOCK_DATA.building?.name || 'Your building';
}

/** "today 9:20 a.m." / "yesterday" / "5 days ago" / "last week" */
function homeBriefAge(iso, now = new Date()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const startOfDay = value => {
    const copy = new Date(value);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (days < 0) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (days === 0) return `today ${date.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  return `${Math.round(days / 7)} weeks ago`;
}

/* ── Announcements ────────────────────────────────────────── */
function homeAnnouncements() {
  const existing = getAnnouncements();
  const seeds = typeof ANNOUNCEMENT_SEED !== 'undefined' ? ANNOUNCEMENT_SEED : [];
  return sortAnnouncementsNewestFirst([
    ...existing,
    ...seeds.filter(seed => !existing.some(item => item.id === seed.id))
  ]);
}

function renderHomeNotices() {
  const list = document.querySelector('#home-brief-list');
  if (!list) return;
  const items = homeAnnouncements().slice(0, 3);
  if (!items.length) {
    list.innerHTML = '<li class="home-card-empty">No announcements right now.</li>';
    return;
  }
  list.innerHTML = items.map(notice => {
    const icon = ['pool', 'building', 'users', 'megaphone'].includes(notice.icon) ? notice.icon : 'megaphone';
    const meta = [notice.category, homeBriefAge(notice.postedAt)].filter(Boolean).join(' · ');
    return `<li>
      <button class="home-notice" type="button" data-announcement="${homeBriefEscape(notice.id)}">
        <span class="home-notice-icon"><i data-icon="${icon}"></i></span>
        <span class="home-notice-copy">
          <strong>${homeBriefEscape(notice.title)}</strong>
          <span>${homeBriefEscape(notice.summary || notice.body || '')}</span>
          <em>${homeBriefEscape(meta)}</em>
        </span>
        <i data-icon="chevron"></i>
      </button>
    </li>`;
  }).join('');
  renderIcons(list);
}

/* ── Upcoming payments ────────────────────────────────────── */
function homePaymentsList() {
  return (MOCK_DATA.payments || [])
    .slice()
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
}

function homeNextPayment() {
  return homePaymentsList().find(payment => payment.status === 'due') || null;
}

/** True once the due date has passed and the charge is still unpaid. */
function homePaymentOverdue(payment) {
  if (!payment || payment.status !== 'due') return false;
  const due = homeBriefDate(payment.dueDate);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

/** The most recently settled charge, by payment date rather than due date. */
function homeLastPaidPayment() {
  const paid = homePaymentsList().filter(item => item.status === 'paid');
  if (!paid.length) return null;
  return paid
    .sort((a, b) => String(a.paidOn || a.dueDate).localeCompare(String(b.paidOn || b.dueDate)))
    .pop();
}

function renderHomePayments() {
  const panel = document.querySelector('#home-payments-panel');
  if (!panel) return;
  const payment = homeNextPayment();
  if (!payment) {
    panel.innerHTML = '<p class="home-due-empty">Nothing due right now.</p>';
    return;
  }
  const paid = homeLastPaidPayment();
  const dueLine = homePaymentOverdue(payment)
    ? `Overdue · was due ${homeBriefShortDate(payment.dueDate)}`
    : `Due ${homeBriefShortDate(payment.dueDate)} · ${homeBriefRelativeDay(payment.dueDate)}`;
  panel.innerHTML = `<div class="home-due">
      <span class="home-due-amount">${homeBriefEscape(homeBriefMoney(payment.amountCents))}</span>
      <span class="home-due-copy">
        <strong>${homeBriefEscape(payment.label || 'Upcoming payment')}</strong>
        <span>${homeBriefEscape(dueLine)}</span>
      </span>
      <span class="home-due-flags">
        <span class="home-pill is-${payment.autopay ? 'done' : 'needs'}">${payment.autopay ? 'Autopay on' : 'Autopay off'}</span>
        ${paid ? `<span class="home-due-last">Last paid ${homeBriefEscape(homeBriefShortDate(paid.paidOn || paid.dueDate))}</span>` : ''}
      </span>
    </div>
    ${payment.covers ? `<p class="home-due-caption">${homeBriefEscape(payment.covers)}</p>` : ''}`;
}

/* ── Your suite ───────────────────────────────────────────── */
function renderHomeSuiteRecord() {
  const list = document.querySelector('#suite-record-list');
  if (!list) return;
  const rows = Array.isArray(MOCK_DATA.suiteRecord?.rows) ? MOCK_DATA.suiteRecord.rows : [];
  list.innerHTML = rows.length
    ? rows.map(row => `<li class="home-record-row">
        <span class="home-record-label">${homeBriefEscape(row.label)}</span>
        <span class="home-record-value">${homeBriefEscape(row.value)}${row.pill ? ` <span class="home-pill is-${homeBriefEscape(row.tone || 'done')}">${homeBriefEscape(row.pill)}</span>` : ''}</span>
      </li>`).join('')
    : '<li class="home-card-empty">Suite details are not available.</li>';

  const desk = document.querySelector('#suite-record-desk');
  if (!desk) return;
  const info = MOCK_DATA.frontDesk;
  if (!info) { desk.hidden = true; return; }
  const phone = String(info.phone || '');
  desk.hidden = false;
  desk.innerHTML = `Front desk ${homeBriefEscape(info.hours || '')}`
    + (phone ? ` · <a href="tel:${homeBriefEscape(phone.replace(/[^\d+]/g, ''))}">${homeBriefEscape(phone)}</a>` : '');
}

/* ── Notices to acknowledge ───────────────────────────────── */
const HOME_ACK_KEY = 'mysuite-resident-notice-acks-v1';

function homeNoticeAcks() {
  const stored = readSaved(HOME_ACK_KEY, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

function homePendingNotices() {
  const acks = homeNoticeAcks();
  return (MOCK_DATA.notices || []).filter(notice => !acks[notice.id]);
}

function renderHomeAcknowledgements() {
  const list = document.querySelector('#ack-list');
  if (!list) return;
  const count = document.querySelector('#ack-count');
  const pending = homePendingNotices();
  if (count) count.textContent = pending.length ? `${pending.length} open` : '';
  if (!pending.length) {
    list.innerHTML = '<p class="home-card-empty">Every notice has been acknowledged.</p>';
    return;
  }
  list.innerHTML = pending.slice(0, 3).map(notice => {
    const meta = [notice.category, homeBriefAge(notice.postedAt)].filter(Boolean).join(' · ');
    return `<div class="home-ack-row">
      <span class="home-ack-copy">
        <strong>${homeBriefEscape(notice.title)}</strong>
        <span>${homeBriefEscape(meta)}</span>
      </span>
      <button class="home-ack-button" type="button" data-ack="${homeBriefEscape(notice.id)}">Acknowledge</button>
    </div>`;
  }).join('');
}

function acknowledgeNotice(id) {
  const all = homeNoticeAcks();
  all[id] = new Date().toISOString();
  save(HOME_ACK_KEY, all);
  const notice = (MOCK_DATA.notices || []).find(item => item.id === id);
  renderHomeAcknowledgements();
  toast(notice ? `Acknowledged · ${notice.title}` : 'Notice acknowledged.');
}

/* ── Violations ───────────────────────────────────────────── */
function homeViolations() {
  return (MOCK_DATA.violations || [])
    .slice()
    .sort((a, b) => String(b.issuedOn).localeCompare(String(a.issuedOn)));
}

function homeViolationState(status) {
  if (status === 'paid') return { tone: 'done', label: 'Paid' };
  if (status === 'disputed') return { tone: 'progress', label: 'Disputed' };
  return { tone: 'needs', label: 'Open' };
}

function renderHomeViolations() {
  const list = document.querySelector('#violations-list');
  if (!list) return;
  const all = homeViolations();
  const open = all.filter(item => item.status !== 'paid');
  const viewAll = document.querySelector('#violations-view-all');
  if (viewAll) viewAll.textContent = all.length ? `View all (${all.length})` : 'View all';
  if (!open.length) {
    list.innerHTML = '<p class="home-card-empty">Nothing on file against your suite.</p>';
    return;
  }
  list.innerHTML = open.slice(0, 2).map(item => {
    const state = homeViolationState(item.status);
    const meta = [
      item.reference,
      homeBriefShortDate(item.issuedOn),
      item.fineCents ? `${homeBriefMoney(item.fineCents)} fine` : ''
    ].filter(Boolean).join(' · ');
    return `<button class="home-violation" type="button" data-violation="${homeBriefEscape(item.id)}">
      <span class="home-violation-top">
        <strong>${homeBriefEscape(item.category || 'Violation')}</strong>
        <span class="home-pill is-${state.tone}">${state.label}</span>
      </span>
      <span class="home-violation-summary">${homeBriefEscape(item.summary || '')}</span>
      <span class="home-violation-meta">${homeBriefEscape(meta)}</span>
    </button>`;
  }).join('');
}

function homeViolationsDialog() {
  const items = homeViolations();
  if (!items.length) return '<p>No violations are on file for your suite.</p>';
  const account = getCurrentResident();
  const suite = account?.suite ? ` against Suite ${homeBriefEscape(account.suite)}` : '';
  return `<div class="dialog-info">Violations recorded${suite}</div>
    <ul class="home-feed">${items.map(item => {
      const state = homeViolationState(item.status);
      const meta = [
        item.reference,
        homeBriefShortDate(item.issuedOn),
        item.fineCents ? homeBriefMoney(item.fineCents) : ''
      ].filter(Boolean).join(' · ');
      return `<li class="home-feed-row">
        <span class="home-feed-icon"><i data-icon="alert"></i></span>
        <span class="home-feed-copy"><strong>${homeBriefEscape(item.category || 'Violation')}</strong><span>${homeBriefEscape(meta)}</span></span>
        <span class="home-pill is-${state.tone}">${state.label}</span>
      </li>`;
    }).join('')}</ul>
    <p>Fines are settled at the front desk. Online payment and formal disputes are not connected in this preview.</p>`;
}

function openViolationDialog(id) {
  const item = homeViolations().find(row => row.id === id);
  if (!item) return;
  const state = homeViolationState(item.status);
  const issued = homeBriefShortDate(item.issuedOn);
  const fine = item.fineCents
    ? `<p><span class="home-pill is-${state.tone}">${state.label}</span> <strong>${homeBriefEscape(homeBriefMoney(item.fineCents))}</strong>${item.dueOn ? ` due ${homeBriefEscape(homeBriefShortDate(item.dueOn))}` : ''}</p>`
    : `<p><span class="home-pill is-${state.tone}">${state.label}</span></p>`;
  openModal(item.category || 'Violation', `<div class="dialog-info">${homeBriefEscape([item.reference, issued ? `Issued ${issued}` : ''].filter(Boolean).join(' · '))}</div>
    <p>${homeBriefEscape(item.summary || '')}</p>
    ${fine}
    <p><a class="button compact" href="contact-directory.html">Contact the front desk</a></p>`);
}

/* ── Dialogs used by the topbar bell and the payments link ── */
function homePaymentsDialog() {
  try {
    const rows = homePaymentsList().slice().reverse().map(payment => {
      const paid = payment.status === 'paid';
      const overdue = homePaymentOverdue(payment);
      const state = paid
        ? { tone: 'done', label: 'Paid' }
        : overdue ? { tone: 'needs', label: 'Overdue' } : { tone: 'needs', label: 'Due' };
      const when = paid
        ? `Paid ${homeBriefShortDate(payment.paidOn || payment.dueDate)}`
        : overdue
          ? `Overdue · was due ${homeBriefShortDate(payment.dueDate)}`
          : `Due ${homeBriefShortDate(payment.dueDate)} · ${homeBriefRelativeDay(payment.dueDate)}`;
      return `<li class="home-feed-row">
        <span class="home-feed-icon"><i data-icon="dollar"></i></span>
        <span class="home-feed-copy">
          <strong>${homeBriefEscape(payment.label || 'Charge')}</strong>
          <span>${homeBriefEscape(when)} · ${homeBriefEscape(homeBriefMoney(payment.amountCents))}</span>
        </span>
        <span class="home-pill is-${state.tone}">${state.label}</span>
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
  const push = (icon, title, meta) => items.push({ icon, title, meta: meta.filter(Boolean).join(' · ') });
  try {
    const payment = homeNextPayment();
    if (payment) {
      push('dollar', `Condo fee due ${homeBriefShortDate(payment.dueDate)}`, [homeBriefMoney(payment.amountCents), homeBriefRelativeDay(payment.dueDate)]);
    }
    homePendingNotices().forEach(notice => {
      push('megaphone', notice.title, [notice.category, 'needs acknowledgement']);
    });
    homeViolations().filter(item => item.status !== 'paid').forEach(item => {
      push('alert', `${item.category || 'Violation'} · ${item.reference || ''}`.trim(), [homeBriefShortDate(item.issuedOn), homeViolationState(item.status).label]);
    });
    /* Only the signed-in resident's own packages and requests. */
    const suite = String(getCurrentResident()?.suite || '').trim();
    const mine = item => !suite || String(item.suite || '').trim() === suite;
    sortPackagesNewestFirst(getPackages().filter(pkg => pkg.status === 'pending' && mine(pkg))).slice(0, 2).forEach(pkg => {
      push('package', `Package for Suite ${pkg.suite}`, [pkg.carrier || 'Other', homeBriefAge(pkg.receivedAt)]);
    });
    sortMaintenanceNewestFirst(getMaintenance().filter(item => item.status !== 'completed' && mine(item))).slice(0, 2).forEach(item => {
      push('wrench', maintenanceSummary(item), [`Suite ${item.suite}`, formatMaintenanceWhen(item.reportedAt)]);
    });
  } catch { /* Show whatever did load. */ }

  if (!items.length) return '<p>Nothing new right now.</p>';
  return `<div class="dialog-info">Recent activity across notices, payments, requests, and packages</div>
    <ul class="home-feed">${items.map(item => `<li class="home-feed-row">
      <span class="home-feed-icon"><i data-icon="${homeBriefEscape(item.icon)}"></i></span>
      <span class="home-feed-copy"><strong>${homeBriefEscape(item.title)}</strong><span>${homeBriefEscape(item.meta)}</span></span>
    </li>`).join('')}</ul>`;
}

/* ── Events ───────────────────────────────────────────────── */
document.addEventListener('click', event => {
  const ack = event.target.closest('[data-ack]');
  if (ack) {
    acknowledgeNotice(ack.dataset.ack);
    return;
  }
  const violation = event.target.closest('[data-violation]');
  if (violation) {
    openViolationDialog(violation.dataset.violation);
    return;
  }
  if (event.target.closest('[data-violations-all]')) {
    openModal('Violations', homeViolationsDialog());
  }
});

/* ── Init ─────────────────────────────────────────────────── */
function homeBriefRefresh() {
  renderHomeNotices();
  renderHomePayments();
  renderHomeAcknowledgements();
  renderHomeViolations();
}

renderHomeBriefDate();
renderHomeSuiteRecord();
homeBriefRefresh();
window.addEventListener('focus', homeBriefRefresh);
window.addEventListener('storage', homeBriefRefresh);
setInterval(renderHomeNotices, 60 * 1000);
