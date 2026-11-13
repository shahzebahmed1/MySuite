/* MySuite shared demo / mock data.
   Load before role logic (packages-data.js, app.js, etc.).
   Replace with API responses later — keep the same shapes.

   accounts + session = temporary demo logins. Refer here when wiring UI. */

const MOCK_DATA = {
  building: {
    name: 'The Point on the Bow'
  },

  /* Demo sessions — who is “logged in” per portal until real auth exists */
  session: {
    conciergeId: 'acct-concierge-jordan',
    residentId: 'acct-resident-maria',
    boardId: 'acct-board-alex',
    managerId: 'acct-manager-sarah',
    technicianId: 'acct-tech-marcus'
  },

  accounts: [
    {
      id: 'acct-resident-maria',
      name: 'Maria Santos',
      initials: 'MS',
      role: 'resident',
      title: 'Resident',
      suite: '101'
    },
    {
      id: 'acct-board-alex',
      name: 'Alex Morgan',
      initials: 'AL',
      role: 'board',
      title: 'Board member',
      suite: '1204'
    },
    {
      id: 'acct-concierge-jordan',
      name: 'Jordan Kim',
      initials: 'JK',
      role: 'concierge',
      title: 'Concierge',
      station: 'Main Lobby',
      shift: '8:00 AM – 4:00 PM'
    },
    {
      id: 'acct-concierge-aisha',
      name: 'Aisha Lawal',
      initials: 'AL',
      role: 'concierge',
      title: 'Concierge',
      station: 'Main Lobby',
      shift: '4:00 PM – 12:00 AM'
    },
    {
      id: 'acct-manager-sarah',
      name: 'Sarah Wong',
      initials: 'SW',
      role: 'manager',
      title: 'Property Manager'
    },
    {
      id: 'acct-tech-marcus',
      name: 'Marcus Torres',
      initials: 'MT',
      role: 'technician',
      title: 'Building Technician',
      shift: '7:00 AM – 3:00 PM'
    }
  ],

  residents: [
    { suite: '101', name: 'Maria Santos', role: 'Resident' },
    { suite: '204', name: 'David Chen', role: 'Resident' },
    { suite: '312', name: 'Priya Nair', role: 'Resident' },
    { suite: '402', name: 'James Okafor', role: 'Resident' },
    { suite: '501', name: 'Emily Larsson', role: 'Resident' },
    { suite: '709', name: 'Marcus Webb', role: 'Resident' },
    { suite: '803', name: 'Yuki Tanaka', role: 'Resident · Board member' },
    { suite: '1108', name: 'Fatima Al-Rashid', role: 'Resident' },
    { suite: '1204', name: 'Alex Morgan', role: 'Resident · Board member' }
  ],

  packageSeed: [
    {
      id: 'pkg-seed-1',
      suite: '402',
      residentName: 'James Okafor',
      receivedBy: 'Jordan Kim',
      carrier: 'Amazon',
      parcelType: 'Box',
      trackingLast6: '482193',
      note: '',
      status: 'pending',
      receivedAt: '2026-11-12T09:05:00',
      deliveredBy: null,
      deliveredAt: null
    },
    {
      id: 'pkg-seed-2',
      suite: '711',
      residentName: 'Unknown resident',
      receivedBy: 'Jordan Kim',
      carrier: 'FedEx',
      parcelType: 'Envelope',
      trackingLast6: '019284',
      note: 'Suite not in demo directory',
      status: 'pending',
      receivedAt: '2026-11-12T10:30:00',
      deliveredBy: null,
      deliveredAt: null
    },
    {
      id: 'pkg-seed-3',
      suite: '1204',
      residentName: 'Alex Morgan',
      receivedBy: 'Aisha Lawal',
      carrier: 'UPS',
      parcelType: 'Package',
      trackingLast6: '774021',
      note: '',
      status: 'pending',
      receivedAt: '2026-11-12T11:45:00',
      deliveredBy: null,
      deliveredAt: null
    },
    {
      id: 'pkg-seed-hist-1',
      suite: '101',
      residentName: 'Maria Santos',
      receivedBy: 'Jordan Kim',
      carrier: 'Canada Post',
      parcelType: 'Package',
      trackingLast6: '551902',
      note: '',
      status: 'delivered',
      receivedAt: '2026-11-11T14:20:00',
      deliveredBy: 'Jordan Kim',
      deliveredAt: '2026-11-11T16:05:00'
    },
    {
      id: 'pkg-seed-hist-2',
      suite: '501',
      residentName: 'Emily Larsson',
      receivedBy: 'Aisha Lawal',
      carrier: 'Amazon',
      parcelType: 'Box',
      trackingLast6: '338471',
      note: '',
      status: 'delivered',
      receivedAt: '2026-11-11T18:40:00',
      deliveredBy: 'Aisha Lawal',
      deliveredAt: '2026-11-11T20:10:00'
    }
  ],

  visitors: [
    { id: 'vis-1', name: 'Liang Chen', suite: '204', signedInAt: '10:14 AM' },
    { id: 'vis-2', name: 'Sarah Park', suite: '1108', signedInAt: '11:02 AM' }
  ],

  amenitySchedule: [
    { time: '2:00 PM', amenity: 'Pool', suite: '501', duration: '1 hour', status: 'Active', statusClass: 'status' },
    { time: '6:00 PM', amenity: 'Common room', suite: '803', duration: '2 hours', status: 'Upcoming', statusClass: '' }
  ],

  maintenanceQueue: [
    {
      id: 'M-4821',
      suite: '1204',
      title: 'Kitchen sink leak',
      status: 'In progress',
      statusClass: 'status',
      detail: '<p><strong>Nov 5</strong> · Request received: Water leaking from pipe below the kitchen sink.</p><p><strong>Nov 6</strong> · Assigned to maintenance team. Appointment being scheduled.</p>'
    },
    {
      id: 'M-4820',
      suite: '312',
      title: 'HVAC noise',
      status: 'Assigned',
      statusClass: 'assigned-badge',
      detail: '<p><strong>Nov 8</strong> · Request received: Loud humming from HVAC unit at night.</p><p><strong>Nov 9</strong> · Assigned to mechanical team. Inspection scheduled for Nov 13.</p>'
    },
    {
      id: 'M-4819',
      suite: '709',
      title: 'Door intercom',
      status: 'Pending',
      statusClass: 'pending-badge',
      detail: '<p><strong>Nov 10</strong> · Request received: Building entry intercom not ringing suite.</p><p>No technician assigned yet. Pending review by building manager.</p>'
    }
  ]
};

function findAccountById(id) {
  return MOCK_DATA.accounts.find(a => a.id === id) || null;
}

function getSessionAccount(roleKey) {
  const id = MOCK_DATA.session[`${roleKey}Id`];
  return findAccountById(id);
}

function getCurrentConcierge() {
  return getSessionAccount('concierge') || findAccountById('acct-concierge-jordan');
}

function accountFirstName(account) {
  if (!account?.name) return '';
  return account.name.split(/\s+/)[0];
}

function accountSubtitle(account) {
  if (!account) return '';
  if (account.role === 'resident' || account.role === 'board') {
    const bits = [account.title];
    if (account.suite) bits.push(`Suite ${account.suite}`);
    return bits.join(' · ');
  }
  if (account.role === 'concierge') {
    return [account.title, account.station].filter(Boolean).join(' · ');
  }
  return account.title || '';
}

function accountPortalLine(account) {
  if (!account) return '';
  if (account.suite) return `${account.name} · Suite ${account.suite}`;
  if (account.station) return `${account.name} · ${account.station}`;
  if (account.title) return `${account.name} · ${account.title}`;
  return account.name;
}

function fillText(el, value) {
  if (!el) return;
  el.textContent = value == null ? '' : String(value);
}

/* Fills sidebar / greeting / avatar hooks from MOCK_DATA.session */
function applyLoggedInUser(roleKey) {
  const account = getSessionAccount(roleKey);
  if (!account) return account;

  const first = accountFirstName(account);
  const subtitle = accountSubtitle(account);
  const building = MOCK_DATA.building.name;

  document.querySelectorAll('[data-user-name]').forEach(el => fillText(el, account.name));
  document.querySelectorAll('[data-user-initials]').forEach(el => fillText(el, account.initials));
  document.querySelectorAll('[data-user-subtitle]').forEach(el => fillText(el, subtitle));
  document.querySelectorAll('[data-user-suite]').forEach(el => {
    fillText(el, account.suite ? `Suite ${account.suite}` : '');
  });
  document.querySelectorAll('[data-user-station]').forEach(el => fillText(el, account.station || ''));
  document.querySelectorAll('[data-user-title]').forEach(el => fillText(el, account.title || ''));
  document.querySelectorAll('[data-user-building]').forEach(el => fillText(el, building));
  document.querySelectorAll('[data-user-greeting]').forEach(el => {
    const template = el.dataset.userGreeting || 'Hello, {first}';
    fillText(el, template.replace('{first}', first).replace('{name}', account.name));
  });
  document.querySelectorAll('[data-user-profile-label]').forEach(el => {
    el.setAttribute('aria-label', `View ${first || account.name}'s profile`);
  });

  return account;
}

function applyPortalAccounts() {
  document.querySelectorAll('[data-portal-role]').forEach(el => {
    const account = getSessionAccount(el.dataset.portalRole);
    if (!account) return;
    fillText(el, accountPortalLine(account));
  });
}

/* Back-compat aliases used by existing concierge scripts */
const DEMO_RESIDENTS = MOCK_DATA.residents;
const PACKAGE_SEED = MOCK_DATA.packageSeed;
