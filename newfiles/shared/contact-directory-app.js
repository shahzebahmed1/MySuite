/* Shared Contact Directory UI logic.
   Requires: icons.js, utils.js, mockdata.js, contact-directory-data.js
   Set body[data-portal-role] before this runs (e.g. concierge, resident). */

(function initContactDirectory() {
  const role = document.body.dataset.portalRole || 'resident';
  /* Residents must not see other residents' private contact details */
  const buildingOnly = role === 'resident' || document.body.dataset.directoryScope === 'building';
  const canViewContractorDetails = ['resident', 'board', 'concierge', 'technician'].includes(role);
  const canManageContractors = role === 'manager';
  let editorSaving = false;
  let pendingContractorFiles = [];
  let removedContractorDocumentIds = new Set();
  const maxContractorPdfSize = 50 * 1024 * 1024;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  renderIcons();
  applyLoggedInUser(role);

  let activeTab = buildingOnly ? 'building' : 'residents';
  let activeFilter = 'all';
  let query = '';
  let contractorTrigger = null;
  let contractorFocusables = [];

  const contractorModal = document.querySelector('#contractor-modal');
  const helpModal = document.querySelector('#modal');

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

  function matchesQuery(row) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [row.name, row.suite, row.phone, row.email, row.roleLabel]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q));
  }

  function currentRows() {
    if (activeTab === 'contractors') {
      return getDirectoryContractors().filter(matchesQuery);
    }
    if (activeTab === 'building' || (buildingOnly && activeTab !== 'contractors')) {
      return getDirectoryBuildingContacts().filter(matchesQuery);
    }
    return getDirectoryResidents()
      .filter(r => activeFilter === 'all' || r.kind === activeFilter)
      .filter(matchesQuery);
  }

  function showContractorActions() {
    return (canViewContractorDetails || canManageContractors) && activeTab === 'contractors';
  }

  function phoneHref(phone) {
    const digits = String(phone || '').replace(/[^\d+]/g, '');
    return digits ? `tel:${digits}` : '#';
  }

  function renderTable() {
    const tbody = document.querySelector('#dir-tbody');
    const empty = document.querySelector('#dir-empty');
    const nameHead = document.querySelector('#dir-col-name');
    const suiteHead = document.querySelector('#dir-col-suite');
    const actionsHead = document.querySelector('#dir-col-actions');
    if (!tbody) return;

    const showSuite = !buildingOnly && activeTab === 'residents';
    const showActions = showContractorActions();
    if (nameHead) {
      if (activeTab === 'contractors') nameHead.textContent = 'Contractor';
      else if (showSuite) nameHead.textContent = 'Resident';
      else nameHead.textContent = 'Contact';
    }
    if (suiteHead) suiteHead.hidden = !showSuite;
    if (actionsHead) actionsHead.hidden = !showActions;

    const rows = currentRows();
    if (rows.length === 0) {
      tbody.innerHTML = '';
      if (empty) {
        empty.hidden = false;
        empty.textContent = activeTab === 'contractors'
          ? 'No approved contractors match that search.'
          : 'No contacts match that search.';
      }
      return;
    }
    if (empty) empty.hidden = true;

    tbody.innerHTML = rows.map(row => {
      const sub = row.roleLabel ? `<span class="dir-role-label">${escapeHtml(row.roleLabel)}</span>` : '';
      const suiteCell = showSuite ? `<td class="dir-suite">${escapeHtml(row.suite || '—')}</td>` : '';
      const actionsCell = showActions
        ? `<td class="dir-actions"><button type="button" class="button outline compact" data-action="${canManageContractors ? 'edit-contractor' : 'view-contractor'}" data-contractor-id="${escapeHtml(row.id)}">${canManageContractors ? 'Edit' : 'View details'}</button></td>`
        : '';
      return `<tr>
        ${suiteCell}
        <td>
          <span class="dir-person">
            <span>${escapeHtml(row.name)}${sub}</span>
          </span>
        </td>
        <td><span class="dir-contact-cell"><i data-icon="phone"></i>${escapeHtml(row.phone || '—')}</span></td>
        <td><span class="dir-contact-cell"><i data-icon="mail"></i>${escapeHtml(row.email || '—')}</span></td>
        ${actionsCell}
      </tr>`;
    }).join('');
    renderIcons(tbody);
  }

  function setTab(tab) {
    if (buildingOnly && tab === 'residents') tab = 'building';
    activeTab = tab;
    const addButton = document.querySelector('#dir-add-contractor');
    if (addButton) addButton.hidden = !canManageContractors || tab !== 'contractors';
    document.querySelectorAll('.dir-tab').forEach(btn => {
      const on = btn.dataset.tab === tab;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });
    const filters = document.querySelector('#dir-filters');
    if (filters) {
      filters.hidden = buildingOnly || tab !== 'residents';
      if (tab !== 'residents') activeFilter = 'all';
    }
    renderTable();
  }

  function setFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll('.dir-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTable();
  }

  function setBodyScrollLocked(locked) {
    document.body.classList.toggle('modal-open', locked);
  }

  function getContractorFocusables() {
    if (!contractorModal) return [];
    return [...contractorModal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(el => el.offsetParent !== null || el === contractorModal.querySelector('[data-action="close-contractor-modal"]'));
  }

  function trapContractorFocus(event) {
    if (!contractorModal?.open || event.key !== 'Tab') return;
    contractorFocusables = getContractorFocusables();
    if (contractorFocusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = contractorFocusables[0];
    const last = contractorFocusables[contractorFocusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function closeContractorModal() {
    if (editorSaving) return;
    if (!contractorModal?.open) return;
    closeDocumentMenus();
    contractorModal.close();
    setBodyScrollLocked(false);
    document.removeEventListener('keydown', trapContractorFocus, true);
    if (contractorTrigger && typeof contractorTrigger.focus === 'function') {
      contractorTrigger.focus();
    }
    contractorTrigger = null;
  }

  function demoDocumentBlob(doc) {
    if (doc.pdfData) {
      const bytes = Uint8Array.from(atob(doc.pdfData), char => char.charCodeAt(0));
      return new Blob([bytes], { type: 'application/pdf' });
    }
    const body = [
      `MySuite demo document`,
      `Filename: ${doc.filename}`,
      `Uploaded: ${doc.uploadedAt || '—'}`,
      '',
      'This is placeholder content for the resident portal demo.',
      'Connect your document service for real files. Access must be enforced server-side.'
    ].join('\n');
    return new Blob([body], { type: 'text/plain' });
  }

  async function viewContractorDocument(doc) {
    let preview;
    try {
      // Open during the click so asynchronous storage reads do not block the popup.
      preview = window.open('about:blank', '_blank');
      if (!preview) throw new Error('Allow popups to view PDFs, or use Download.');
      preview.opener = null;
      const blob = doc.blobStored ? await readContractorPdf(doc.id) : demoDocumentBlob(doc);
      const url = URL.createObjectURL(blob);
      preview.location.replace(url);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      preview?.close();
      toast(error.message || 'Could not open that document. Try again.');
    }
  }

  async function downloadContractorDocument(doc) {
    try {
      const blob = doc.blobStored ? await readContractorPdf(doc.id) : demoDocumentBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename || 'document.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast('Download started.');
    } catch {
      toast('Could not download that document. Try again.');
    }
  }

  function renderContractorDocuments(docs) {
    if (!docs.length) {
      return '';
    }
    return `<ul class="contractor-doc-list">${docs.map((doc, index) => {
      return `<li class="contractor-doc-row">
        <span class="contractor-doc-icon" aria-hidden="true"><i data-icon="file"></i></span>
        <div class="contractor-doc-main">
          <strong>${escapeHtml(doc.filename)}</strong>
        </div>
        <div class="contractor-doc-options">
          <button type="button" class="icon-button contractor-doc-menu-trigger" data-action="contractor-doc-menu" aria-label="Document options for ${escapeHtml(doc.filename)}" aria-haspopup="menu" aria-expanded="false" aria-controls="contractor-doc-menu-${index}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
          <div id="contractor-doc-menu-${index}" class="contractor-doc-menu" popover="auto" role="menu" aria-label="Document options">
            <button type="button" role="menuitem" data-action="view-contractor-doc" data-doc-id="${escapeHtml(doc.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>View PDF</button>
            <button type="button" role="menuitem" data-action="download-contractor-doc" data-doc-id="${escapeHtml(doc.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/></svg>Download</button>
            ${canManageContractors ? `<button type="button" role="menuitem" class="contractor-menu-remove" data-action="remove-uploaded-contractor-doc" data-doc-id="${escapeHtml(doc.id)}"><i data-icon="trash"></i>Remove document</button>` : ''}
          </div>
        </div>
      </li>`;
    }).join('')}</ul>`;
  }

  function renderContractorModalLoading() {
    const body = document.querySelector('#contractor-modal-body');
    if (!body) return;
    body.hidden = false;
    body.innerHTML = '<p class="contractor-status">Loading contractor details…</p>';
  }

  function renderContractorModalError(message) {
    const body = document.querySelector('#contractor-modal-body');
    if (!body) return;
    body.hidden = false;
    body.innerHTML = `<p class="contractor-status is-error">${message || 'Could not load contractor details.'}</p>
      <button type="button" class="button outline" data-action="close-contractor-modal">Close</button>`;
    renderIcons(body);
  }

  function renderContractorModalContent(contractor) {
    const title = document.querySelector('#contractor-modal-title');
    const trade = document.querySelector('#contractor-modal-trade');
    const body = document.querySelector('#contractor-modal-body');
    if (title) title.textContent = contractor.name || 'Contractor';
    if (trade) trade.textContent = contractor.roleLabel || 'Trade';
    if (!body) return;

    const tel = phoneHref(contractor.phone);
    const mail = contractor.email ? `mailto:${encodeURIComponent(contractor.email)}` : '#';
    const contacts = document.querySelector('#contractor-header-contacts');
    if (contacts) {
      contacts.innerHTML = `
          <a class="contractor-contact-link" href="${tel}">
            <i data-icon="phone"></i>
            <span>${escapeHtml(contractor.phone || '—')}</span>
          </a>
          <a class="contractor-contact-link" href="${mail}">
            <i data-icon="mail"></i>
            <span>${escapeHtml(contractor.email || '—')}</span>
          </a>
        `;
      renderIcons(contacts);
    }
    const documents = contractor.documents || [];
    body.hidden = documents.length === 0;
    body.innerHTML = documents.length ? `
      <section class="contractor-section" aria-label="Documents">
        <div class="contractor-docs-heading">
          <h3>Documents</h3>
        </div>
        <div class="contractor-docs-scroll">
          ${renderContractorDocuments(documents)}
        </div>
      </section>` : '';
    body.dataset.contractorId = contractor.id;
    renderIcons(body);
  }

  async function openContractorModal(id, trigger) {
    if (!contractorModal || !canViewContractorDetails) return;
    contractorTrigger = trigger || null;
    const title = document.querySelector('#contractor-modal-title');
    const trade = document.querySelector('#contractor-modal-trade');
    if (title) title.textContent = 'Contractor';
    if (trade) trade.textContent = 'Loading…';
    const contacts = document.querySelector('#contractor-header-contacts');
    if (contacts) contacts.replaceChildren();
    renderContractorModalLoading();
    if (!contractorModal.open) contractorModal.showModal();
    setBodyScrollLocked(true);
    document.addEventListener('keydown', trapContractorFocus, true);
    window.setTimeout(() => {
      contractorModal.querySelector('[data-action="close-contractor-modal"]')?.focus();
    }, 0);

    try {
      const details = await fetchDirectoryContractorDetails(id);
      if (!contractorModal.open) return;
      renderContractorModalContent(details);
      contractorFocusables = getContractorFocusables();
      contractorModal.querySelector('[data-action="close-contractor-modal"]')?.focus();
    } catch (err) {
      if (!contractorModal.open) return;
      renderContractorModalError(err?.message || 'Could not load contractor details.');
      contractorModal.querySelector('[data-action="close-contractor-modal"]')?.focus();
    }
  }

  function openContractorEditor(id, trigger) {
    if (!canManageContractors || !contractorModal) return;
    const contractor = id ? getContractorById(id) : null;
    if (id && !contractor) return toast('That contractor is no longer available.');
    contractorTrigger = trigger;
    pendingContractorFiles = [];
    removedContractorDocumentIds = new Set();
    document.querySelector('#contractor-modal-title').textContent = id ? 'Edit contractor' : 'Add contractor';
    const body = document.querySelector('#contractor-modal-body');
    body.dataset.contractorId = id || '';
    body.innerHTML = `<form id="contractor-form" class="contractor-form">
      <div class="contractor-fields">
      <label>Company name <input name="name" required maxlength="160" value="${escapeHtml(contractor?.name)}" autocomplete="organization"></label>
      <label>Trade <input name="trade" required maxlength="100" value="${escapeHtml(contractor?.roleLabel)}" placeholder="For example, Plumbing"></label>
      <label>Phone <input name="phone" type="tel" maxlength="50" value="${escapeHtml(contractor?.phone)}" autocomplete="tel"></label>
      <label>Email <input name="email" type="email" maxlength="254" value="${escapeHtml(contractor?.email)}" autocomplete="email"></label>
      </div>
      <section class="contractor-section" aria-label="Uploaded Documents">
        <h3>Uploaded Documents</h3>
        <div class="contractor-upload" id="contractor-upload">
          <span class="contractor-upload-icon" aria-hidden="true"><i data-icon="file"></i></span>
          <div class="contractor-upload-copy"><strong>Add PDF documents</strong><span id="contractor-upload-note">Drop files here or browse · Up to 50 MB each</span></div>
          <button type="button" class="button outline compact" data-action="browse-contractor-pdfs" aria-describedby="contractor-upload-note">Upload</button>
          <input id="contractor-pdfs" name="pdfs" type="file" accept=".pdf,application/pdf" multiple aria-label="Choose PDF documents" hidden>
        </div>
        <ul id="contractor-pending-files" class="contractor-pending-files" aria-label="Selected PDFs" hidden></ul>
        <p id="contractor-upload-status" class="contractor-upload-status" role="status"></p>
        <div id="contractor-uploaded-documents">${renderContractorDocuments(contractor?.documents || [])}</div>
        <p id="contractor-removal-status" class="contractor-docs-note" role="status" hidden></p>
      </section>
      <p id="contractor-form-error" class="contractor-status is-error" role="alert" hidden></p>
      <div class="contractor-form-actions"><button type="button" class="button outline" data-action="close-contractor-modal">Cancel</button><button type="submit" class="button">Save</button></div>
    </form>`;
    setupContractorUpload(body.querySelector('#contractor-form'));
    renderIcons(body);
    contractorModal.showModal();
    setBodyScrollLocked(true);
    document.addEventListener('keydown', trapContractorFocus, true);
    body.querySelector('input').focus();
  }

  function renderPendingContractorFiles(form) {
    const list = form.querySelector('#contractor-pending-files');
    list.hidden = pendingContractorFiles.length === 0;
    list.innerHTML = pendingContractorFiles.map((file, index) => `<li>
      <span class="contractor-pending-name">${escapeHtml(file.name)}<small>${file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}</small></span>
      <button type="button" class="icon-button" data-action="remove-contractor-pdf" data-file-index="${index}" aria-label="Remove ${escapeHtml(file.name)}"><i data-icon="close"></i></button>
    </li>`).join('');
    renderIcons(list);
  }

  function setupContractorUpload(form) {
    const input = form.querySelector('#contractor-pdfs');
    const dropArea = form.querySelector('#contractor-upload');
    const status = form.querySelector('#contractor-upload-status');
    function addFiles(files) {
      if (editorSaving) return;
      const rejected = [];
      for (const file of files) {
        if (!/\.pdf$/i.test(file.name) || file.size > maxContractorPdfSize || file.size < 5) {
          rejected.push(file.name);
          continue;
        }
        if (!pendingContractorFiles.some(other => other.name === file.name && other.size === file.size && other.lastModified === file.lastModified)) {
          pendingContractorFiles.push(file);
        }
      }
      renderPendingContractorFiles(form);
      status.textContent = rejected.length
        ? `Not added: ${rejected.join(', ')}. Choose PDFs up to 50 MB each.`
        : `${pendingContractorFiles.length} PDF${pendingContractorFiles.length === 1 ? '' : 's'} ready to save.`;
      status.classList.toggle('is-error', rejected.length > 0);
    }
    input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
    dropArea.addEventListener('dragover', event => {
      event.preventDefault();
      if (!editorSaving) dropArea.classList.add('is-dragging');
    });
    dropArea.addEventListener('dragleave', event => {
      if (!dropArea.contains(event.relatedTarget)) dropArea.classList.remove('is-dragging');
    });
    dropArea.addEventListener('drop', event => {
      event.preventDefault();
      dropArea.classList.remove('is-dragging');
      addFiles(event.dataTransfer?.files || []);
    });
  }

  document.addEventListener('submit', async event => {
    if (event.target.id !== 'contractor-form' || !canManageContractors) return;
    event.preventDefault();
    if (editorSaving) return;
    const form = event.target;
    const error = form.querySelector('#contractor-form-error');
    error.hidden = true;
    const fields = form.elements;
    const name = fields.namedItem('name').value.trim();
    const trade = fields.namedItem('trade').value.trim();
    if (!name || !trade) {
      error.textContent = 'Enter a company name and trade.';
      error.hidden = false;
      return;
    }
    editorSaving = true;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Saving…';
    form.setAttribute('aria-busy', 'true');
    const controls = [...form.querySelectorAll('input, button')];
    controls.forEach(control => { control.disabled = true; });
    try {
      const id = document.querySelector('#contractor-modal-body').dataset.contractorId;
      const existing = id ? getContractorById(id) : null;
      if (id && !existing) throw new Error('Contractor not found. Reopen the form and try again.');
      const documents = (existing?.documents || []).filter(doc => !removedContractorDocumentIds.has(doc.id));
      const uploads = [];
      for (const file of pendingContractorFiles) {
        if (!/\.pdf$/i.test(file.name) || file.size > maxContractorPdfSize) {
          throw new Error('Choose PDF files up to 50 MB each.');
        }
        const header = await file.slice(0, 5).text();
        if (header !== '%PDF-') throw new Error(`${file.name} is not a valid PDF file.`);
        const documentId = `cd-${crypto.randomUUID()}`;
        uploads.push({ id: documentId, file });
        documents.push({ id: documentId, filename: file.name,
          uploadedAt: new Date().toLocaleDateString('en-CA'),
          sharedWithResidents: false,
          status: 'on_file', blobStored: true });
      }
      const result = await saveDirectoryContractorWithFiles({ ...existing, id: id || `cc-${crypto.randomUUID()}`,
        name, roleLabel: trade, kind: 'contractor', initials: contactInitials(name),
        phone: fields.namedItem('phone').value.trim(), email: fields.namedItem('email').value.trim(), documents }, uploads);
      editorSaving = false;
      closeContractorModal();
      renderTable();
      toast(result?.cleanupFailed
        ? 'Contractor updated. Some removed PDF files could not be cleared from browser storage.'
        : id ? 'Contractor updated.' : 'Contractor added.');
    } catch (err) {
      error.textContent = err.message || 'Could not save. Please try again.';
      error.hidden = false;
    } finally {
      editorSaving = false;
      form.removeAttribute('aria-busy');
      controls.forEach(control => { control.disabled = false; });
      submit.disabled = false;
      submit.textContent = 'Save';
    }
  });

  document.querySelector('#dir-search')?.addEventListener('input', event => {
    query = event.target.value || '';
    renderTable();
  });

  function closeDocumentMenus() {
    document.querySelectorAll('.contractor-doc-menu:popover-open').forEach(menu => {
      menu.hidePopover();
      menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
    });
  }

  function openDocumentMenu(trigger) {
    const menu = trigger.nextElementSibling;
    const wasOpen = menu.matches(':popover-open');
    closeDocumentMenus();
    if (wasOpen) return;
    menu.showPopover();
    trigger.setAttribute('aria-expanded', 'true');
    const anchor = trigger.getBoundingClientRect();
    const bounds = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(12, Math.min(anchor.right - bounds.width, window.innerWidth - bounds.width - 12))}px`;
    menu.style.top = `${Math.max(12, Math.min(anchor.bottom + 6, window.innerHeight - bounds.height - 12))}px`;
    menu.querySelector('button')?.focus();
  }

  document.addEventListener('toggle', event => {
    if (event.target.matches?.('.contractor-doc-menu')) {
      event.target.previousElementSibling?.setAttribute('aria-expanded', String(event.newState === 'open'));
    }
  }, true);

  document.addEventListener('keydown', event => {
    const trigger = event.target.closest('[data-action="contractor-doc-menu"]');
    const menu = event.target.closest('.contractor-doc-menu');
    if (trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      openDocumentMenu(trigger);
      if (event.key === 'ArrowUp') trigger.nextElementSibling.querySelector('button:last-child')?.focus();
    } else if (menu) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); }
        const opener = menu.previousElementSibling;
        closeDocumentMenus();
        opener?.focus();
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const items = [...menu.querySelectorAll('button')];
        const index = items.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      }
    }
  });

  window.addEventListener('resize', closeDocumentMenus);
  contractorModal?.addEventListener('scroll', closeDocumentMenus, true);

  document.addEventListener('click', event => {
    const documentMenuTrigger = event.target.closest('[data-action="contractor-doc-menu"]');
    if (documentMenuTrigger) {
      if (!editorSaving) openDocumentMenu(documentMenuTrigger);
      return;
    }
    if (event.target.closest('.contractor-doc-menu')) closeDocumentMenus();
    const removeUploaded = event.target.closest('[data-action="remove-uploaded-contractor-doc"]');
    if (removeUploaded) {
      if (!canManageContractors || editorSaving) return;
      const form = removeUploaded.closest('#contractor-form');
      if (!form) return;
      const contractor = getContractorById(document.querySelector('#contractor-modal-body')?.dataset.contractorId);
      const doc = contractor?.documents?.find(item => item.id === removeUploaded.dataset.docId);
      if (!doc) return;
      removedContractorDocumentIds.add(doc.id);
      const list = form.querySelector('#contractor-uploaded-documents');
      list.innerHTML = renderContractorDocuments(contractor.documents.filter(item => !removedContractorDocumentIds.has(item.id)));
      renderIcons(list);
      const status = form.querySelector('#contractor-removal-status');
      status.hidden = false;
      const count = removedContractorDocumentIds.size;
      status.textContent = `${count} document${count === 1 ? '' : 's'} will be removed when you save.`;
      form.querySelector('[data-action="browse-contractor-pdfs"]').focus();
      return;
    }
    const uploadButton = event.target.closest('[data-action="browse-contractor-pdfs"], [data-action="remove-contractor-pdf"]');
    if (uploadButton) {
      if (!canManageContractors || editorSaving) return;
      const form = uploadButton.closest('#contractor-form');
      if (!form) return;
      if (uploadButton.dataset.action === 'browse-contractor-pdfs') {
        form.querySelector('#contractor-pdfs').click();
      } else {
        const index = Number(uploadButton.dataset.fileIndex);
        if (!Number.isInteger(index) || index < 0 || index >= pendingContractorFiles.length) return;
        pendingContractorFiles.splice(index, 1);
        renderPendingContractorFiles(form);
        form.querySelector('#contractor-upload-status').textContent = `${pendingContractorFiles.length} PDFs ready to save.`;
        form.querySelector('[data-action="browse-contractor-pdfs"]').focus();
      }
      return;
    }
    const editBtn = event.target.closest('[data-action="add-contractor"], [data-action="edit-contractor"]');
    if (editBtn) {
      openContractorEditor(editBtn.dataset.contractorId, editBtn);
      return;
    }
    const tab = event.target.closest('.dir-tab');
    if (tab) {
      setTab(tab.dataset.tab);
      return;
    }
    const chip = event.target.closest('.dir-chip');
    if (chip) {
      setFilter(chip.dataset.filter);
      return;
    }

    const viewBtn = event.target.closest('[data-action="view-contractor"]');
    if (viewBtn) {
      openContractorModal(viewBtn.dataset.contractorId, viewBtn);
      return;
    }

    const viewDoc = event.target.closest('[data-action="view-contractor-doc"]');
    if (viewDoc) {
      const contractorId = document.querySelector('#contractor-modal-body')?.dataset.contractorId;
      const contractor = getContractorById(contractorId);
      const doc = getContractorDocuments(contractor).find(d => d.id === viewDoc.dataset.docId);
      if (doc) viewContractorDocument(doc);
      else toast('That document is not available.');
      return;
    }

    const downloadDoc = event.target.closest('[data-action="download-contractor-doc"]');
    if (downloadDoc) {
      const contractorId = document.querySelector('#contractor-modal-body')?.dataset.contractorId;
      const contractor = getContractorById(contractorId);
      const doc = getContractorDocuments(contractor).find(d => d.id === downloadDoc.dataset.docId);
      if (doc) downloadContractorDocument(doc);
      else toast('That document is not available.');
      return;
    }

    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.closest('.sidebar')) closeMenu();
    const action = button.dataset.action;
    if (action === 'menu') {
      const open = document.querySelector('.sidebar').classList.toggle('open');
      document.querySelector('.scrim').classList.toggle('visible', open);
      document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
    } else if (action === 'close-menu') {
      closeMenu();
    } else if (action === 'close-modal') {
      helpModal?.close();
    } else if (action === 'close-contractor-modal') {
      closeContractorModal();
    } else if (action === 'help') {
      openModal(
        'Contact directory help',
        buildingOnly
          ? '<p>Browse building contacts and approved contractors by name, trade, or phone.</p><p>On Approved contractors, use <strong>View details</strong> to see contact info and documents shared by management.</p>'
          : '<p>Search residents, building contacts, and approved contractors by name, suite, or phone.</p><p>Use the tabs to switch lists.</p>'
      );
    }
  });

  helpModal?.addEventListener('click', event => {
    if (event.target === helpModal) {
      const r = helpModal.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) {
        helpModal.close();
      }
    }
  });

  contractorModal?.addEventListener('click', event => {
    if (event.target === contractorModal) closeContractorModal();
  });

  contractorModal?.addEventListener('cancel', event => {
    event.preventDefault();
    closeContractorModal();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (contractorModal?.open) {
        closeContractorModal();
        return;
      }
      closeMenu();
    }
  });

  const lightingPicker = document.querySelector('#header-lighting');
  if (lightingPicker) {
    const lightingOptions = ['morning', 'afternoon', 'evening', 'night'];
    const savedLighting = readSaved('mysuite-header-lighting', 'afternoon');
    function setLighting(value) {
      const selected = lightingOptions.includes(value) ? value : 'afternoon';
      document.body.dataset.time = selected;
      lightingPicker.value = selected;
    }
    setLighting(savedLighting);
    lightingPicker.addEventListener('change', () => {
      setLighting(lightingPicker.value);
      save('mysuite-header-lighting', lightingPicker.value);
    });
  }

  setTab(buildingOnly ? 'building' : 'residents');
  if (!buildingOnly) setFilter('all');
  else renderTable();
})();
