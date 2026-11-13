/* MySuite — Concierge dashboard.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, packages-data.js */

renderIcons();
applyLoggedInUser('concierge');

/* ── Render dashboard cards from MOCK_DATA ─────────────────── */
(function renderHomePackages() {
  const listEl = document.querySelector('#home-package-list');
  const countEl = document.querySelector('#home-package-count');
  if (!listEl || !countEl) return;
  const packages = sortPackagesNewestFirst(getPackages());
  const pending = packages.filter(p => p.status === 'pending');
  countEl.textContent = `${pending.length} pending`;
  const recent = (pending.length ? pending : packages).slice(0, 3);
  if (recent.length === 0) {
    listEl.innerHTML = '<p class="muted" style="padding:12px 0 0">No deliveries yet. Log a package to get started.</p>';
    return;
  }
  listEl.innerHTML = recent.map(pkg => renderPackageRow(pkg)).join('');
  renderIcons(listEl);
})();

(function renderVisitors() {
  const listEl = document.querySelector('#visitor-list');
  const countEl = document.querySelector('#visitor-count');
  if (!listEl || !countEl) return;
  const visitors = MOCK_DATA.visitors;
  countEl.textContent = `${visitors.length} signed in`;
  listEl.innerHTML = visitors.map(v => `
    <div class="visitor-row">
      <span class="tile-icon"><i data-icon="person"></i></span>
      <span class="visitor-info"><strong>${v.name}</strong><small>Guest of Suite ${v.suite} · Signed in ${v.signedInAt}</small></span>
      <button class="button compact outline" data-sign-out="${v.id}">Sign out</button>
    </div>`).join('');
  renderIcons(listEl);
})();

(function renderSchedule() {
  const listEl = document.querySelector('#schedule-list');
  if (!listEl) return;
  listEl.innerHTML = MOCK_DATA.amenitySchedule.map(row => `
    <div class="schedule-row">
      <span class="schedule-time">${row.time}</span>
      <span class="schedule-body"><strong>${row.amenity}</strong><small>Suite ${row.suite} · ${row.duration}</small></span>
      <span class="badge ${row.statusClass}">${row.status}</span>
    </div>`).join('');
})();

(function renderMaintenance() {
  const listEl = document.querySelector('#maint-list');
  const countEl = document.querySelector('#maint-count');
  if (!listEl || !countEl) return;
  const items = MOCK_DATA.maintenanceQueue;
  countEl.textContent = `${items.length} open`;
  listEl.innerHTML = items.map(item => `
    <button class="queue-row" data-maint="${item.id}">
      <span class="queue-meta"><strong>#${item.id}</strong><small>Suite ${item.suite} · ${item.title}</small></span>
      <span class="badge ${item.statusClass}">${item.status}</span>
      <i data-icon="chevron"></i>
    </button>`).join('');
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

  notifications: () => openModal('Notifications', '<p>No new notifications in this demo.</p><div class="dialog-info">Connect your notification service to show real-time alerts here.</div>'),
  profile: () => {
    const concierge = getCurrentConcierge();
    openModal(concierge?.name || 'Concierge', `<p>${concierge?.title || 'Concierge'}${concierge?.station ? ` · ${concierge.station}` : ''}<br>${MOCK_DATA.building.name}</p><div class="dialog-info">${concierge?.shift ? `Shift: ${concierge.shift} · ` : ''}Demo session</div>`);
  },

  'confirm-sign-out': () => { modal.close(); toast('Visitor signed out. Demo only \u2014 no record was saved.'); },

  help: () => openModal('Concierge help', '<p>This is the concierge dashboard demo. Visitor log, packages, and maintenance data are all sample data from <code>shared/mockdata.js</code>.</p><p>Connect your building\u2019s directory, parcel system, and maintenance platform to enable live data.</p><div class="dialog-info">For production, all data access must be enforced by your server.</div>')
};

/* ── Event delegation ─────────────────────────────────────── */
document.addEventListener('click', event => {
  const signOut = event.target.closest('[data-sign-out]');
  if (signOut) {
    const visitor = MOCK_DATA.visitors.find(v => v.id === signOut.dataset.signOut);
    if (visitor) {
      openModal('Sign out visitor', `<p>Mark <strong>${visitor.name}</strong> (guest of Suite ${visitor.suite}) as signed out?</p><div class="dialog-options"><button class="button full" data-action="confirm-sign-out">Confirm sign-out</button><button class="button outline full" data-action="close-modal">Cancel</button></div>`);
    }
    return;
  }

  const maint = event.target.closest('[data-maint]');
  if (maint) {
    const item = MOCK_DATA.maintenanceQueue.find(m => m.id === maint.dataset.maint);
    if (item) {
      openModal(item.title, `<div class="dialog-info">#${item.id} · Suite ${item.suite} · ${item.status}</div>${item.detail}<p class="muted">Demo data · Connect your maintenance system for live details.</p>`);
    }
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
