/* Resident maintenance queue (localStorage).
   Requires: shared/utils.js, shared/mockdata.js (DEMO_RESIDENTS, getCurrentResident). */

const MAINTENANCE_STORAGE_KEY = 'mysuite-resident-maintenance-v1';

const MAINTENANCE_SEED = [
  {
    id: 'mnt-4821',
    suite: '1204',
    residentName: 'Alex Morgan',
    title: 'Kitchen sink leak',
    note: 'Water leaking from pipe below the kitchen sink.',
    status: 'pending',
    reportedAt: '2026-11-05T09:20:00',
    reportedBy: 'Front desk',
    completedAt: null,
    completedBy: null
  },
  {
    id: 'mnt-4820',
    suite: '312',
    residentName: 'Priya Nair',
    title: 'HVAC noise',
    note: 'Loud humming from HVAC unit at night.',
    status: 'pending',
    reportedAt: '2026-11-08T14:05:00',
    reportedBy: 'Front desk',
    completedAt: null,
    completedBy: null
  },
  {
    id: 'mnt-4819',
    suite: '709',
    residentName: 'Marcus Webb',
    title: 'Door intercom',
    note: 'Building entry intercom not ringing suite.',
    status: 'pending',
    reportedAt: '2026-11-10T11:40:00',
    reportedBy: 'Front desk',
    completedAt: null,
    completedBy: null
  }
];

function findMaintenanceResidentBySuite(suite) {
  const key = String(suite || '').trim();
  return DEMO_RESIDENTS.find(r => r.suite === key) || null;
}

function getMaintenance() {
  const stored = readSaved(MAINTENANCE_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    save(MAINTENANCE_STORAGE_KEY, MAINTENANCE_SEED);
    return MAINTENANCE_SEED.map(m => ({ ...m }));
  }
  return stored;
}

function setMaintenance(list) {
  save(MAINTENANCE_STORAGE_KEY, list);
}

function sortMaintenanceNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
}

function formatMaintenanceTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatMaintenanceWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${date} · ${formatMaintenanceTime(iso)}`;
  } catch {
    return '';
  }
}

function formatMaintenanceDateTime(iso) {
  if (!iso) return '—';
  return formatMaintenanceWhen(iso) || '—';
}

function parseMaintenanceReportedAt(value) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function maintenanceSummary(item) {
  return String(item?.title || item?.note || 'Maintenance request').trim();
}

function addMaintenance(fields) {
  const suite = String(fields.suite || '').trim();
  const title = String(fields.title || '').trim();
  const note = String(fields.note || '').trim();
  const resident = getCurrentResident();
  const list = getMaintenance();
  const entry = {
    id: `mnt-${Date.now()}`,
    suite,
    residentName: '',
    title: title || note || 'Maintenance request',
    note,
    status: 'pending',
    reportedAt: parseMaintenanceReportedAt(fields.reportedAt),
    reportedBy: (fields.reportedBy || resident?.name || 'Resident').trim(),
    completedAt: null,
    completedBy: null
  };
  list.push(entry);
  setMaintenance(list);
  return entry;
}

function markMaintenanceCompleted(ids, by = getCurrentResident()?.name || 'Resident') {
  const idSet = new Set((ids || []).map(String));
  if (idSet.size === 0) return [];
  const now = new Date().toISOString();
  const done = [];
  const list = getMaintenance().map(m => {
    if (!idSet.has(m.id) || m.status !== 'pending') return m;
    const next = {
      ...m,
      status: 'completed',
      completedAt: now,
      completedBy: by
    };
    done.push(next);
    return next;
  });
  setMaintenance(list);
  return done;
}

function renderMaintenancePendingRow(item) {
  const metaBits = [];
  if (item.note && item.note !== item.title) metaBits.push(item.note);
  metaBits.push(formatMaintenanceDateTime(item.reportedAt), item.reportedBy);
  const meta = metaBits.filter(Boolean).join(' · ');
  return `<article class="pending-row maint-pending-row" data-maint-id="${item.id}">
    <div class="pending-who">
      <strong>${item.suite}</strong>
    </div>
    <div class="pending-detail maint-pending-detail">
      <div class="pending-detail-text">
        <strong>${maintenanceSummary(item)}</strong>
        <span>${meta}</span>
      </div>
    </div>
    <div class="pending-actions">
      <button type="button" class="button compact" data-complete-maint="${item.id}">Mark complete</button>
    </div>
  </article>`;
}

function renderMaintenanceHistoryRow(item) {
  return `<tr data-maint-id="${item.id}">
    <td class="suite-cell"><strong>${item.suite}</strong></td>
    <td>${maintenanceSummary(item)}</td>
    <td>${formatMaintenanceDateTime(item.reportedAt)}</td>
    <td>${item.reportedBy || '—'}</td>
    <td>${formatMaintenanceDateTime(item.completedAt)}</td>
    <td>${item.completedBy || '—'}</td>
  </tr>`;
}
