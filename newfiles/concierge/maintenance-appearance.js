(() => {
  const sidebar = document.querySelector('.sidebar');
  const card = document.querySelector('.desk-list-card');
  if (!document.body.classList.contains('maintenance-page') || !sidebar || !card) return;
  const key = 'mysuite-concierge-maintenance-colors-v1';
  const valid = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  const channels = color => [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
  const toHex = values => '#' + values.map(n => n.toString(16).padStart(2, '0')).join('');
  function computedHex(value, fallback) {
    if (valid(value)) return value;
    const parts = String(value).match(/[\d.]+/g);
    if (!parts || parts.length < 3 || (parts.length > 3 && Number(parts[3]) === 0)) return fallback;
    return toHex(parts.slice(0, 3).map(Number));
  }
  function ink(color) {
    const linear = channels(color).map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 > .179 ? '#171717' : '#ffffff';
  }
  const defaults = {
    card: computedHex(getComputedStyle(card).backgroundColor, '#fffdf9'),
    canvas: computedHex(getComputedStyle(document.body).backgroundColor, '#f8f4ee'),
    button: computedHex(getComputedStyle(card.querySelector('.portal-create-button')).backgroundColor, '#a66b38')
  };
  let colors = { ...defaults };
  const controls = document.createElement('details');
  controls.className = 'sidebar-rgb-controls maintenance-color-controls';
  controls.innerHTML = '<summary>Maintenance colors</summary><div class="sidebar-rgb-panel"></div>';
  const panel = controls.querySelector('.sidebar-rgb-panel');
  for (const [name, title] of [['card', 'Card background'], ['canvas', 'Page background'], ['button', '+ Log Request button']]) {
    const field = document.createElement('fieldset');
    field.className = 'maintenance-color-fields';
    field.innerHTML = `<legend>${title}</legend><label class="sidebar-color-label">Choose color<input type="color" data-maintenance-color="${name}" aria-label="${title} color"></label><div class="sidebar-rgb-fields">${['R', 'G', 'B'].map((letter, index) => `<label>${letter}<input type="number" min="0" max="255" step="1" data-maintenance-rgb="${name}" data-channel="${index}" aria-label="${title} ${letter}"></label>`).join('')}</div>`;
    panel.append(field);
  }
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.textContent = 'Reset maintenance colors';
  panel.append(reset);
  const existing = [...sidebar.querySelectorAll('.sidebar-rgb-controls')].pop();
  if (existing) existing.after(controls);
  else sidebar.querySelector('nav')?.append(controls);
  function apply(persist = true) {
    const style = document.body.style;
    style.setProperty('--maintenance-card-bg', colors.card);
    style.setProperty('--maintenance-canvas-bg', colors.canvas);
    style.setProperty('--maintenance-log-button-bg', colors.button);
    style.setProperty('--maintenance-log-button-ink', ink(colors.button));
    style.setProperty('--maintenance-log-button-hover', toHex(channels(colors.button).map(n => Math.round(n * .86))));
    const cardInk = ink(colors.card);
    style.setProperty('--maintenance-card-ink', cardInk);
    style.setProperty('--maintenance-card-secondary', `color-mix(in srgb, ${cardInk} 76%, ${colors.card})`);
    style.setProperty('--maintenance-card-line', `color-mix(in srgb, ${cardInk} 14%, ${colors.card})`);
    for (const name of Object.keys(defaults)) {
      controls.querySelector(`[data-maintenance-color="${name}"]`).value = colors[name];
      const rgb = channels(colors[name]);
      controls.querySelectorAll(`[data-maintenance-rgb="${name}"]`).forEach(input => { input.value = rgb[Number(input.dataset.channel)]; });
    }
    if (persist) { try { localStorage.setItem(key, JSON.stringify(colors)); } catch {} }
  }
  function load(value) {
    let saved;
    try { saved = JSON.parse(value); } catch {}
    colors = { ...defaults };
    for (const name of Object.keys(defaults)) if (valid(saved?.[name])) colors[name] = saved[name];
    apply(false);
  }
  controls.addEventListener('input', event => {
    const name = event.target.dataset.maintenanceColor || event.target.dataset.maintenanceRgb;
    if (!Object.hasOwn(defaults, name)) return;
    if (event.target.dataset.maintenanceColor) {
      if (!valid(event.target.value)) return;
      colors[name] = event.target.value;
    } else {
      const fields = [...controls.querySelectorAll(`[data-maintenance-rgb="${name}"]`)];
      if (fields.some(input => input.value === '' || !input.validity.valid)) return;
      colors[name] = toHex(fields.map(input => Number(input.value)));
    }
    apply();
  });
  reset.addEventListener('click', () => { colors = { ...defaults }; apply(); });
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  load(saved);
  window.addEventListener('storage', event => { if (event.key === key) load(event.newValue); });
})();
