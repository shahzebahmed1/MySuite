/* Restore the pre-cream appearance once, while retaining both appearance snapshots. */
(() => {
  const marker = 'mysuite-concierge-home-blue-restored-v1';
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const image = JSON.parse(localStorage.getItem('mysuite-concierge-dashboard-header-adjustments-v1'))?.image;
      const lightImages = ['morning','afternoon'];
      const splitStyles = ['split-header','square-split-card','rounded-split-card','split-overlap','editorial-split','asymmetrical-cutout','greeting-pill','reference-cream'];
      if (image && !lightImages.includes(image) && !splitStyles.includes(document.body.dataset.dashboardHeader)) document.querySelector('.welcome')?.classList.add('blue-reading-ink');
    } catch {}
  });
  try {
    if (localStorage.getItem(marker)) return;
    let backup;
    try { backup = JSON.parse(localStorage.getItem('mysuite-concierge-home-appearance-backup-v1')); } catch {}
    const fallback = {
      'mysuite-concierge-dashboard-finish-v1': 'warm-stone',
      'mysuite-concierge-dashboard-header-v1': 'clean-edge',
      'mysuite-concierge-dashboard-header-adjustments-v1': JSON.stringify({ height: 216, zoom: 100, x: 72, y: 40, image: 'navy-organizer' }),
      'mysuite-concierge-original-sidebar-background-v1': '#1e293b',
      'mysuite-concierge-dashboard-card-experiments-v1': '{}'
    };
    const restored = backup && typeof backup === 'object' && !Array.isArray(backup) ? backup : fallback;
    const affected = new Set([...Object.keys(restored), ...Object.keys(fallback), 'mysuite-concierge-logo-custom-dot-v1', 'mysuite-concierge-home-layout-trial-v1', 'mysuite-concierge-navigation-colors-v1', 'mysuite-concierge-sidebar-ink-colors-v1', 'mysuite-concierge-logo-cream-finish-v1']);
    localStorage.setItem('mysuite-concierge-before-blue-restore-v1', JSON.stringify(Object.fromEntries([...affected].map(key => [key, localStorage.getItem(key)]))));
    for (const [key,value] of Object.entries(restored)) {
      if (!key.startsWith('mysuite-')) continue;
      if (value === null) localStorage.removeItem(key);
      else if (typeof value === 'string') localStorage.setItem(key,value);
    }
    if (!localStorage.getItem('mysuite-concierge-dashboard-finish-v1') || localStorage.getItem('mysuite-concierge-dashboard-finish-v1') === 'original-cream') localStorage.setItem('mysuite-concierge-dashboard-finish-v1','warm-stone');
    const color = localStorage.getItem('mysuite-concierge-original-sidebar-background-v1');
    const channels = /^#[\da-f]{6}$/i.test(color || '') ? [1,3,5].map(i=>parseInt(color.slice(i,i+2),16)) : null;
    if (!channels || channels.reduce((sum,n)=>sum+n,0)/3 > 140) localStorage.setItem('mysuite-concierge-original-sidebar-background-v1','#1e293b');
    // Restore the light lettering used by the earlier navy sidebar.
    let ink; try { ink = JSON.parse(localStorage.getItem('mysuite-concierge-sidebar-ink-colors-v1')); } catch {}
    localStorage.setItem('mysuite-concierge-sidebar-ink-colors-v1',JSON.stringify({ ...(ink || {}), logo:'#ffffff', icons:'#cbd1db' }));
    localStorage.setItem('mysuite-concierge-logo-cream-finish-v1','none');
    localStorage.setItem('mysuite-concierge-logo-custom-dot-v1','#eadcc6');
    localStorage.setItem('mysuite-concierge-navigation-colors-v1',JSON.stringify({ text:'#cbd1db', icons:'#cbd1db', selectedText:'#ffffff', selectedIcon:'#ffffff' }));
    localStorage.setItem('mysuite-concierge-navigation-treatment-v1','tonal');
    localStorage.setItem('mysuite-concierge-brown-navigation-v1','true');
    localStorage.setItem('mysuite-concierge-tonal-default-v1','true');
    localStorage.setItem('mysuite-concierge-restore-navy-cream-dot-v1','true');
    localStorage.setItem('mysuite-concierge-home-layout-trial-v1','current');
    localStorage.setItem('mysuite-concierge-home-cream-reference-v1','true');
    localStorage.setItem(marker,'true');
  } catch {}

})();
