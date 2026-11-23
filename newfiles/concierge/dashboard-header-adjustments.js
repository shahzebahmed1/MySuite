(() => {
  const card = document.querySelector('body.sidebar-merge .header-lab');
  if (!card) return;
  const key = 'mysuite-concierge-dashboard-header-adjustments-v1';
  const images = [
    { id: 'sunlit-workspace', label: 'Sunlit navy & brass', file: 'header-sunlit-workspace.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'sunlit-workspace-wide', label: 'Sunlit navy & brass - panoramic', file: 'header-sunlit-workspace-wide.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'navy-ledger-wide', label: 'Navy & gold - panoramic ledger', file: 'header-navy-ledger-wide.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'navy-organizer', label: 'Navy & gold - organizer', file: 'header-navy-organizer.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'navy-wide', label: 'Navy & gold - wide', file: 'carriers/MySuite-header-double-width.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'navy', label: 'Navy & gold', file: 'header-navy-gold.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'afternoon', label: 'Warm afternoon', file: 'header-afternoon.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'morning', label: 'Morning', file: 'header-morning.png', heading: '#fff8ef', note: '#dfc6a6' },
    { id: 'evening', label: 'Evening', file: 'header-evening.png', heading: '#fff8ef', note: '#ead9c3' },
    { id: 'night', label: 'Night', file: 'header-night.png', heading: '#fff8ef', note: '#ead9c3' }
  ];
  const defaults = { height: null, zoom: 100, x: 72, y: 40, image: 'navy-organizer' };
  const limits = { height: [40, 800], zoom: [100, 200], x: [0, 100], y: [0, 100] };
  let settings = { ...defaults };
  const panel = document.createElement('details');
  panel.className = 'dashboard-header-adjustments';
  panel.open = true;
  panel.innerHTML = `<summary>Header controls</summary><div class="header-adjustment-fields"><label>Header style<select data-header-style aria-label="Dashboard header style in booking card"><option value="clean-edge">Clean Edge</option><option value="navy-overlap">Navy Overlap</option><option value="framed-banner">Framed Banner</option></select></label><label>Header image<select data-adjust="image">${images.map(image => `<option value="${image.id}">${image.label}</option>`).join('')}</select></label>${[['height', 'Header height', 'px'], ['zoom', 'Image zoom', '%'], ['x', 'Image left / right', '%'], ['y', 'Image up / down', '%']].map(([name, label, unit]) => `<label class="header-adjustment-range"><span>${label}<output data-adjust-value="${name}"></output></span><input type="range" data-adjust="${name}" min="${limits[name][0]}" max="${limits[name][1]}" step="1" aria-label="${label}"></label>`).join('')}</div><button type="button" class="header-adjustments-reset">Reset size &amp; image</button>`;
  card.querySelector('.card-heading').after(panel);
  const sourceStyles = document.querySelector('.sidebar select[aria-label="Dashboard header style"]');
  if (sourceStyles) panel.querySelector('[data-header-style]').innerHTML = [...sourceStyles.options].map(option => option.outerHTML).join('');
  function defaultHeight() {
    return { 'premium-welcome-card': 160, 'navy-overlap': 270, 'framed-banner': 200, 'floating-island': 240, 'glass-header': 240, 'split-header': 220, 'square-split-card': 220, 'rounded-split-card': 220, 'square-card-plain': 220, 'split-overlap': 270, 'tabbed-header': 230, 'greeting-pill': 240, 'panoramic-card': 240, 'contained-banner': 240, 'overlapping-sheet': 270, 'floating-glass-pill': 200, 'editorial-split': 240, 'asymmetrical-cutout': 240 }[document.body.dataset.dashboardHeader] || 216;
  }
  function alignGreeting() {
    const header = document.querySelector('body.sidebar-merge .welcome');
    const firstCard = document.querySelector('.dashboard .packages .card-heading');
    if (!header || !firstCard) return;
    const inset = document.body.hasAttribute('data-dashboard-card-layout') ? '24px' : document.body.dataset.dashboardHeader === 'floating-island' ? '32px' : `${Math.max(0, Math.round(firstCard.getBoundingClientRect().left - header.getBoundingClientRect().left))}px`;
    if (document.body.style.getPropertyValue('--dashboard-header-left-inset') !== inset) document.body.style.setProperty('--dashboard-header-left-inset', inset);
  }
  function normalize(value) {
    const result = { ...defaults };
    if (!value || typeof value !== 'object') return result;
    for (const [name, [min, max]] of Object.entries(limits)) {
      if (typeof value[name] === 'number' && Number.isFinite(value[name])) result[name] = Math.max(min, Math.min(max, Math.round(value[name])));
    }
    if (images.some(image => image.id === value.image)) result.image = value.image;
    return result;
  }
  function apply(persist = true) {
    document.body.dataset.headerAdjustments = 'true';
    const style = document.body.style;
    const image = images.find(image => image.id === settings.image);
    style.setProperty('--dashboard-adjusted-height', `${settings.height ?? defaultHeight()}px`);
    style.setProperty('--dashboard-image-zoom', String(settings.zoom / 100));
    style.setProperty('--dashboard-image-x', `${settings.x}%`);
    style.setProperty('--dashboard-image-y', `${settings.y}%`);
    style.setProperty('--dashboard-header-photo', `url('../assets/${image.file}')`);
    style.setProperty('--dashboard-heading-ink', image.heading);
    style.setProperty('--dashboard-note-ink', image.note);
    panel.querySelector('[data-header-style]').value = document.body.dataset.dashboardHeader || 'clean-edge';
    panel.querySelector('[data-adjust="image"]').value = settings.image;
    for (const name of Object.keys(limits)) {
      const value = settings[name] ?? defaultHeight();
      panel.querySelector(`[data-adjust="${name}"]`).value = value;
      panel.querySelector(`[data-adjust-value="${name}"]`).textContent = `${value}${name === 'height' ? 'px' : '%'}`;
    }
    alignGreeting();
    if (persist) { try { localStorage.setItem(key, JSON.stringify(settings)); } catch {} }
  }
  panel.addEventListener('input', event => {
    const name = event.target.dataset.adjust;
    if (name === 'image') settings.image = images.some(image => image.id === event.target.value) ? event.target.value : defaults.image;
    else if (Object.hasOwn(limits, name)) settings[name] = Number(event.target.value);
    else return;
    settings = normalize(settings);
    apply();
  });
  panel.querySelector('[data-header-style]').addEventListener('change', event => {
    const source = document.querySelector('.sidebar select[aria-label="Dashboard header style"]');
    if (source) { source.value = event.target.value; source.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  panel.querySelector('button').addEventListener('click', () => { settings = document.body.dataset.dashboardHeader === 'premium-welcome-card' ? { height:160, zoom:125, x:100, y:100, image:'sunlit-workspace' } : { ...defaults }; apply(); });
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(key));
    const imageUpgradeKey = 'mysuite-dashboard-header-organizer-v1';
    if (!localStorage.getItem(imageUpgradeKey)) {
      saved = { ...(saved || {}), image: 'navy-organizer' };
      localStorage.setItem(key, JSON.stringify(saved));
      localStorage.setItem(imageUpgradeKey, 'true');
    }
  } catch {}
  settings = normalize(saved);
  apply(false);
  const observer = new MutationObserver(() => apply(false));
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-dashboard-header'] });
  const alignmentObserver = new ResizeObserver(alignGreeting);
  alignmentObserver.observe(document.querySelector('body.sidebar-merge .welcome'));
  alignmentObserver.observe(document.querySelector('.dashboard .packages'));
  window.addEventListener('resize', alignGreeting);
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value;
    try { value = JSON.parse(event.newValue); } catch {}
    settings = normalize(value);
    apply(false);
  });
})();
