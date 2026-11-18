/* Local amenity booking demo. Production must enforce ownership, availability,
   and concurrent reservations through an authenticated booking API. */
const AMENITY_STORAGE_KEY = 'mysuite-amenity-bookings-v1';
const AMENITY_BOOKING_HOURS = { start: '08:00', end: '22:00' };
const amenityMinuteOfDay = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const amenityTimeOfDay = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const BOOKABLE_AMENITIES = {
  'common-area': { name: 'Common area', icon: 'users', feeCents: 2000 },
  pool: { name: 'Pool', icon: 'pool', feeCents: 2000 },
  'daily-rental': { name: 'Daily rental', icon: 'building', feeCents: 12000, bookingType: 'daily', rateUnit: 'day' },
  // Temporary options for previewing a larger amenities grid.
  'guest-suite-test': { name: 'Guest suite', icon: 'building', feeCents: 2000, bookingType: 'daily', test: true },
  'pool-2-test': { name: 'Pool #2', icon: 'pool', feeCents: 2000, test: true },
  'common-area-2-test': { name: 'Common area #2', icon: 'users', feeCents: 2000, test: true },
  'gym-test': { name: 'Gym', icon: 'activity', feeCents: 2000, test: true },
  'games-room-test': { name: 'Games room', icon: 'users', feeCents: 2000, test: true },
  'meeting-room-test': { name: 'Meeting room', icon: 'users', feeCents: 2000, test: true }
};

/* Display-only samples. These never reserve a space or affect availability. */
function demoAmenityActiveBookings() {
  const resident = amenityResident();
  const today = amenityNowParts().date;
  return [1, 3, 7].map((daysAhead, index) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + daysAhead);
    return {
      id: `amenity-demo-active-${resident.id}-${index + 1}`,
      amenity: index === 1 ? 'pool' : 'common-area',
      date: date.toISOString().slice(0, 10), startTime: '14:00', endTime: '15:00',
      residentId: resident.id, suite: resident.suite, status: 'confirmed',
      feeCents: 2000, currency: 'CAD', demo: true
    };
  });
}

function demoAmenityPastBookings() {
  const resident = amenityResident();
  const today = amenityNowParts().date;
  return Array.from({ length: 20 }, (_, index) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - index - 1);
    const created = new Date(date);
    created.setUTCDate(created.getUTCDate() - 3);
    created.setUTCHours(17, 30, 0, 0);
    const cancelled = index % 4 === 2;
    return {
      id: `amenity-demo-past-${resident.id}-${index + 1}`,
      amenity: index % 2 === 0 ? 'common-area' : 'pool',
      date: date.toISOString().slice(0, 10), startTime: '14:00', endTime: '15:00',
      residentId: resident.id, suite: resident.suite, status: cancelled ? 'cancelled' : 'confirmed',
      cancelledAt: cancelled ? new Date(created.getTime() + 86400000).toISOString() : undefined,
      feeCents: 2000, currency: 'CAD', demo: true,
      createdAt: created.toISOString(), notes: index % 2 === 0 ? 'Family gathering' : 'Afternoon swim'
    };
  });
}

function formatAmenityPrice(cents) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', minimumFractionDigits: cents % 100 === 0 ? 0 : 2
  }).format(cents / 100);
}

function amenityPricing(amenities, values = {}) {
  const items = [...new Set(amenities)].map(id => {
    if (!Object.hasOwn(BOOKABLE_AMENITIES, id)) throw new Error('Choose an available amenity.');
    const config = BOOKABLE_AMENITIES[id];
    const days = Math.round((Date.parse(`${values.checkOutDate}T12:00:00Z`) - Date.parse(`${values.checkInDate}T12:00:00Z`)) / 86400000);
    const quantity = config.rateUnit === 'day' && Number.isInteger(days) && days > 0 ? days : 1;
    return { amenity: id, name: config.name, feeCents: config.feeCents * quantity, unitFeeCents: config.feeCents, quantity, rateUnit: config.rateUnit || 'booking' };
  });
  return { items, totalCents: items.reduce((total, item) => total + item.feeCents, 0) };
}

function amenityNowParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return { date: `${value('year')}-${value('month')}-${value('day')}`, time: `${value('hour')}:${value('minute')}` };
}

function amenityResident() {
  const account = getSessionAccount('resident');
  if (document.body.dataset.portalRole !== 'resident' || account?.role !== 'resident' || !account.id || !account.suite) {
    throw new Error('Sign in to your resident portal to book an amenity.');
  }
  return account;
}

function getAmenityBookings() {
  try {
    const raw = localStorage.getItem(AMENITY_STORAGE_KEY);
    const rows = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || !row.id)) throw new Error();
    if (!rows.some(row => row.availabilityExample)) {
      rows.push(...amenityAvailabilityExamples());
      localStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify(rows));
    }
    return rows;
  } catch {
    throw new Error('Could not load bookings from this browser. Please try again.');
  }
}

function amenityAvailabilityExamples(now = amenityNowParts()) {
  const dateAt = offset => {
    const date = new Date(`${now.date}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const examples = [];
  const base = { residentId: 'availability-example-resident', suite: '402', status: 'confirmed', availabilityExample: true, createdAt: new Date().toISOString() };
  for (const [amenity, config] of Object.entries(BOOKABLE_AMENITIES)) {
    if (config.bookingType === 'daily') {
      const stays = amenity === 'daily-rental' ? [[0, 2], [5, 8]] : [[1, 4], [7, 9]];
      stays.forEach(([start, end], index) => {
        const checkInDate = dateAt(start), checkOutDate = dateAt(end);
        examples.push({ ...base, id: `availability-example-${amenity}-${checkInDate}-${index}`, amenity, bookingType: 'daily', checkInDate, checkOutDate,
          date: checkInDate, endDate: checkOutDate, startTime: '00:00', endTime: '00:00', feeCents: amenityPricing([amenity], { checkInDate, checkOutDate }).totalCents, currency: 'CAD' });
      });
      continue;
    }
    for (let offset = 0; offset < 14; offset++) {
      const slots = offset === 4 ? [['08:00', '22:00']] : amenity === 'pool' || amenity === 'pool-2-test' ? [['11:00', '13:00']]
        : amenity === 'common-area' ? [['16:00', '19:00']] : [['10:00', '12:00'], ['15:00', '17:00']];
      slots.forEach(([startTime, endTime], index) => examples.push({ ...base, id: `availability-example-${amenity}-${dateAt(offset)}-${index}`,
        amenity, date: dateAt(offset), startTime, endTime, feeCents: config.feeCents, currency: 'CAD' }));
    }
  }
  return examples;
}

function saveAmenityBookings(rows) {
  amenityResident();
  try { localStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify(rows)); }
  catch { throw new Error('Could not save your booking. Browser storage may be full or unavailable.'); }
}

function amenityBookingIsUpcoming(booking, now = amenityNowParts()) {
  return booking.status === 'confirmed' && `${booking.endDate || booking.date}T${booking.endTime}` > `${now.date}T${now.time}`;
}

function myAmenityBookings() {
  const resident = amenityResident();
  return getAmenityBookings().filter(row => row.residentId === resident.id)
    .sort((a, b) => {
      const activeOrder = Number(amenityBookingIsUpcoming(b)) - Number(amenityBookingIsUpcoming(a));
      return activeOrder || `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`);
    });
}

function reservedAmenityTimes(amenity, date) {
  return getAmenityBookings().filter(row => row.amenity === amenity && row.date === date && row.status === 'confirmed')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(({ startTime, endTime }) => ({ startTime, endTime }));
}

function amenityReservedPeriods(amenities, date) {
  const start = `${date}T${AMENITY_BOOKING_HOURS.start}`;
  const end = `${date}T${AMENITY_BOOKING_HOURS.end}`;
  return getAmenityBookings().filter(row => row.status === 'confirmed' && amenities.includes(row.amenity)
    && `${row.date}T${row.startTime}` < end && `${row.endDate || row.date}T${row.endTime}` > start)
    .map(row => ({ amenity: row.amenity,
      startTime: `${row.date}T${row.startTime}` < start ? AMENITY_BOOKING_HOURS.start : row.startTime,
      endTime: `${row.endDate || row.date}T${row.endTime}` > end ? AMENITY_BOOKING_HOURS.end : row.endTime
    })).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function availableAmenityWindows(amenities, date, now = amenityNowParts()) {
  const selected = [...new Set(amenities)].filter(id => Object.hasOwn(BOOKABLE_AMENITIES, id) && BOOKABLE_AMENITIES[id].bookingType !== 'daily');
  if (!selected.length || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < now.date) return [];
  const dayEnd = amenityMinuteOfDay(AMENITY_BOOKING_HOURS.end);
  let cursor = Math.max(amenityMinuteOfDay(AMENITY_BOOKING_HOURS.start), date === now.date ? (Math.floor(amenityMinuteOfDay(now.time) / 15) + 1) * 15 : 0);
  const windows = [];
  for (const period of amenityReservedPeriods(selected, date)) {
    const start = amenityMinuteOfDay(period.startTime), end = amenityMinuteOfDay(period.endTime);
    if (start > cursor && cursor < dayEnd) windows.push({ start: amenityTimeOfDay(cursor), end: amenityTimeOfDay(Math.min(start, dayEnd)) });
    cursor = Math.max(cursor, end);
  }
  if (cursor < dayEnd) windows.push({ start: amenityTimeOfDay(cursor), end: AMENITY_BOOKING_HOURS.end });
  return windows;
}

function validateAmenityBooking(values, now = amenityNowParts()) {
  amenityResident();
  if (!Object.hasOwn(BOOKABLE_AMENITIES, values.amenity)) throw new Error('Choose an available amenity.');
  const notes = String(values.notes || '').trim();
  if (notes.length > 500) throw new Error('Keep notes to 500 characters or fewer.');
  if (BOOKABLE_AMENITIES[values.amenity].bookingType === 'daily') {
    const checkInDate = String(values.checkInDate || '');
    const checkOutDate = String(values.checkOutDate || '');
    for (const date of [checkInDate, checkOutDate]) {
      const parsed = new Date(`${date}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Choose valid check-in and check-out dates.');
    }
    if (checkInDate < now.date) throw new Error('Choose a check-in date today or later.');
    if (checkOutDate <= checkInDate) throw new Error('Check-out must be after check-in.');
    const candidate = { amenity: values.amenity, bookingType: 'daily', checkInDate, checkOutDate, date: checkInDate, endDate: checkOutDate, startTime: '00:00', endTime: '00:00', notes };
    if (getAmenityBookings().some(row => amenityBookingsOverlap(candidate, row))) throw new Error('This rental is already reserved during these dates.');
    return candidate;
  }
  const date = String(values.date || '');
  const startTime = String(values.startTime || '');
  const endTime = String(values.endTime || '');
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('Choose a valid booking date.');
  }
  if (![startTime, endTime].every(value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value))) throw new Error('Choose a start and end time.');
  if (endTime <= startTime) throw new Error('End time must be after start time on the same day.');
  if (startTime < AMENITY_BOOKING_HOURS.start || endTime > AMENITY_BOOKING_HOURS.end) throw new Error('Timed amenities are available from 8:00 AM to 10:00 PM.');
  const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  if (minutes(endTime) - minutes(startTime) > 480) throw new Error('Timed amenities can be booked for a maximum of 8 hours.');
  if (`${date}T${startTime}` <= `${now.date}T${now.time}`) throw new Error('Choose a date and time in the future.');
  const rows = getAmenityBookings();
  const overlap = rows.some(row => amenityBookingsOverlap({ amenity: values.amenity, date, startTime, endTime }, row));
  if (overlap) throw new Error('That time is already reserved. Please choose another time.');
  return { amenity: values.amenity, date, startTime, endTime, notes };
}

function amenityBookingsOverlap(candidate, row) {
  return row.status === 'confirmed' && row.amenity === candidate.amenity
    && `${candidate.date}T${candidate.startTime}` < `${row.endDate || row.date}T${row.endTime}`
    && `${row.date}T${row.startTime}` < `${candidate.endDate || candidate.date}T${candidate.endTime}`;
}

function createAmenityBooking(values, now = amenityNowParts()) {
  return createAmenityBookings({ ...values, amenities: [values.amenity] }, now)[0];
}

function validateAmenityBookings(values, now = amenityNowParts()) {
  if (!Array.isArray(values.amenities) || !values.amenities.length || values.amenities.some(id => !Object.hasOwn(BOOKABLE_AMENITIES, id))) {
    throw new Error('Choose at least one available amenity.');
  }
  return [...new Set(values.amenities)].map(amenity => {
    try { return validateAmenityBooking({ ...values, amenity }, now); }
    catch (error) { throw new Error(`${BOOKABLE_AMENITIES[amenity].name}: ${error.message}`); }
  });
}

function createAmenityBookings(values, now = amenityNowParts()) {
  const resident = amenityResident();
  // Validate every selected space before writing any reservations.
  const candidates = validateAmenityBookings(values, now);
  const rows = getAmenityBookings();
  const bookings = candidates.map(candidate => ({
    id: `amenity-${crypto.randomUUID()}`, ...candidate,
    feeCents: amenityPricing([candidate.amenity], candidate).totalCents, currency: 'CAD',
    ...(BOOKABLE_AMENITIES[candidate.amenity].rateUnit === 'day' ? { dailyRateCents: BOOKABLE_AMENITIES[candidate.amenity].feeCents, rentalDays: amenityPricing([candidate.amenity], candidate).items[0].quantity } : {}),
    residentId: resident.id, suite: resident.suite, status: 'confirmed', createdAt: new Date().toISOString()
  }));
  saveAmenityBookings([...rows, ...bookings]);
  return bookings;
}

function cancelAmenityBooking(id) {
  const resident = amenityResident();
  const rows = getAmenityBookings();
  const booking = rows.find(row => row.id === id && row.residentId === resident.id);
  if (!booking || !amenityBookingIsUpcoming(booking)) throw new Error('This booking cannot be cancelled.');
  booking.status = 'cancelled';
  booking.cancelledAt = new Date().toISOString();
  saveAmenityBookings(rows);
}
