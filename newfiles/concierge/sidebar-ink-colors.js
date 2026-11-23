(() => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  const key = 'mysuite-concierge-sidebar-ink-colors-v1';
  const valid = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  function initialColor(element, fallback) {
    if (!element) return fallback;
    const values = getComputedStyle(element).color.match(/[\d.]+/g);
    return values?.length >= 3 ? '#' + values.slice(0, 3).map(n => Math.round(Number(n)).toString(16).padStart(2, '0')).join('') : fallback;
  }
  const defaults = {
    logo: initialColor(sidebar.querySelector('.brand'), '#35261e'),
    icons: initialColor(sidebar.querySelector('.nav-item:not(.active) svg'), '#4a3f35')
  };
  let colors = {};
  const control = document.createElement('details');
  control.className = 'sidebar-rgb-controls sidebar-ink-controls';
  control.innerHTML = '<summary>Logo &amp; icon colors</summary><div class="sidebar-rgb-panel"></div>';
  const panel = control.querySelector('.sidebar-rgb-panel');
  for (const [name, title] of [['logo', 'MySuite logo text'], ['icons', 'Sidebar icons']]) {
    const field = document.createElement('fieldset');
    field.className = 'sidebar-ink-fields';
    field.innerHTML = `<legend>${title}</legend><label class="sidebar-color-label">Choose color<input type="color" data-ink-color="${name}" aria-label="${title} color"></label><div class="sidebar-rgb-fields">${['R', 'G', 'B'].map((letter, i) => `<label>${letter}<input type="number" min="0" max="255" step="1" data-ink-rgb="${name}" data-channel="${i}" aria-label="${title} ${letter}"></label>`).join('')}</div>`;
    panel.append(field);
  }
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.textContent = 'Reset logo and icons';
  panel.append(reset);
  const previous = [...sidebar.querySelectorAll('.sidebar-rgb-controls')].pop();
  if (previous) previous.after(control);
  else sidebar.querySelector('nav')?.append(control);
  function apply(persist = true) {
    for (const name of Object.keys(defaults)) {
      if (valid(colors[name])) {
        sidebar.setAttribute(`data-custom-${name}-color`, 'true');
        sidebar.style.setProperty(`--sidebar-${name}-color`, colors[name]);
      } else {
        sidebar.removeAttribute(`data-custom-${name}-color`);
        sidebar.style.removeProperty(`--sidebar-${name}-color`);
      }
      const value = colors[name] || defaults[name];
      control.querySelector(`[data-ink-color="${name}"]`).value = value;
      const channels = rgb(value);
      control.querySelectorAll(`[data-ink-rgb="${name}"]`).forEach(input => { input.value = channels[Number(input.dataset.channel)]; });
    }
    if (persist) { try { localStorage.setItem(key, JSON.stringify(colors)); } catch {} }
  }
  function load(value) {
    let saved;
    try { saved = JSON.parse(value); } catch {}
    colors = {};
    for (const name of Object.keys(defaults)) if (valid(saved?.[name])) colors[name] = saved[name];
    apply(false);
  }
  control.addEventListener('input', event => {
    const name = event.target.dataset.inkColor || event.target.dataset.inkRgb;
    if (!Object.hasOwn(defaults, name)) return;
    if (event.target.dataset.inkColor) {
      if (!valid(event.target.value)) return;
      colors[name] = event.target.value;
    } else {
      const fields = [...control.querySelectorAll(`[data-ink-rgb="${name}"]`)];
      if (fields.some(input => input.value === '' || !input.validity.valid)) return;
      colors[name] = '#' + fields.map(input => Number(input.value).toString(16).padStart(2, '0')).join('');
    }
    apply();
  });
  reset.addEventListener('click', () => { colors = {}; apply(); });
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  load(saved);
  window.addEventListener('storage', event => { if (event.key === key) load(event.newValue); });
})();
