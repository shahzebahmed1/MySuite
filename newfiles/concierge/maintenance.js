/* MySuite — Concierge maintenance: log panel + pending/history.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, maintenance-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeTab = 'awaiting';
let formWired = false;
const deskSearch = { awaiting: '', history: '' };
const deskPages = { awaiting: 1, history: 1 };
const deskPageSize = 5;

const maintenanceFormModal = document.querySelector('#maintenance-form-modal');

function openMaintenanceForm() {
  ensureFormMounted();
  resetForm();
  if (!maintenanceFormModal.open) maintenanceFormModal.showModal();
  document.querySelector('#mnt-location')?.focus();
}

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

function toDatetimeLocalValue(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function stampReportedTime() {
  const el = document.querySelector('#mnt-reported');
  if (el) el.value = toDatetimeLocalValue();
}

function wireFormHandlers() {
  if (formWired) return;
  const form = document.querySelector('#maintenance-form');
  if (!form) return;
  formWired = true;

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const message = document.querySelector('#maintenance-form-message');
    if (!String(data.suite || '').trim() || !String(data.title || '').trim() || !String(data.note || '').trim() || Number.isNaN(new Date(data.reportedAt).getTime())) {
      message.textContent = 'Enter a location, request title, reported time and description.';
      message.hidden = false;
      message.focus();
      return;
    }
    addMaintenance(data);
    maintenanceFormModal.close();
    resetForm();
    deskSearch.awaiting = '';
    deskPages.awaiting = 1;
    setTab('awaiting');
    toast('Maintenance request logged.');
  });
}

function ensureFormMounted() {
  const slot = document.querySelector('#maintenance-form-slot-modal');
  let form = document.querySelector('#maintenance-form');
  if (!form) {
    const template = document.querySelector('#maintenance-form-template');
    slot.appendChild(template.content.cloneNode(true));
    form = document.querySelector('#maintenance-form');
    formWired = false;
    wireFormHandlers();
    renderIcons(form);
  }
  return form;
}

function currentConciergeName() {
  return getCurrentConcierge()?.name || 'Concierge';
}

function resetForm() {
  const form = document.querySelector('#maintenance-form');
  if (!form) return;
  form.reset();
  const reportedBy = form.querySelector('input[name="reportedBy"]');
  if (reportedBy) reportedBy.value = currentConciergeName();
  stampReportedTime();
  document.querySelector('#maintenance-form-message').hidden = true;
}

function escapeMaintenanceHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function renderMaintenanceRecord(item) {
  const escape = escapeMaintenanceHtml;
  const complete = item.status !== 'pending';
  return `<tr data-maintenance-id="${escape(item.id)}">
    <td><strong class="portal-primary">${escape(item.suite)}</strong>${item.residentName ? `<span class="portal-secondary">${escape(item.residentName)}</span>` : ''}</td>
    <td><strong class="portal-primary">${escape(maintenanceSummary(item))}</strong>${item.note && item.note !== item.title ? `<details class="portal-details"><summary>Details</summary><p>${escape(item.note)}</p></details>` : ''}</td>
    <td>${escape(formatMaintenanceDateTime(item.reportedAt))}<span class="portal-secondary">Logged by ${escape(item.reportedBy || 'Concierge')}</span></td>
    <td>${complete ? `Completed<span class="portal-secondary">${escape(formatMaintenanceDateTime(item.completedAt))}</span><span class="portal-secondary">By ${escape(item.completedBy || 'Concierge')}</span>` : 'Pending'}</td>
    <td>${complete ? '<span class="portal-secondary">No actions</span>' : `<button type="button" class="desk-complete" data-complete-maint="${escape(item.id)}">Mark complete</button>`}</td>
  </tr>`;
}

function refreshTable() {
  const items = sortMaintenanceNewestFirst(getMaintenance());
  const pending = items.filter(item => item.status === 'pending');
  const history = items.filter(item => item.status !== 'pending');
  document.querySelector('#tab-pending').innerHTML = `Pending <span class="desk-count">${pending.length}</span>`;
  document.querySelector('#tab-history').textContent = 'History';
  const query = deskSearch[activeTab].trim().toLowerCase();
  const rows = (activeTab === 'history' ? history : pending).filter(item => !query || [item.suite, item.residentName, item.title, item.note, item.reportedBy].some(value => String(value || '').toLowerCase().includes(query)));
  const pageCount = Math.max(1, Math.ceil(rows.length / deskPageSize));
  deskPages[activeTab] = Math.min(Math.max(1, deskPages[activeTab]), pageCount);
  const page = deskPages[activeTab];
  const offset = (page - 1) * deskPageSize;
  document.querySelector('#maintenance-range').textContent = rows.length ? `Showing ${offset + 1}\u2013${Math.min(offset + deskPageSize, rows.length)} of ${rows.length}` : 'Showing 0 of 0';
  document.querySelector('#maintenance-page').innerHTML = Array.from({ length: pageCount }, (_, index) => `<option value="${index + 1}"${index + 1 === page ? ' selected' : ''}>Page ${index + 1} of ${pageCount}</option>`).join('');
  document.querySelector('#maintenance-previous').disabled = page <= 1;
  document.querySelector('#maintenance-next').disabled = page >= pageCount;
  const list = document.querySelector('#maintenance-list');
  list.innerHTML = rows.slice(offset, offset + deskPageSize).map(renderMaintenanceRecord).join('');
  renderIcons(list);
  const empty = document.querySelector('#maintenance-empty');
  empty.hidden = rows.length > 0;
  empty.textContent = query ? 'No requests match your search.' : activeTab === 'history' ? 'No completed requests yet.' : 'Nothing pending. Log a request when something needs attention.';
}

function setTab(tab) {
  if (!['awaiting', 'history'].includes(tab)) return;
  activeTab = tab;
  document.querySelectorAll('.pkg-tab').forEach(button => {
    const selected = button.dataset.tab === tab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#maintenance-panel').setAttribute('aria-labelledby', tab === 'awaiting' ? 'tab-pending' : 'tab-history');
  document.querySelector('#maintenance-search').value = deskSearch[tab];
  refreshTable();
}


document.querySelector('#maintenance-search').addEventListener('input', event => {
  deskSearch[activeTab] = event.target.value;
  deskPages[activeTab] = 1;
  refreshTable();
});
document.querySelector('#maintenance-page').addEventListener('change', event => {
  const page = Number(event.target.value);
  if (!Number.isInteger(page) || page < 1) return;
  deskPages[activeTab] = page;
  refreshTable();
});
for (const [id, offset] of [['maintenance-previous', -1], ['maintenance-next', 1]]) {
  document.querySelector(`#${id}`).addEventListener('click', () => { deskPages[activeTab] += offset; refreshTable(); });
}
document.querySelector('.pkg-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tab = event.key === 'Home' ? 'awaiting' : event.key === 'End' ? 'history' : activeTab === 'awaiting' ? 'history' : 'awaiting';
  setTab(tab);
  document.querySelector(`[data-tab="${tab}"]`).focus();
});
function findMaintenanceById(id) {
  return getMaintenance().find(m => m.id === id) || null;
}

function maintenanceConfirmLabel(item) {
  if (!item) return 'this request';
  return `${escapeMaintenanceHtml(item.suite)} &middot; ${escapeMaintenanceHtml(maintenanceSummary(item))}`;
}

function askCompleteConfirm(id) {
  const item = findMaintenanceById(id);
  if (!item || item.status !== 'pending') return;
  openModal(
    'Mark complete',
    `<p>Mark <strong>${maintenanceConfirmLabel(item)}</strong> as complete?</p>
     <div class="dialog-options">
       <button class="button full" data-action="confirm-complete" data-maint-id="${item.id}">Confirm complete</button>
       <button class="button outline full" data-action="close-modal">Cancel</button>
     </div>`
  );
}

ensureFormMounted();
resetForm();
setTab('awaiting');

document.addEventListener('click', event => {
  if (event.target.closest('[data-cancel-log]')) {
    resetForm();
    document.querySelector('#mnt-location')?.focus();
    return;
  }

  const tab = event.target.closest('.pkg-tab');
  if (tab) {
    setTab(tab.dataset.tab);
    return;
  }

  const complete = event.target.closest('[data-complete-maint]');
  if (complete) {
    askCompleteConfirm(complete.dataset.completeMaint);
    return;
  }

  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.closest('.sidebar')) closeMenu();
  const action = button.dataset.action;
  if (action === 'menu') {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  } else if (action === 'close-menu') {
    closeMenu();
  } else if (action === 'open-maintenance-form') {
    openMaintenanceForm();
  } else if (action === 'close-maintenance-form') {
    maintenanceFormModal.close();
  } else if (action === 'close-modal') {
    modal.close();
  } else if (action === 'confirm-complete') {
    const id = button.dataset.maintId;
    modal.close();
    markMaintenanceCompleted([id], currentConciergeName());
    refreshTable();
    toast('Maintenance request marked complete.');
  } else if (action === 'help') {
    openModal(
      'Maintenance help',
      '<p>Choose <strong>+ Log request</strong> for new issues from residents or the desk.</p><p>On each pending item, use <strong>Mark complete</strong>, then confirm in the dialog.</p>'
    );
  }
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

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

maintenanceFormModal.addEventListener('click', event => {
  if (event.target !== maintenanceFormModal) return;
  const bounds = maintenanceFormModal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) maintenanceFormModal.close();
});
