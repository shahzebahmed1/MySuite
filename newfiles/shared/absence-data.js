/* Shared long-term absence store (localStorage demo).
   Requires: shared/utils.js
   No time-slot conflict check — absences are notices, not bookings. */

const ABSENCE_STORAGE_KEY = 'mysuite-long-term-absences-v2';

const ABSENCE_SEED = [
  {
    id: 'abs-seed-1',
    suite: '505',
    residentName: 'Sam Okonkwo',
    awayFrom: '2026-11-01',
    returnDate: '2026-11-30',
    emergencyName: 'Jordan Okonkwo',
    emergencyPhone: '403-555-0144',
    holdPackages: true,
    checkResidence: true,
    waterOff: true,
    notes: '',
    createdAt: '2026-10-28T11:00:00'
  },
  {
    id: 'abs-seed-2',
    suite: '1204',
    residentName: 'Alex Morgan',
    awayFrom: '2026-12-01',
    returnDate: '2026-12-15',
    emergencyName: 'Taylor Morgan',
    emergencyPhone: '403-555-0198',
    holdPackages: true,
    checkResidence: false,
    waterOff: false,
    notes: '',
    createdAt: '2026-11-12T16:20:00'
  }
];

function parseAbsenceDate(dateStr) {
  if (!dateStr) return NaN;
  const [y, mo, d] = String(dateStr).split('-').map(Number);
  return new Date(y, mo - 1, d).getTime();
}

function toBool(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function getAbsences() {
  const stored = readSaved(ABSENCE_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    save(ABSENCE_STORAGE_KEY, ABSENCE_SEED);
    return ABSENCE_SEED.map(a => ({ ...a }));
  }
  return stored.map(a => ({ ...a }));
}

function setAbsences(list) {
  save(ABSENCE_STORAGE_KEY, list);
}

function sortAbsencesByAway(list) {
  return [...list].sort((a, b) => parseAbsenceDate(a.awayFrom) - parseAbsenceDate(b.awayFrom));
}

function validateAbsencePayload(payload) {
  const suite = String(payload.suite || '').trim();
  const residentName = String(payload.residentName || '').trim();
  const awayFrom = String(payload.awayFrom || '').trim();
  const returnDate = String(payload.returnDate || '').trim();
  const emergencyName = String(payload.emergencyName || '').trim();
  const emergencyPhone = String(payload.emergencyPhone || '').trim();
  const holdPackages = toBool(payload.holdPackages);
  const checkResidence = toBool(payload.checkResidence);
  const waterOff = toBool(payload.waterOff);
  const notes = String(payload.notes || '').trim();

  if (!suite || !residentName || !awayFrom || !returnDate || !emergencyName || !emergencyPhone) {
    return { ok: false, code: 'VALIDATION', message: 'Please fill in all required fields.' };
  }

  const fromMs = parseAbsenceDate(awayFrom);
  const toMs = parseAbsenceDate(returnDate);
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs < fromMs) {
    return { ok: false, code: 'VALIDATION', message: 'Return date must be on or after the away-from date.' };
  }

  return {
    ok: true,
    normalized: {
      suite,
      residentName,
      awayFrom,
      returnDate,
      emergencyName,
      emergencyPhone,
      holdPackages,
      checkResidence,
      waterOff,
      notes
    }
  };
}

/** Create absence notice — no overlap conflict check. */
function createAbsence(payload) {
  const checked = validateAbsencePayload(payload);
  if (!checked.ok) return checked;

  const list = getAbsences();
  const absence = {
    id: `abs-${Date.now()}`,
    ...checked.normalized,
    createdAt: new Date().toISOString()
  };
  list.push(absence);
  setAbsences(list);
  return { ok: true, absence };
}

function formatAbsenceDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const [y, mo, d] = dateStr.split('-').map(Number);
    return new Date(y, mo - 1, d).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function formatAbsenceChecks(absence) {
  const parts = [];
  if (absence.holdPackages) parts.push('Hold packages at desk');
  if (absence.checkResidence) parts.push('Check residence');
  if (absence.waterOff) parts.push('Water turned off');
  return parts;
}

function startOfLocalDay(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function isAbsencePast(absence, now = new Date()) {
  return parseAbsenceDate(absence.returnDate) < startOfLocalDay(now);
}

function isAbsenceActive(absence, now = new Date()) {
  const today = startOfLocalDay(now);
  const from = parseAbsenceDate(absence.awayFrom);
  const to = parseAbsenceDate(absence.returnDate);
  return from <= today && to >= today;
}

function isAbsenceUpcoming(absence, now = new Date()) {
  return parseAbsenceDate(absence.awayFrom) > startOfLocalDay(now);
}

function getAbsencesForSuite(suite) {
  const key = String(suite || '').trim();
  return sortAbsencesByAway(getAbsences().filter(a => a.suite === key));
}
