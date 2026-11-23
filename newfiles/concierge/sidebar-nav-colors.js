(() => {
  const sidebar = document.querySelector('body.concierge-sidebar .sidebar');
  if (!sidebar) return;
  const key = 'mysuite-concierge-navigation-colors-v1';
  const fields = [
    ['text', 'Menu text', '.nav-item:not(.active)', 'color'],
    ['icons', 'Menu icons', '.nav-item:not(.active) svg', 'color'],
    ['selection', 'Selected background', '.nav-item.active', 'backgroundColor'],
    ['selectedText', 'Selected text', '.nav-item.active', 'color'],
    ['selectedIcon', 'Selected icon', '.nav-item.active svg', 'color'],
    ['divider', 'Menu dividers', '.nav-divider', 'backgroundColor']
  ];
  const valid = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  let colors = {};
  const control = document.createElement('details');
  control.className = 'sidebar-rgb-controls sidebar-nav-color-controls';
  control.innerHTML = `<summary>Navigation colors</summary><div class="sidebar-rgb-panel">${fields.map(([id, label]) => `<label>${label}<input type="color" data-nav-color="${id}" aria-label="${label} color"></label>`).join('')}<button type="button">Reset navigation colors</button></div>`;
  sidebar.querySelector('nav')?.append(control);
  function currentColor(selector, property) {
    const element = sidebar.querySelector(selector);
    const channels = element ? getComputedStyle(element)[property].match(/[\d.]+/g)?.map(Number) : null;
    const background = getComputedStyle(sidebar).backgroundColor.match(/[\d.]+/g)?.map(Number) || [25,38,56];
    return '#' + (channels?.slice(0,3) || [255,255,255]).map((n,i) => Math.round(property === 'backgroundColor' && channels?.length === 4 ? n * channels[3] + background[i] * (1 - channels[3]) : n).toString(16).padStart(2,'0')).join('');
  }
  function apply(persist = true) {
    for (const [id] of fields) {
      sidebar.toggleAttribute(`data-nav-custom-${id.toLowerCase()}`, valid(colors[id]));
      if (valid(colors[id])) sidebar.style.setProperty(`--custom-nav-${id}`, colors[id]);
      else sidebar.style.removeProperty(`--custom-nav-${id}`);
    }
    for (const [id, , selector, property] of fields) control.querySelector(`[data-nav-color="${id}"]`).value = colors[id] || currentColor(selector, property);
    if (persist) { try { localStorage.setItem(key, JSON.stringify(colors)); } catch {} }
  }
  function load(value) {
    let saved; try { saved = JSON.parse(value); } catch {}
    colors = {};
    for (const [id] of fields) if (valid(saved?.[id])) colors[id] = saved[id];
    apply(false);
  }
  control.addEventListener('input', event => {
    const id = event.target.dataset.navColor;
    if (!fields.some(([name]) => name === id) || !valid(event.target.value)) return;
    colors[id] = event.target.value; apply();
  });
  control.querySelector('button').addEventListener('click', () => { colors = {}; apply(); });
  let saved;
  try {
    saved = localStorage.getItem(key);
    const marker = 'mysuite-concierge-brown-navigation-v1';
    if (!localStorage.getItem(marker)) {
      let previous; try { previous = JSON.parse(saved); } catch {}
      saved = JSON.stringify({ ...(previous || {}), text: '#5a3f2c', selectedText: '#85532f' });
      localStorage.setItem(key,saved);
      localStorage.setItem(marker,'true');
    }
  } catch {}
  load(saved);
  window.addEventListener('storage', event => { if (event.key === key) load(event.newValue); });
})();
