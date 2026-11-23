(() => {
  const card = document.querySelector('body.sidebar-merge #announcements');
  if (!card) return;
  const key = 'mysuite-concierge-dashboard-split-v1';
  const defaults = { angle: 115, position: 42 };
  let settings = { ...defaults };
  const controls = document.createElement('section');
  controls.className = 'dashboard-split-controls';
  controls.setAttribute('aria-label', 'Split header adjustments');
  controls.innerHTML = `<h3>Split header controls</h3><label><span>Diagonal angle<output data-split-output="angle"></output></span><input type="range" min="60" max="140" step="1" data-split="angle" aria-label="Split header diagonal angle"></label><label><span>Split left / right<output data-split-output="position"></output></span><input type="range" min="20" max="80" step="1" data-split="position" aria-label="Split header left and right position"></label><p>Adjust any split style here. Other headers switch to Split Header.</p><button type="button">Reset split</button>`;
  const experiments = card.querySelector('.announcement-header-experiments');
  if (experiments) card.insertBefore(controls, experiments);
  else card.append(controls);
  function normalize(value) {
    const result = { ...defaults };
    for (const [name, min, max] of [['angle', 60, 140], ['position', 20, 80]]) {
      if (typeof value?.[name] === 'number' && Number.isFinite(value[name])) result[name] = Math.max(min, Math.min(max, Math.round(value[name])));
    }
    return result;
  }
  function apply(persist = true) {
    const style = document.body.style;
    style.setProperty('--dashboard-split-angle', `${settings.angle}deg`);
    style.setProperty('--dashboard-split-position', `${settings.position}%`);
    style.setProperty('--dashboard-split-edge', `${settings.position + .15}%`);
    for (const name of Object.keys(defaults)) {
      controls.querySelector(`[data-split="${name}"]`).value = settings[name];
      controls.querySelector(`[data-split-output="${name}"]`).textContent = `${settings[name]}${name === 'angle' ? '°' : '%'}`;
    }
    if (persist) { try { localStorage.setItem(key, JSON.stringify(settings)); } catch {} }
  }
  function activate() {
    const select = document.querySelector('.sidebar select[aria-label="Dashboard header style"]');
    if (select && !['split-header', 'square-split-card', 'rounded-split-card', 'split-overlap'].includes(select.value)) {
      select.value = 'split-header';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  controls.addEventListener('input', event => {
    const name = event.target.dataset.split;
    if (!Object.hasOwn(defaults, name)) return;
    settings = normalize({ ...settings, [name]: Number(event.target.value) });
    apply(); activate();
  });
  controls.querySelector('button').addEventListener('click', () => { settings = { ...defaults }; apply(); activate(); });
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
  settings = normalize(saved);
  apply(false);
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value;
    try { value = JSON.parse(event.newValue); } catch {}
    settings = normalize(value); apply(false);
  });
})();
