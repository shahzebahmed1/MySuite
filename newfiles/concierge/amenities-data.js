/* Concierge reservations share the resident amenity booking records and rules. */
const CONCIERGE_AMENITY_PREVIEWS = {
  'concierge-preview-gym': { name: 'Gym', icon: 'activity' },
  'concierge-preview-games-room': { name: 'Games Room', icon: 'users' },
  'concierge-preview-library': { name: 'Library', icon: 'file' },
  'concierge-preview-meeting-room': { name: 'Meeting Room', icon: 'users' },
  'concierge-preview-yoga-studio': { name: 'Yoga Studio', icon: 'activity' },
  'concierge-preview-guest-lounge': { name: 'Guest Lounge', icon: 'building' },
  'concierge-preview-private-dining': { name: 'Private Dining', icon: 'users' },
  'concierge-preview-garden-lounge': { name: 'Garden Lounge', icon: 'users' },
  'concierge-preview-coworking-room': { name: 'Co-working Room', icon: 'users' },
  'concierge-preview-party-room': { name: 'Party Room', icon: 'users' }
};
Object.entries(CONCIERGE_AMENITY_PREVIEWS).forEach(([id, config]) => {
  BOOKABLE_AMENITIES[id] = { ...config, test: true, feeCents: null };
});
const CONCIERGE_AMENITIES = ['common-area', 'pool', ...Object.keys(CONCIERGE_AMENITY_PREVIEWS)];

function conciergeAmenityAccount() {
  const account = getCurrentConcierge();
  if (account?.role !== 'concierge' || !account.id) throw new Error('Sign in as concierge to manage amenity bookings.');
  return account;
}

function conciergeAmenityBookings() {
  conciergeAmenityAccount();
  return getAmenityBookings().filter(row => CONCIERGE_AMENITIES.includes(row.amenity) && !row.availabilityExample && !row.demo);
}

(function seedConciergeMockBookings() {
  try {
    const existing = getAmenityBookings();
    const today = amenityNowParts().date;
    const seeds = [
      { id: `amenity-mock-pool-evening-${today}`, amenity: 'pool', date: today, startTime: '19:00', endTime: '19:30', suite: '402', residentName: 'James Okafor' },
      { id: `amenity-mock-common-afternoon-${today}`, amenity: 'common-area', date: today, startTime: '14:00', endTime: '15:00', suite: '501', residentName: 'Emily Larsson' },
      { id: `amenity-mock-common-evening-${today}`, amenity: 'common-area', date: today, startTime: '19:00', endTime: '19:30', suite: '501', residentName: 'Emily Larsson' }
    ];
    const missing = seeds.filter(seed => !existing.some(row => row.id === seed.id));
    if (!missing.length) return;
    const createdAt = new Date().toISOString();
    const additions = missing.map(seed => ({
      ...seed, reservationId: `reservation-${seed.id}`, residentId: null, preview: false,
      notes: '', status: 'confirmed', feeCents: BOOKABLE_AMENITIES[seed.amenity]?.feeCents ?? 2000,
      currency: 'CAD', recordedBy: 'Concierge', recordedById: 'concierge-seed', source: 'concierge', createdAt
    }));
    localStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify([...existing, ...additions]));
  } catch { /* Ignore storage errors in restricted contexts */ }
})();

function conciergeAmenityResident(suite) {
  return DEMO_RESIDENTS.find(resident => resident.suite === String(suite || '').trim()) || null;
}

function createConciergeAmenityBooking(fields, now = amenityNowParts()) {
  return createConciergeAmenityBookings({ ...fields, amenities: [fields.amenity] }, now)[0];
}

function createConciergeAmenityBookings(fields, now = amenityNowParts()) {
  const actor = conciergeAmenityAccount();
  const suite = String(fields.suite || '').trim();
  const residentName = String(fields.residentName || '').trim();
  const notes = String(fields.notes || '').trim();
  if (!suite || suite.length > 20 || !residentName || residentName.length > 120) throw new Error('Enter a suite number and resident name.');
  if (!Array.isArray(fields.amenities) || !fields.amenities.length || fields.amenities.some(id => !CONCIERGE_AMENITIES.includes(id))) throw new Error('Choose at least one amenity.');
  const amenities = [...new Set(fields.amenities)];
  if (notes.length > 500) throw new Error('Keep notes within 500 characters.');
  const date = String(fields.date || '');
  const startTime = String(fields.startTime || '');
  const endTime = String(fields.endTime || '');
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Choose a valid booking date.');
  if (![startTime, endTime].every(value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value))) throw new Error('Choose a start and end time.');
  if (endTime <= startTime) throw new Error('End time must be after start time on the same day.');
  if (startTime < AMENITY_BOOKING_HOURS.start || endTime > AMENITY_BOOKING_HOURS.end) throw new Error('Bookings are available from 8:00 a.m. to 10:00 p.m.');
  if (amenityMinuteOfDay(endTime) - amenityMinuteOfDay(startTime) > 480) throw new Error('Bookings can be up to eight hours long.');
  if (`${date}T${startTime}` <= `${now.date}T${now.time}`) throw new Error('Choose a start time in the future.');
  const rows = getAmenityBookings();
  const candidates = amenities.map(amenity => ({ amenity, date, startTime, endTime }));
  candidates.forEach(candidate => {
    if (rows.some(row => amenityBookingsOverlap(candidate, row))) throw new Error(`${candidate.amenity === 'common-area' ? 'Common Area' : BOOKABLE_AMENITIES[candidate.amenity].name} is already reserved during that time. Choose another time.`);
  });
  const resident = MOCK_DATA.accounts.find(account => account.role === 'resident' && account.suite === suite);
  const reservationId = `reservation-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  const bookings = candidates.map(candidate => ({
    id: `amenity-${crypto.randomUUID()}`, reservationId, ...candidate, suite, residentName,
    residentId: BOOKABLE_AMENITIES[candidate.amenity].test ? null : resident?.id || null,
    preview: Boolean(BOOKABLE_AMENITIES[candidate.amenity].test),
    notes, status: 'confirmed', feeCents: BOOKABLE_AMENITIES[candidate.amenity].feeCents, currency: 'CAD',
    recordedBy: actor.name, recordedById: actor.id, source: 'concierge', createdAt
  }));
  try { localStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify([...rows, ...bookings])); }
  catch { throw new Error('The booking could not be saved. Your details are still here; please try again.'); }
  return bookings;
}

function cancelConciergeAmenityBooking(id, now = amenityNowParts()) {
  const actor = conciergeAmenityAccount();
  const rows = getAmenityBookings();
  const booking = rows.find(row => row.id === id && CONCIERGE_AMENITIES.includes(row.amenity) && !row.availabilityExample && !row.demo);
  if (!booking || !amenityBookingIsUpcoming(booking, now)) throw new Error('This booking is no longer available to cancel.');
  const updated = { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString(), cancelledBy: actor.name, cancelledById: actor.id };
  try { localStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify(rows.map(row => row.id === id ? updated : row))); }
  catch { throw new Error('The cancellation could not be saved. Please try again.'); }
  return updated;
}

async function withConciergeAmenityLock(operation) {
  if (globalThis.navigator?.locks?.request) return navigator.locks.request(AMENITY_STORAGE_KEY, operation);
  return operation();
}
