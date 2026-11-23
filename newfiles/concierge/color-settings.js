/* Local prototype color preferences, shared by the concierge pages. */
(() => {
  const limestone = document.body.dataset.colorPalette === 'limestone';
  const saas = document.body.dataset.colorPalette === 'modern-saas';
  const key = saas ? 'mysuite-directory-saas-colors-v2' : limestone ? 'mysuite-directory-limestone-colors-v1' : 'mysuite-concierge-colors-cream-v3';
  const defaults = saas ? { highlight: '#2563eb', buttons: '#334155' } : limestone ? { highlight: '#dedad2', buttons: '#67503d' } : { highlight: '#f2e3d5', buttons: '#a66b38' };
  const valid = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  let colors = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    for (const name of Object.keys(defaults)) if (valid(saved?.[name])) colors[name] = saved[name];
  } catch {}
  const channels = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const hex = rgb => '#' + rgb.map(n => n.toString(16).padStart(2, '0')).join('');
  const foreground = color => {
    const rgb = channels(color).map(n => {
      const s = n / 255;
      return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
    });
    const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    return luminance > .179 ? '#171717' : '#ffffff';
  };
  function apply() {
    const style = document.body.style;
    if (!document.body.hasAttribute('data-nav-mix')) {
      style.setProperty('--sidebar-highlight', colors.highlight);
      style.setProperty('--sidebar-highlight-text', foreground(colors.highlight));
    }
    const hover = hex(channels(colors.buttons).map(n => Math.round(n * .82)));
    for (const name of ['--caramel', '--theme-accent']) style.setProperty(name, colors.buttons);
    for (const name of ['--caramel-dark', '--theme-accent-hover']) style.setProperty(name, hover);
    style.setProperty('--button-text', colors.buttons === defaults.buttons ? '#ffffff' : foreground(colors.buttons));
    style.setProperty('--theme-accent-text', colors.buttons === defaults.buttons ? '#ffffff' : foreground(colors.buttons));
  }
  apply();
  const footer = document.createElement('section');
  footer.className = 'concierge-color-settings';
  footer.setAttribute('aria-label', 'Page color settings');
  footer.innerHTML = `<span class="color-settings-title">Page colors</span>
    <label>Sidebar highlight <input type="color" data-color="highlight" aria-label="Sidebar highlight color"><output data-rgb="highlight"></output></label>
    <label>Buttons <input type="color" data-color="buttons" aria-label="Button color"><output data-rgb="buttons"></output></label>
    <button type="button" class="color-settings-reset">Reset</button>`;
  (document.querySelector('main') || document.body).append(footer);
  function sync() {
    for (const name of Object.keys(defaults)) {
      footer.querySelector(`[data-color="${name}"]`).value = colors[name];
      footer.querySelector(`[data-rgb="${name}"]`).textContent = `RGB ${channels(colors[name]).join(', ')}`;
    }
  }
  function save() {
    apply(); sync();
    try { localStorage.setItem(key, JSON.stringify(colors)); } catch {}
  }
  footer.addEventListener('input', event => {
    const name = event.target.dataset.color;
    if (name in defaults && valid(event.target.value)) {
      colors[name] = event.target.value;
      save();
      if (name === 'highlight') document.dispatchEvent(new CustomEvent('sidebar:highlight-color', { detail: { color: colors.highlight } }));
    }
  });
  footer.querySelector('button').addEventListener('click', () => {
    colors = { ...defaults }; save();
    document.dispatchEvent(new CustomEvent('sidebar:highlight-color', { detail: { color: colors.highlight } }));
  });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    try {
      const saved = JSON.parse(event.newValue);
      for (const name of Object.keys(defaults)) colors[name] = valid(saved?.[name]) ? saved[name] : defaults[name];
      apply(); sync();
    } catch {}
  });
  sync();
})();
