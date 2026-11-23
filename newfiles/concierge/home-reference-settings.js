/* Apply the requested home preset once, retaining a reversible appearance backup. */
(() => {
  const marker = 'mysuite-concierge-home-cream-reference-v1';
  try {
    if (localStorage.getItem(marker)) return;
    const values = {
      'mysuite-concierge-dashboard-finish-v1': 'original-cream',
      'mysuite-concierge-dashboard-header-v1': 'reference-cream',
      'mysuite-concierge-dashboard-header-adjustments-v1': JSON.stringify({ height: 216, zoom: 100, x: 72, y: 40, image: 'afternoon' }),
      'mysuite-concierge-dashboard-card-experiments-v1': '{}',
      'mysuite-concierge-original-sidebar-nav-v2': JSON.stringify({ sidebar: 'original', pill: 'soft-selection' }),
      'mysuite-concierge-original-sidebar-background-v1': '#f7f3ec',
      'mysuite-concierge-sidebar-ink-colors-v1': JSON.stringify({ logo: '#35261e', icons: '#4a3f35' }),
      'mysuite-concierge-logo-cream-finish-v1': 'none',
      'mysuite-concierge-navigation-treatment-v1': 'tonal',
      'mysuite-concierge-logo-position-v1': JSON.stringify({ size: 43, x: 0, y: 0 }),
      'mysuite-concierge-sidebar-shape-v1': null,
      'mysuite-concierge-sidebar-divider-v1': 'none',
      'mysuite-concierge-navigation-colors-v1': '{}',
      'mysuite-concierge-original-sidebar-pill-v2': null,
      'mysuite-concierge-page-background-v1:dashboard': null,
      'mysuite-concierge-dashboard-card-color-v1': null,
      'mysuite-concierge-dashboard-header-text-v1': null,
      'mysuite-concierge-dashboard-gradient-v1': null,
      'mysuite-concierge-dashboard-header-fade-v1': null,
      'mysuite-concierge-header-text-lock-v1': null,
      'mysuite-concierge-dashboard-edge-v1': 'current',
      'mysuite-concierge-restore-navy-cream-dot-v1': 'true',
      'mysuite-dashboard-header-organizer-v1': 'true',
      'mysuite-concierge-tonal-default-v1': 'true'
    };
    const backup = Object.fromEntries(Object.keys(values).map(key => [key, localStorage.getItem(key)]));
    localStorage.setItem('mysuite-concierge-home-appearance-backup-v1', JSON.stringify(backup));
    for (const [key, value] of Object.entries(values)) value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value);
    localStorage.setItem(marker, 'true');
  } catch {}
})();
