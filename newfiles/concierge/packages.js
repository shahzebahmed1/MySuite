/* MySuite — Concierge packages: always-on log panel + pending/history table.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, packages-data.js */

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

function stampArrivalTime() {
  const el = document.querySelector('#pkg-arrived');
  if (el) el.value = toDatetimeLocalValue();
}

function applySuiteLookup() {
  const suiteEl = document.querySelector('#pkg-suite');
  const nameInput = document.querySelector('#pkg-resident');
  const hint = document.querySelector('#suite-hint');
  if (!suiteEl || !nameInput || !hint) return;

  const suite = suiteEl.value.trim();
  const resident = findResidentBySuite(suite);

  if (!suite) {
    if (!nameInput.dataset.edited) nameInput.value = '';
    hint.textContent = '';
    hint.className = 'suite-hint is-muted';
    return;
  }

  if (!resident) {
    if (!nameInput.dataset.edited) nameInput.value = '';
    hint.textContent = '';
    hint.className = 'suite-hint is-muted';
    return;
  }

  if (!nameInput.dataset.edited) nameInput.value = resident.name;
  hint.textContent = '';
  hint.className = 'suite-hint is-muted';
}

function wireFormHandlers() {
  if (formWired) return;
  const form = document.querySelector('#package-form');
  if (!form) return;
  formWired = true;

  document.querySelector('#pkg-resident')?.addEventListener('input', () => {
    document.querySelector('#pkg-resident').dataset.edited = 'true';
  });
  document.querySelector('#pkg-suite')?.addEventListener('input', () => {
    delete document.querySelector('#pkg-resident').dataset.edited;
    applySuiteLookup();
  });
  document.querySelector('#pkg-suite')?.addEventListener('change', applySuiteLookup);

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.residentName) data.residentName = 'Unknown resident';
    const entry = addPackage(data);
    resetForm();
    refreshTable();
    toast(`Suite ${entry.suite} · ${entry.parcelType} logged.`);
  });
}

function ensureFormMounted() {
  const slot = document.querySelector('#form-slot-panel');
  let form = document.querySelector('#package-form');
  if (!form) {
    const template = document.querySelector('#package-form-template');
    slot.appendChild(template.content.cloneNode(true));
    form = document.querySelector('#package-form');
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
  const form = document.querySelector('#package-form');
  if (!form) return;
  form.reset();
  delete document.querySelector('#pkg-resident')?.dataset.edited;
  const received = form.querySelector('input[name="receivedBy"]');
  if (received) received.value = currentConciergeName();
  const parcelType = form.querySelector('select[name="parcelType"]');
  if (parcelType) parcelType.value = 'Package';
  stampArrivalTime();
  applySuiteLookup();
}

function updateTabCounts(pendingCount, historyCount) {
  const pendingTab = document.querySelector('#tab-pending');
  const historyTab = document.querySelector('#tab-history');
  if (pendingTab) pendingTab.textContent = `Pending (${pendingCount})`;
  if (historyTab) historyTab.textContent = `History (${historyCount})`;
}

function refreshTable() {
  const packages = sortPackagesNewestFirst(getPackages());
  const pending = packages.filter(p => p.status === 'pending');
  const history = packages.filter(p => p.status !== 'pending').slice(0, 20);
  const isHistory = activeTab === 'history';
  const pendingPanel = document.querySelector('#pending-panel');
  const historyPanel = document.querySelector('#history-panel');
  const pendingList = document.querySelector('#pending-list');
  const pendingEmpty = document.querySelector('#pending-empty');
  const tbody = document.querySelector('#pkg-tbody');
  const historyEmpty = document.querySelector('#pkg-empty');

  updateTabCounts(pending.length, history.length);

  if (pendingPanel) pendingPanel.hidden = isHistory;
  if (historyPanel) historyPanel.hidden = !isHistory;

  if (!isHistory) {
    if (pending.length === 0) {
      pendingList.innerHTML = '';
      pendingEmpty.hidden = false;
    } else {
      pendingEmpty.hidden = true;
      pendingList.innerHTML = pending.map(renderPendingRow).join('');
    }
    return;
  }

  if (history.length === 0) {
    tbody.innerHTML = '';
    historyEmpty.hidden = false;
    return;
  }

  historyEmpty.hidden = true;
  tbody.innerHTML = history.map(renderHistoryRow).join('');
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

function findPackageById(id) {
  return getPackages().find(p => p.id === id) || null;
}

function packageConfirmLabel(pkg) {
  if (!pkg) return 'this package';
  const name = pkg.residentName && pkg.residentName !== 'Unknown resident' ? pkg.residentName : 'Unknown resident';
  return `Suite ${pkg.suite} · ${name}`;
}

function askDeliverConfirm(id) {
  const pkg = findPackageById(id);
  if (!pkg || pkg.status !== 'pending') return;
  openModal(
    'Confirm delivery',
    `<p>Mark <strong>${packageConfirmLabel(pkg)}</strong> as delivered by <strong>${currentConciergeName()}</strong>?</p>
     <div class="dialog-options">
       <button class="button full" data-action="confirm-deliver" data-package-id="${pkg.id}">Confirm delivered</button>
       <button class="button outline full" data-action="close-modal">Cancel</button>
     </div>`
  );
}

function askPickupConfirm(id) {
  const pkg = findPackageById(id);
  if (!pkg || pkg.status !== 'pending') return;
  openModal(
    'Confirm pickup',
    `<p>Mark <strong>${packageConfirmLabel(pkg)}</strong> as picked up by the resident?</p>
     <div class="dialog-options">
       <button class="button full" data-action="confirm-pickup" data-package-id="${pkg.id}">Confirm picked up</button>
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
    document.querySelector('#pkg-suite')?.focus();
    return;
  }

  const tab = event.target.closest('.pkg-tab');
  if (tab) {
    setTab(tab.dataset.tab);
    return;
  }

  const deliver = event.target.closest('[data-deliver]');
  if (deliver) {
    askDeliverConfirm(deliver.dataset.deliver);
    return;
  }

  const pickup = event.target.closest('[data-pickup]');
  if (pickup) {
    askPickupConfirm(pickup.dataset.pickup);
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
  } else if (action === 'confirm-deliver') {
    const id = button.dataset.packageId;
    modal.close();
    markPackagesDelivered([id], currentConciergeName());
    refreshTable();
    toast(`Package marked delivered by ${currentConciergeName()}.`);
  } else if (action === 'confirm-pickup') {
    const id = button.dataset.packageId;
    modal.close();
    markPackagesPickedUp([id]);
    refreshTable();
    toast('Package marked as resident picked up.');
  } else if (action === 'help') {
    openModal('Package tracking help', '<p>Use the <strong>Log a package</strong> card for new arrivals.</p><p>On each pending package, use <strong>Delivered</strong> or <strong>Picked up</strong>, then confirm in the dialog.</p>');
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
