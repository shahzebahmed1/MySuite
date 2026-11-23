(() => {
  const sidebar = document.querySelector('body.sidebar-merge .sidebar');
  if (!sidebar) return;
  const key = 'mysuite-concierge-dashboard-card-color-v1';
  const valid = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  const channels = color => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  const control = document.createElement('details');
  control.className = 'sidebar-rgb-controls';
  control.innerHTML = `<summary>Card colors</summary><div class="sidebar-rgb-panel"><label>Card background<input type="color" aria-label="Dashboard card background"></label><div class="sidebar-rgb-fields">${['R', 'G', 'B'].map((name, i) => `<label>${name}<input type="number" min="0" max="255" step="1" data-card-rgb="${i}" aria-label="Card ${name}"></label>`).join('')}</div><button type="button">Reset card colors</button></div>`;
  sidebar.querySelector('nav')?.append(control);
  const picker = control.querySelector('input[type="color"]');
  const inputs = [...control.querySelectorAll('[data-card-rgb]')];
  function apply(value, persist = true) {
    const active = valid(value);
    document.body.toggleAttribute('data-card-background', active);
    const fallback = getComputedStyle(document.querySelector('.dashboard .card')).backgroundColor.match(/\d+/g);
    const color = active ? value : '#' + (fallback?.slice(0, 3) || [255, 255, 255]).map(n => Number(n).toString(16).padStart(2, '0')).join('');
    const rgb = channels(color);
    const linear = rgb.map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
    const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
    const ink = luminance > .179 ? '#101827' : '#ffffff';
    document.body.style.setProperty('--dashboard-custom-card', color);
    document.body.style.setProperty('--dashboard-custom-card-ink', ink);
    picker.value = color;
    inputs.forEach((input, i) => input.value = rgb[i]);
    if (persist) { try { if (active) localStorage.setItem(key, color); else localStorage.removeItem(key); } catch {} }
  }
  picker.addEventListener('input', () => apply(picker.value));
  inputs.forEach(input => input.addEventListener('input', () => {
    if (inputs.some(field => field.value === '' || !field.validity.valid)) return;
    apply('#' + inputs.map(field => Number(field.value).toString(16).padStart(2, '0')).join(''));
  }));
  control.querySelector('button').addEventListener('click', () => apply(null));
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(saved, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
