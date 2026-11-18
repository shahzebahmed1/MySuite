/* MySuite — Technician dashboard.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js */

renderIcons();
applyLoggedInUser('technician');

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

const actions = {
  menu() {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  },
  'close-menu': closeMenu,
  'close-modal': () => modal.close(),

  notifications: () => openModal('Notifications', '<p>Intercom board for #M-4819 is still on order (ETA Friday).</p>'),
  profile: () => {
    const account = getSessionAccount('technician');
    openModal(account?.name || 'Technician', `<p>${account?.title || 'Building Technician'}<br>${MOCK_DATA.building.name}</p><div class="dialog-info">${account?.shift ? `Shift: ${account.shift} · ` : ''}Technician portal</div>`);
  },

  'job-m4821': () => openModal('Kitchen sink leak', '<div class="dialog-info">#M-4821 · Suite 1204 · In progress</div><p><strong>Issue:</strong> Water leaking from the pipe below the kitchen sink.</p><p><strong>Access:</strong> Resident home after 1:00 PM.</p><p><strong>Plan:</strong> Replace 1/2&quot; compression fitting. Part checked out.</p><div class="dialog-options"><button class="button" data-action="complete-job">Mark complete</button><button class="button outline" data-action="close-modal">Keep working</button></div>'),
  'job-m4820': () => openModal('HVAC noise', '<div class="dialog-info">#M-4820 · Suite 312 · Assigned</div><p><strong>Issue:</strong> Loud humming from HVAC unit overnight.</p><p><strong>Scheduled:</strong> Inspection Nov 13.</p><p><strong>Notes:</strong> Check blower motor and filter. MERV-13 filter available in mechanical room.</p>'),
  'job-m4819': () => openModal('Door intercom', '<div class="dialog-info">#M-4819 · Suite 709 · Pending parts</div><p><strong>Issue:</strong> Building entry intercom not ringing the suite.</p><p><strong>Blocker:</strong> Handset board on order · ETA Friday.</p>'),

  'complete-job': () => openModal('Complete work order', '<p>Mark <strong>#M-4821 — Kitchen sink leak</strong> as complete?</p><p>This will notify the resident and update the manager overview in a real system.</p><div class="dialog-options"><button class="button" data-action="confirm-complete">Confirm complete</button><button class="button outline" data-action="close-modal">Cancel</button></div>'),
  'confirm-complete': () => { modal.close(); toast('Work order completion confirmed.'); },

  'systems-detail': () => openModal('Building systems log', '<div class="dialog-info">Building systems overview</div><p><strong>HVAC tower A</strong> — Normal<br><strong>Elevators 1–3</strong> — In service<br><strong>Booster pumps</strong> — Within range<br><strong>Parking exhaust</strong> — Vibration advisory (inspect this week)</p>'),

  help: () => openModal('Technician help', '<p>Review work orders, parts, and building system status from this dashboard.</p>')
};

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.closest('.sidebar')) closeMenu();
  actions[button.dataset.action]?.();
});

document.addEventListener('submit', event => {
  if (event.target.id === 'tech-note-form') {
    event.preventDefault();
    const note = document.querySelector('#tech-note-input').value.trim();
    const manager = getSessionAccount('manager');
    openModal('Send note to manager', `<p>Send this handoff to ${manager?.name || 'the manager'}?</p><blockquote style="border-left:3px solid var(--caramel);margin:14px 0;padding:10px 14px;font-size:13px;color:#5a4232;background:#f8f1e8;border-radius:0 8px 8px 0">${note}</blockquote><button class="button full" data-action="confirm-note">Send note</button>`);
  }
});

actions['confirm-note'] = () => {
  const input = document.querySelector('#tech-note-input');
  if (input) input.value = '';
  modal.close();
  toast('Note prepared.');
};

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

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
