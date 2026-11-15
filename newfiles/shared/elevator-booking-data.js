/* Shared elevator booking store (localStorage demo).
   Requires: shared/utils.js
   createBooking is the single gate — swap for a real API later (409 CONFLICT). */

const ELEVATOR_BOOKING_STORAGE_KEY = 'mysuite-elevator-bookings-v1';
const ELEVATOR_RESOURCE = 'Service';

const ELEVATOR_BOOKING_SEED = [
  {
    id: 'elv-seed-1',
    suite: '303',
    residentName: 'Priya Nair',
    elevator: ELEVATOR_RESOURCE,
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '12:00',
    reason: 'Delivery',
    notes: 'Large appliance delivery',
    createdAt: '2026-11-10T15:00:00'
  },
  {
    id: 'elv-seed-2',
    suite: '1101',
    residentName: 'Chris Waslen',
    elevator: ELEVATOR_RESOURCE,
    date: '2026-11-18',
    startTime: '14:00',
    endTime: '16:00',
    reason: 'Move',
    notes: '',
    createdAt: '2026-11-12T09:30:00'
  }
];

function normalizeTime(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const parts = raw.split(':');
  const h = String(parts[0] || '0').padStart(2, '0');
  const m = String(parts[1] || '0').padStart(2, '0');
  return `${h}:${m}`;
}

function bookingStartMs(booking) {
  const t = normalizeTime(booking.startTime);
  return new Date(`${booking.date}T${t}:00`).getTime();
}

function bookingEndMs(booking) {
  const t = normalizeTime(booking.endTime);
  return new Date(`${booking.date}T${t}:00`).getTime();
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function getElevatorBookings() {
  const stored = readSaved(ELEVATOR_BOOKING_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    save(ELEVATOR_BOOKING_STORAGE_KEY, ELEVATOR_BOOKING_SEED);
    return ELEVATOR_BOOKING_SEED.map(b => ({ ...b }));
  }
  return stored.map(b => ({ ...b }));
}

function setElevatorBookings(list) {
  save(ELEVATOR_BOOKING_STORAGE_KEY, list);
}

function sortBookingsSoonestFirst(list) {
  return [...list].sort((a, b) => bookingStartMs(a) - bookingStartMs(b));
}

function findOverlappingBooking(candidate, list) {
  const elevator = candidate.elevator || ELEVATOR_RESOURCE;
  const start = bookingStartMs(candidate);
  const end = bookingEndMs(candidate);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  return list.find(existing => {
    if ((existing.elevator || ELEVATOR_RESOURCE) !== elevator) return false;
    if (existing.date !== candidate.date) return false;
    return rangesOverlap(start, end, bookingStartMs(existing), bookingEndMs(existing));
  }) || null;
}

function validateBookingPayload(payload) {
  const date = String(payload.date || '').trim();
  const startTime = normalizeTime(payload.startTime);
  const endTime = normalizeTime(payload.endTime);
  const reason = String(payload.reason || '').trim();
  const suite = String(payload.suite || '').trim();
  const residentName = String(payload.residentName || '').trim();

  if (!suite || !residentName || !date || !startTime || !endTime || !reason) {
    return { ok: false, code: 'VALIDATION', message: 'Please fill in all required fields.' };
  }

  const start = new Date(`${date}T${startTime}:00`).getTime();
  const end = new Date(`${date}T${endTime}:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return { ok: false, code: 'VALIDATION', message: 'End time must be after start time.' };
  }

  return {
    ok: true,
    normalized: {
      suite,
      residentName,
      elevator: ELEVATOR_RESOURCE,
      date,
      startTime,
      endTime,
      reason,
      notes: String(payload.notes || '').trim()
    }
  };
}

/** Single create gate — returns { ok, booking } or { ok:false, code, message }. */
function createBooking(payload) {
  const checked = validateBookingPayload(payload);
  if (!checked.ok) return checked;

  const list = getElevatorBookings();
  const conflict = findOverlappingBooking(checked.normalized, list);
  if (conflict) {
    return {
      ok: false,
      code: 'CONFLICT',
      message: 'That time overlaps another elevator booking. Pick a different time.'
    };
  }

  const booking = {
    id: `elv-${Date.now()}`,
    ...checked.normalized,
    createdAt: new Date().toISOString()
  };
  list.push(booking);
  setElevatorBookings(list);
  return { ok: true, booking };
}

function formatBookingTimeRange(booking) {
  const start = normalizeTime(booking.startTime);
  const end = normalizeTime(booking.endTime);
  const fmt = t => {
    try {
      const [h, m] = t.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return t;
    }
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatBookingDate(dateStr) {
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

function isBookingPast(booking, now = new Date()) {
  return bookingEndMs(booking) < now.getTime();
}

function getBookingsForSuite(suite) {
  const key = String(suite || '').trim();
  return sortBookingsSoonestFirst(getElevatorBookings().filter(b => b.suite === key));
}
