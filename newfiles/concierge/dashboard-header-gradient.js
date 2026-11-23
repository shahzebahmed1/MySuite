(() => {
  const panel = document.querySelector('.dashboard-header-adjustments');
  if (!panel) return;
  const key = 'mysuite-concierge-dashboard-gradient-v1';
  let settings = null;
  const controls = document.createElement('fieldset');
  controls.className = 'header-gradient-controls';
  controls.innerHTML = `<legend>Gradient overlay</legend><div class="header-adjustment-fields"><label>Gradient color<input type="color" value="#192638" aria-label="Header gradient color"></label><label>Strength<output></output><input type="range" min="0" max="100" value="100" aria-label="Header gradient strength"></label></div><div class="sidebar-rgb-fields">${['R','G','B'].map((channel,i) => `<label>${channel}<input type="number" min="0" max="255" step="1" data-gradient-channel="${i}" aria-label="Gradient ${channel}"></label>`).join('')}</div><button type="button">Reset gradient</button>`;
  const textControls = panel.querySelector('.header-text-controls');
  if (textControls) textControls.before(controls); else panel.append(controls);
  const picker = controls.querySelector('input[type="color"]');
  const strength = controls.querySelector('input[type="range"]');
  const channels = [...controls.querySelectorAll('[data-gradient-channel]')];
  function normalize(value) {
    if (!value || typeof value.color !== 'string' || !/^#[\da-f]{6}$/i.test(value.color)) return null;
    return { color: value.color, strength: Number.isFinite(value.strength) ? Math.max(0, Math.min(100, Math.round(value.strength))) : 100 };
  }
  function apply(persist = true) {
    const current = settings || { color: '#192638', strength: 100 };
    document.body.toggleAttribute('data-custom-header-gradient', settings !== null);
    document.body.style.setProperty('--header-gradient-color', current.color);
    document.body.style.setProperty('--header-gradient-strength', `${current.strength}%`);
    picker.value = current.color; strength.value = current.strength;
    controls.querySelector('output').textContent = `${current.strength}%`;
    channels.forEach((input,i) => input.value = parseInt(current.color.slice(1 + i * 2, 3 + i * 2), 16));
    if (persist) { try { if (settings) localStorage.setItem(key, JSON.stringify(settings)); else localStorage.removeItem(key); } catch {} }
  }
  picker.addEventListener('input', () => { settings = normalize({ color: picker.value, strength: Number(strength.value) }); apply(); });
  strength.addEventListener('input', () => { settings = normalize({ color: picker.value, strength: Number(strength.value) }); apply(); });
  channels.forEach(input => input.addEventListener('input', () => {
    if (channels.some(field => !field.value || !field.validity.valid)) return;
    settings = normalize({ color: '#' + channels.map(field => Number(field.value).toString(16).padStart(2,'0')).join(''), strength: Number(strength.value) }); apply();
  }));
  controls.querySelector('button').addEventListener('click', () => { settings = null; apply(); });
  try { settings = normalize(JSON.parse(localStorage.getItem(key))); } catch {}
  apply(false);
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value; try { value = JSON.parse(event.newValue); } catch {}
    settings = normalize(value); apply(false);
  });
})();
