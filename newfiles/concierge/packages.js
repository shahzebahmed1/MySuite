/* MySuite — Concierge packages: log package dialog + pending/history table.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, packages-data.js */

renderIcons();
applyLoggedInUser('concierge');

let activeTab = 'awaiting';
let packageDate = '';
const packageDates = { awaiting: '', history: '' };
const pendingSort = { key: 'arrived', direction: 'descending' };
const packageSearch = { awaiting: '', history: '' };
const packagePages = { awaiting: 1, history: 1 };
const packagePageSize = 5;
let formWired = false;
const packageLogModal = document.querySelector('#package-log-modal');

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
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (!data.residentName) data.residentName = 'Unknown resident';
    const entry = addPackage(data);
    packagePages.awaiting = 1;
    packageSearch.awaiting = '';
    packageDates.awaiting = '';
    resetForm();
    packageLogModal.close();
    setTab('awaiting');
    toast(`Suite ${entry.suite} · ${entry.parcelType} logged.`);
  });
}

function ensureFormMounted() {
  const slot = document.querySelector('#form-slot-modal');
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

function openPackageLog() {
  document.querySelector('#activity-log-package-trigger').click();
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

function escapePackageHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function packageArrivalDate(pkg) {
  const date = new Date(pkg.receivedAt);
  if (Number.isNaN(date.getTime())) return '';
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function packageFilterDateLabel(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function syncPackageDateControls() {
  document.querySelector('#package-date-label').textContent = packageDate ? packageFilterDateLabel(packageDate) : 'Filter by Date';
  document.querySelector('#package-date-value').value = packageDate;
  const toggle = document.querySelector('#package-date-toggle');
  toggle.dataset.active = String(Boolean(packageDate));
  document.querySelector('#package-clear-date').hidden = !packageDate;
  toggle.title = packageDate ? `Arrival date: ${packageFilterDateLabel(packageDate)}` : 'Filter packages by arrival date';
}

function openPackageDatePicker() {
  const input = document.querySelector('#package-date-value');
  input.value = packageDate;
  try {
    if (typeof input.showPicker === 'function') { input.showPicker(); return; }
  } catch { /* Fall back to the browser's date input. */ }
  input.focus();
  input.click();
}

function applyPackageDate(value) {
  if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(`${value}T12:00:00`).getTime()))) return;
  packageDate = value;
  packageDates[activeTab] = value;
  packagePages[activeTab] = 1;
  refreshTable();
}

function shortPackageName(value) {
  const name = String(value || '').trim();
  if (!name || ['Unknown resident', 'Not recorded'].includes(name)) return name;
  const parts = name.split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${Array.from(parts[parts.length - 1])[0].toLocaleUpperCase()}.` : name;
}

function renderPackageEntryMenu(pkg) {
  const id = escapePackageHtml(pkg.id);
  const own = !pkg.deletionAudit && canManagePackageEntry(pkg);
  const canMove = !pkg.deletionAudit && canReturnPackageToPending(pkg);
  const history = `<button type="button" data-action="view-package-history" data-package-id="${id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v5l3 2"/></svg>Revision history</button>`;
  const edit = own ? `<button type="button" data-action="edit-package-entry" data-package-id="${id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 5 5-12 12H4v-5zm-1 1 5 5M3 22h18"/></svg>Edit entry</button>` : '';
  const move = canMove ? `<button type="button" data-action="move-package-pending" data-package-id="${id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4-6 6 6 6M3 10h11a6 6 0 0 1 0 12"/></svg>Move to pending</button>` : '';
  const remove = own ? `<button type="button" class="is-danger" data-action="delete-package-entry" data-package-id="${id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></svg>Delete entry</button>` : '';
  return `<div class="package-entry-menu">
    <button type="button" class="package-menu-toggle" data-package-menu-toggle aria-expanded="false" aria-label="Actions for package in Suite ${escapePackageHtml(pkg.suite)}"><span aria-hidden="true">&#8942;</span></button>
    <div class="package-menu-options" data-package-menu-options hidden role="group" aria-label="Package entry actions">${edit}${history}${move}${remove}</div>
  </div>`;
}

function getPackageAuditRecords() {
  const records = readSaved(PACKAGE_AUDIT_KEY, []);
  return (Array.isArray(records) ? records : []).filter(record => record && record.packageId && record.before && ['edit', 'delete', 'move-to-pending', 'restore', 'deliver', 'pickup'].includes(record.action));
}

function packageAuditChanges(record) {
  if (record.action === 'delete') {
    const previous = record.before?.status ? packageStatusLabel(record.before.status) : 'Unknown';
    return `<li>Package Status changed from ${escapePackageHtml(previous)} to Deleted.</li>`;
  }
  const fields = [
    ['status', 'Status'], ['suite', 'Suite'], ['residentName', 'Resident'], ['carrier', 'Carrier'],
    ['parcelType', 'Type'], ['trackingLast6', 'Tracking'], ['receivedAt', 'Arrival'],
    ['deliveredAt', 'Delivery time'], ['pickedUpBy', 'Picked up by'], ['pickupIdVerified', 'ID verified'], ['pickupIdType', 'ID type'], ['note', 'Notes']
  ];
  const escape = escapePackageHtml;
  return fields.filter(([field]) => !['move-to-pending', 'restore', 'deliver', 'pickup'].includes(record.action) || field === 'status' || (record.action === 'pickup' && ['pickedUpBy', 'pickupIdVerified', 'pickupIdType'].includes(field))).filter(([field]) => ['receivedAt', 'deliveredAt'].includes(field)
    ? !packageTimesMatchAtMinute(record.before?.[field], record.after?.[field])
    : String(record.before?.[field] || '') !== String(record.after?.[field] || '')).map(([field, label]) => {
    const format = value => field === 'pickupIdVerified' ? value === true ? 'Yes' : 'Not recorded' : value ? field === 'status' ? value === 'deleted' ? 'Deleted' : packageStatusLabel(value) : ['receivedAt', 'deliveredAt'].includes(field) ? formatDateTime(value) : String(value) : 'None';
    if (field === 'status') return `<li>Package Status changed from ${escape(format(record.before[field]))} to ${escape(format(record.after?.[field]))}.</li>`;
    return `<li><strong>${label}:</strong> ${escape(format(record.before[field]))} &rarr; ${escape(format(record.after?.[field]))}</li>`;
  }).join('') || '<li>No fields changed.</li>';
}

function renderPackageAudit(pkg, records) {
  const escape = escapePackageHtml;
  const revisions = records.filter(record => ['edit', 'delete', 'move-to-pending', 'restore', 'deliver', 'pickup'].includes(record.action));
  if (pkg.deletionAudit && !revisions.some(record => record.action === 'delete' && record.id === pkg.deletionAudit.id)) revisions.push(pkg.deletionAudit);
  revisions.reverse().sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  if (!revisions.length) return '<p class="package-history-empty">No revisions recorded for this package.</p>';
  return `<div class="package-audit package-revision-history"><div class="package-design-history">${revisions.map(record => `<section class="package-design-event"><ul>${packageAuditChanges(record)}</ul>${['edit', 'delete'].includes(record.action) || record.reason ? `<p class="package-audit-reason"><strong>Reason:</strong> ${escape((record.reason === 'Other' ? record.note : record.reason) || 'Not recorded')}</p>` : ''}${record.note && record.reason !== 'Other' ? `<p class="package-audit-explanation">${escape(record.note)}</p>` : ''}<div class="package-revision-attribution"><span>Revision By: ${escape(shortPackageName(record.actorName))}</span><time datetime="${escape(record.recordedAt)}">${escape(formatDateTime(record.recordedAt))}</time></div></section>`).join('')}</div></div>`;
}

function openPackageRevisionHistory(id) {
  closePackageEntryMenu(true);
  const records = getPackageAuditRecords().filter(record => record.packageId === id);
  let pkg = findPackageById(id);
  if (!pkg) {
    const deletion = records.filter(record => record.action === 'delete').sort((first, second) => new Date(second.recordedAt) - new Date(first.recordedAt))[0];
    if (deletion) pkg = { ...deletion.before, deletionAudit: deletion };
  }
  if (!pkg) { toast('This package is no longer available.'); return; }
  modal.classList.add('package-entry-dialog', 'package-revision-dialog');
  openModal('Revision history', `<p class="package-history-context">Suite ${escapePackageHtml(pkg.suite)} &middot; ${escapePackageHtml(pkg.residentName || 'Unknown resident')}</p>${renderPackageAudit(pkg, records)}`);
}

function renderTrackingRecord(pkg, auditRecords = []) {
  const escape = escapePackageHtml;
  const deleted = Boolean(pkg.deletionAudit);
  const date = new Date(pkg.receivedAt);
  const arrived = Number.isNaN(date.getTime()) ? 'Date unavailable'
    : `${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace('AM', 'a.m.').replace('PM', 'p.m.')}`;
  const carrier = pkg.carrier || 'Other';
  const completedAt = pkg.status === 'picked-up' ? pkg.pickedUpAt : pkg.deliveredAt;
  const completedLabel = pkg.status === 'picked-up' ? 'Picked up' : 'Delivered';
  const completionDate = completedAt ? new Date(completedAt) : null;
  const completionWhen = completionDate && !Number.isNaN(completionDate.getTime())
    ? `${completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at ${completionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace('AM', 'a.m.').replace('PM', 'p.m.')}`
    : 'Not recorded';
  const completedBy = pkg.status === 'picked-up' ? pkg.pickedUpBy : pkg.deliveredBy;
  const released = deleted ? '<span class="history-deleted-status">Deleted</span>'
    : ['delivered', 'picked-up'].includes(pkg.status)
      ? `${completionDate && !Number.isNaN(completionDate.getTime()) ? `<time datetime="${escape(completedAt)}">${escape(completionWhen)}</time>` : '<span class="history-release-date">Not recorded</span>'}<span class="pending-logged-by">${completedLabel} by ${escape(shortPackageName(completedBy || 'Not recorded'))}</span>`
      : escape(packageStatusLabel(pkg.status));
  const pickupMeta = pkg.status === 'picked-up' ? [
    pkg.pickedUpRecordedBy ? `Logged by ${shortPackageName(pkg.pickedUpRecordedBy)}` : '',
    pkg.pickupIdVerified === true ? pkg.pickupIdType ? `ID: ${pkg.pickupIdType}` : 'ID verified' : ''
  ].filter(Boolean).join(' \u00b7 ') : '';
  const tracking = pkg.trackingLast6 ? `<span class="pending-tracking">Tracking # ${escape(pkg.trackingLast6)}</span>` : '';
  const note = pkg.note ? `<p class="pending-package-note">${escape(pkg.note)}</p>` : '';
  const undo = deleted && canManagePackageEntry(pkg) ? `<button type="button" class="package-undo-delete" data-action="undo-delete-package" data-package-id="${escape(pkg.id)}" data-deletion-id="${escape(pkg.deletionAudit.id || '')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4-6 6 6 6M3 10h11a6 6 0 0 1 0 12"/></svg>Undo delete</button>` : '';
  return `<tr class="pending-package-row history-package-row${deleted ? ' is-deleted' : ''}" data-package-id="${escape(pkg.id)}">
    <td><strong class="pending-resident-name">${escape(pkg.residentName || 'Unknown resident')}</strong><span class="pending-suite">Suite ${escape(pkg.suite)}</span></td>
    <td><div class="pending-carrier"><span class="pending-carrier-logo"><img src="${escape(carrierLogoSrc(carrier))}" alt="" width="30" height="26"></span><div><strong>${escape(carrier)} &middot; ${escape(pkg.parcelType || 'Package')}</strong>${tracking}${note}</div></div></td>
    <td class="pending-arrived"><time datetime="${escape(pkg.receivedAt)}">${escape(arrived)}</time><span class="pending-logged-by">Logged by ${escape(shortPackageName(pkg.receivedBy || 'Concierge'))}</span></td>
    <td class="pending-arrived history-released">${released}${pickupMeta ? `<span class="pending-logged-by">${escape(pickupMeta)}</span>` : ''}</td>
    <td><div class="history-actions">${renderPackageEntryMenu(pkg)}${undo}</div></td>
  </tr>`;
}

function renderPendingPackage(pkg, auditRecords = []) {
  const escape = escapePackageHtml;
  const date = new Date(pkg.receivedAt);
  const arrived = Number.isNaN(date.getTime()) ? 'Date unavailable'
    : `${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace('AM', 'a.m.').replace('PM', 'p.m.')}`;
  const carrier = pkg.carrier || 'Other';
  const tracking = pkg.trackingLast6 ? `<span class="pending-tracking">Tracking # ${escape(pkg.trackingLast6)}</span>` : '';
  return `<tr class="pending-package-row" data-package-id="${escape(pkg.id)}">
    <td><strong class="pending-resident-name">${escape(pkg.residentName || 'Unknown resident')}</strong><span class="pending-suite">Suite ${escape(pkg.suite)}</span></td>
    <td><div class="pending-carrier"><span class="pending-carrier-logo"><img src="${escape(carrierLogoSrc(carrier))}" alt="" width="30" height="26"></span><div><strong>${escape(carrier)} &middot; ${escape(pkg.parcelType || 'Package')}</strong>${tracking}${pkg.note ? `<p class="pending-package-note">${escape(pkg.note)}</p>` : ''}</div></div></td>
    <td class="pending-arrived"><time datetime="${escape(pkg.receivedAt)}">${escape(arrived)}</time><span class="pending-logged-by">Logged by ${escape(shortPackageName(pkg.receivedBy || 'Concierge'))}</span></td>
    <td><div class="pending-actions"><button type="button" class="pending-release-inline" data-action="release-package" data-package-id="${escape(pkg.id)}">Release</button>${renderPackageEntryMenu(pkg)}</div></td>
  </tr>`;
}

function sortPendingPackages(packages) {
  const direction = pendingSort.direction === 'ascending' ? 1 : -1;
  return [...packages].sort((first, second) => {
    if (pendingSort.key === 'arrived') {
      const firstTime = new Date(first.receivedAt).getTime();
      const secondTime = new Date(second.receivedAt).getTime();
      if (!Number.isFinite(firstTime)) return Number.isFinite(secondTime) ? 1 : 0;
      if (!Number.isFinite(secondTime)) return -1;
      return (firstTime - secondTime) * direction;
    }
    const field = pendingSort.key === 'resident' ? 'residentName' : 'carrier';
    return String(first[field] || '').localeCompare(String(second[field] || ''), undefined, { numeric: true, sensitivity: 'base' }) * direction;
  });
}

function syncPendingSortControls() {
  document.querySelectorAll('[data-sort]').forEach(button => {
    const selected = button.dataset.sort === pendingSort.key;
    button.closest('th').setAttribute('aria-sort', selected ? pendingSort.direction : 'none');
    const next = selected && pendingSort.direction === 'ascending' ? 'descending' : 'ascending';
    button.setAttribute('aria-label', `Sort by ${button.dataset.sort === 'arrived' ? 'arrival date' : button.dataset.sort}, ${next}`);
  });
}

function updateTabCounts(pendingCount) {
  const pendingTab = document.querySelector('#tab-pending');
  const historyTab = document.querySelector('#tab-history');
  if (pendingTab) pendingTab.innerHTML = `Pending <span class="pkg-tab-count">${pendingCount}</span>`;
  if (historyTab) historyTab.textContent = 'History';
}

function refreshTable() {
  closePackageEntryMenu();
  syncPackageDateControls();
  const auditRecords = getPackageAuditRecords();
  const live = getPackages();
  updatePackageHeaderCount();
  const liveIds = new Set(live.map(pkg => pkg.id));
  const deletions = new Map();
  auditRecords.filter(record => record.action === 'delete' && !liveIds.has(record.packageId)).forEach(record => {
    const previous = deletions.get(record.packageId);
    if (!previous || new Date(record.recordedAt) >= new Date(previous.recordedAt)) deletions.set(record.packageId, record);
  });
  const packages = sortPackagesNewestFirst([...live, ...Array.from(deletions.values(), record => ({ ...record.before, deletionAudit: record }))]);
  const pending = packages.filter(pkg => pkg.status === 'pending' && !pkg.deletionAudit);
  const history = packages.filter(pkg => pkg.status !== 'pending' || pkg.deletionAudit);
  updateTabCounts(pending.length);
  const isHistory = activeTab === 'history';
  const source = isHistory ? history : sortPendingPackages(pending);
  syncPendingSortControls();
  const query = packageSearch[activeTab].trim().toLowerCase().replace(/^#/, '');
  const filtered = source.filter(pkg => {
    if (packageDate && packageArrivalDate(pkg) !== packageDate) return false;
    if (!query) return true;
    return [`Suite ${pkg.suite || ''}`, pkg.residentName || '', pkg.trackingLast6 || '', pkg.carrier || ''].join(' ').toLowerCase().includes(query);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / packagePageSize));
  packagePages[activeTab] = Math.max(1, Math.min(packagePages[activeTab], pageCount));
  const page = packagePages[activeTab];
  const offset = (page - 1) * packagePageSize;
  document.querySelector('#pending-panel').hidden = isHistory;
  document.querySelector('#history-panel').hidden = !isHistory;
  document.querySelector('#package-date-filter').hidden = false;
  const search = document.querySelector('#package-history-search');
  if (search.value !== packageSearch[activeTab]) search.value = packageSearch[activeTab];
  search.setAttribute('aria-controls', isHistory ? 'history-list' : 'pending-list');
  const deletedCount = filtered.filter(pkg => pkg.deletionAudit).length;
  document.querySelector('#package-range').textContent = (filtered.length ? `Showing ${offset + 1}\u2013${Math.min(offset + packagePageSize, filtered.length)} of ${filtered.length}` : 'Showing 0 of 0') + (deletedCount ? ` \u00b7 ${deletedCount} deleted` : '');
  document.querySelector('#package-page-select').innerHTML = Array.from({ length: pageCount }, (_, index) => `<option value="${index + 1}"${index + 1 === page ? ' selected' : ''}>Page ${index + 1} of ${pageCount}</option>`).join('');
  document.querySelector('[data-action="previous-package-page"]').disabled = page === 1;
  document.querySelector('[data-action="next-package-page"]').disabled = page === pageCount;
  const list = document.querySelector(isHistory ? '#history-list' : '#pending-list');
  const empty = document.querySelector(isHistory ? '#pkg-empty' : '#pending-empty');
  list.innerHTML = filtered.slice(offset, offset + packagePageSize).map(pkg => (isHistory ? renderTrackingRecord : renderPendingPackage)(pkg, auditRecords.filter(record => record.packageId === pkg.id))).join('');
  empty.hidden = filtered.length > 0;
  empty.textContent = query ? 'No packages match your search.' : packageDate ? `No packages arrived on ${packageFilterDateLabel(packageDate)}.` : isHistory ? 'No package history yet.' : 'Nothing pending. Log a package when one arrives.';
}

function setTab(tab) {
  activeTab = tab;
  packageDate = packageDates[tab] || '';
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
  return `Suite ${escapePackageHtml(pkg.suite)} &middot; ${escapePackageHtml(name)}`;
}

function askPackageRelease(id) {
  const pkg = findPackageById(id);
  if (!pkg || pkg.status !== 'pending') { toast('This package is no longer pending.'); return; }
  closePackageEntryMenu();
  modal.classList.add('package-entry-dialog', 'package-release-dialog');
  openModal('Release package', `<p>How is the package for <strong>${packageConfirmLabel(pkg)}</strong> being released?</p>
    <div class="package-release-options">
      <button type="button" class="package-release-choice" data-action="release-as-delivered" data-package-id="${escapePackageHtml(id)}"><strong>Delivered</strong><span>Delivered to the resident's suite.</span></button>
      <button type="button" class="package-release-choice" data-action="release-as-picked-up" data-package-id="${escapePackageHtml(id)}"><strong>Picked up</strong><span>Collected in person by a resident or their representative.</span></button>
    </div>
    <div class="package-release-footer"><button type="button" class="button outline" data-action="close-modal">Cancel</button></div>`);
}

function askDeliverConfirm(id) {
  const pkg = findPackageById(id);
  if (!pkg || pkg.status !== 'pending') return;
  openModal(
    'Confirm delivery',
    `<p>Mark <strong>${packageConfirmLabel(pkg)}</strong> as delivered by <strong>${escapePackageHtml(currentConciergeName())}</strong>?</p>
     <div class="dialog-options">
       <button class="button full" data-action="confirm-deliver" data-package-id="${escapePackageHtml(pkg.id)}">Confirm delivered</button>
       <button class="button outline full" data-action="close-modal">Cancel</button>
     </div>`
  );
}

function askPickupConfirm(id) {
  const pkg = findPackageById(id);
  if (!pkg || pkg.status !== 'pending') return;
  modal.classList.add('package-entry-dialog');
  openModal('Confirm pickup', `<form id="package-pickup-form" class="package-edit-form">
    <p class="package-edit-wide package-delete-summary">Record pickup for <strong>${packageConfirmLabel(pkg)}</strong>.</p>
    <label class="package-edit-wide">Picked up by<input name="pickedUpBy" maxlength="120" placeholder="Full name of the person collecting" required autocomplete="off"></label>
    <label class="package-id-type package-edit-wide">ID type verified (optional)
      <select name="idType"><option value="" selected>Not recorded</option>${PACKAGE_PICKUP_ID_TYPES.map(type => `<option value="${escapePackageHtml(type)}">${escapePackageHtml(type)}</option>`).join('')}</select>
    </label>
    <p id="package-pickup-error" class="package-edit-error package-edit-wide" role="alert" hidden></p>
    <div class="package-edit-actions package-edit-wide"><button type="button" class="button outline" data-action="close-modal">Cancel</button><button type="submit" class="button">Confirm pickup</button></div>
  </form>`);
  const form = document.querySelector('#package-pickup-form');
  const idTypeSelect = form.querySelector('[name="idType"]');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const name = String(fields.get('pickedUpBy') || '').trim();
    const idType = String(fields.get('idType') || '').trim();
    const idVerified = Boolean(idType);
    if (!name || name.length > 120) {
      const error = document.querySelector('#package-pickup-error');
      error.textContent = 'Enter the name of the person collecting the package.';
      error.hidden = false;
      return;
    }
    if (idVerified && !PACKAGE_PICKUP_ID_TYPES.includes(idType)) {
      const error = document.querySelector('#package-pickup-error');
      error.textContent = 'Choose the type of ID verified.';
      error.hidden = false;
      idTypeSelect.focus();
      return;
    }
    const result = releasePackagesWithActivity([{ id, method: 'picked-up', name, idType: idVerified ? idType : '' }]);
    if (result.error) {
      const error = document.querySelector('#package-pickup-error');
      error.textContent = result.error;
      error.hidden = false;
      return;
    }
    modal.close();
    refreshTable();
    toast('Package pickup recorded.');
  });
}

function packageReasonFields(pkg, action) {
  const options = PACKAGE_CHANGE_REASONS.map(reason => `<option value="${escapePackageHtml(reason)}">${escapePackageHtml(reason)}</option>`).join('');
  return `<fieldset class="package-change-reason package-edit-wide"><legend>Reason for ${action}</legend><label><span class="sr-only">Reason for ${action}</span><select name="changeReason" required><option value="" disabled selected>Choose a reason</option>${options}</select></label><label data-package-explanation><span data-package-explanation-label>Explanation (optional)</span><textarea name="changeNote" rows="2" maxlength="500" placeholder="Explain why this entry needs to change"></textarea></label></fieldset>`;
}

function bindPackageReasonRequirement(form) {
  const submit = form.querySelector('[data-package-submit]');
  const sync = () => {
    const value = form.querySelector('[name="changeReason"]')?.value || '';
    const other = value === 'Other';
    const note = form.querySelector('[name="changeNote"]');
    form.querySelector('[data-package-explanation-label]').textContent = other ? 'Explanation (required)' : 'Explanation (optional)';
    note.required = other;
    const explanation = note.value.trim();
    submit.disabled = !PACKAGE_CHANGE_REASONS.includes(value) || (other && !explanation) || explanation.length > 500;
  };
  form.addEventListener('input', sync);
  form.addEventListener('change', sync);
  sync();
}

function openPackageEditor(id) {
  const pkg = findPackageById(id);
  if (!pkg) { toast('This package no longer exists.'); return; }
  if (!canManagePackageEntry(pkg)) { toast('Sign in as concierge to edit packages.'); return; }
  const escape = escapePackageHtml;
  const options = (values, selected) => [...new Set([...values, selected].filter(Boolean))].map(value => `<option value="${escape(value)}"${value === selected ? ' selected' : ''}>${escape(value)}</option>`).join('');
  const arrivalValue = toDatetimeLocalValue(new Date(pkg.receivedAt));
  const deliveryValue = pkg.deliveredAt ? toDatetimeLocalValue(new Date(pkg.deliveredAt)) : '';
  const deliverySection = pkg.status === 'delivered' ? `<section class="package-edit-completion package-edit-wide"><h3>Delivery details</h3><p>Recorded by ${escape(shortPackageName(pkg.deliveredBy || 'Concierge'))}</p><label>Delivery date &amp; time<input type="datetime-local" name="deliveredAt" value="${escape(deliveryValue)}" required></label></section>` : '';
  modal.classList.add('package-entry-dialog');
  openModal('Edit package', `<form id="package-edit-form" class="package-edit-form">
    <div class="package-edit-wide package-edit-section-heading"><h3>Arrival details</h3><p>Logged by ${escape(shortPackageName(pkg.receivedBy || 'Concierge'))}</p></div>
    <label>Suite<input name="suite" value="${escape(pkg.suite)}" maxlength="20" required></label>
    <label>Resident name<input name="residentName" value="${escape(pkg.residentName)}" maxlength="120" required></label>
    <label>Carrier<select name="carrier" required>${options(['Amazon', 'UPS', 'FedEx', 'Canada Post', 'Other'], pkg.carrier || 'Other')}</select></label>
    <label>Type<select name="parcelType" required>${options(['Box', 'Package', 'Envelope'], pkg.parcelType || 'Package')}</select></label>
    <label>Tracking #<input name="trackingLast6" value="${escape(pkg.trackingLast6)}" pattern="[A-Za-z0-9]+" required></label>
    <label>Arrival date &amp; time<input type="datetime-local" name="arrivedAt" value="${escape(arrivalValue)}" required></label>
    <label class="package-edit-wide">Notes (optional)<textarea name="note" rows="2" maxlength="2000">${escape(pkg.note || '')}</textarea></label>
    ${deliverySection}
    ${pkg.status === 'picked-up' ? `<label class="package-edit-wide">Picked up by<input name="pickedUpBy" value="${escape(pkg.pickedUpBy || '')}" maxlength="120" required></label>` : ''}
    ${packageReasonFields(pkg, 'edit')}
    <p id="package-edit-error" class="package-edit-error package-edit-wide" role="alert" hidden></p>
    <div class="package-edit-actions package-edit-wide"><button type="button" class="button outline" data-action="close-modal">Cancel</button><button type="submit" class="button" data-package-submit disabled>Save</button></div>
  </form>`);
  const editForm = document.querySelector('#package-edit-form');
  bindPackageReasonRequirement(editForm);
  editForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    if (fields.arrivedAt === arrivalValue) delete fields.arrivedAt;
    if (fields.deliveredAt === deliveryValue) delete fields.deliveredAt;
    const result = updatePackageEntry(id, fields);
    if (result.error) {
      const error = document.querySelector('#package-edit-error');
      error.textContent = result.error;
      error.hidden = false;
      return;
    }
    modal.close();
    refreshTable();
    toast('Package updated.');
  });
}

function askDeletePackage(id) {
  const pkg = findPackageById(id);
  if (!pkg) { toast('This package no longer exists.'); return; }
  if (!canManagePackageEntry(pkg)) { toast('Sign in as concierge to delete packages.'); return; }
  modal.classList.add('package-entry-dialog');
  openModal('Delete package entry', `<form id="package-delete-form" class="package-edit-form package-delete-form"><p class="package-edit-wide package-delete-summary">Delete the package entry for <strong>${packageConfirmLabel(pkg)}</strong>?</p>${packageReasonFields(pkg, 'deletion')}<p id="package-delete-error" class="package-edit-error package-edit-wide" role="alert" hidden></p><div class="package-edit-actions package-edit-wide"><button type="button" class="button outline" data-action="close-modal">Cancel</button><button type="submit" class="button package-delete-confirm" data-package-submit disabled>Delete entry</button></div></form>`);
  const form = document.querySelector('#package-delete-form');
  bindPackageReasonRequirement(form);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    const current = findPackageById(id);
    const change = current ? packageChangeReason(current, fields) : { error: 'This package no longer exists.' };
    if (change.error || !current || !canManagePackageEntry(current) || !deletePackageEntry(id, fields)) {
      const error = document.querySelector('#package-delete-error');
      error.textContent = change.error || 'Unable to delete this package entry.';
      error.hidden = false;
      return;
    }
    modal.close();
    refreshTable();
    toast('Package entry deleted.');
  });
}

function askMovePackageToPending(id) {
  const pkg = findPackageById(id);
  if (!pkg || !['delivered', 'picked-up'].includes(pkg.status)) { toast('This package is no longer in History.'); return; }
  if (!canReturnPackageToPending(pkg)) { toast('Sign in as concierge to move packages to Pending.'); return; }
  openModal('Move to pending', `<p>Move the package for <strong>${packageConfirmLabel(pkg)}</strong> back to Pending? Its delivery or pickup details will be cleared.</p><div class="package-edit-actions"><button type="button" class="button outline" data-action="close-modal">Cancel</button><button type="button" class="button" data-action="confirm-move-package-pending" data-package-id="${escapePackageHtml(id)}">Move to pending</button></div>`);
}

let openPackageEntryMenu = null;
function closePackageEntryMenu(restoreFocus = false) {
  if (!openPackageEntryMenu) return;
  const { trigger, panel } = openPackageEntryMenu;
  panel.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  openPackageEntryMenu = null;
  if (restoreFocus && trigger.isConnected) trigger.focus();
}

ensureFormMounted();
resetForm();
setTab('awaiting');

document.querySelector('#package-history-search').addEventListener('input', event => {
  packageSearch[activeTab] = event.target.value;
  packagePages[activeTab] = 1;
  refreshTable();
});

document.querySelector('#package-page-select').addEventListener('change', event => {
  const page = Number(event.target.value);
  if (!Number.isInteger(page) || page < 1) return;
  packagePages[activeTab] = page;
  refreshTable();
  document.querySelector('#package-page-select').focus();
});
const packageDateInput = document.querySelector('#package-date-value');
packageDateInput.addEventListener('change', event => applyPackageDate(event.target.value));
if (typeof packageDateInput.showPicker !== 'function') {
  document.querySelector('.package-date-trigger').classList.add('uses-native-date-input');
  packageDateInput.tabIndex = 0;
  document.querySelector('#package-date-toggle').tabIndex = -1;
}

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
  } else if (action === 'open-package-log') {
    openPackageLog();
  } else if (action === 'close-package-log') {
    packageLogModal.close();
  } else if (action === 'close-modal') {
    modal.close();
  } else if (action === 'release-package') {
    askPackageRelease(button.dataset.packageId);
  } else if (action === 'release-as-delivered' || action === 'release-as-picked-up') {
    const pkg = findPackageById(button.dataset.packageId);
    if (!pkg || pkg.status !== 'pending') { modal.close(); toast('This package is no longer pending.'); return; }
    modal.classList.remove('package-release-dialog');
    if (action === 'release-as-delivered') askDeliverConfirm(pkg.id);
    else askPickupConfirm(pkg.id);
  } else if (action === 'sort-pending-packages') {
    const key = button.dataset.sort;
    if (!['resident', 'carrier', 'arrived'].includes(key)) return;
    pendingSort.direction = pendingSort.key === key && pendingSort.direction === 'ascending' ? 'descending' : 'ascending';
    pendingSort.key = key;
    packagePages.awaiting = 1;
    refreshTable();
  } else if (action === 'view-package-history') {
    openPackageRevisionHistory(button.dataset.packageId);
  } else if (action === 'edit-package-entry') {
    openPackageEditor(button.dataset.packageId);
  } else if (action === 'delete-package-entry') {
    askDeletePackage(button.dataset.packageId);
  } else if (action === 'undo-delete-package') {
    const restored = undoDeletePackage(button.dataset.packageId, button.dataset.deletionId);
    if (!restored) { toast('This package has already been restored or is no longer available.'); return; }
    setTab(restored.status === 'pending' ? 'awaiting' : 'history');
    toast(`Package restored to ${restored.status === 'pending' ? 'Pending' : 'History'}.`);
  } else if (action === 'move-package-pending') {
    askMovePackageToPending(button.dataset.packageId);
  } else if (action === 'confirm-move-package-pending') {
    const pkg = findPackageById(button.dataset.packageId);
    if (pkg && !canReturnPackageToPending(pkg)) { modal.close(); toast('Sign in as concierge to move packages to Pending.'); return; }
    const moved = movePackageToPending(button.dataset.packageId);
    modal.close();
    refreshTable();
    toast(moved ? 'Package moved to Pending.' : 'This package is no longer in History.');
  } else if (action === 'confirm-deliver') {
    const id = button.dataset.packageId;
    const result = releasePackagesWithActivity([{ id, method: 'delivered' }]);
    if (result.error) { toast(result.error); return; }
    modal.close();
    refreshTable();
    toast(`Package marked delivered by ${currentConciergeName()}.`);
  } else if (action === 'open-package-date') {
    openPackageDatePicker();
  } else if (action === 'clear-package-date') {
    applyPackageDate('');
    document.querySelector('#package-date-toggle').focus();
  } else if (action === 'previous-package-page' || action === 'next-package-page') {
    packagePages[activeTab] += action === 'next-package-page' ? 1 : -1;
    refreshTable();
  } else if (action === 'help') {
    openModal('Package tracking help', '<p>Use the <strong>Log a package</strong> button to record new arrivals.</p><p>Use <strong>Release package</strong> to choose Delivered or Picked up, then confirm the details. On other rows, <strong>Mark collected</strong> records a pickup.</p>');
  }
});

packageLogModal.addEventListener('click', event => {
  if (event.target !== packageLogModal) return;
  const bounds = packageLogModal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) packageLogModal.close();
});

modal.addEventListener('close', () => modal.classList.remove('package-entry-dialog', 'package-revision-dialog', 'package-release-dialog'));

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMenu();
  }
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

// Fixed-position menus stay visible outside the package list's scroll/clipping area.
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-package-menu-toggle]');
  if (trigger) {
    const same = openPackageEntryMenu?.trigger === trigger;
    closePackageEntryMenu();
    if (same) return;
    const panel = trigger.parentElement.querySelector('[data-package-menu-options]');
    if (!panel) return;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const rect = trigger.getBoundingClientRect();
    panel.style.left = `${Math.max(8, Math.min(rect.right - panel.offsetWidth, innerWidth - panel.offsetWidth - 8))}px`;
    panel.style.top = `${Math.max(8, rect.bottom + panel.offsetHeight + 5 <= innerHeight - 8 ? rect.bottom + 5 : rect.top - panel.offsetHeight - 5)}px`;
    openPackageEntryMenu = { trigger, panel };
    return;
  }
  if (!openPackageEntryMenu) return;
  if (event.target.closest('[data-action="edit-package-entry"], [data-action="delete-package-entry"], [data-action="move-package-pending"]') || !openPackageEntryMenu.panel.contains(event.target)) closePackageEntryMenu();
}, true);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && openPackageEntryMenu) { event.preventDefault(); closePackageEntryMenu(true); }
});
document.addEventListener('focusin', event => {
  if (openPackageEntryMenu && event.target !== openPackageEntryMenu.trigger && !openPackageEntryMenu.panel.contains(event.target)) closePackageEntryMenu();
});
window.addEventListener('resize', () => closePackageEntryMenu());
document.addEventListener('scroll', () => closePackageEntryMenu(), true);

function updatePackageHeaderCount() {
  const count = getPackages().filter(pkg => pkg.status === 'pending').length;
  document.querySelector('#package-header-pending-count').textContent = String(count);
  document.querySelector('#activity-release-trigger').setAttribute('aria-label', `Release Package, ${count} pending ${count === 1 ? 'package' : 'packages'}`);
}

initPackageReleaseDialog({
  onChange: updatePackageHeaderCount,
  onReleased: refreshTable,
  onStorage(event) {
    if ([PACKAGE_STORAGE_KEY, PACKAGE_AUDIT_KEY, null].includes(event.key)) refreshTable();
  }
});
initPackageLogDialog({
  onChange: updatePackageHeaderCount,
  onLogged() {
    packagePages.awaiting = 1;
    packageSearch.awaiting = '';
    packageDates.awaiting = '';
    setTab('awaiting');
  }
});
window.addEventListener('pageshow', updatePackageHeaderCount);

// Open the logging dialog for direct logging links.
const packageShortcutUrl = new URL(window.location.href);
if (packageShortcutUrl.searchParams.get('action') === 'log-package') {
  openPackageLog();
  packageShortcutUrl.searchParams.delete('action');
  window.history.replaceState(window.history.state, '', packageShortcutUrl.href);
}
