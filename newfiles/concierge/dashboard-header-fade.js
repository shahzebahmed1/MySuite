(() => {
  const controls = document.querySelector('.dashboard-header-adjustments');
  const header = document.querySelector('.welcome');
  if (!controls || !header) return;
  const key = 'mysuite-concierge-dashboard-header-fade-v1';
  const defaults = { edge: 'none', width: 100, strength: 100, color: '#192638', matchPage: false };
  let settings = { ...defaults };
  const panel = document.createElement('fieldset');
  panel.className = 'header-gradient-controls header-fade-controls';
  panel.innerHTML = `<legend>Edge fade</legend><div class="header-adjustment-fields"><label>Fade edge<select data-fade="edge" aria-label="Header fade edge"><option value="none">Off</option><option value="left">Left edge</option><option value="bottom">Bottom edge</option><option value="both">Left &amp; bottom</option></select></label><label>Fade color<input type="color" data-fade="color" aria-label="Header fade color"></label><label>Fade width<output data-fade-output="width"></output><input type="range" min="10" max="400" step="1" data-fade="width" aria-label="Header fade width"></label><label>Fade strength<output data-fade-output="strength"></output><input type="range" min="0" max="100" step="1" data-fade="strength" aria-label="Header fade strength"></label></div><button type="button">Reset edge fade</button>`;
  const matchControl = document.createElement('label');
  matchControl.className = 'header-match-page-toggle';
  matchControl.innerHTML = '<input type="checkbox" data-fade="matchPage"><span>Blend left edge with page background</span>';
  panel.querySelector('.header-adjustment-fields').before(matchControl);
  const gradient = controls.querySelector('.header-gradient-controls');
  if (gradient) gradient.after(panel); else controls.append(panel);
  const layer = document.createElement('div');
  layer.className = 'header-edge-fade-layer';
  layer.setAttribute('aria-hidden', 'true');
  header.append(layer);
  function normalize(value) {
    const result = { ...defaults };
    result.matchPage = value?.matchPage === true;
    if (['none', 'left', 'bottom', 'both'].includes(value?.edge)) result.edge = value.edge;
    if (typeof value?.color === 'string' && /^#[\da-f]{6}$/i.test(value.color)) result.color = value.color;
    for (const [id, min, max] of [['width', 10, 400], ['strength', 0, 100]]) if (Number.isFinite(value?.[id])) result[id] = Math.max(min, Math.min(max, Math.round(value[id])));
    return result;
  }
  function syncPageColor() {
    let color = settings.color;
    if (settings.matchPage) {
      color = getComputedStyle(document.querySelector('main')).backgroundColor;
      if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') color = getComputedStyle(document.body).backgroundColor;
    }
    if (layer.style.getPropertyValue('--header-fade-color') !== color) layer.style.setProperty('--header-fade-color', color);
  }
  function apply(persist = true) {
    header.dataset.edgeFade = settings.edge;
    syncPageColor();
    layer.style.setProperty('--header-fade-width', `${settings.width}px`);
    layer.style.opacity = String(settings.strength / 100);
    for (const id of ['edge', 'width', 'strength', 'color']) panel.querySelector(`[data-fade="${id}"]`).value = settings[id];
    panel.querySelector('[data-fade="matchPage"]').checked = settings.matchPage;
    panel.querySelector('[data-fade="color"]').disabled = settings.matchPage;
    panel.querySelector('[data-fade-output="width"]').textContent = `${settings.width}px`;
    panel.querySelector('[data-fade-output="strength"]').textContent = `${settings.strength}%`;
    if (persist) { try { localStorage.setItem(key, JSON.stringify(settings)); } catch {} }
  }
  panel.addEventListener('input', event => {
    const id = event.target.dataset.fade;
    if (!Object.hasOwn(defaults, id)) return;
    settings = normalize({ ...settings, [id]: id === 'matchPage' ? event.target.checked : ['width', 'strength'].includes(id) ? Number(event.target.value) : event.target.value });
    if (id === 'matchPage' && settings.matchPage) settings.edge = settings.edge === 'bottom' ? 'both' : settings.edge === 'none' ? 'left' : settings.edge;
    apply();
  });
  panel.querySelector('button').addEventListener('click', () => { settings = { ...defaults }; apply(); });
  try { settings = normalize(JSON.parse(localStorage.getItem(key))); } catch {}
  apply(false);
  const colorObserver = new MutationObserver(syncPageColor);
  colorObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'data-dashboard-finish', 'data-card-experiments'] });
  colorObserver.observe(document.querySelector('main'), { attributes: true, attributeFilter: ['style', 'class'] });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value; try { value = JSON.parse(event.newValue); } catch {}
    settings = normalize(value); apply(false);
  });
})();
