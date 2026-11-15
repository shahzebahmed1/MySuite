/* Shared contact directory seed data.
   Requires: shared/mockdata.js (DEMO_RESIDENTS optional fallback).
   Contractor document access for portal users must be enforced server-side in production. */

const CONTACT_RESIDENT_SEED = [
  { id: 'cr-101', suite: '101', name: 'Maria Santos', phone: '(403) 555-0101', email: 'maria@example.com', kind: 'owner', initials: 'MS' },
  { id: 'cr-204', suite: '204', name: 'David Chen', phone: '(403) 555-0102', email: 'david@example.com', kind: 'tenant', initials: 'DC' },
  { id: 'cr-305', suite: '305', name: 'Sofia Reyes', phone: '(403) 555-0103', email: 'sofia@example.com', kind: 'owner', initials: 'SR' },
  { id: 'cr-312', suite: '312', name: 'Priya Nair', phone: '(403) 555-0104', email: 'priya@example.com', kind: 'tenant', initials: 'PN' },
  { id: 'cr-402', suite: '402', name: 'James Okafor', phone: '(403) 555-0105', email: 'james@example.com', kind: 'owner', initials: 'JO' },
  { id: 'cr-501', suite: '501', name: 'Emily Larsson', phone: '(403) 555-0106', email: 'emily@example.com', kind: 'tenant', initials: 'EL' },
  { id: 'cr-709', suite: '709', name: 'Marcus Webb', phone: '(403) 555-0107', email: 'marcus@example.com', kind: 'owner', initials: 'MW' },
  { id: 'cr-803', suite: '803', name: 'Yuki Tanaka', phone: '(403) 555-0108', email: 'yuki@example.com', kind: 'owner', initials: 'YT', board: true },
  { id: 'cr-1108', suite: '1108', name: 'Fatima Al-Rashid', phone: '(403) 555-0109', email: 'fatima@example.com', kind: 'tenant', initials: 'FA' },
  { id: 'cr-1204', suite: '1204', name: 'Alex Morgan', phone: '(403) 555-0110', email: 'alex@example.com', kind: 'owner', initials: 'AM', board: true }
];

const CONTACT_BUILDING_SEED = [
  { id: 'cb-1', suite: 'Lobby', name: 'Front desk', phone: '(403) 555-1000', email: 'desk@thepoint.example', kind: 'building', initials: 'FD', roleLabel: 'Concierge' },
  { id: 'cb-2', suite: 'Office', name: 'Sam Rivera', phone: '(403) 555-1001', email: 'manager@thepoint.example', kind: 'building', initials: 'SR', roleLabel: 'Property manager' },
  { id: 'cb-3', suite: 'Shop', name: 'Morgan Taylor', phone: '(403) 555-1002', email: 'tech@thepoint.example', kind: 'building', initials: 'MT', roleLabel: 'Building technician' },
  { id: 'cb-4', suite: '—', name: 'Emergency after-hours', phone: '(403) 555-0911', email: 'urgent@thepoint.example', kind: 'building', initials: 'EM', roleLabel: 'Emergency line' }
];

const CONTACT_CONTRACTOR_SEED = [
  {
    id: 'cc-1',
    name: 'Prairie Elevator Co.',
    phone: '(403) 555-2201',
    email: 'service@prairieelevator.example',
    kind: 'contractor',
    initials: 'PE',
    roleLabel: 'Elevator',
    documents: [
      {
        id: 'cd-1a',
        filename: 'Liability_Insurance_2026.pdf',
        uploadedAt: '2026-01-12',
        issueAt: '2026-01-01',
        sharedWithResidents: true,
        status: 'on_file'
      },
      {
        id: 'cd-1b',
        filename: 'WCB_Clearance.pdf',
        uploadedAt: '2026-02-03',
        issueAt: '2026-02-01',
        sharedWithResidents: true,
        status: 'on_file'
      },
      {
        id: 'cd-1c',
        filename: 'Service_Info_Elevators.pdf',
        uploadedAt: '2025-11-20',
        issueAt: '2025-11-15',
        sharedWithResidents: true,
        status: 'on_file'
      },
      {
        id: 'cd-1d',
        filename: 'Internal_Rate_Card.pdf',
        uploadedAt: '2026-03-01',
        sharedWithResidents: false,
        status: 'on_file'
      }
    ]
  },
  {
    id: 'cc-2',
    name: 'Bow Valley Plumbing',
    phone: '(403) 555-2202',
    email: 'dispatch@bowvalleyplumbing.example',
    kind: 'contractor',
    initials: 'BV',
    roleLabel: 'Plumbing',
    documents: [
      {
        id: 'cd-2a',
        filename: 'Liability_Insurance.pdf',
        uploadedAt: '2025-06-10',
        issueAt: '2025-06-01',
        sharedWithResidents: true,
        status: 'on_file'
      },
      {
        id: 'cd-2b',
        filename: 'WCB_Clearance.pdf',
        uploadedAt: '2024-09-01',
        issueAt: '2024-09-01',
        sharedWithResidents: true,
        status: 'on_file'
      }
    ]
  },
  {
    id: 'cc-3',
    name: 'Chinook HVAC Systems',
    phone: '(403) 555-2203',
    email: 'jobs@chinookhvac.example',
    kind: 'contractor',
    initials: 'CH',
    roleLabel: 'HVAC',
    documents: [
      {
        id: 'cd-3a',
        filename: 'Service_Information.pdf',
        uploadedAt: '2026-04-18',
        issueAt: '2026-04-18',
        sharedWithResidents: true,
        status: 'on_file'
      }
    ]
  },
  {
    id: 'cc-4',
    name: 'Summit Fire Protection',
    phone: '(403) 555-2204',
    email: 'ops@summitfire.example',
    kind: 'contractor',
    initials: 'SF',
    roleLabel: 'Fire safety',
    documents: []
  },
  {
    id: 'cc-5',
    name: 'Riverbend Electrical',
    phone: '(403) 555-2205',
    email: 'crew@riverbendelectric.example',
    kind: 'contractor',
    initials: 'RE',
    roleLabel: 'Electrical',
    documents: [
      {
        id: 'cd-5a',
        filename: 'Liability_Insurance.pdf',
        uploadedAt: '2026-03-22',
        issueAt: '2026-03-15',
        sharedWithResidents: true,
        status: 'on_file'
      },
      {
        id: 'cd-5b',
        filename: 'Electrical_Safety_Certificate.pdf',
        uploadedAt: '2026-03-22',
        issueAt: '2026-03-20',
        sharedWithResidents: true,
        status: 'on_file'
      }
    ]
  }
];

function contactInitials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || '?';
}

function getDirectoryResidents() {
  return CONTACT_RESIDENT_SEED.map(r => ({ ...r }));
}

function getDirectoryBuildingContacts() {
  const staff = CONTACT_BUILDING_SEED.map(c => ({ ...c }));
  const boardMembers = CONTACT_RESIDENT_SEED
    .filter(r => r.board)
    .map(r => ({
      ...r,
      kind: 'building',
      roleLabel: 'Board member'
    }));
  return [...staff, ...boardMembers];
}

function getDirectoryContractors() {
  let contractors = CONTACT_CONTRACTOR_SEED;
  try {
    const saved = JSON.parse(localStorage.getItem('mysuite-approved-contractors'));
    if (Array.isArray(saved)) contractors = saved;
  } catch { /* Use seed data if browser storage is unavailable. */ }
  return contractors.map(c => ({
    ...c,
    documents: (c.documents || []).map(d => ({ ...d }))
  }));
}

function getContractorById(id) {
  const found = getDirectoryContractors().find(c => c.id === id);
  if (!found) return null;
  return {
    ...found,
    documents: (found.documents || []).map(d => ({ ...d }))
  };
}

/* Local demo only. Production requires authenticated manager APIs and private
   document storage; a browser role is not an authorization boundary. */
function saveDirectoryContractor(contractor) {
  if (document.body.dataset.portalRole !== 'manager') throw new Error('Manager access required.');
  const rows = getDirectoryContractors();
  const index = rows.findIndex(row => row.id === contractor.id);
  if (index < 0) rows.push(contractor);
  else rows[index] = contractor;
  try {
    localStorage.setItem('mysuite-approved-contractors', JSON.stringify(rows));
  } catch {
    throw new Error('Could not save in this browser. Storage may be full or disabled. Try fewer or smaller PDFs.');
  }
}

/* Store large PDFs as binary objects, keeping only metadata in localStorage. */
function contractorPdfTransaction(mode, operation) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('PDF storage is unavailable in this browser. Try a regular browser window.'));
      return;
    }
    let blocked = false;
    const opening = indexedDB.open('mysuite-contractor-pdfs', 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore('pdfs');
    opening.onerror = () => reject(new Error('Could not access PDF storage in this browser.'));
    opening.onblocked = () => {
      blocked = true;
      reject(new Error('Close other portal tabs and try saving again.'));
    };
    opening.onsuccess = () => {
      const db = opening.result;
      if (blocked) { db.close(); return; }
      db.onversionchange = () => db.close();
      let transaction;
      let result;
      try {
        transaction = db.transaction('pdfs', mode);
        const request = operation(transaction.objectStore('pdfs'));
        if (request) request.onsuccess = () => { result = request.result; };
      } catch (error) {
        transaction?.abort();
        db.close();
        reject(error);
        return;
      }
      transaction.oncomplete = () => { db.close(); resolve(result); };
      transaction.onabort = () => {
        db.close();
        reject(new Error('Could not store PDFs. Browser storage may be full or disabled. Try fewer files.'));
      };
      transaction.onerror = () => { /* The abort handler reports transaction failures. */ };
    };
  });
}

async function saveDirectoryContractorWithFiles(contractor, files) {
  if (document.body.dataset.portalRole !== 'manager') throw new Error('Manager access required.');
  const retainedIds = new Set((contractor.documents || []).map(doc => doc.id));
  const removedFiles = (getContractorById(contractor.id)?.documents || [])
    .filter(doc => doc.blobStored && !retainedIds.has(doc.id));
  if (files.length) {
    await contractorPdfTransaction('readwrite', store => {
      files.forEach(({ id, file }) => store.put(file, id));
    });
  }
  try {
    saveDirectoryContractor(contractor);
  } catch (error) {
    if (files.length) {
      try {
        await contractorPdfTransaction('readwrite', store => {
          files.forEach(({ id }) => store.delete(id));
        });
      } catch { /* Metadata was not saved; never report this upload as successful. */ }
    }
    throw error;
  }
  // Clear removed binary files only after the updated document list is saved.
  // A failed save must leave existing PDFs available to the contractor.
  if (removedFiles.length) {
    try {
      await contractorPdfTransaction('readwrite', store => {
        removedFiles.forEach(doc => store.delete(doc.id));
      });
    } catch {
      return { cleanupFailed: true };
    }
  }
  return { cleanupFailed: false };
}

async function readContractorPdf(id) {
  const blob = await contractorPdfTransaction('readonly', store => store.get(id));
  if (!(blob instanceof Blob)) throw new Error('This PDF is no longer stored in this browser.');
  return blob;
}

/** All uploaded contractor documents are available to every portal role. */
function getContractorDocuments(contractor) {
  const list = contractor?.documents || [];
  return list
    .map(d => ({ ...d, status: 'on_file' }));
}

function formatDirectoryDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const [y, mo, d] = String(dateStr).split('-').map(Number);
    return new Date(y, mo - 1, d).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Demo stand-in for a secured document API.
 * Swap for fetch(`/api/contractors/${id}`) with server-side permission checks.
 */
function fetchDirectoryContractorDetails(id) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const contractor = getContractorById(id);
      if (!contractor) {
        reject(new Error('Contractor not found.'));
        return;
      }
      resolve({
        ...contractor,
        documents: getContractorDocuments(contractor)
      });
    }, 280);
  });
}
