/* Resident maintenance requests, stored per account in this browser. */
(function initResidentMaintenance() {
  'use strict';
  renderIcons();
  applyLoggedInUser('resident');
  const storageKey = 'mysuite-resident-maintenance-v1';
  const categories = ['Plumbing', 'Heating & cooling', 'Electrical', 'Doors & windows', 'Appliances', 'Other'];
  const locations = ['Kitchen', 'Bathroom', 'Bedroom', 'Living room', 'Other area'];
  const statuses = { submitted: 'Submitted', 'in-progress': 'In progress', completed: 'Completed', cancelled: 'Cancelled' };
  const form = document.querySelector('#maintenance-form');
  const errorBox = document.querySelector('#maintenance-error');
  const tabs = [...document.querySelectorAll('[data-maintenance-tab]')];
  let activeTab = 'create';
  let page = 1;
  let selectedYear = 'all';
  let busy = false;
  const pageSize = 5;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const isPast = row => ['completed', 'cancelled'].includes(row.status);
  const formatDate = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  const submissionYear = row => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric' }).format(new Date(row.createdAt));

  function resident() {
    const account = getSessionAccount('resident');
    if (!account || account.role !== 'resident' || !account.id || !account.suite) throw new Error('Sign in as a resident to manage maintenance requests.');
    return account;
  }

  const examples = residentMaintenanceExamples;

  function readAll() {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return [];
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) throw new Error('Your saved requests could not be read. Please try again.');
    return rows;
  }

  function requests() {
    const account = resident();
    const owned = [...examples(account), ...readAll()].map(row => row?.status === 'scheduled' ? { ...row, status: 'in-progress' } : row).filter(row => row && row.residentId === account.id && row.suite === account.suite && Object.hasOwn(statuses, row.status) && Number.isFinite(Date.parse(row.createdAt)));
    return [...new Map(owned.map(row => [row.id, row])).values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function validate(values) {
    const title = String(values.title || '').trim();
    const description = String(values.description || '').trim();
    const availability = String(values.availability || '').trim();
    if (title.length < 3 || title.length > 100) throw new Error('Enter a request title between 3 and 100 characters.');
    if (!categories.includes(values.category)) throw new Error('Choose an issue category.');
    if (!locations.includes(values.location)) throw new Error('Choose where the issue is located.');
    if (description.length < 10 || description.length > 2000) throw new Error('Describe the issue using 10 to 2,000 characters.');
    if (availability.length > 300) throw new Error('Keep availability notes to 300 characters or fewer.');
    return { title, description, category: values.category, location: values.location, availability, entryPermission: values.entryPermission === 'on' };
  }

  async function withLock(operation) {
    if (navigator.locks?.request) return navigator.locks.request(storageKey, operation);
    return operation();
  }

  function showError(error) {
    errorBox.textContent = error.message || 'Something went wrong. Please try again.';
    errorBox.hidden = false;
    errorBox.focus();
  }

  function requestMarkup(row) {
    return `<details class="maintenance-request${isPast(row) ? ' maintenance-history' : ''}">
      <summary><span class="maintenance-icon" aria-hidden="true"><i data-icon="wrench"></i></span>
        <span class="maintenance-title"><strong>${escapeHtml(row.title)}</strong><span class="maintenance-meta">${escapeHtml(row.reference)} &middot; ${escapeHtml(row.category)} &middot; ${formatDate(row.createdAt)}</span></span>
        <span class="maintenance-status ${row.status}">${statuses[row.status]}</span>
        <span class="maintenance-details-link">Details<i data-icon="chevron"></i></span>
      </summary>
      <div class="maintenance-request-body"><p class="maintenance-description">${escapeHtml(row.description)}</p>
        <dl class="maintenance-request-facts"><div><dt>Location</dt><dd>Suite ${escapeHtml(row.suite)} &middot; ${escapeHtml(row.location)}</dd></div><div><dt>Entry permission</dt><dd>${row.entryPermission ? 'Entry permitted when I am away' : 'Contact me before entering'}</dd></div>${row.availability ? `<div><dt>Availability</dt><dd>${escapeHtml(row.availability)}</dd></div>` : ''}</dl>
        ${!isPast(row) ? `<button type="button" class="button outline maintenance-cancel" data-action="cancel-request" data-request-id="${escapeHtml(row.id)}">Cancel request</button>` : ''}
      </div></details>`;
  }

  function render() {
    const rows = requests();
    const open = rows.filter(row => !isPast(row)), allPast = rows.filter(isPast);
    const section = activeTab === 'open' ? 'open' : 'past';
    const sectionRows = section === 'open' ? open : allPast;
    const filtered = sectionRows.filter(row => selectedYear === 'all' || submissionYear(row) === selectedYear);
    document.querySelector(`#maintenance-${section}-heading`).appendChild(document.querySelector('#maintenance-history-tools'));
    const currentYear = Number(submissionYear({ createdAt: new Date().toISOString() }));
    const years = [...new Set([currentYear, currentYear - 1, currentYear - 2, ...sectionRows.map(row => Number(submissionYear(row)))])].sort((a, b) => b - a);
    document.querySelector('#maintenance-year-options').innerHTML = ['all', ...years.map(String)].map(year => `<label><input type="radio" name="maintenance-year" value="${year}"${selectedYear === year ? ' checked' : ''}>${year === 'all' ? 'All years' : year}</label>`).join('');
    document.querySelector('#maintenance-year-label').textContent = selectedYear === 'all' ? 'Filter by year' : selectedYear;
    tabs.forEach(tab => {
      const key = tab.dataset.maintenanceTab;
      tab.setAttribute('aria-selected', String(key === activeTab));
      tab.tabIndex = key === activeTab ? 0 : -1;
      if (key !== 'create') tab.querySelector('[data-tab-count]').textContent = key === 'open' ? open.length : allPast.length;
      document.querySelector(`#maintenance-panel-${key}`).hidden = key !== activeTab;
    });
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.max(1, Math.min(page, pages));
    const offset = (page - 1) * pageSize;
    document.querySelector(`#maintenance-${section}-list`).innerHTML = filtered.slice(offset, offset + pageSize).map(requestMarkup).join('');
    document.querySelector(`#maintenance-${section}-empty`).hidden = filtered.length > 0;
    document.querySelector(`#maintenance-${section}-empty`).textContent = selectedYear !== 'all' ? `No ${section} requests were submitted in ${selectedYear}.` : section === 'open' ? 'You have no open requests. Submit a request when something needs attention.' : 'Your completed and cancelled requests will appear here.';
    document.querySelector('#maintenance-pagination').hidden = filtered.length === 0;
    document.querySelector('#maintenance-pagination').setAttribute('aria-label', `${section === 'open' ? 'Open' : 'Past'} request pages`);
    document.querySelector(section === 'open' ? '#maintenance-open-range' : '#maintenance-range').textContent = filtered.length ? `Showing ${offset + 1}–${Math.min(offset + pageSize, filtered.length)} of ${filtered.length}` : 'Showing 0 of 0';
    document.querySelector('#maintenance-page-controls').innerHTML = `<button type="button" class="maintenance-page-arrow is-previous" data-action="request-page" data-page="${page - 1}" aria-label="Previous page"${page === 1 ? ' disabled' : ''}><i data-icon="chevron"></i></button><span class="maintenance-page-picker"><select id="maintenance-page-select" aria-label="Choose request history page">${Array.from({ length: pages }, (_, index) => `<option value="${index + 1}"${page === index + 1 ? ' selected' : ''}>Page ${index + 1} of ${pages}</option>`).join('')}</select><i data-icon="chevron"></i></span><button type="button" class="maintenance-page-arrow" data-action="request-page" data-page="${page + 1}" aria-label="Next page"${page === pages ? ' disabled' : ''}><i data-icon="chevron"></i></button>`;
    renderIcons(document.querySelector('.maintenance-page'));
  }

  function refresh() {
    try { render(); errorBox.hidden = true; } catch (error) { showError(error); }
  }

  function selectTab(key, updateUrl = true) {
    if (!['create', 'open', 'past'].includes(key)) key = 'create';
    activeTab = key;
    page = 1;
    selectedYear = 'all';
    closeYearFilter();
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('tab', key);
      history.replaceState(null, '', url);
    }
    refresh();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const candidate = validate(Object.fromEntries(new FormData(form)));
      const account = resident();
      await withLock(() => {
        if (resident().id !== account.id) throw new Error('Your account changed. Please reload the page.');
        const all = readAll(), id = crypto.randomUUID(), now = new Date().toISOString();
        all.push({ ...candidate, id, reference: `M-${id.replaceAll('-', '').slice(0, 8).toUpperCase()}`, residentId: account.id, suite: account.suite, status: 'submitted', createdAt: now, updatedAt: now, update: 'Request received and awaiting review.' });
        localStorage.setItem(storageKey, JSON.stringify(all));
      });
      form.reset();
      selectTab('open');
      tabs.find(tab => tab.dataset.maintenanceTab === 'open').focus();
      toast('Maintenance request saved.');
    } catch (error) { showError(error); }
    finally { busy = false; button.disabled = false; }
  });

  function closeMenu() {
    document.querySelector('.sidebar').classList.remove('open');
    document.querySelector('.scrim').classList.remove('visible');
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', 'false');
  }

  function closeYearFilter() {
    document.querySelector('#maintenance-year-menu').hidden = true;
    document.querySelector('#maintenance-year-toggle').setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('click', async event => {
    if (!event.target.closest('.maintenance-year-filter')) closeYearFilter();
    const tab = event.target.closest('[data-maintenance-tab]');
    if (tab) return selectTab(tab.dataset.maintenanceTab);
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'toggle-request-year') {
      const menu = document.querySelector('#maintenance-year-menu');
      menu.hidden = !menu.hidden;
      button.setAttribute('aria-expanded', String(!menu.hidden));
      if (!menu.hidden) document.querySelector('input[name="maintenance-year"]:checked')?.focus();
    } else if (action === 'apply-request-year') {
      const choice = document.querySelector('input[name="maintenance-year"]:checked');
      if (!choice || !/^(all|\d{4})$/.test(choice.value)) return;
      selectedYear = choice.value;
      page = 1;
      closeYearFilter();
      refresh();
      document.querySelector('#maintenance-year-toggle').focus();
    } else if (action === 'menu') {
      const open = document.querySelector('.sidebar').classList.toggle('open');
      document.querySelector('.scrim').classList.toggle('visible', open);
      document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
    } else if (action === 'close-menu') closeMenu();
    else if (action === 'close-modal') modal.close();
    else if (action === 'request-page') {
      const next = Number(button.dataset.page);
      if (Number.isInteger(next) && ['open', 'past'].includes(activeTab)) { page = next; refresh(); }
    } else if (action === 'cancel-request') {
      try {
        const row = requests().find(item => item.id === button.dataset.requestId && !isPast(item));
        if (!row) throw new Error('This request is no longer open.');
        openModal('Cancel this request?', `<p>${escapeHtml(row.title)} will move to Past requests.</p><div class="dialog-options"><button class="button outline" data-action="close-modal">Keep request</button><button class="button maintenance-cancel" data-action="confirm-cancel-request" data-request-id="${escapeHtml(row.id)}">Cancel request</button></div>`);
      } catch (error) { showError(error); }
    } else if (action === 'confirm-cancel-request' && !busy) {
      busy = true;
      button.disabled = true;
      try {
        const account = resident();
        await withLock(() => {
          if (resident().id !== account.id) throw new Error('Your account changed. Please reload the page.');
          const all = readAll();
          const source = all.find(item => item.id === button.dataset.requestId && item.residentId === account.id && item.suite === account.suite) || examples(account).find(item => item.id === button.dataset.requestId);
          if (!source || isPast(source)) throw new Error('This request is no longer open.');
          const updated = { ...source, status: 'cancelled', updatedAt: new Date().toISOString(), update: 'Request cancelled by the resident.' };
          const filtered = all.filter(item => item.id !== source.id);
          filtered.push(updated);
          localStorage.setItem(storageKey, JSON.stringify(filtered));
        });
        modal.close();
        refresh();
        toast('Maintenance request cancelled.');
        tabs.find(tab => tab.dataset.maintenanceTab === activeTab).focus();
      } catch (error) { modal.close(); showError(error); }
      finally { busy = false; button.disabled = false; }
    } else if (action === 'help') openModal('Maintenance help', '<p>Submit a request with a description and location. Check Open requests for updates, and Past requests for completed or cancelled work.</p><p>For an urgent issue, contact the concierge directly.</p>');
  });

  document.querySelector('#maintenance-page-controls').addEventListener('change', event => {
    if (event.target.id !== 'maintenance-page-select' || !['open', 'past'].includes(activeTab)) return;
    const next = Number(event.target.value);
    if (Number.isInteger(next)) { page = next; refresh(); }
    document.querySelector('#maintenance-page-select').focus();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.querySelector('#maintenance-year-menu').hidden) {
      closeYearFilter();
      document.querySelector('#maintenance-year-toggle').focus();
    }
  });

  document.querySelector('.maintenance-tabs').addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectTab(tabs[next].dataset.maintenanceTab);
    tabs[next].focus();
  });
  document.querySelector('.sidebar nav').addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link) { closeMenu(); if (link.getAttribute('href') === '#') event.preventDefault(); }
  });
  const lighting = document.querySelector('#header-lighting');
  const setLighting = value => { document.body.dataset.time = ['morning', 'afternoon', 'evening', 'night'].includes(value) ? value : 'afternoon'; lighting.value = document.body.dataset.time; };
  setLighting(readSaved('mysuite-header-lighting', 'afternoon'));
  lighting.addEventListener('change', () => { setLighting(lighting.value); save('mysuite-header-lighting', lighting.value); });
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) refresh(); });
  window.addEventListener('focus', refresh);
  window.addEventListener('popstate', () => selectTab(new URL(location.href).searchParams.get('tab') || 'create', false));
  selectTab(new URL(location.href).searchParams.get('tab') || 'create', false);
})();
