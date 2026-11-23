(() => {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  const brand = sidebar?.querySelector('.brand');
  if (!sidebar || !main || !brand) return;
  const key = 'mysuite-concierge-navigation-treatment-v1';
  let selected = 'tonal';
  try {
    const migration = 'mysuite-concierge-tonal-default-v1';
    if (!localStorage.getItem(migration)) {
      localStorage.setItem(key, 'tonal');
      localStorage.setItem(migration, 'true');
    }
    selected = 'tonal';
    localStorage.setItem(key, selected);
  } catch {}
  function palette(mode, dark) {
    const dot = brand.querySelector('.brand-dot');
    const accent = dot ? getComputedStyle(dot).color : '#d4b891';
    const cream = `color-mix(in srgb, ${accent} 20%, white)`;
    const warmIcon = `color-mix(in srgb, ${accent} 60%, white)`;
    const base = {
      normal: dark ? '#cbd1db' : '#5a3f2c',
      text: mode === 'white' ? '#85532f' : dark ? '#ffffff' : '#85532f',
      fill: mode === 'white' ? '#fffffff0' : mode === 'tonal' ? dark ? '#ffffff14' : '#27313f0a' : 'transparent',
      edge: mode === 'outline' ? dark ? '#ffffff40' : '#7d86964d' : 'transparent',
      hover: dark ? '#ffffff0c' : '#27313f08',
      icon: dark ? '#cbd1db' : '#626973',
      activeIcon: mode === 'white' ? '#25303c' : dark ? '#ffffff' : '#27313f',
      divider: dark ? '#ffffff1a' : '#e5ddd3'
    };
    if (!['cream-pill', 'cream-icons', 'cream-outline', 'bronze-tint'].includes(mode)) return base;
    const colors = {
      ...base, normal: dark ? '#d7d2cc' : '#62594f', icon: dark ? warmIcon : '#8b7255',
      text: dark ? cream : '#453628', activeIcon: dark ? warmIcon : '#806346',
      divider: `color-mix(in srgb, ${accent} 22%, transparent)`,
      hover: `color-mix(in srgb, ${accent} 9%, transparent)`
    };
    if (mode === 'cream-pill') return { ...colors, fill: cream, text: '#3b3026', activeIcon: '#806346', edge: 'transparent' };
    if (mode === 'cream-icons') return { ...colors, fill: dark ? '#ffffff0c' : '#8063460a', edge: 'transparent' };
    if (mode === 'cream-outline') return { ...colors, fill: 'transparent', edge: `color-mix(in srgb, ${accent} 48%, transparent)` };
    return { ...colors, fill: `color-mix(in srgb, ${accent} 17%, transparent)`, edge: `color-mix(in srgb, ${accent} 16%, transparent)` };
  }
  function setVariable(name, value) {
    if (document.body.style.getPropertyValue(name) !== value) document.body.style.setProperty(name, value);
  }
  let lastSignature = '';
  function refresh() {
    let pillColor;
    const pillColorKey = document.body.dataset.sidebarPalette === 'original-cream' ? 'mysuite-concierge-original-sidebar-pill-v2' : document.body.dataset.colorPalette === 'modern-saas' || document.body.dataset.sidebarPalette === 'modern-saas' ? 'mysuite-directory-saas-pill-color-v2' : document.body.dataset.colorPalette === 'limestone' || document.body.dataset.sidebarPalette === 'limestone' ? 'mysuite-directory-limestone-pill-color-v1' : 'mysuite-concierge-pill-color-v1';
    try { const saved = localStorage.getItem(pillColorKey); if (/^#[\da-f]{6}$/i.test(saved || '')) pillColor = saved; } catch {}
    const background = getComputedStyle(sidebar).backgroundColor;
    const brandColor = getComputedStyle(brand).color;
    const dot = brand.querySelector('.brand-dot');
    const dotColor = dot ? getComputedStyle(dot).color : '';
    const signature = JSON.stringify([selected, background, brandColor, dotColor, pillColor]);
    if (signature === lastSignature) return;
    lastSignature = signature;
    const channels = background.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [248, 244, 238];
    const linear = channels.map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
    const dark = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 < .179;
    const actual = palette(selected, dark);
    if (pillColor) actual.fill = `color-mix(in srgb, ${pillColor} 18%, transparent)`;
    for (const [name, value] of Object.entries(actual)) setVariable(`--navigation-treatment-${name}`, value);
  }

  function apply(value, persist = true) {
    selected = 'tonal';
    document.body.dataset.navigationTreatment = selected;
    refresh();
    if (persist) { try { localStorage.setItem(key, selected); } catch {} }
  }
  document.addEventListener('sidebar:pill-changed', () => apply('tonal'));
  apply(selected, false);
  let refreshPending = false;
  const observer = new MutationObserver(() => {
    if (refreshPending) return;
    refreshPending = true;
    requestAnimationFrame(() => { refreshPending = false; refresh(); });
  });
  observer.observe(sidebar, { attributes: true, attributeFilter: ['style', 'data-custom-sidebar', 'data-custom-logo-color'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
