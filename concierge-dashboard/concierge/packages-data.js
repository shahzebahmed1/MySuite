/* Concierge package log logic (localStorage).
   Requires: shared/utils.js, shared/mockdata.js (DEMO_RESIDENTS, PACKAGE_SEED, getCurrentConcierge). */

const PACKAGE_STORAGE_KEY = 'mysuite-concierge-packages-v4';
const PACKAGE_PICKUP_ID_TYPES = ["Driver's licence", 'Provincial photo ID', 'Passport', 'Other photo ID'];

function findResidentBySuite(suite) {
  const key = String(suite || '').trim();
  return DEMO_RESIDENTS.find(r => r.suite === key) || null;
}

const PACKAGE_HISTORY_EXAMPLES = [
  {
    "id": "pkg-history-example-1",
    "suite": "204",
    "residentName": "David Chen",
    "carrier": "UPS",
    "parcelType": "Box",
    "trackingLast6": "785142",
    "receivedAt": "2026-11-17T09:15:00",
    "receivedBy": "Shahzeb",
    "status": "picked-up",
    "deliveredAt": null,
    "deliveredBy": null,
    "pickedUpAt": "2026-11-17T18:25:00",
    "note": ""
  },
  {
    "id": "pkg-history-example-2",
    "suite": "312",
    "residentName": "Priya Nair",
    "carrier": "FedEx",
    "parcelType": "Envelope",
    "trackingLast6": "234901",
    "receivedAt": "2026-11-17T10:30:00",
    "receivedBy": "Aisha Lawal",
    "status": "delivered",
    "deliveredAt": "2026-11-17T12:45:00",
    "deliveredBy": "Aisha Lawal",
    "pickedUpAt": null,
    "note": ""
  },
  {
    "id": "pkg-history-example-3",
    "suite": "803",
    "residentName": "Yuki Tanaka",
    "carrier": "Amazon",
    "parcelType": "Package",
    "trackingLast6": "920477",
    "receivedAt": "2026-11-16T13:10:00",
    "receivedBy": "Jordan Kim",
    "status": "picked-up",
    "deliveredAt": null,
    "deliveredBy": null,
    "pickedUpAt": "2026-11-16T17:40:00",
    "note": ""
  },
  {
    "id": "pkg-history-example-4",
    "suite": "1108",
    "residentName": "Fatima Al-Rashid",
    "carrier": "Canada Post",
    "parcelType": "Box",
    "trackingLast6": "661820",
    "receivedAt": "2026-11-16T11:20:00",
    "receivedBy": "Shahzeb",
    "status": "delivered",
    "deliveredAt": "2026-11-16T14:05:00",
    "deliveredBy": "Shahzeb",
    "pickedUpAt": null,
    "note": ""
  },
  {
    "id": "pkg-history-example-5",
    "suite": "402",
    "residentName": "James Okafor",
    "carrier": "UPS",
    "parcelType": "Package",
    "trackingLast6": "108645",
    "receivedAt": "2026-11-15T08:55:00",
    "receivedBy": "Alsina Butt",
    "status": "picked-up",
    "deliveredAt": null,
    "deliveredBy": null,
    "pickedUpAt": "2026-11-15T19:10:00",
    "note": ""
  },
  {
    "id": "pkg-history-example-6",
    "suite": "709",
    "residentName": "Marcus Webb",
    "carrier": "FedEx",
    "parcelType": "Box",
    "trackingLast6": "872113",
    "receivedAt": "2026-11-15T15:05:00",
    "receivedBy": "Aisha Lawal",
    "status": "delivered",
    "deliveredAt": "2026-11-15T16:30:00",
    "deliveredBy": "Jordan Kim",
    "pickedUpAt": null,
    "note": ""
  },
  {
    "id": "pkg-history-example-7",
    "suite": "1204",
    "residentName": "Alex Morgan",
    "carrier": "Amazon",
    "parcelType": "Box",
    "trackingLast6": "440782",
    "receivedAt": "2026-11-14T12:35:00",
    "receivedBy": "Jordan Kim",
    "status": "picked-up",
    "deliveredAt": null,
    "deliveredBy": null,
    "pickedUpAt": "2026-11-14T20:15:00",
    "note": ""
  },
  {
    "id": "pkg-history-example-8",
    "suite": "101",
    "residentName": "Maria Santos",
    "carrier": "Canada Post",
    "parcelType": "Envelope",
    "trackingLast6": "317560",
    "receivedAt": "2026-11-14T09:40:00",
    "receivedBy": "Alsina Butt",
    "status": "delivered",
    "deliveredAt": "2026-11-14T11:25:00",
    "deliveredBy": "Alsina Butt",
    "pickedUpAt": null,
    "note": ""
  },
  {
    "id": "pkg-history-example-9",
    "suite": "501",
    "residentName": "Emily Larsson",
    "carrier": "Other",
    "parcelType": "Package",
    "trackingLast6": "095624",
    "receivedAt": "2026-11-13T16:50:00",
    "receivedBy": "Shahzeb",
    "status": "picked-up",
    "deliveredAt": null,
    "deliveredBy": null,
    "pickedUpAt": "2026-11-14T08:20:00",
    "note": "Oversized package stored beside the mail room shelving."
  },
  {
    "id": "pkg-history-example-10",
    "suite": "204",
    "residentName": "David Chen",
    "carrier": "Amazon",
    "parcelType": "Envelope",
    "trackingLast6": "563209",
    "receivedAt": "2026-11-12T14:15:00",
    "receivedBy": "Jordan Kim",
    "status": "picked-up",
    "deliveredAt": null,
    "deliveredBy": null,
    "pickedUpAt": "2026-11-12T18:55:00",
    "note": ""
  }
];

const PACKAGE_SAMPLE_PICKUP_RECORDERS = {
  'pkg-history-example-1': { name: 'Aisha Lawal', id: 'acct-concierge-aisha' },
  'pkg-history-example-3': { name: 'Shahzeb', id: 'acct-concierge-shahzeb' },
  'pkg-history-example-5': { name: 'Jordan Kim', id: 'acct-concierge-jordan' },
  'pkg-history-example-7': { name: 'Shahzeb', id: 'acct-concierge-shahzeb' },
  'pkg-history-example-9': { name: 'Shahzeb', id: 'acct-concierge-shahzeb' },
  'pkg-history-example-10': { name: 'Aisha Lawal', id: 'acct-concierge-aisha' }
};

function withPackageSamplePickupRecorder(pkg) {
  const recorder = PACKAGE_SAMPLE_PICKUP_RECORDERS[pkg.id];
  if (pkg.status !== 'picked-up' || pkg.pickedUpRecordedBy || pkg.pickedUpRecordedById || !recorder) return pkg;
  return { ...pkg, pickedUpRecordedBy: recorder.name, pickedUpRecordedById: recorder.id };
}

// Fictional carrier-style tracking numbers for the existing demo packages.
const PACKAGE_SAMPLE_TRACKING = {
  'pkg-history-example-1': { previous: '785142', number: '1Z8R20450321785142' },
  'pkg-history-example-2': { previous: '234901', number: '794612234901' },
  'pkg-history-example-3': { previous: '920477', number: 'TBC203648920477' },
  'pkg-history-example-4': { previous: '661820', number: '1028347500661820' },
  'pkg-history-example-5': { previous: '108645', number: '1Z6V70980345108645' },
  'pkg-history-example-6': { previous: '872113', number: '782965872113' },
  'pkg-history-example-7': { previous: '440782', number: 'TBC207315440782' },
  'pkg-history-example-8': { previous: '317560', number: '1028476300317560' },
  'pkg-history-example-9': { previous: '095624', number: '84620173095624' },
  'pkg-history-example-10': { previous: '563209', number: 'TBC209482563209' },
  'pkg-pending-shahzeb-example': { previous: '620153', number: '1Z4X18320378620153' },
  'pkg-permission-other-delivery': { previous: '754920', number: '1Z9A63750382754920' },
  'pkg-permission-own-delivery': { previous: '286431', number: '794638286431' },
};

function getPackages() {
  const stored = readSaved(PACKAGE_STORAGE_KEY, null);
  const needsSeed = !Array.isArray(stored);
  const source = needsSeed ? PACKAGE_SEED : stored;
  let changed = false;
  const packages = source.map(pkg => {
    const placeholder = pkg.note === 'Suite not in demo directory';
    const sampleNote = pkg.id === 'pkg-history-example-4' && pkg.note === 'Fragile item kept on the lower shelf.';
    let next = placeholder || sampleNote ? { ...pkg, note: '' } : needsSeed ? { ...pkg } : pkg;
    if (placeholder || sampleNote) changed = true;
    const attributed = withPackageSamplePickupRecorder(next);
    if (attributed !== next) changed = true;
    return attributed;
  });
  const examplesKey = 'mysuite-concierge-package-history-examples-v1';
  const needsExamples = !readSaved(examplesKey, false);
  if (needsExamples) {
    const ids = new Set(packages.map(pkg => pkg.id));
    const extra = PACKAGE_HISTORY_EXAMPLES.filter(pkg => !ids.has(pkg.id));
    if (extra.length) { packages.push(...extra.map(pkg => withPackageSamplePickupRecorder({ ...pkg }))); changed = true; }
  }
  const ownExampleKey = 'mysuite-concierge-pending-shahzeb-example-v1';
  const needsOwnExample = !readSaved(ownExampleKey, false);
  if (needsOwnExample && !packages.some(pkg => pkg.id === 'pkg-pending-shahzeb-example')) {
    packages.push({
      id: 'pkg-pending-shahzeb-example', suite: '501', residentName: 'Emily Larsson',
      receivedBy: 'Shahzeb', receivedById: 'acct-concierge-shahzeb',
      carrier: 'UPS', parcelType: 'Box', trackingLast6: '620153', note: '',
      status: 'pending', receivedAt: '2026-11-18T10:20:00',
      deliveredAt: null, deliveredBy: null, pickedUpAt: null
    });
    changed = true;
  }
  const permissionExamplesKey = 'mysuite-concierge-package-permission-examples-v1';
  const needsPermissionExamples = !readSaved(permissionExamplesKey, false);
  if (needsPermissionExamples) {
    const examples = [
      {
        id: 'pkg-permission-other-delivery', suite: '1204', residentName: 'Alex Morgan',
        receivedBy: 'Shahzeb', receivedById: 'acct-concierge-shahzeb',
        carrier: 'UPS', parcelType: 'Box', trackingLast6: '754920', note: '',
        receivedAt: '2026-11-18T09:15:00', status: 'delivered',
        deliveredAt: '2026-11-18T10:15:00', deliveredBy: 'Aisha Lawal',
        deliveredById: 'acct-concierge-aisha', pickedUpAt: null
      },
      {
        id: 'pkg-permission-own-delivery', suite: '501', residentName: 'Emily Larsson',
        receivedBy: 'Shahzeb', receivedById: 'acct-concierge-shahzeb',
        carrier: 'FedEx', parcelType: 'Envelope', trackingLast6: '286431', note: '',
        receivedAt: '2026-11-18T08:45:00', status: 'delivered',
        deliveredAt: '2026-11-18T09:40:00', deliveredBy: 'Shahzeb',
        deliveredById: 'acct-concierge-shahzeb', pickedUpAt: null
      }
    ];
    const ids = new Set(packages.map(pkg => pkg.id));
    const extra = examples.filter(pkg => !ids.has(pkg.id));
    if (extra.length) { packages.push(...extra); changed = true; }
  }
  packages.forEach((pkg, index) => {
    const sample = PACKAGE_SAMPLE_TRACKING[pkg.id];
    if (sample && pkg.trackingLast6 === sample.previous) {
      packages[index] = { ...pkg, trackingLast6: sample.number };
      changed = true;
    }
  });
  if (needsSeed || changed) save(PACKAGE_STORAGE_KEY, packages);
  if (needsExamples) save(examplesKey, true);
  if (needsOwnExample) save(ownExampleKey, true);
  if (needsPermissionExamples) save(permissionExamplesKey, true);
  return packages;
}

function setPackages(list) {
  save(PACKAGE_STORAGE_KEY, list);
}

function canManagePackageEntry(pkg, account = getCurrentConcierge()) {
  return Boolean(pkg && account?.id && account.role === 'concierge');
}

function canManagePackageDelivery(pkg, account = getCurrentConcierge()) {
  return pkg?.status === 'delivered' && canManagePackageEntry(pkg, account);
}

function canManagePackagePickup(pkg, account = getCurrentConcierge()) {
  return pkg?.status === 'picked-up' && canManagePackageEntry(pkg, account);
}

function canReturnPackageToPending(pkg, account = getCurrentConcierge()) {
  return canManagePackageDelivery(pkg, account) || canManagePackagePickup(pkg, account);
}

const PACKAGE_CHANGE_REASONS = ['Duplicate entry', 'Wrong suite', 'Logged in error', 'Other'];
const PACKAGE_AUDIT_KEY = 'mysuite-concierge-package-audit-v1';

function packageChangeReason(pkg, fields = {}) {
  const reason = String(fields.changeReason || '').trim();
  const note = String(fields.changeNote || '').trim();
  const completed = ['delivered', 'picked-up'].includes(pkg.status);
  if (!PACKAGE_CHANGE_REASONS.includes(reason)) return { error: 'Choose a reason for this change.' };
  if (reason === 'Other' && !note) return { error: 'Provide an explanation for this change.' };
  if (note.length > 500) return { error: 'Keep the reason note to 500 characters or fewer.' };
  return { completed, reason, note };
}

function recordPackageChange(action, before, after, change) {
  const stored = readSaved(PACKAGE_AUDIT_KEY, []);
  const records = Array.isArray(stored) ? stored : [];
  const actor = getCurrentConcierge();
  records.push({
    id: `package-change-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    packageId: before.id, action, reason: change.reason, note: change.note,
    actorId: actor?.id || null, actorName: actor?.name || 'Concierge',
    recordedAt: new Date().toISOString(),
    before: JSON.parse(JSON.stringify(before)), after: after ? JSON.parse(JSON.stringify(after)) : null
  });
  save(PACKAGE_AUDIT_KEY, records);
}

function packageTimesMatchAtMinute(first, second) {
  const firstMs = new Date(first).getTime();
  const secondMs = new Date(second).getTime();
  return Number.isFinite(firstMs) && Number.isFinite(secondMs)
    ? Math.floor(firstMs / 60000) === Math.floor(secondMs / 60000)
    : String(first || '') === String(second || '');
}

function preparePackageEntryUpdate(current, fields) {
  if (!canManagePackageEntry(current)) return { error: 'Sign in as concierge to edit packages.' };
  const suite = String(fields.suite || '').trim();
  const residentName = String(fields.residentName || '').trim();
  const trackingLast6 = String(fields.trackingLast6 || '').trim();
  const arrival = new Date(fields.arrivedAt ?? current.receivedAt);
  if (!suite || !residentName) return { error: 'Enter a suite and resident name.' };
  if (!/^[A-Za-z0-9]+$/.test(trackingLast6)) return { error: 'Enter a tracking number using letters and digits.' };
  if (Number.isNaN(arrival.getTime())) return { error: 'Choose a valid arrival date and time.' };
  let deliveredAt = current.deliveredAt;
  if (Object.hasOwn(fields, 'deliveredAt')) {
    if (!canManagePackageDelivery(current)) return { error: 'Delivery details are only available for delivered packages.' };
    const delivery = new Date(fields.deliveredAt);
    if (Number.isNaN(delivery.getTime())) return { error: 'Choose a valid delivery date and time.' };
    deliveredAt = packageTimesMatchAtMinute(delivery, current.deliveredAt) ? current.deliveredAt : delivery.toISOString();
  }
  const collector = String(fields.pickedUpBy ?? current.pickedUpBy ?? '').trim();
  if (current.status === 'picked-up' && (!collector || collector.length > 120)) return { error: 'Enter the name of the person who picked up the package.' };
  const completedAt = current.status === 'picked-up' ? current.pickedUpAt : deliveredAt;
  if (completedAt && arrival.getTime() > new Date(completedAt).getTime()) return { error: 'Arrival must be before the delivery or pickup time.' };
  const next = {
    ...current, suite, residentName, trackingLast6,
    carrier: String(fields.carrier || current.carrier || 'Other').trim(),
    parcelType: String(fields.parcelType || current.parcelType || 'Package').trim(),
    receivedAt: packageTimesMatchAtMinute(arrival, current.receivedAt) ? current.receivedAt : arrival.toISOString(), note: String(fields.note || '').trim(),
    ...(current.status === 'picked-up' ? { pickedUpBy: collector, ...(collector !== String(current.pickedUpBy || '').trim() ? { pickupIdVerified: null, pickupIdType: null } : {}) } : {}),
    ...(Object.hasOwn(fields, 'deliveredAt') ? { deliveredAt } : {})
  };
  return { package: next };
}

function updatePackageEntry(id, fields) {
  const list = getPackages();
  const index = list.findIndex(pkg => pkg.id === id);
  if (index < 0) return { error: 'This package no longer exists.' };
  const current = list[index];
  const result = preparePackageEntryUpdate(current, fields);
  if (result.error) return result;
  const change = packageChangeReason(current, fields);
  if (change.error) return change;
  recordPackageChange('edit', current, result.package, change);
  list[index] = result.package;
  setPackages(list);
  return result;
}

function deletePackageEntry(id, fields = {}) {
  const list = getPackages();
  const current = list.find(pkg => pkg.id === id);
  if (!canManagePackageEntry(current)) return false;
  const change = packageChangeReason(current, fields);
  if (change.error) return false;
  const remaining = list.filter(pkg => pkg.id !== id);
  if (remaining.length === list.length) return false;
  recordPackageChange('delete', current, null, change);
  setPackages(remaining);
  return true;
}

function undoDeletePackage(id, deletionId) {
  const list = getPackages();
  if (list.some(pkg => pkg.id === id)) return null;
  const stored = readSaved(PACKAGE_AUDIT_KEY, []);
  const deletion = (Array.isArray(stored) ? stored : []).filter(record => record?.packageId === id && record.action === 'delete' && record.before).reverse().sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0];
  if (!deletion || (deletionId && deletion.id !== deletionId) || !canManagePackageEntry(deletion.before)) return null;
  const restored = JSON.parse(JSON.stringify(deletion.before));
  if (!['pending', 'delivered', 'picked-up'].includes(restored.status)) return null;
  recordPackageChange('restore', { ...restored, status: 'deleted' }, restored, { reason: '', note: '' });
  list.push(restored);
  setPackages(list);
  return restored;
}

function movePackageToPending(id) {
  const list = getPackages();
  const index = list.findIndex(pkg => pkg.id === id);
  if (index < 0 || !canReturnPackageToPending(list[index])) return null;
  const next = { ...list[index], status: 'pending', deliveredBy: null, deliveredById: null, deliveredAt: null, pickedUpAt: null, pickedUpBy: null, pickedUpRecordedBy: null, pickedUpRecordedById: null, pickupIdVerified: null, pickupIdType: null };
  recordPackageChange('move-to-pending', list[index], next, { reason: '', note: '' });
  list[index] = next;
  setPackages(list);
  return next;
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
  return addPackages([fields])[0];
}

function addPackages(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  const concierge = getCurrentConcierge();
  const list = getPackages();
  const arrivedAt = new Date().toISOString();
  const entries = rows.map(fields => {
    const suite = String(fields.suite || '').trim();
    const resident = findResidentBySuite(suite);
    return {
      id: `pkg-${crypto.randomUUID()}`,
      suite,
      residentName: (fields.residentName || resident?.name || 'Unknown resident').trim(),
      receivedBy: (concierge?.name || fields.receivedBy || 'Concierge').trim(),
      receivedById: concierge?.id || null,
      carrier: fields.carrier || 'Other',
      parcelType: fields.parcelType || 'Package',
      trackingLast6: String(fields.trackingLast6 || '').trim(),
      note: (fields.note || '').trim(),
      perishable: fields.perishable === true,
      storageSpot: String(fields.storageSpot || '').trim(),
      status: 'pending',
      receivedAt: parseArrivalInput(fields.arrivedAt || arrivedAt),
      deliveredBy: null,
      deliveredAt: null,
      pickedUpAt: null
    };
  });
  setPackages([...list, ...entries]);
  return entries;
}

function recordPackageCompletion(action, before, after) {
  const records = readSaved(PACKAGE_AUDIT_KEY, []);
  const hasHistory = Array.isArray(records) && records.some(record => record?.packageId === before.id && ['edit', 'delete', 'move-to-pending', 'restore', 'deliver', 'pickup'].includes(record.action));
  if (hasHistory) recordPackageChange(action, before, after, { reason: '', note: '' });
}

const PACKAGE_RELEASE_STORAGE_KEY = 'mysuite-concierge-package-releases-v1';

function releasePackagesWithActivity(selections) {
  if (!Array.isArray(selections) || !selections.length) return { packages: [], error: 'Choose at least one package to release.' };
  const requests = new Map();
  for (const item of selections) {
    const name = String(item.name || '').trim().replace(/\s+/g, ' ');
    const idType = String(item.idType || '').trim();
    if (!item.id || requests.has(item.id) || !['delivered', 'picked-up'].includes(item.method)) return { packages: [], error: 'Review the release method for each package.' };
    if (item.method === 'picked-up' && (!name || name.length > 120 || (idType && !PACKAGE_PICKUP_ID_TYPES.includes(idType)))) return { packages: [], error: 'Enter the collector name and choose a valid optional ID type for each pickup.' };
    requests.set(item.id, { ...item, name, idType });
  }
  const list = getPackages();
  if (selections.some(item => !list.some(pkg => pkg.id === item.id && pkg.status === 'pending'))) return { packages: [], error: 'The pending list has changed. Review the packages and try again.' };
  const actor = getCurrentConcierge();
  const now = new Date().toISOString();
  const release = { id: `release-${crypto.randomUUID()}`, releasedAt: now, recordedBy: actor?.name || 'Concierge', recordedById: actor?.id || null, items: [] };
  const changes = [];
  const nextPackages = list.map(pkg => {
    const request = requests.get(pkg.id);
    if (!request) return pkg;
    const pickedUp = request.method === 'picked-up';
    const next = { ...pkg, status: request.method,
      deliveredAt: pickedUp ? null : now, deliveredBy: pickedUp ? null : release.recordedBy, deliveredById: pickedUp ? null : release.recordedById,
      pickedUpAt: pickedUp ? now : null, pickedUpBy: pickedUp ? request.name : null,
      pickedUpRecordedBy: pickedUp ? release.recordedBy : null, pickedUpRecordedById: pickedUp ? release.recordedById : null,
      pickupIdVerified: pickedUp ? Boolean(request.idType) : null, pickupIdType: pickedUp ? request.idType || null : null
    };
    changes.push({ before: pkg, after: next });
    release.items.push({ packageId: pkg.id, suite: String(pkg.suite || '').trim(), residentName: pkg.residentName || 'Unknown resident', trackingNumber: pkg.trackingLast6 || '', method: request.method, pickedUpBy: next.pickedUpBy, pickupIdVerified: next.pickupIdVerified, pickupIdType: next.pickupIdType });
    return next;
  });
  const storedReleases = readSaved(PACKAGE_RELEASE_STORAGE_KEY, []);
  const releases = Array.isArray(storedReleases) ? storedReleases : [];
  const storedAudit = readSaved(PACKAGE_AUDIT_KEY, []);
  const audit = Array.isArray(storedAudit) ? [...storedAudit] : [];
  changes.forEach(({ before, after }) => {
    if (!audit.some(record => record?.packageId === before.id && ['edit', 'delete', 'move-to-pending', 'restore', 'deliver', 'pickup'].includes(record.action))) return;
    audit.push({ id: `package-change-${crypto.randomUUID()}`, packageId: before.id, action: after.status === 'delivered' ? 'deliver' : 'pickup', reason: '', note: '', actorId: release.recordedById, actorName: release.recordedBy, recordedAt: now, before, after });
  });
  const entry = createPackageReleaseLogEntry(release);
  const logs = getDailyLogs();
  const writes = [
    [PACKAGE_STORAGE_KEY, nextPackages], [PACKAGE_AUDIT_KEY, audit],
    [PACKAGE_RELEASE_STORAGE_KEY, [...releases, release]], [DAILY_LOG_STORAGE_KEY, [...logs, entry]]
  ];
  // localStorage has no multi-key transaction. Restore completed writes if a save fails.
  const previous = new Map();
  const written = [];
  try {
    writes.forEach(([key, value]) => {
      previous.set(key, localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(value));
      written.push(key);
    });
  } catch {
    let restored = true;
    written.reverse().forEach(key => {
      try {
        const value = previous.get(key);
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch { restored = false; }
    });
    return { packages: [], error: restored ? 'The release could not be saved. No packages were released. Please try again.' : 'Browser storage failed. Reload and check package history before trying again.' };
  }
  return { packages: changes.map(change => change.after), release, entry };
}

function markPackagesDelivered(ids) {
  return releasePackagesWithActivity([...new Set((ids || []).map(String))].map(id => ({ id, method: 'delivered' }))).packages;
}

function markPackagesPickedUp(ids, pickedUpBy, idVerified = false, idType = '') {
  return releasePackagesWithActivity([...new Set((ids || []).map(String))].map(id => ({ id, method: 'picked-up', name: pickedUpBy, idType: idVerified === true ? idType : '' }))).packages;
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
  const carrier = pkg.carrier || 'Other';
  const tracking = pkg.trackingLast6 ? ` · Tracking # ${pkg.trackingLast6}` : '';
  const who = pkg.residentName && pkg.residentName !== 'Unknown resident' ? ` · ${pkg.residentName}` : '';
  return `<div class="package-row" data-package-id="${pkg.id}">
    <span class="package-logo-wrap">
      <img class="carrier-logo package-logo" src="${carrierLogoSrc(carrier)}" alt="" width="36" height="36">
    </span>
    <span class="package-info">
      <strong>Suite ${pkg.suite}${who}</strong>
      <small>${pkg.parcelType || 'Package'} · ${carrier}${tracking}</small>
      <small>In ${formatPackageTime(pkg.receivedAt)}</small>
    </span>
    <span class="badge ${packageStatusClass(pkg.status)}">${packageStatusLabel(pkg.status)}</span>
  </div>`;
}

// Shared package workflow dialogs for Activity Log and Package tracking.
function initPackageReleaseDialog(options = {}) {
  const dialog = document.querySelector('#activity-release-modal');
  const form = document.querySelector('#activity-release-form');
  const rows = document.querySelector('#activity-release-rows');
  const error = document.querySelector('#activity-release-error');
  const submit = document.querySelector('#activity-release-submit');

  function selections() {
    return [...rows.querySelectorAll('select[data-release-method]')].filter(select => select.value).map(select => ({
      id: select.dataset.releaseMethod,
      method: select.value,
      name: select.closest('tr').querySelector('[data-pickup-name]').value.trim(),
      idType: select.closest('tr').querySelector('[data-pickup-id]').value
    }));
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = !message;
  }

  function syncSelection() {
    const total = rows.querySelectorAll('select[data-release-method]').length;
    const chosen = selections();
    rows.querySelectorAll('select[data-release-method]').forEach(select => {
      const pickup = select.closest('tr').querySelector('[data-row-pickup]');
      pickup.hidden = select.value !== 'picked-up';
      pickup.disabled = pickup.hidden;
    });
    document.querySelector('#activity-release-count').textContent = `${chosen.length} of ${total} ready to release`;
    submit.disabled = chosen.length === 0 || chosen.some(item => !['delivered', 'picked-up'].includes(item.method));
  }

  function renderPending(keepSelected = []) {
    options.onChange?.();
    const pending = sortPackagesNewestFirst(getPackages().filter(pkg => pkg.status === 'pending'));
    const selected = new Map(keepSelected.map(item => [item.id, item]));
    rows.innerHTML = pending.map(pkg => {
      const escape = escapeLogHtml;
      const fullName = String(pkg.residentName || '').trim();
      const nameParts = fullName.split(/\s+/);
      const residentLabel = !fullName || fullName === 'Unknown resident' ? 'Unknown resident' : nameParts.length > 1 ? `${nameParts[0]} ${Array.from(nameParts[nameParts.length - 1])[0]}.` : fullName;
      const chosen = selected.get(pkg.id);
      const arrival = new Date(pkg.receivedAt);
      const date = Number.isNaN(arrival.getTime()) ? 'Not recorded' : arrival.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const time = Number.isNaN(arrival.getTime()) ? '' : formatPackageTime(pkg.receivedAt);
      return `<tr><td><strong>${escape(residentLabel)}</strong><span>Suite ${escape(pkg.suite)}</span></td><td>${escape(pkg.carrier || 'Other')} &middot; ${escape(pkg.parcelType || 'Package')}<span>Tracking # ${escape(pkg.trackingLast6 || 'Not recorded')}</span></td><td class="activity-release-arrival">${escape(time)}<span>${escape(date)}</span></td><td><div class="activity-release-controls"><select data-release-method="${escape(pkg.id)}" aria-label="Release method for Suite ${escape(pkg.suite)}, tracking ${escape(pkg.trackingLast6 || 'not recorded')}"><option value="">Choose</option><option value="delivered"${chosen?.method === 'delivered' ? ' selected' : ''}>Delivered</option><option value="picked-up"${chosen?.method === 'picked-up' ? ' selected' : ''}>Picked up</option></select><fieldset data-row-pickup class="activity-release-row-pickup" hidden disabled><legend class="sr-only">Pickup details for Suite ${escape(pkg.suite)}</legend><label>Collected by<input data-pickup-name value="${escape(chosen?.name || '')}" placeholder="Full name" maxlength="120" required autocomplete="off"></label><label>ID checked &middot; optional<select data-pickup-id><option value="">Not recorded</option>${PACKAGE_PICKUP_ID_TYPES.map(type => `<option value="${escape(type)}"${chosen?.idType === type ? ' selected' : ''}>${escape(type)}</option>`).join('')}</select></label></fieldset></div></td></tr>`;
    }).join('');
    document.querySelector('#activity-release-empty').hidden = pending.length > 0;
    syncSelection();
  }

  document.querySelector('#activity-release-trigger').addEventListener('click', () => {
    form.reset();
    showError('');
    renderPending();
    dialog.showModal();
  });
  dialog.querySelectorAll('[data-close-activity-release]').forEach(button => button.addEventListener('click', () => dialog.close()));
  form.addEventListener('change', () => { showError(''); syncSelection(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const chosen = selections();
    const ids = chosen.map(item => item.id);
    const pickups = chosen.filter(item => item.method === 'picked-up');
    if (!ids.length || chosen.some(item => !['delivered', 'picked-up'].includes(item.method))) {
      showError('Choose Delivered or Picked up beside at least one package.');
      return;
    }
    if (!form.reportValidity()) return;
    if (pickups.some(item => !item.name || item.name.length > 120)) {
      showError('Enter the full name of the person collecting each package marked Picked up.');
      return;
    }
    if (pickups.some(item => item.idType && !PACKAGE_PICKUP_ID_TYPES.includes(item.idType))) {
      showError('Choose a valid ID type or leave it as Not recorded.');
      return;
    }
    const pendingIds = new Set(getPackages().filter(pkg => pkg.status === 'pending').map(pkg => pkg.id));
    if (ids.some(id => !pendingIds.has(id))) {
      renderPending(chosen);
      showError('The pending list has changed. Review your selection and release again.');
      return;
    }
    submit.disabled = true;
    const result = releasePackagesWithActivity(chosen);
    if (result.error) {
      renderPending(chosen);
      showError(result.error);
      return;
    }
    const delivered = result.packages.filter(pkg => pkg.status === 'delivered');
    const pickedUp = result.packages.filter(pkg => pkg.status === 'picked-up');
    options.onChange?.();
    dialog.close();
    options.onReleased?.(result);
    const summary = [delivered.length ? `${delivered.length} delivered` : '', pickedUp.length ? `${pickedUp.length} picked up` : ''].filter(Boolean).join(', ');
    toast(`Packages released: ${summary}.`);
  });
  window.addEventListener('storage', event => {
    if (event.key === PACKAGE_STORAGE_KEY || event.key === null) options.onChange?.();
    options.onStorage?.(event);
    if (dialog.open && (event.key === PACKAGE_STORAGE_KEY || event.key === null)) {
      renderPending(selections());
      showError('The pending list has been updated. Review your selection before releasing.');
    }
  });
}

function initPackageLogDialog(options = {}) {
  const dialog = document.querySelector('#activity-package-log-modal');
  const form = document.querySelector('#activity-package-log-form');
  const rows = document.querySelector('#activity-package-log-rows');
  const error = document.querySelector('#activity-package-log-error');
  const saveButton = document.querySelector('#activity-package-log-save');
  const carriers = ['Amazon', 'UPS', 'FedEx', 'Canada Post', 'Other'];
  const types = ['Package', 'Box', 'Envelope'];
  let nextRow = 0;
  let saving = false;

  function clearError() {
    error.textContent = '';
    error.hidden = true;
  }

  function addRow() {
    const index = ++nextRow;
    const label = text => escapeLogHtml(`${text}, row ${index}`);
    rows.insertAdjacentHTML('beforeend', `<tr data-package-entry-row>
      <td><input data-field="suite" inputmode="numeric" aria-label="${label('Suite')}" placeholder="Suite" maxlength="30" required autocomplete="off"></td><td><input data-field="residentName" aria-label="${label('Resident name')}" placeholder="Resident name" maxlength="120" required autocomplete="off"></td>
      <td><div class="activity-package-type"><select data-field="carrier" aria-label="${label('Carrier')}" required><option value="">Carrier</option>${carriers.map(carrier => `<option value="${carrier}">${carrier}</option>`).join('')}</select><select data-field="parcelType" aria-label="${label('Package type')}">${types.map(type => `<option value="${type}">${type}</option>`).join('')}</select></div></td>
      <td><input data-field="trackingLast6" aria-label="${label('Tracking number (optional)')}" placeholder="Optional" pattern="[A-Za-z0-9]+" maxlength="100" autocomplete="off"></td>
      <td><input data-field="storageSpot" aria-label="${label('Storage Location (optional)')}" placeholder="Optional" maxlength="100" autocomplete="off"></td>
    </tr>`);
    rows.lastElementChild.querySelector('[data-field="suite"]').focus();
  }

  document.querySelector('#activity-log-package-trigger').addEventListener('click', () => {
    rows.innerHTML = '';
    nextRow = 0;
    clearError();
    dialog.showModal();
    addRow();
  });
  document.querySelector('#activity-package-add-row').addEventListener('click', addRow);
  dialog.querySelectorAll('[data-close-activity-package-log]').forEach(button => button.addEventListener('click', () => dialog.close()));
  rows.addEventListener('input', event => {
    clearError();
    const field = event.target;
    if (field.dataset.field !== 'suite') return;
    const row = field.closest('[data-package-entry-row]');
    const resident = findResidentBySuite(field.value.trim());
    row.querySelector('[data-field="residentName"]').value = resident?.name || '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (saving || !form.reportValidity()) return;
    const entries = [...rows.querySelectorAll('[data-package-entry-row]')].map(row => {
      const value = name => row.querySelector(`[data-field="${name}"]`).value.trim();
      return { suite: value('suite'), residentName: value('residentName'), carrier: value('carrier'), trackingLast6: value('trackingLast6'), parcelType: value('parcelType'), storageSpot: value('storageSpot') };
    });
    if (!entries.length || entries.some(entry => !entry.suite || entry.suite.length > 30 || !entry.residentName || entry.residentName.length > 120 || !carriers.includes(entry.carrier) || !types.includes(entry.parcelType) || entry.trackingLast6.length > 100 || (entry.trackingLast6 && !/^[A-Za-z0-9]+$/.test(entry.trackingLast6)) || entry.storageSpot.length > 100)) {
      error.textContent = 'Complete the suite, resident and carrier in every row, and check any tracking numbers.';
      error.hidden = false;
      return;
    }
    saving = true;
    saveButton.disabled = true;
    try {
      const saved = addPackages(entries);
      options.onChange?.();
      dialog.close();
      options.onLogged?.(saved);
      toast(`${saved.length} ${saved.length === 1 ? 'package' : 'packages'} logged.`);
    } catch {
      error.textContent = 'The packages could not be saved. Your entries are still here; please try again.';
      error.hidden = false;
    } finally {
      saving = false;
      saveButton.disabled = false;
    }
  });
}
