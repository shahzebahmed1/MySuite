(() => {
  const sidebar = document.querySelector('.sidebar');
  if (!document.body.classList.contains('absence-page') || !sidebar) return;
  const key = 'mysuite-concierge-absence-card-color-v1';
  const valid = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  const channels = color => [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
  const control = document.createElement('details');
  control.className = 'sidebar-rgb-controls';
  control.innerHTML = `<summary>Card background</summary><div class="sidebar-rgb-panel"><label class="sidebar-color-label">Choose color<input type="color" value="#ffffff" aria-label="Absence card background color"></label><div class="sidebar-rgb-fields">${['R', 'G', 'B'].map((letter, index) => `<label>${letter}<input type="number" min="0" max="255" step="1" data-card-channel="${index}" aria-label="Absence card ${letter}"></label>`).join('')}</div><button type="button">Reset card to white</button></div>`;
  const previous = [...sidebar.querySelectorAll('.sidebar-rgb-controls')].pop();
  if (previous) previous.after(control);
  else sidebar.querySelector('nav')?.append(control);
  const picker = control.querySelector('input[type="color"]');
  const fields = [...control.querySelectorAll('[data-card-channel]')];
  function apply(value, persist = true) {
    const color = valid(value) ? value : '#ffffff';
    const rgb = channels(color);
    const linear = rgb.map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
    const ink = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 > .179 ? '#251d17' : '#ffffff';
    document.body.style.setProperty('--absence-card-background', color);
    document.body.style.setProperty('--absence-card-ink', ink);
    document.body.style.setProperty('--absence-card-secondary', `color-mix(in srgb, ${ink} 76%, ${color})`);
    document.body.style.setProperty('--absence-card-line', `color-mix(in srgb, ${ink} 14%, ${color})`);
    picker.value = color;
    fields.forEach((input, index) => { input.value = rgb[index]; });
    if (persist) { try { localStorage.setItem(key, color); } catch {} }
  }
  picker.addEventListener('input', () => apply(picker.value));
  fields.forEach(input => input.addEventListener('input', () => {
    if (fields.some(field => field.value === '' || !field.validity.valid)) return;
    apply('#' + fields.map(field => Number(field.value).toString(16).padStart(2, '0')).join(''));
  }));
  control.querySelector('button').addEventListener('click', () => apply('#ffffff'));
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(saved, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
