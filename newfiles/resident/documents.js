/* Resident — condo documents.
   Requires: icons.js, utils.js, mockdata.js, documents-data.js */

renderIcons();
applyLoggedInUser('resident');

let activeCategory = 'All';
let query = '';

function closeMenu() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.scrim')?.classList.remove('visible');
  document.querySelector('.mobile-toggle')?.setAttribute('aria-expanded', 'false');
}

document.querySelector('.sidebar nav')?.addEventListener('click', event => {
  const link = event.target.closest('a.nav-item');
  if (!link) return;
  closeMenu();
  if (link.getAttribute('href') === '#') event.preventDefault();
});

function filteredDocuments() {
  const q = query.trim().toLowerCase();
  return getCondoDocuments().filter(doc => {
    if (activeCategory !== 'All' && doc.category !== activeCategory) return false;
    if (!q) return true;
    return [doc.title, doc.category, doc.summary]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q));
  });
}

function renderFilters() {
  const el = document.querySelector('#docs-filters');
  if (!el) return;
  el.innerHTML = DOCUMENT_CATEGORIES.map(cat => {
    const active = cat === activeCategory ? ' active' : '';
    return `<button type="button" class="docs-chip${active}" data-category="${cat}">${cat}</button>`;
  }).join('');
}

function renderList() {
  const listEl = document.querySelector('#docs-list');
  const emptyEl = document.querySelector('#docs-empty');
  if (!listEl) return;

  const rows = filteredDocuments();
  if (rows.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = rows.map(doc => `<button type="button" class="doc-row" data-doc-id="${doc.id}">
    <span>
      <strong>${doc.title}</strong>
      <span class="doc-meta">${doc.category} · Updated ${formatDocumentDate(doc.updatedAt)}</span>
    </span>
    <span class="doc-open">View</span>
  </button>`).join('');
}

function openDocument(id) {
  const doc = findCondoDocument(id);
  if (!doc) return;
  openModal(
    doc.title,
    `<div class="dialog-info">${doc.category} · Updated ${formatDocumentDate(doc.updatedAt)}</div>
     <p>${doc.summary}</p>
     <p style="font-size:14px;line-height:1.45;color:#5c4a3c">Demo library · File viewing and download will connect to your document service.</p>
     <button class="button full" type="button" data-action="demo-download" data-doc-id="${doc.id}">Download (demo)</button>`
  );
}

document.querySelector('#docs-search')?.addEventListener('input', event => {
  query = event.target.value || '';
  renderList();
});

document.querySelector('#docs-filters')?.addEventListener('click', event => {
  const chip = event.target.closest('[data-category]');
  if (!chip) return;
  activeCategory = chip.dataset.category;
  renderFilters();
  renderList();
});

document.querySelector('#docs-list')?.addEventListener('click', event => {
  const row = event.target.closest('[data-doc-id]');
  if (!row) return;
  openDocument(row.dataset.docId);
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'menu') {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  } else if (action === 'close-menu') {
    closeMenu();
  } else if (action === 'close-modal') {
    modal.close();
  } else if (action === 'demo-download') {
    toast('Demo only. Connect your document service to download real files.');
  } else if (action === 'help') {
    openModal(
      'Documents help',
      '<p>Browse condo bylaws, house rules, guides, and forms.</p><p>Use search or the category buttons to find a document, then open it for a short summary.</p>'
    );
  }
});

const lightingPicker = document.querySelector('#header-lighting');
const lightingOptions = ['morning', 'afternoon', 'evening', 'night'];
const savedLighting = readSaved('mysuite-header-lighting', 'afternoon');
function setLighting(value) {
  const selected = lightingOptions.includes(value) ? value : 'afternoon';
  document.body.dataset.time = selected;
  if (lightingPicker) lightingPicker.value = selected;
}
setLighting(savedLighting);
lightingPicker?.addEventListener('change', () => {
  setLighting(lightingPicker.value);
  save('mysuite-header-lighting', lightingPicker.value);
});

renderFilters();
renderList();
renderIcons(document.querySelector('.docs-toolbar'));
