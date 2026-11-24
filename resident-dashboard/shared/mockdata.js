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
      id: 'acct-staff-jordan',
      name: 'Jordan Kim',
      initials: 'JK',
      role: 'staff',
      title: 'Building staff',
      station: 'Main Lobby',
      shift: '8:00 AM – 4:00 PM'
    },
    {
      id: 'acct-staff-shahzeb',
      name: 'Shahzeb',
      initials: 'SZ',
      role: 'staff',
      title: 'Building staff',
      station: 'Main Lobby',
      shift: '7:00 AM – 3:00 PM'
    },
    {
      id: 'acct-staff-aisha',
      name: 'Aisha Lawal',
      initials: 'AL',
      role: 'staff',
      title: 'Building staff',
      station: 'Main Lobby',
      shift: '4:00 PM – 12:00 AM'
    },
    {
      id: 'acct-staff-alsina',
      name: 'Alsina Butt',
      initials: 'AB',
      role: 'staff',
      title: 'Building staff',
      station: 'Main Lobby',
      shift: '3:00 PM – 11:00 PM'
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

  dailyLogSeed: [
    {
      id: 'log-seed-m1',
      date: '2026-11-12',
      shift: 'morning',
      happenedAt: '2026-11-12T07:30:00',
      notes: 'Shift Started: Phone + Keys from Jawad',
      loggedBy: 'Shahzeb',
      updatedAt: null
    },
    {
      id: 'log-seed-m2',
      date: '2026-11-12',
      shift: 'morning',
      happenedAt: '2026-11-12T08:00:00',
      notes: 'Healthcare for Frank, let up',
      loggedBy: 'Shahzeb',
      updatedAt: null
    },
    {
      id: 'log-seed-m3',
      date: '2026-11-12',
      shift: 'morning',
      happenedAt: '2026-11-12T08:55:00',
      notes: 'Benjamin for Donaldson, let in the building by resident',
      loggedBy: 'Jordan Kim',
      updatedAt: null
    },
    {
      id: 'log-seed-m4',
      date: '2026-11-12',
      shift: 'morning',
      happenedAt: '2026-11-12T10:30:00',
      notes: 'Package for 402 delivered',
      loggedBy: 'Shahzeb',
      updatedAt: null
    },
    {
      id: 'log-seed-m5',
      date: '2026-11-12',
      shift: 'morning',
      happenedAt: '2026-11-12T10:30:00',
      notes: 'Electrical Room Checked + Common Area Checked + Carwash Cleaned',
      loggedBy: 'Shahzeb',
      updatedAt: null
    },
    {
      id: 'log-seed-m6',
      date: '2026-11-12',
      shift: 'morning',
      happenedAt: '2026-11-12T11:15:00',
      notes: 'Mech Room Checked + Drop Chutes checked + Parkade Checked',
      loggedBy: 'Shahzeb',
      updatedAt: null
    },
    {
      id: 'log-seed-m7',
      date: '2026-11-12',
      shift: 'morning',
      happenedAt: '2026-11-12T11:30:00',
      notes: 'Shift Ended: Keys + Phone inside backroom for retrieval',
      loggedBy: 'Shahzeb',
      updatedAt: null
    },
    {
      id: 'log-seed-e1',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T14:50:00',
      notes: 'Shahzeb left his Fob key for entering POB (outside in bushes as I didn\'t get one)',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    },
    {
      id: 'log-seed-e2',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T14:55:00',
      notes: 'Let in Ms. Waslen Suite #1101 (she had been waiting outside for 1/2 hour as had forgotten her fob key inside and no resident at desk), let her in elevator too',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    },
    {
      id: 'log-seed-e3',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T15:00:00',
      notes: 'Phone and Keys retrieved from staff room',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    },
    {
      id: 'log-seed-e4',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T15:05:00',
      notes: 'Received packages already on desk 2 for #401, #402, #1201',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    },
    {
      id: 'log-seed-e5',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T15:22:00',
      notes: 'Delivered packages 2 for #401, #402, #1201',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    },
    {
      id: 'log-seed-e6',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T16:08:00',
      notes: '1st (A) Tour — Perimeters + Mech. + Electrical rooms and Parkades checked',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    },
    {
      id: 'log-seed-e7',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T16:52:00',
      notes: 'Benjamin arrived',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    },
    {
      id: 'log-seed-e8',
      date: '2026-11-12',
      shift: 'evening',
      happenedAt: '2026-11-12T17:02:00',
      notes: 'Ms. Patterson suite #303 three guests arrived/signed in and escorted to elevator',
      loggedBy: 'Alsina Butt',
      updatedAt: null
    }
  ],

  dailyLogNotesSeed: [
    {
      id: 'note-seed-1',
      title: 'Entrance door adjustment',
      body: 'Adjust automatic outer door opener if needed based on the weather. Select the correct door based on the wind.',
      status: 'open',
      createdBy: 'Shahzeb',
      createdAt: '2026-11-18T07:30:00',
      readAt: null,
      resolvedAt: null
    }
  ],

  visitors: [
    { id: 'vis-1', name: 'Liang Chen', suite: '204', signedInAt: '10:14 AM' },
    { id: 'vis-2', name: 'Sarah Park', suite: '1108', signedInAt: '11:02 AM' }
  ],

  /* Resident ledger. Money stays in integer cents; due dates are generated
     relative to today so the overview always has a genuine next payment. */
  payments: demoResidentPayments(),

  /* Building operations and closures. Used by the manager overview, not the
     resident dashboard. */
  buildingStatus: [
    { id: 'bs-elevator', title: 'Elevator B offline', detail: 'Monday, 8–11 a.m. · safety inspection', icon: 'elevator' },
    { id: 'bs-water', title: 'Water shut off', detail: 'Thursday, 9–11 a.m. · whole building', icon: 'alert' },
    { id: 'bs-gym', title: 'Gym closed tonight', detail: 'Deep clean 10 p.m. – 6 a.m.', icon: 'wrench' }
  ],

  frontDesk: {
    hours: '7 a.m. – 10 p.m. daily',
    phone: '(403) 555-0142',
    afterHours: '(403) 555-0199'
  },

  /* Notices the resident is asked to confirm they have read. */
  notices: [
    {
      id: 'notice-water',
      title: 'Water shut off this Thursday',
      category: 'Building update',
      postedAt: demoDaysAgo(2, 9, 0),
      body: 'Water will be shut off Thursday from 9–11 a.m. for riser repairs. Store water if you will need it during that window.'
    },
    {
      id: 'notice-parking',
      title: 'Visitor parking rules',
      category: 'Community',
      postedAt: demoDaysAgo(5, 15, 30),
      body: 'Visitor passes are now required after 6 p.m. Register guests at the front desk or through MySuite before they arrive.'
    },
    {
      id: 'notice-fire',
      title: 'Annual fire alarm testing',
      category: 'Safety',
      postedAt: demoDaysAgo(9, 8, 0),
      body: 'Alarm testing runs next week between 10 a.m. and noon. Alarms will sound intermittently; no evacuation is required.'
    }
  ],

  /* Violations recorded against the signed-in resident's suite. */
  violations: [
    {
      id: 'vio-1',
      reference: 'V-26-041',
      category: 'Noise',
      issuedOn: '2026-11-09',
      summary: 'Noise complaint from Suite 903 at 10:40 p.m. Quiet hours begin at 10 p.m.',
      status: 'open',
      fineCents: 10000,
      dueOn: '2026-12-01'
    },
    {
      id: 'vio-2',
      reference: 'V-26-037',
      category: 'Parking',
      issuedOn: '2026-10-21',
      summary: 'Vehicle left in a visitor stall overnight without a pass.',
      status: 'paid',
      fineCents: 7500,
      dueOn: '2026-11-05',
      paidOn: '2026-11-03'
    },
    {
      id: 'vio-3',
      reference: 'V-26-029',
      category: 'Amenity',
      issuedOn: '2026-09-30',
      summary: 'Common room occupied after posted hours; lights and chairs left out.',
      status: 'disputed',
      fineCents: 5000,
      dueOn: '2026-10-14'
    }
  ],

  /* What the building holds on file for the signed-in suite. */
  suiteRecord: {
    rows: [
      { label: 'Entry fob', value: 'Expires Jun 2027', pill: 'Active', tone: 'done' },
      { label: 'Parking', value: 'P2 · Stall 114' },
      { label: 'Storage', value: 'Locker 2B' },
      { label: 'Insurance', value: 'Wawanesa · expires Mar 15, 2027', pill: 'On file', tone: 'done' },
      { label: 'Emergency contact', value: 'Ana Santos · (403) 555-0188' }
    ]
  },

  /* Status is derived from the clock in resident/app.js — do not hardcode labels */
  amenitySchedule: [
    { date: '2026-11-13', time: '2:00 PM', amenity: 'Pool', suite: '501', residentName: 'Emily Larsson', duration: '1 hour' },
    { date: '2026-11-14', time: '5:00 PM', amenity: 'Gym', suite: '204', residentName: 'Alex Morgan', duration: '2 hours' },
    { date: '2026-11-14', time: '6:00 PM', amenity: 'Common room', suite: '803', residentName: 'Jamie Chen', duration: '2 hours' },
    { date: '2026-11-15', time: '10:00 AM', amenity: 'Pool', suite: '312', residentName: 'Maria Santos', duration: '1 hour' }
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

function getCurrentResident() {
  return getSessionAccount('resident') || findAccountById('acct-resident-maria');
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
  if (account.role === 'staff') {
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

/* ── Resident home demo helpers ───────────────────────────── */
function demoIsoDate(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* A day in a month relative to today; 0 is the current month. */
function demoMonthDay(monthOffset, day) {
  const now = new Date();
  return demoIsoDate(new Date(now.getFullYear(), now.getMonth() + monthOffset, day));
}

/* A local timestamp a number of days back, so demo recency stays truthful. */
function demoDaysAgo(days, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const pad = value => String(value).padStart(2, '0');
  return `${demoIsoDate(date)}T${pad(hour)}:${pad(minute)}:00`;
}

/* Replace with the real statement endpoint; keep the same shape. */
function demoResidentPayments() {
  return [
    {
      id: 'pay-fee-next',
      label: 'Monthly condo fee',
      amountCents: 61200,
      dueDate: demoMonthDay(1, 1),
      status: 'due',
      autopay: false,
      covers: 'Suite 101 fees, parking P2, and locker 2B'
    },
    {
      id: 'pay-fee-last',
      label: 'Monthly condo fee',
      amountCents: 61200,
      dueDate: demoMonthDay(0, 1),
      status: 'paid',
      autopay: false,
      paidOn: demoMonthDay(-1, 28)
    },
    {
      id: 'pay-fee-prior',
      label: 'Monthly condo fee',
      amountCents: 61200,
      dueDate: demoMonthDay(-1, 1),
      status: 'paid',
      autopay: false,
      paidOn: demoMonthDay(-2, 28)
    }
  ];
}

/* Back-compat aliases used by existing resident scripts */
const DEMO_RESIDENTS = MOCK_DATA.residents;
const PACKAGE_SEED = MOCK_DATA.packageSeed;
const DAILY_LOG_SEED = MOCK_DATA.dailyLogSeed;
const DAILY_LOG_NOTES_SEED = MOCK_DATA.dailyLogNotesSeed;
