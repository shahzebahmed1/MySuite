/* Injects Home > Current page at the top of <main> on sidebar subpages.
   Uses body[data-breadcrumb], or falls back to the active sidebar label.
   Skips Home dashboards. Visible on mobile only via CSS. Requires icons.js. */
(function () {
  function activeNavLabel() {
    const active = document.querySelector(
      '.sidebar .nav-item[aria-current="page"], .sidebar .nav-item.active'
    );
    if (!active) return '';
    return (active.textContent || '').replace(/\s+/g, ' ').trim();
  }

  let label = (document.body.dataset.breadcrumb || '').trim();
  if (!label) label = activeNavLabel();
  if (!label || /^home$/i.test(label)) return;

  const main = document.querySelector('main');
  if (!main || main.querySelector('.breadcrumb')) return;

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.innerHTML = `
    <ol>
      <li><a href="./"><i data-icon="home"></i>Home</a></li>
      <li aria-current="page">${escapeHtml(label)}</li>
    </ol>
  `;

  main.prepend(nav);
  if (typeof renderIcons === 'function') renderIcons(nav);
})();
