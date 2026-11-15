/* MySuite — Concierge maintenance: log panel + pending/history.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, maintenance-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeTab = 'awaiting';
let formWired = false;

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
    const data = Object.fromEntries(new FormData(form));
    const entry = addMaintenance(data);
    resetForm();
    refreshTable();
    toast(`${entry.suite} logged.`);
  });
}

function ensureFormMounted() {
  const slot = document.querySelector('#form-slot-panel');
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
}

function updateTabCounts(pendingCount, historyCount) {
  const pendingTab = document.querySelector('#tab-pending');
  const historyTab = document.querySelector('#tab-history');
  if (pendingTab) pendingTab.textContent = `Pending (${pendingCount})`;
  if (historyTab) historyTab.textContent = `History (${historyCount})`;
}

function refreshTable() {
  const items = sortMaintenanceNewestFirst(getMaintenance());
  const pending = items.filter(m => m.status === 'pending');
  const history = items.filter(m => m.status !== 'pending').slice(0, 20);
  const isHistory = activeTab === 'history';
  const pendingPanel = document.querySelector('#pending-panel');
  const historyPanel = document.querySelector('#history-panel');
  const pendingList = document.querySelector('#pending-list');
  const pendingEmpty = document.querySelector('#pending-empty');
  const tbody = document.querySelector('#mnt-tbody');
  const historyEmpty = document.querySelector('#mnt-empty');

  updateTabCounts(pending.length, history.length);

  if (pendingPanel) pendingPanel.hidden = isHistory;
  if (historyPanel) historyPanel.hidden = !isHistory;

  if (!isHistory) {
    if (pending.length === 0) {
      pendingList.innerHTML = '';
      pendingEmpty.hidden = false;
    } else {
      pendingEmpty.hidden = true;
      pendingList.innerHTML = pending.map(renderMaintenancePendingRow).join('');
    }
    return;
  }

  if (history.length === 0) {
    tbody.innerHTML = '';
    historyEmpty.hidden = false;
    return;
  }

  historyEmpty.hidden = true;
  tbody.innerHTML = history.map(renderMaintenanceHistoryRow).join('');
}

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.pkg-tab').forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', String(on));
  });
  refreshTable();
}

function findMaintenanceById(id) {
  return getMaintenance().find(m => m.id === id) || null;
}

function maintenanceConfirmLabel(item) {
  if (!item) return 'this request';
  return `${item.suite} · ${maintenanceSummary(item)}`;
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
      '<p>Use <strong>Log a request</strong> for new issues from residents or the desk.</p><p>On each pending item, use <strong>Mark complete</strong>, then confirm in the dialog.</p>'
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
