/* Local amenity booking demo. Production must enforce ownership, availability,
   and concurrent reservations through an authenticated booking API. */
const AMENITY_STORAGE_KEY = 'mysuite-amenity-bookings-v1';
const BOOKABLE_AMENITIES = {
  'common-area': { name: 'Common area', icon: 'users', feeCents: 2000 },
  pool: { name: 'Pool', icon: 'pool', feeCents: 2000 },
  // Temporary options for previewing a larger amenities grid.
  'guest-suite-test': { name: 'Guest suite', icon: 'building', feeCents: 2000, test: true },
  'pool-2-test': { name: 'Pool #2', icon: 'pool', feeCents: 2000, test: true },
  'common-area-2-test': { name: 'Common area #2', icon: 'users', feeCents: 2000, test: true },
  'gym-test': { name: 'Gym', icon: 'activity', feeCents: 2000, test: true },
  'games-room-test': { name: 'Games room', icon: 'users', feeCents: 2000, test: true },
  'meeting-room-test': { name: 'Meeting room', icon: 'users', feeCents: 2000, test: true }
};

/* Display-only sample history. These never reserve a space or affect availability. */
function demoAmenityPastBookings() {
  const resident = amenityResident();
  const today = amenityNowParts().date;
  return Array.from({ length: 20 }, (_, index) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - index - 1);
    return {
      id: `amenity-demo-past-${resident.id}-${index + 1}`,
      amenity: index % 2 === 0 ? 'common-area' : 'pool',
      date: date.toISOString().slice(0, 10), startTime: '14:00', endTime: '15:00',
      residentId: resident.id, suite: resident.suite, status: 'confirmed',
      feeCents: 2000, currency: 'CAD', demo: true
    };
  });
}

function formatAmenityPrice(cents) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', minimumFractionDigits: cents % 100 === 0 ? 0 : 2
  }).format(cents / 100);
}

function amenityPricing(amenities) {
  const items = [...new Set(amenities)].map(id => {
    if (!Object.hasOwn(BOOKABLE_AMENITIES, id)) throw new Error('Choose an available amenity.');
    return { amenity: id, name: BOOKABLE_AMENITIES[id].name, feeCents: BOOKABLE_AMENITIES[id].feeCents };
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
    if (raw === null) return [];
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || !row.id)) throw new Error();
    return rows;
  } catch {
    throw new Error('Could not load bookings from this browser. Please try again.');
  }
}

function saveAmenityBookings(rows) {
  amenityResident();
  try { localStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify(rows)); }
  catch { throw new Error('Could not save your booking. Browser storage may be full or unavailable.'); }
}

function amenityBookingIsUpcoming(booking, now = amenityNowParts()) {
  return booking.status === 'confirmed' && `${booking.date}T${booking.endTime}` > `${now.date}T${now.time}`;
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

function validateAmenityBooking(values, now = amenityNowParts()) {
  amenityResident();
  if (!Object.hasOwn(BOOKABLE_AMENITIES, values.amenity)) throw new Error('Choose an available amenity.');
  const date = String(values.date || '');
  const startTime = String(values.startTime || '');
  const endTime = String(values.endTime || '');
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('Choose a valid booking date.');
  }
  if (![startTime, endTime].every(value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value))) throw new Error('Choose a start and end time.');
  if (endTime <= startTime) throw new Error('End time must be after start time on the same day.');
  if (`${date}T${startTime}` <= `${now.date}T${now.time}`) throw new Error('Choose a date and time in the future.');
  const notes = String(values.notes || '').trim();
  if (notes.length > 500) throw new Error('Keep notes to 500 characters or fewer.');
  const rows = getAmenityBookings();
  const overlap = rows.some(row => row.status === 'confirmed' && row.amenity === values.amenity && row.date === date && startTime < row.endTime && row.startTime < endTime);
  if (overlap) throw new Error('That time is already reserved. Please choose another time.');
  return { amenity: values.amenity, date, startTime, endTime, notes };
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
    feeCents: BOOKABLE_AMENITIES[candidate.amenity].feeCents, currency: 'CAD',
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
