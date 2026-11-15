/* Shared condo documents seed (demo).
   Replace with document-service API later — keep the same shapes. */

const CONDO_DOCUMENTS = [
  {
    id: 'doc-bylaws',
    title: 'Condominium bylaws',
    category: 'Bylaws',
    updatedAt: '2026-03-12',
    summary: 'The governing bylaws for The Point on the Bow, including unit use, common property, and board authority.'
  },
  {
    id: 'doc-rules',
    title: 'House rules',
    category: 'Rules',
    updatedAt: '2026-06-01',
    summary: 'Day-to-day building rules for noise, pets, smoking, balconies, and shared spaces.'
  },
  {
    id: 'doc-move',
    title: 'Move-in / move-out guide',
    category: 'Guides',
    updatedAt: '2025-11-18',
    summary: 'How to book the service elevator, protect common areas, and complete move paperwork with the desk.'
  },
  {
    id: 'doc-parking',
    title: 'Parking & visitor policy',
    category: 'Rules',
    updatedAt: '2026-01-20',
    summary: 'Assigned stalls, visitor parking rules, and what to do if a vehicle is blocking access.'
  },
  {
    id: 'doc-amenities',
    title: 'Amenity booking guide',
    category: 'Guides',
    updatedAt: '2026-04-08',
    summary: 'Hours, booking windows, and guest rules for the pool, gym, and common room.'
  },
  {
    id: 'doc-insurance',
    title: 'Insurance requirements',
    category: 'Forms',
    updatedAt: '2025-09-02',
    summary: 'Minimum contents insurance residents must carry, and how to provide proof to management.'
  },
  {
    id: 'doc-emergency',
    title: 'Emergency procedures',
    category: 'Guides',
    updatedAt: '2026-02-14',
    summary: 'Fire alarm response, evacuation routes, and who to contact after hours.'
  },
  {
    id: 'doc-pet',
    title: 'Pet registration form',
    category: 'Forms',
    updatedAt: '2025-08-30',
    summary: 'Register a pet with the building and confirm the current pet rules in the house rules.'
  }
];

const DOCUMENT_CATEGORIES = ['All', 'Bylaws', 'Rules', 'Guides', 'Forms'];

function getCondoDocuments() {
  return CONDO_DOCUMENTS.map(d => ({ ...d }));
}

function findCondoDocument(id) {
  return CONDO_DOCUMENTS.find(d => d.id === id) || null;
}

function formatDocumentDate(dateStr) {
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
