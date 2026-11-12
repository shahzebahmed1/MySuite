/* MySuite — Manager dashboard.
   Requires: shared/icons.js, shared/utils.js (loaded before this file via defer). */

renderIcons();

/* ── Occupancy grid ───────────────────────────────────────── */
(function buildOccupancyGrid() {
  const grid = document.querySelector('#occ-grid');
  if (!grid) return;
  const totalSuites = 136;
  const overdueSuites = [12, 43]; // demo suite indices that are overdue
  const vacantSuites  = [15, 28, 39, 55, 71, 82, 99, 114]; // demo vacant suite indices
  const html = Array.from({ length: totalSuites }, (_, i) => {
    let cls = 'occ-dot-cell';
    if (overdueSuites.includes(i)) cls += ' overdue-cell';
    else if (vacantSuites.includes(i)) cls += ' vacant';
    return `<span class="${cls}" title="Suite ${i + 1}"></span>`;
  }).join('');
  grid.innerHTML = html;
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
  profile: () => openModal('Sarah Wong', '<p>Property Manager<br>The Point on the Bow</p><div class="dialog-info">Admin access · Demo session</div>'),

  /* KPI tiles */
  'kpi-occupancy': () => openModal('Occupancy details', '<div class="dialog-info">128 of 136 suites occupied · 94% occupancy rate</div><p><strong>8 vacant suites</strong> — units 115, 228, 339, 455, 571, 682, 799, 1014.</p><p class="muted">Demo data · Connect your property management system for live occupancy figures.</p>'),
  'kpi-maintenance': () => openModal('Open maintenance', '<p>There are <strong>3 open maintenance requests</strong> across the building.</p><div class="dialog-options"><button class="button outline" data-action="maint-m4821">#M-4821 · Kitchen sink leak</button><button class="button outline" data-action="maint-m4820">#M-4820 · HVAC noise</button><button class="button outline" data-action="maint-m4819">#M-4819 · Door intercom</button></div>'),
  'kpi-fees': () => openModal('Overdue fees', '<div class="dialog-info">$14,200 outstanding · 2 suites</div><p><strong>Suite 312</strong> — $7,100 overdue since Oct 1, 2026.</p><p><strong>Suite 709</strong> — $7,100 overdue since Oct 1, 2026.</p><p>Follow-up notices sent Nov 1, 2026. No response on file.</p><p class="muted">Demo data · Connect your property management system for live financials.</p>'),

  /* Maintenance */
  'maint-m4821': () => openModal('Kitchen sink leak', '<div class="dialog-info">#M-4821 · Suite 1204 · In progress</div><p><strong>Nov 5</strong> · Reported by resident: Water leaking below kitchen sink.</p><p><strong>Nov 6</strong> · Assigned to Marcus Torres. Appointment pending confirmation.</p><p class="muted">Demo data · Connect your maintenance platform for live details.</p>'),
  'maint-m4820': () => openModal('HVAC noise', '<div class="dialog-info">#M-4820 · Suite 312 · Assigned</div><p><strong>Nov 8</strong> · Reported: Loud humming from HVAC unit overnight.</p><p><strong>Nov 9</strong> · Assigned to mechanical team. Inspection scheduled Nov 13.</p><p class="muted">Demo data · Connect your maintenance platform for live details.</p>'),
  'maint-m4819': () => openModal('Door intercom', '<div class="dialog-info">#M-4819 · Suite 709 · Pending</div><p><strong>Nov 10</strong> · Reported: Building entry intercom not ringing the suite.</p><p>No technician assigned yet. Awaiting manager review.</p><p class="muted">Demo data · Connect your maintenance platform for live details.</p>'),

  /* Financials */
  'view-financials': () => openModal('Financial report — Nov 2026', '<div class="dialog-info">Demo report · Not connected to a financial system</div><p><strong>Total expected:</strong> $84,320<br><strong>Collected:</strong> $81,600 (96.8%)<br><strong>Outstanding:</strong> $2,720<br><strong>Overdue (&gt;30 days):</strong> $14,200</p><p class="muted">Connect your accounting or property management platform to generate real reports.</p>'),

  /* Votes admin */
  'view-vote-results': () => openModal('Lobby refresh — results', '<div class="dialog-info">94 of 128 residents voted · 72% participation</div><p><strong>Warm natural finishes:</strong> 61 votes (65%)<br><strong>Contemporary neutral:</strong> 33 votes (35%)</p><p class="muted">Demo vote · No actual ballots have been cast.</p>'),
  'close-vote': () => openModal('Close vote', '<p>Are you sure you want to close the <strong>Lobby refresh</strong> vote?</p><p>Results will be locked and residents will no longer be able to vote.</p><div class="dialog-options"><button class="button" data-action="confirm-close-vote">Close the vote</button><button class="button outline" data-action="close-modal">Cancel</button></div>'),
  'confirm-close-vote': () => { modal.close(); toast('Demo vote closed. Connect your voting service to persist this change.'); },
  'create-vote': () => openModal('Create new vote', '<form id="vote-form"><label>Vote title<input name="title" placeholder="e.g. Rooftop garden proposal" required></label><label>Option A<input name="optionA" placeholder="e.g. Approve the project" required></label><label>Option B<input name="optionB" placeholder="e.g. Do not proceed" required></label><button class="button full">Create demo vote</button></form>'),

  help: () => openModal('Manager portal help', '<p>This is the management dashboard demo. All KPIs, financials, and maintenance data are sample data.</p><p>Connect your property management platform, accounting system, and maintenance service to enable live data.</p><div class="dialog-info">For production, all admin access must be enforced server-side.</div>')
};

/* ── Event delegation ─────────────────────────────────────── */
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.closest('.sidebar')) closeMenu();
  actions[button.dataset.action]?.();
});

/* ── Vote creation form ───────────────────────────────────── */
document.addEventListener('submit', event => {
  if (event.target.id === 'vote-form') {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    modal.close();
    toast(`Demo vote "${data.title}" created. Connect your voting service to publish it.`);
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
