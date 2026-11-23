(() => {
  const brand = document.querySelector('.sidebar .brand');
  if (!brand) return;
  const key = 'mysuite-concierge-logo-position-v1';
  const defaults = { size: 43, x: 0, y: 0 };
  const limits = { size: [20, 48], x: [-48, 48], y: [-12, 36] };
  let settings = { ...defaults };
  let controls = null;
  const announcements = document.querySelector('body.sidebar-merge #announcements');
  if (announcements) {
    controls = document.createElement('section');
    controls.className = 'dashboard-logo-controls';
    controls.setAttribute('aria-label', 'MySuite logo size and position');
    controls.innerHTML = `<h3>MySuite logo controls</h3>${[['size', 'Logo size'], ['x', 'Move left / right'], ['y', 'Move up / down']].map(([name, label]) => `<label><span>${label}<output data-logo-value="${name}"></output></span><input type="range" min="${limits[name][0]}" max="${limits[name][1]}" step="1" data-logo-adjust="${name}" aria-label="${label}"></label>`).join('')}<button type="button">Reset logo size &amp; position</button>`;
    announcements.append(controls);
  }
  function normalize(value) {
    const result = { ...defaults };
    for (const [name, [min, max]] of Object.entries(limits)) if (typeof value?.[name] === 'number' && Number.isFinite(value[name])) result[name] = Math.max(min, Math.min(max, Math.round(value[name])));
    return result;
  }
  function apply(persist = true) {
    brand.style.setProperty('--sidebar-logo-size', `${settings.size}px`);
    brand.style.setProperty('--sidebar-logo-x', `${settings.x}px`);
    brand.style.setProperty('--sidebar-logo-y', `${settings.y}px`);
    if (controls) {
      for (const name of Object.keys(defaults)) {
        controls.querySelector(`[data-logo-adjust="${name}"]`).value = settings[name];
        controls.querySelector(`[data-logo-value="${name}"]`).textContent = `${settings[name]}px`;
      }
    }
    if (persist) { try { localStorage.setItem(key, JSON.stringify(settings)); } catch {} }
  }
  controls?.addEventListener('input', event => {
    const name = event.target.dataset.logoAdjust;
    if (!Object.hasOwn(defaults, name)) return;
    settings = normalize({ ...settings, [name]: Number(event.target.value) }); apply();
  });
  controls?.querySelector('button').addEventListener('click', () => { settings = { ...defaults }; apply(); });
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
  settings = normalize(saved); apply(false);
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value;
    try { value = JSON.parse(event.newValue); } catch {}
    settings = normalize(value); apply(false);
  });
})();
