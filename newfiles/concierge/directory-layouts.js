/* Split-view directory uses the shared directory's filtered results. */
(() => {
  const card = document.querySelector('.dir-card');
  if (!card) return;
  const layout = 'c';
  const controls = document.createElement('div');
  controls.className = 'directory-layout-controls';
  const header = card.querySelector('.dir-page-header');
  card.prepend(controls);
  controls.append(...[header,card.querySelector('.dir-tabs'),card.querySelector('.dir-toolbar')].filter(Boolean));
  const tableWrap = card.querySelector('.dir-table-wrap');
  const views = document.createElement('div');
  views.className = 'directory-alternative-view';
  views.hidden = true;
  tableWrap.after(views);
  const status = document.createElement('p');
  status.className = 'directory-result-status sr-only';
  status.setAttribute('role', 'status');
  card.append(status);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  let results = { rows: [], tab: 'residents', showSuite: true, showActions: false };
  let selectedId = null;
  function initials(row) {
    return row.initials || String(row.name || '').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
  }
  function avatar(row, large = false) {
    return `<span class="directory-avatar${large ? ' is-large' : ''}" aria-hidden="true">${escape(initials(row))}</span>`;
  }
  function contacts(row, withPhoneIcon = false) {
    const phone = String(row.phone || '').replace(/[^\d+]/g, '');
    return `<dl class="directory-profile-contacts"><div><dt>Phone</dt><dd>${phone ? `<a href="tel:${phone}">${withPhoneIcon ? '<i data-icon="phone"></i>' : ''}${escape(row.phone)}</a>` : '<span>Not provided</span>'}</dd></div><div><dt>Email</dt><dd>${row.email ? `<a href="mailto:${escape(encodeURIComponent(row.email))}">${escape(row.email)}</a>` : '<span>Not provided</span>'}</dd></div></dl>`;
  }
  function action(row) {
    return results.showActions && (results.tab==='contractors' || row.kind==='contractor') ? `<button type="button" class="button outline directory-contractor-details" data-action="view-contractor" data-contractor-id="${escape(row.id)}">View contractor details</button>` : '';
  }
  function renderDetail() {
    const row = results.rows.find(item => String(item.id) === selectedId);
    const panel = views.querySelector('.directory-detail-panel');
    if (!panel || !row) return;
    panel.innerHTML = `<header class="directory-detail-heading">${avatar(row, true)}<div><h2>${escape(row.name)}</h2><p>${results.showSuite ? `Suite ${escape(row.suite)}` : escape(row.roleLabel || 'Building contact')}</p></div></header>${contacts(row, true)}<section class="directory-detail-notes"><h3>Notes</h3><p>${escape(row.notes || row.note || 'No notes on file.')}</p></section>${action(row)}`;
    if (typeof renderIcons === 'function') renderIcons(panel);
  }
  function render() {
    document.body.dataset.directoryLayout = layout;
    const alternative = layout === 'b' || layout === 'c';
    tableWrap.hidden = alternative;
    views.hidden = !alternative;
    status.textContent = `${results.rows.length} ${results.rows.length === 1 ? 'contact' : 'contacts'}`;
    if (!alternative) return;
    if (!results.rows.length) {
      views.innerHTML = '<p class="directory-layout-empty">No contacts match that search.</p>';
      return;
    }
    if (layout === 'b') {
      views.innerHTML = `<div class="directory-profile-grid">${results.rows.map(row => `<article class="directory-profile-card">${results.showSuite ? `<span class="directory-suite-badge">Suite ${escape(row.suite)}</span>` : ''}<header>${avatar(row)}<div><h2>${escape(row.name)}</h2>${row.roleLabel ? `<p>${escape(row.roleLabel)}</p>` : ''}</div></header>${contacts(row)}${action(row)}</article>`).join('')}</div>`;
      return;
    }
    if (!results.rows.some(row => String(row.id) === selectedId)) selectedId = String(results.rows[0].id);
    views.innerHTML = `<div class="directory-split-view"><div class="directory-master-list" role="listbox" aria-label="Contacts">${results.rows.map(row => `<button type="button" role="option" aria-selected="${String(row.id) === selectedId}" tabindex="${String(row.id) === selectedId ? 0 : -1}" data-contact-id="${escape(row.id)}"><span>${escape(row.name)}</span><small>${results.showSuite ? `Suite ${escape(row.suite)}` : escape(row.roleLabel || '')}</small></button>`).join('')}</div><section class="directory-detail-panel" aria-label="Contact details" aria-live="polite"></section></div>`;
    renderDetail();
  }
  function selectContact(button, focus = false) {
    selectedId = button.dataset.contactId;
    views.querySelectorAll('[data-contact-id]').forEach(option => {
      const selected = option.dataset.contactId === selectedId;
      option.setAttribute('aria-selected', String(selected));
      option.tabIndex = selected ? 0 : -1;
    });
    renderDetail();
    if (focus) button.focus();
  }
  views.addEventListener('click', event => {
    const button = event.target.closest('[data-contact-id]');
    if (button) selectContact(button);
  });
  views.addEventListener('keydown', event => {
    const current = event.target.closest('[data-contact-id]');
    if (!current || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const options = [...views.querySelectorAll('[data-contact-id]')];
    const index = options.indexOf(current);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
    selectContact(options[next], true);
  });
  document.addEventListener('directory:rendered', event => {
    if (results.tab !== event.detail.tab) selectedId = null;
    results = event.detail;
    render();
  });
  render();
})();
