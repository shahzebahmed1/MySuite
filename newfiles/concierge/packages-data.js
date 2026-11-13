/* Concierge package log logic (localStorage).
   Requires: shared/utils.js, shared/mockdata.js (DEMO_RESIDENTS, PACKAGE_SEED, getCurrentConcierge). */

const PACKAGE_STORAGE_KEY = 'mysuite-concierge-packages-v4';

function findResidentBySuite(suite) {
  const key = String(suite || '').trim();
  return DEMO_RESIDENTS.find(r => r.suite === key) || null;
}

function getPackages() {
  const stored = readSaved(PACKAGE_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    save(PACKAGE_STORAGE_KEY, PACKAGE_SEED);
    return PACKAGE_SEED.map(p => ({ ...p }));
  }
  return stored;
}

function setPackages(list) {
  save(PACKAGE_STORAGE_KEY, list);
}

function sortPackagesNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
}

function formatPackageTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatPackageWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${date} · ${formatPackageTime(iso)}`;
  } catch {
    return '';
  }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return formatPackageWhen(iso) || '—';
}

function carrierLogoFile(carrier) {
  const map = {
    Amazon: 'amazon.svg',
    UPS: 'ups.svg',
    FedEx: 'fedex.svg',
    'Canada Post': 'canada-post.svg',
    Other: 'other.svg'
  };
  return map[carrier] || 'other.svg';
}

function carrierLogoSrc(carrier) {
  return `../assets/carriers/${carrierLogoFile(carrier || 'Other')}`;
}

function carrierLogoHtml(carrier) {
  const label = carrier || 'Other';
  return `<span class="carrier-cell"><img class="carrier-logo" src="${carrierLogoSrc(label)}" alt="" width="28" height="28">${label}</span>`;
}

function renderPendingRow(pkg) {
  const name = pkg.residentName && pkg.residentName !== 'Unknown resident' ? pkg.residentName : 'Unknown resident';
  const carrier = pkg.carrier || 'Other';
  const type = pkg.parcelType || 'Package';
  const meta = [formatDateTime(pkg.receivedAt), pkg.receivedBy].filter(Boolean).join(' · ');
  return `<article class="pending-row" data-package-id="${pkg.id}">
    <div class="pending-who">
      <strong>Suite ${pkg.suite}</strong>
      <span>${name}</span>
    </div>
    <div class="pending-detail">
      <span class="pending-logo-wrap">
        <img class="carrier-logo pending-logo" src="${carrierLogoSrc(carrier)}" alt="" width="36" height="36">
      </span>
      <div class="pending-detail-text">
        <strong>${carrier} · ${type}</strong>
        <span>${meta}</span>
      </div>
    </div>
    <div class="pending-actions">
      <button type="button" class="button compact" data-deliver="${pkg.id}">Delivered</button>
      <button type="button" class="button compact outline" data-pickup="${pkg.id}">Picked up</button>
    </div>
  </article>`;
}

function renderHistoryRow(pkg) {
  const name = pkg.residentName && pkg.residentName !== 'Unknown resident' ? pkg.residentName : 'Unknown resident';
  const loggedBy = pkg.receivedBy || '—';
  const arrival = formatDateTime(pkg.receivedAt);
  const completedAt = pkg.deliveredAt || pkg.pickedUpAt;
  const completedBy = pkg.status === 'picked-up'
    ? 'Resident'
    : (pkg.deliveredBy || '—');
  return `<tr data-package-id="${pkg.id}">
    <td class="suite-cell"><strong>${pkg.suite}</strong><span>${name}</span></td>
    <td>${carrierLogoHtml(pkg.carrier)}</td>
    <td>${arrival}</td>
    <td>${loggedBy}</td>
    <td>${formatDateTime(completedAt)}</td>
    <td>${completedBy}</td>
  </tr>`;
}

function parseArrivalInput(value) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function addPackage(fields) {
  const suite = String(fields.suite || '').trim();
  const resident = findResidentBySuite(suite);
  const concierge = getCurrentConcierge();
  const list = getPackages();
  const entry = {
    id: `pkg-${Date.now()}`,
    suite,
    residentName: (fields.residentName || resident?.name || 'Unknown resident').trim(),
    receivedBy: (fields.receivedBy || concierge?.name || 'Concierge').trim(),
    carrier: fields.carrier || 'Other',
    parcelType: fields.parcelType || 'Package',
    trackingLast6: String(fields.trackingLast6 || '').trim().slice(-6),
    note: (fields.note || '').trim(),
    status: 'pending',
    receivedAt: parseArrivalInput(fields.arrivedAt),
    deliveredBy: null,
    deliveredAt: null,
    pickedUpAt: null
  };
  list.push(entry);
  setPackages(list);
  return entry;
}

function markPackagesDelivered(ids, by = getCurrentConcierge()?.name || 'Concierge') {
  const idSet = new Set((ids || []).map(String));
  if (idSet.size === 0) return [];
  const now = new Date().toISOString();
  const delivered = [];
  const list = getPackages().map(p => {
    if (!idSet.has(p.id) || p.status !== 'pending') return p;
    const next = {
      ...p,
      status: 'delivered',
      deliveredAt: now,
      deliveredBy: by,
      pickedUpAt: null
    };
    delivered.push(next);
    return next;
  });
  setPackages(list);
  return delivered;
}

function markPackagesPickedUp(ids) {
  const idSet = new Set((ids || []).map(String));
  if (idSet.size === 0) return [];
  const now = new Date().toISOString();
  const picked = [];
  const list = getPackages().map(p => {
    if (!idSet.has(p.id) || p.status !== 'pending') return p;
    const next = {
      ...p,
      status: 'picked-up',
      pickedUpAt: now,
      deliveredAt: null,
      deliveredBy: null
    };
    picked.push(next);
    return next;
  });
  setPackages(list);
  return picked;
}

function packageStatusLabel(status) {
  if (status === 'delivered') return 'Delivered';
  if (status === 'picked-up') return 'Picked up';
  if (status === 'pending') return 'Pending';
  return status || 'Pending';
}

function packageStatusClass(status) {
  if (status === 'pending') return 'status';
  return 'assigned-badge';
}

function countPending(list) {
  return list.filter(p => p.status === 'pending').length;
}

function renderPackageRow(pkg) {
  /* Compact row for the home dashboard card */
  const tracking = pkg.trackingLast6 ? ` · #…${pkg.trackingLast6}` : '';
  const who = pkg.residentName && pkg.residentName !== 'Unknown resident' ? ` · ${pkg.residentName}` : '';
  return `<div class="package-row" data-package-id="${pkg.id}">
    <span class="tile-icon"><i data-icon="package"></i></span>
    <span class="package-info">
      <strong>Suite ${pkg.suite}${who}</strong>
      <small>${pkg.parcelType || 'Package'} · ${pkg.carrier}${tracking}</small>
      <small>In ${formatPackageTime(pkg.receivedAt)}</small>
    </span>
    <span class="badge ${packageStatusClass(pkg.status)}">${packageStatusLabel(pkg.status)}</span>
  </div>`;
}
