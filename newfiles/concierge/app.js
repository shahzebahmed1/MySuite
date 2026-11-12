/* MySuite — Concierge dashboard.
   Requires: shared/icons.js, shared/utils.js (loaded before this file via defer). */

renderIcons();

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

/* ── Demo resident directory ──────────────────────────────── */
const demoResidents = [
  { suite: '101', name: 'Maria Santos',   role: 'Resident' },
  { suite: '204', name: 'David Chen',     role: 'Resident' },
  { suite: '312', name: 'Priya Nair',     role: 'Resident' },
  { suite: '402', name: 'James Okafor',   role: 'Resident' },
  { suite: '501', name: 'Emily Larsson',  role: 'Resident' },
  { suite: '709', name: 'Marcus Webb',    role: 'Resident' },
  { suite: '803', name: 'Yuki Tanaka',    role: 'Resident · Board member' },
  { suite: '1108', name: 'Fatima Al-Rashid', role: 'Resident' },
  { suite: '1204', name: 'Alex Morgan',   role: 'Resident · Board member' },
];

/* ── Actions ──────────────────────────────────────────────── */
const actions = {
  menu() {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  },
  'close-menu': closeMenu,
  'close-modal': () => modal.close(),

  notifications: () => openModal('Notifications', '<p>No new notifications in this demo.</p><div class="dialog-info">Connect your notification service to show real-time alerts here.</div>'),
  profile: () => openModal('Jordan Kim', '<p>Concierge · Main Lobby<br>The Point on the Bow</p><div class="dialog-info">Shift: 8:00 AM – 4:00 PM · Demo session</div>'),

  'sign-out-liang': () => { openModal('Sign out visitor', '<p>Mark <strong>Liang Chen</strong> (guest of Suite 204) as signed out?</p><div class="dialog-options"><button class="button full" data-action="confirm-sign-out">Confirm sign-out</button><button class="button outline full" data-action="close-modal">Cancel</button></div>'); },
  'sign-out-sarah': () => { openModal('Sign out visitor', '<p>Mark <strong>Sarah Park</strong> (guest of Suite 1108) as signed out?</p><div class="dialog-options"><button class="button full" data-action="confirm-sign-out">Confirm sign-out</button><button class="button outline full" data-action="close-modal">Cancel</button></div>'); },
  'confirm-sign-out': () => { modal.close(); toast('Visitor signed out. Demo only \u2014 no record was saved.'); },

  'notify-402':  () => { openModal('Notify resident', '<p>Send a package notification to <strong>Suite 402</strong> (James Okafor)?</p><div class="dialog-info">Amazon parcel · Received 9:05 AM</div><button class="button full" data-action="confirm-notify">Send demo notification</button>'); },
  'notify-711':  () => { openModal('Notify resident', '<p>Send a package notification to <strong>Suite 711</strong>?</p><div class="dialog-info">FedEx parcel · Received 10:30 AM</div><button class="button full" data-action="confirm-notify">Send demo notification</button>'); },
  'notify-1204': () => { openModal('Notify resident', '<p>Send a package notification to <strong>Suite 1204</strong> (Alex Morgan)?</p><div class="dialog-info">UPS parcel · Received 11:45 AM</div><button class="button full" data-action="confirm-notify">Send demo notification</button>'); },
  'confirm-notify': () => { modal.close(); toast('Demo notification sent. Connect your messaging service to deliver real alerts.'); },

  'view-m4821': () => openModal('Kitchen sink leak', '<div class="dialog-info">#M-4821 · Suite 1204 · In progress</div><p><strong>Nov 5</strong> · Request received: Water leaking from pipe below the kitchen sink.</p><p><strong>Nov 6</strong> · Assigned to maintenance team. Appointment being scheduled.</p><p class="muted">Demo data · Connect your maintenance system for live details.</p>'),
  'view-m4820': () => openModal('HVAC noise', '<div class="dialog-info">#M-4820 · Suite 312 · Assigned</div><p><strong>Nov 8</strong> · Request received: Loud humming from HVAC unit at night.</p><p><strong>Nov 9</strong> · Assigned to mechanical team. Inspection scheduled for Nov 13.</p><p class="muted">Demo data · Connect your maintenance system for live details.</p>'),
  'view-m4819': () => openModal('Door intercom', '<div class="dialog-info">#M-4819 · Suite 709 · Pending</div><p><strong>Nov 10</strong> · Request received: Building entry intercom not ringing suite.</p><p>No technician assigned yet. Pending review by building manager.</p><p class="muted">Demo data · Connect your maintenance system for live details.</p>'),

  help: () => openModal('Concierge help', '<p>This is the concierge dashboard demo. Visitor log, packages, and maintenance data are all sample data.</p><p>Connect your building\u2019s directory, parcel system, and maintenance platform to enable live data.</p><div class="dialog-info">For production, all data access must be enforced by your server.</div>')
};

/* ── Event delegation ─────────────────────────────────────── */
document.addEventListener('click', event => {
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
    const matches = demoResidents.filter(r =>
      r.suite.includes(query) || r.name.toLowerCase().includes(query)
    );
    if (!query) {
      resultsEl.innerHTML = '<p class="muted">Enter a suite number or resident name.</p>';
      return;
    }
    if (matches.length === 0) {
      resultsEl.innerHTML = '<p class="muted">No demo residents match that search.</p>';
      return;
    }
    resultsEl.innerHTML = matches.map(r =>
      `<div class="lookup-result-item"><span class="tile-icon" style="width:36px;height:36px;font-size:11px;font-weight:650">${r.suite}</span><span><strong>${r.name}</strong><small>${r.role} · Suite ${r.suite}</small></span></div>`
    ).join('');
  }

  if (event.target.id === 'broadcast-form') {
    event.preventDefault();
    const msg = document.querySelector('#broadcast-input').value.trim();
    modal.close();
    openModal('Send broadcast', `<p>Send this announcement to all residents?</p><blockquote style="border-left:3px solid var(--caramel);margin:14px 0;padding:10px 14px;font-size:13px;color:#5a4232;background:#f8f1e8;border-radius:0 8px 8px 0">${msg}</blockquote><button class="button full" data-action="confirm-broadcast">Send demo broadcast</button>`);
    renderIcons(modal);
  }
});

actions['confirm-broadcast'] = () => {
  const input = document.querySelector('#broadcast-input');
  if (input) input.value = '';
  modal.close();
  toast('Demo broadcast sent. Connect your notification service to deliver real messages.');
};

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
