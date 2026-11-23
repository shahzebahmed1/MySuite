(() => {
  const key = 'mysuite-concierge-home-tools-hidden-v1';
  const selectors = '.sidebar-rgb-controls, .header-lab, .dashboard-card-experiments, .dashboard-split-controls, .dashboard-logo-controls, .announcement-header-experiments, .dashboard-finish-controls, .dashboard-header-adjustments, .sidebar-divider-options, .concierge-nav-comparison, .logo-cream-options, .dashboard-header-experiments, .navigation-treatment-options, .concierge-color-settings, .lighting-picker';
  document.querySelectorAll(selectors).forEach(element => element.setAttribute('data-home-editor', ''));
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'home-tools-toggle';
  button.setAttribute('aria-label', 'Show editing tools');
  document.body.append(button);
  function apply(hidden, persist = true) {
    document.body.toggleAttribute('data-home-tools-hidden', hidden);
    button.textContent = hidden ? 'Show tools' : 'Hide tools';
    button.setAttribute('aria-label', hidden ? 'Show editing tools' : 'Hide editing tools');
    button.setAttribute('aria-pressed', String(hidden));
    if (persist) { try { localStorage.setItem(key, String(hidden)); } catch {} }
  }
  button.addEventListener('click', () => apply(!document.body.hasAttribute('data-home-tools-hidden')));
  let hidden = true; try { hidden = localStorage.getItem(key) !== 'false'; } catch {}
  apply(hidden, false);
  // Keep the previous appearance recoverable, without deleting editor settings.
  const card = document.querySelector('.header-lab');
  const restore = document.createElement('section'); restore.className = 'home-tools-restore';
  restore.innerHTML = '<button type="button">Restore previous design settings</button>';
  restore.querySelector('button').addEventListener('click', () => {
    try {
      const backup = JSON.parse(localStorage.getItem('mysuite-concierge-home-appearance-backup-v1'));
      if (!backup || typeof backup !== 'object') return;
      for (const [name, value] of Object.entries(backup)) {
        if (name.startsWith('mysuite-')) value === null ? localStorage.removeItem(name) : localStorage.setItem(name, value);
      }
      location.reload();
    } catch {}
  });
  card?.append(restore);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue !== 'false', false); });
})();
