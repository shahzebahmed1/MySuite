(() => {
  const sidebar = document.querySelector('body.concierge-sidebar .sidebar');
  if (!sidebar) return;
  const key = 'mysuite-concierge-sidebar-shape-v1';
  const fields = [
    ['width', 'Sidebar width', 210, 340, 250, 'px'],
    ['radius', 'Corner rounding', 0, 48, 0, 'px'],
    ['shadow', 'Shadow strength', 0, 30, 0, '%'],
    ['blur', 'Shadow softness', 4, 64, 28, 'px'],
    ['edge', 'Divider thickness', 0, 8, 1, 'px'],
    ['opacity', 'Divider opacity', 0, 100, 35, '%']
  ];
  const defaults = Object.fromEntries(fields.map(([id, , , , value]) => [id, value]));
  const presets = {
    soft: { ...defaults, shadow: 8, blur: 36, opacity: 8 },
    rounded: { ...defaults, radius: 28, shadow: 12, blur: 40, edge: 0 },
    shaded: { ...defaults, shadow: 22, blur: 48, edge: 0 }
  };
  let settings = null;
  const controls = document.createElement('details');
  controls.className = 'sidebar-rgb-controls sidebar-shape-controls';
  controls.innerHTML = `<summary>Sidebar shape &amp; shading</summary><div class="sidebar-rgb-panel"><div class="sidebar-shape-presets"><button type="button" data-shape-preset="soft">Soft edge</button><button type="button" data-shape-preset="rounded">Rounded</button><button type="button" data-shape-preset="shaded">Shaded</button></div>${fields.map(([id, label, min, max]) => `<label><span>${label}<output data-shape-output="${id}"></output></span><input type="range" min="${min}" max="${max}" step="1" data-shape-field="${id}" aria-label="${label}"></label>`).join('')}<label class="sidebar-shape-fade"><input type="checkbox" data-shape-fade>Fade divider ends</label><button type="button" data-shape-reset>Reset shape &amp; shading</button></div>`;
  sidebar.querySelector('nav')?.append(controls);
  function normalize(value) {
    if (!value || typeof value !== 'object') return null;
    const result = { ...defaults, fade: value.fade === true };
    for (const [id, , min, max] of fields) if (Number.isFinite(value[id])) result[id] = Math.max(min, Math.min(max, Math.round(value[id])));
    return result;
  }
  function apply(persist = true) {
    const active = settings !== null;
    document.body.toggleAttribute('data-sidebar-shape', active);
    const current = settings || defaults;
    for (const [id, , , , , unit] of fields) {
      controls.querySelector(`[data-shape-field="${id}"]`).value = current[id];
      controls.querySelector(`[data-shape-output="${id}"]`).textContent = `${current[id]}${unit}`;
    }
    controls.querySelector('[data-shape-fade]').checked = Boolean(current.fade);
    document.body.dataset.sidebarEdgeFade = String(Boolean(current.fade));
    document.body.style.setProperty('--sidebar-shape-width', `${current.width}px`);
    document.body.style.setProperty('--sidebar-shape-radius', `${current.radius}px`);
    document.body.style.setProperty('--sidebar-shape-blur', `${current.blur}px`);
    document.body.style.setProperty('--sidebar-shape-shadow', String(current.shadow / 100));
    document.body.style.setProperty('--sidebar-shape-edge', `${current.edge}px`);
    document.body.style.setProperty('--sidebar-shape-opacity', String(current.opacity / 100));
    refreshEdgeColor();
    controls.querySelectorAll('[data-shape-preset]').forEach(button => button.setAttribute('aria-pressed', String(active && Object.entries(presets[button.dataset.shapePreset]).every(([id, value]) => current[id] === value) && !current.fade)));
    if (persist) { try { if (active) localStorage.setItem(key, JSON.stringify(settings)); else localStorage.removeItem(key); } catch {} }
  }
  controls.addEventListener('input', event => {
    const id = event.target.dataset.shapeField;
    if (!fields.some(([name]) => name === id) && !event.target.matches('[data-shape-fade]')) return;
    settings = normalize({ ...(settings || defaults), ...(id ? { [id]: Number(event.target.value) } : { fade: event.target.checked }) });
    apply();
  });
  controls.addEventListener('click', event => {
    const preset = event.target.closest('[data-shape-preset]');
    if (preset) { settings = normalize(presets[preset.dataset.shapePreset]); apply(); }
    if (event.target.closest('[data-shape-reset]')) { settings = null; apply(); }
  });
  try { settings = normalize(JSON.parse(localStorage.getItem(key))); } catch {}
  apply(false);
  function refreshEdgeColor() {
    const rgb = getComputedStyle(sidebar).backgroundColor.match(/[\d.]+/g)?.slice(0,3).map(Number) || [248,244,238];
    const light = (rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722) > 140;
    const color = light ? '81 71 61' : '255 255 255';
    if (document.body.style.getPropertyValue('--sidebar-shape-rgb') !== color) document.body.style.setProperty('--sidebar-shape-rgb',color);
  }
  new MutationObserver(refreshEdgeColor).observe(sidebar,{attributes:true,attributeFilter:['style','data-custom-sidebar']});
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value;
    try { value = JSON.parse(event.newValue); } catch {}
    settings = normalize(value); apply(false);
  });
})();
