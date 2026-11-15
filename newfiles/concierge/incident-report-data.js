/* Concierge incident report logic (localStorage).
   Requires: shared/utils.js, shared/mockdata.js (getCurrentConcierge). */

const INCIDENT_STORAGE_KEY = 'mysuite-concierge-incidents-v2';

const INCIDENT_SEED = [
  {
    id: 'inc-seed-1',
    occurredAt: '2026-11-12T08:40:00',
    location: 'Lobby',
    type: 'Noise',
    description: 'Resident reported loud music from the elevators area during morning rush.',
    peopleInvolved: 'Suite 402',
    reportedBy: 'Jordan Kim',
    createdAt: '2026-11-12T08:45:00'
  },
  {
    id: 'inc-seed-2',
    occurredAt: '2026-11-11T19:15:00',
    location: 'Parking garage P2',
    type: 'Property damage',
    description: 'Vehicle mirror found damaged near stall 48. Photos taken for management.',
    peopleInvolved: '',
    reportedBy: 'Aisha Lawal',
    createdAt: '2026-11-11T19:22:00'
  },
  {
    id: 'inc-seed-3',
    occurredAt: '2026-11-10T14:05:00',
    location: 'Amenity lounge',
    type: 'Safety',
    description: 'Wet floor near coffee station after a spill. Area dried and cones placed.',
    peopleInvolved: '',
    reportedBy: 'Jordan Kim',
    createdAt: '2026-11-10T14:10:00'
  },
  {
    id: 'inc-seed-4',
    occurredAt: '2025-08-22T16:30:00',
    location: 'Loading bay',
    type: 'Safety',
    description: 'Delivery cart left unattended blocking egress. Moved and vendor reminded of dock rules.',
    peopleInvolved: '',
    reportedBy: 'Alsina Butt',
    createdAt: '2025-08-22T16:40:00'
  },
  {
    id: 'inc-seed-5',
    occurredAt: '2025-03-04T09:10:00',
    location: 'Suite 808 hallway',
    type: 'Noise',
    description: 'Ongoing construction noise complaint before permitted hours. Contractor advised.',
    peopleInvolved: 'Suite 808',
    reportedBy: 'Jordan Kim',
    createdAt: '2025-03-04T09:18:00'
  }
];

function getIncidents() {
  const stored = readSaved(INCIDENT_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    save(INCIDENT_STORAGE_KEY, INCIDENT_SEED);
    return INCIDENT_SEED.map(item => ({ ...item }));
  }
  return stored;
}

function setIncidents(list) {
  save(INCIDENT_STORAGE_KEY, list);
}

function sortIncidentsNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
}

function incidentYear(incident) {
  const d = new Date(incident.occurredAt);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

function getIncidentYears(list = getIncidents()) {
  const years = new Set();
  list.forEach(item => {
    const y = incidentYear(item);
    if (y != null) years.add(y);
  });
  years.add(new Date().getFullYear());
  return [...years].sort((a, b) => a - b);
}

function filterIncidentsByYear(list, year) {
  const y = Number(year);
  return list.filter(item => incidentYear(item) === y);
}

function formatIncidentTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatIncidentWhen(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${date} · ${formatIncidentTime(iso)}`;
  } catch {
    return '—';
  }
}

function parseIncidentInput(value) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function addIncident(fields) {
  const concierge = getCurrentConcierge();
  const list = getIncidents();
  const entry = {
    id: `inc-${Date.now()}`,
    occurredAt: parseIncidentInput(fields.occurredAt),
    location: String(fields.location || '').trim() || 'Unspecified',
    type: fields.type || 'Other',
    description: String(fields.description || '').trim(),
    peopleInvolved: String(fields.peopleInvolved || '').trim(),
    reportedBy: (fields.reportedBy || concierge?.name || 'Concierge').trim(),
    createdAt: new Date().toISOString()
  };
  list.push(entry);
  setIncidents(list);
  return entry;
}

function renderIncidentRow(incident) {
  const when = formatIncidentWhen(incident.occurredAt);
  const people = incident.peopleInvolved
    ? `<span>People involved: ${incident.peopleInvolved}</span>`
    : '';
  return `<article class="incident-row" data-incident-id="${incident.id}">
    <div class="incident-who">
      <strong>${incident.type}</strong>
      <span>${when}</span>
    </div>
    <div class="incident-detail">
      <div class="incident-detail-text">
        <strong>${incident.location}</strong>
        <span>${incident.description || 'No description provided.'}</span>
        ${people}
        <span>Logged by ${incident.reportedBy || 'Concierge'}</span>
      </div>
    </div>
  </article>`;
}
