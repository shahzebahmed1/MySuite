(() => {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  if (!sidebar || !main) return;
  // Restore the user's approved navy / white / cream-dot finish once.
  // Later adjustments continue to save normally.
  try {
    const restoreKey = 'mysuite-concierge-restore-navy-cream-dot-v1';
    if (!localStorage.getItem(restoreKey)) {
      localStorage.setItem('mysuite-concierge-original-sidebar-nav-v2', JSON.stringify({ sidebar: 'modern-saas', pill: 'soft-selection' }));
      localStorage.setItem('mysuite-concierge-original-sidebar-background-v1', '#1e293b');
      localStorage.removeItem('mysuite-concierge-original-sidebar-pill-v2');
      localStorage.removeItem('mysuite-concierge-sidebar-ink-colors-v1');
      localStorage.setItem('mysuite-concierge-navigation-treatment-v1', 'white');
      localStorage.setItem('mysuite-concierge-logo-cream-finish-v1', 'cream-dot');
      localStorage.setItem(restoreKey, 'true');
    }
  } catch {}
  const originalCream = document.body.dataset.sidebarPalette === 'original-cream';
  const saas = !originalCream && (document.body.dataset.colorPalette === 'modern-saas' || document.body.dataset.sidebarPalette === 'modern-saas');
  const sidebarOnly = originalCream || (saas && document.body.dataset.colorPalette !== 'modern-saas');
  const limestone = !originalCream && (document.body.dataset.colorPalette === 'limestone' || document.body.dataset.sidebarPalette === 'limestone');
  const defaultSelection = saas ? { sidebar: 'modern-saas', pill: 'royal-blue' } : limestone ? { sidebar: 'limestone', pill: 'limestone' } : { sidebar: 'original', pill: originalCream ? 'soft-selection' : 'original' };
  const key = originalCream ? 'mysuite-concierge-original-sidebar-nav-v2' : saas ? 'mysuite-directory-saas-nav-v2' : limestone ? 'mysuite-directory-limestone-nav-v1' : 'mysuite-concierge-nav-mix-v2';
  const pillColorKey = originalCream ? 'mysuite-concierge-original-sidebar-pill-v2' : saas ? 'mysuite-directory-saas-pill-color-v2' : limestone ? 'mysuite-directory-limestone-pill-color-v1' : 'mysuite-concierge-pill-color-v1';
  const validColor = color => /^#[\da-f]{6}$/i.test(color || '');
  const colorChannels = color => [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
  let pillColor = null;
  try { const saved = localStorage.getItem(pillColorKey); if (validColor(saved)) pillColor = saved; } catch {}
  const sidebars = [
    { id: 'modern-saas', title: 'Modern SaaS', detail: 'Deep charcoal with a white canvas', bg: '#1e293b', canvas: '#ffffff' },
    { id: 'limestone', title: 'Limestone', detail: 'Warm grey with a limestone canvas', bg: '#eeece7', canvas: '#f6f5f2' },
    { id: 'original', title: 'Original Cream', detail: 'Blended cream, no divider', bg: '#f8f4ee' },
    { id: 'white', title: 'White Sidebar', detail: 'Pure white, clean separation', bg: '#ffffff' },
    { id: 'beige', title: 'Warm Beige', detail: 'Muted warm grey and beige', bg: '#f0ebe5' },
    { id: 'crisp', title: 'Crisp SaaS', detail: 'White with a faint divider', bg: '#ffffff', border: '1px solid #e5e0da' },
    { id: 'tonal', title: 'Soft Color Block', detail: 'Shaded beige, bright warm canvas', bg: '#f2ebe1', canvas: '#fdfbf7' },
    { id: 'shadow', title: 'Soft Shadow', detail: 'Matching cream, diffused right shadow', bg: '#f8f4ee', canvas: '#f8f4ee', shadow: '4px 0 15px rgba(0, 0, 0, 0.03)' },
    { id: 'border', title: 'Ultra-Faint Border', detail: 'Warm cream, quiet architectural edge', bg: '#faf7f2', canvas: '#faf7f2', border: '1px solid #e8e0d5' },
    { id: 'card', title: 'Card Sidebar', detail: 'White with rounded right corners', bg: '#ffffff', radius: '0 24px 24px 0', shadow: '4px 0 18px rgba(53, 38, 30, 0.05)' }
  ];
  const pills = [
    { id: 'soft-selection', title: 'Soft Selection', detail: 'Soft grey, dark text, blue icon', bg: '#f3f4f6', text: '#27313f', icon: '#6577b9', radius: '6px' },
    { id: 'royal-blue', title: 'Royal Blue', detail: 'Professional blue with white text', bg: '#2563eb', text: '#ffffff' },
    { id: 'indigo', title: 'Indigo', detail: 'Indigo with white text', bg: '#4f46e5', text: '#ffffff' },
    { id: 'limestone', title: 'Limestone Stone', detail: 'Flat stone with charcoal text', bg: '#dedad2', text: '#302b27' },
    { id: 'original', title: 'Original Beige', detail: 'Your original warm selection', bg: '#f2e3d5', text: '#35261e' },
    { id: 'white', title: 'White Pill', detail: 'Crisp white, no shadow', bg: '#ffffff', text: '#35261e' },
    { id: 'white-shadow', title: 'Pure & Clean', detail: 'White with a soft shadow', bg: '#ffffff', text: '#35261e', shadow: '0 2px 7px #35261e14' },
    { id: 'brown', title: 'High Contrast', detail: 'Dark brown with white text', bg: '#4a3424', text: '#ffffff' },
    { id: 'espresso', title: 'Premium Hospitality', detail: 'Espresso with white text', bg: '#35261e', text: '#ffffff' },
    { id: 'none', title: 'Bold Text Only', detail: 'No fill, bold dark text and icon', bg: 'transparent', text: '#35261e', weight: '700' },
    { id: 'accent', title: 'Minimalist Ghost', detail: 'No fill, small espresso accent', bg: 'transparent', text: '#35261e', weight: '700', accent: true },
    { id: 'grey', title: 'Crisp Grey', detail: 'Very light grey selection', bg: '#f3f4f6', text: '#35261e' },
    { id: 'ivory', title: 'Soft Ivory', detail: 'Warm white selection', bg: '#fff8f0', text: '#35261e' },
    { id: 'cream', title: 'Soft Cream', detail: 'Light cream selection', bg: '#f5efe6', text: '#35261e' },
    { id: 'sage', title: 'Soft Sage', detail: 'Quiet green with deep olive text', bg: '#e2e8dc', text: '#354332' },
    { id: 'taupe', title: 'Warm Taupe', detail: 'Muted brown with cream text', bg: '#6b4f3a', text: '#fff8f0' },
    { id: 'stone', title: 'Soft Stone', detail: 'Neutral stone with espresso text', bg: '#e5e1da', text: '#35261e' },
    { id: 'caramel', title: 'Caramel', detail: 'Warm caramel with white text', bg: '#8d5e35', text: '#ffffff' },
    { id: 'slate', title: 'Slate', detail: 'Muted slate with white text', bg: '#4e5d68', text: '#ffffff' },
    { id: 'liquid-glass', title: 'Liquid Glass', detail: 'Translucent, blurred, softly reflective', bg: 'linear-gradient(135deg, #ffffffb8, #ffffff3d)', text: '#35261e', shadow: 'inset 0 1px 1px #ffffffed, inset 0 0 0 1px #ffffff9e, 0 3px 10px #35261e12', glass: true }
  ];
  const migrations = {
    white: ['original', 'white-shadow'], brown: ['original', 'brown'],
    'white-sidebar': ['white', 'none'], 'beige-sidebar': ['beige', 'white'],
    'crisp-saas': ['crisp', 'grey'], hospitality: ['original', 'espresso'],
    'minimal-ghost': ['original', 'accent'], 'tonal-layer': ['tonal', 'ivory'],
    'soft-shadow': ['shadow', 'white'], 'faint-border': ['border', 'original'],
    'card-sidebar': ['card', 'cream']
  };
  let selection = { ...defaultSelection };
  function readSelection(value) {
    try {
      const saved = JSON.parse(value);
      return {
        sidebar: sidebars.some(item => item.id === saved?.sidebar) ? saved.sidebar : defaultSelection.sidebar,
        pill: pills.some(item => item.id === saved?.pill) ? saved.pill : defaultSelection.pill
      };
    } catch { return { ...defaultSelection }; }
  }
  try {
    const saved = localStorage.getItem(key);
    if (saved) selection = readSelection(saved);
    else if (!originalCream && !limestone && !saas) {
      const migrated = migrations[localStorage.getItem('mysuite-concierge-nav-style-v1')];
      if (migrated) selection = { sidebar: migrated[0], pill: migrated[1] };
    }
  } catch {}
  const section = document.createElement('section');
  section.className = 'concierge-nav-comparison';
  section.setAttribute('aria-label', 'Mix and match sidebar and active pill styles');
  section.innerHTML = '<div class="nav-comparison-heading"><h2>Mix and match your sidebar</h2><button type="button" class="nav-style-reset">Restore original</button></div><h3 class="nav-group-title">Sidebar background</h3><p class="nav-group-description">Choose the sidebar surface. Your selected pill stays the same.</p><div class="nav-comparison-grid" data-group="sidebar"></div><h3 class="nav-group-title">Active pill</h3><p class="nav-group-description">Choose the selection style. Your sidebar background stays the same.</p><div class="nav-comparison-grid" data-group="pill"></div>';
  const navLinks = [...sidebar.querySelectorAll('.nav-item')].slice(0, 3);
  function effectivePill(pill) {
    if (!pillColor) return pill;
    const channels = colorChannels(pillColor);
    let contrastChannels = channels;
    if (pill.glass) {
      const surface = sidebars.find(item => item.id === selection.sidebar);
      const behind = sidebar.dataset.customSidebar ? sidebar.style.getPropertyValue('--custom-sidebar-bg') : surface.bg;
      contrastChannels = channels.map((value, index) => value * .66 + colorChannels(behind)[index] * .34);
    }
    const linear = contrastChannels.map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
    const light = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 > .179;
    return { ...pill, bg: pill.glass ? `linear-gradient(135deg, #ffffff40, #ffffff00), rgba(${channels.join(',')}, .66)` : pillColor, text: light ? '#251d17' : '#ffffff' };
  }
  function setPill(row, pill) {
    row.style.background = pill.bg;
    row.style.color = pill.text;
    row.style.boxShadow = pill.shadow || 'none';
    row.style.fontWeight = pill.weight || '600';
    row.style.borderRadius = pill.radius || '999px';
    const icon = row.querySelector('svg');
    if (icon) icon.style.color = pill.icon || pill.text;
    row.classList.toggle('nav-preview-accent', Boolean(pill.accent));
    row.style.backdropFilter = pill.glass ? 'blur(12px) saturate(1.3)' : 'none';
    row.style.webkitBackdropFilter = pill.glass ? 'blur(12px) saturate(1.3)' : 'none';
  }
  function applySelection(persist = true) {
    const surface = sidebars.find(item => item.id === selection.sidebar);
    const pill = effectivePill(pills.find(item => item.id === selection.pill));
    document.body.dataset.navMix = 'true';
    document.body.dataset.navPill = pill.id;
    delete document.body.dataset.navStyle;
    const properties = {
      '--sidebar-highlight': pill.bg, '--sidebar-highlight-text': pill.text,
      '--nav-highlight-shadow': pill.shadow || 'none', '--nav-highlight-weight': pill.weight || '600',
      '--nav-highlight-radius': pill.radius || '999px', '--nav-highlight-icon': pill.icon || pill.text,
      '--nav-highlight-filter': pill.glass ? 'blur(12px) saturate(1.3)' : 'none',
      '--nav-sidebar-background': surface.bg, '--nav-sidebar-shadow': surface.shadow || 'none',
      '--nav-sidebar-border': surface.border || '0', '--nav-sidebar-radius': surface.radius || '0'
    };
    for (const [name, value] of Object.entries(properties)) document.body.style.setProperty(name, value);
    if (surface.canvas && !sidebarOnly) document.body.style.setProperty('--nav-canvas', surface.canvas);
    else document.body.style.removeProperty('--nav-canvas');
    document.body.toggleAttribute('data-nav-canvas', Boolean(surface.canvas) && !sidebarOnly);
    section.querySelectorAll('[data-choice]').forEach(article => {
      const group = article.dataset.group;
      const chosen = article.dataset.choice === selection[group] && !(group === 'sidebar' && sidebar.dataset.customSidebar);
      const button = article.querySelector('button');
      button.setAttribute('aria-pressed', String(chosen));
      button.textContent = chosen ? 'Selected' : group === 'sidebar' ? 'Use sidebar' : 'Use pill';
      const preview = article.querySelector('.nav-preview-sidebar');
      const previewSurface = group === 'sidebar' ? sidebars.find(item => item.id === article.dataset.choice) : sidebar.dataset.customSidebar ? { ...surface, bg: sidebar.style.getPropertyValue('--custom-sidebar-bg') } : surface;
      preview.style.background = previewSurface.bg;
      if (validColor(previewSurface.bg)) {
        const linear = colorChannels(previewSurface.bg).map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
        const dark = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 < .179;
        preview.style.color = dark ? '#cbd5e1' : '#4a3f35';
        preview.querySelector('.nav-preview-logo').style.color = dark ? '#ffffff' : '#35261e';
      }
      preview.style.border = '0';
      preview.style.borderRight = previewSurface.border || '0';
      preview.style.borderRadius = previewSurface.radius || '0';
      preview.style.boxShadow = previewSurface.shadow || 'none';
      article.querySelector('.nav-preview-canvas').style.background = previewSurface.canvas || '#f8f4ee';
      setPill(article.querySelector('.nav-preview-row'), group === 'pill' ? pills.find(item => item.id === article.dataset.choice) : pill);
    });
    if (persist) { try { localStorage.setItem(key, JSON.stringify(selection)); } catch {} }
  }
  for (const [group, options] of [['sidebar', sidebars], ['pill', pills]]) {
    const grid = section.querySelector(`[data-group="${group}"]`);
    for (const option of options) {
      const article = document.createElement('article');
      article.dataset.group = group;
      article.dataset.choice = option.id;
      article.innerHTML = `<h3>${option.title}</h3><p>${option.detail}</p><div class="nav-preview-canvas"><div class="nav-preview-sidebar"><div class="nav-preview-logo">MySuite<span>.</span></div><div class="nav-preview-rows"></div></div></div><button type="button" aria-pressed="false">Select</button>`;
      navLinks.forEach(link => {
        const row = document.createElement('div');
        row.className = 'nav-preview-row';
        row.innerHTML = link.innerHTML;
        article.querySelector('.nav-preview-rows').append(row);
      });
      article.querySelector('button').addEventListener('click', () => {
        selection[group] = option.id;
        if (group === 'sidebar') changeBackground(null);
        if (group === 'pill') changePillColor(null);
        applySelection();
      });
      grid.append(article);
    }
  }
  main.append(section);
  section.querySelector('.nav-style-reset').addEventListener('click', () => {
    document.querySelector('.color-settings-reset')?.click();
    selection = { ...defaultSelection };
    changePillColor(null);
    applySelection();
  });
  applySelection(false);
  window.addEventListener('storage', event => {
    if (event.key === key) { selection = readSelection(event.newValue); applySelection(false); }
  });

  const backgroundKey = originalCream ? 'mysuite-concierge-original-sidebar-background-v1' : saas ? 'mysuite-directory-saas-sidebar-color-v1' : limestone ? 'mysuite-directory-limestone-sidebar-color-v1' : 'mysuite-concierge-sidebar-background-v1';
  const controls = document.createElement('details');
  controls.className = 'sidebar-rgb-controls';
  controls.innerHTML = `<summary>Sidebar color</summary><div class="sidebar-rgb-panel">
    <label class="sidebar-color-label">Choose color<input type="color" value="#f8f4ee" aria-label="Sidebar background color"></label>
    <div class="sidebar-rgb-fields"><label>R<input type="number" min="0" max="255" step="1" aria-label="Sidebar red" data-rgb="0"></label><label>G<input type="number" min="0" max="255" step="1" aria-label="Sidebar green" data-rgb="1"></label><label>B<input type="number" min="0" max="255" step="1" aria-label="Sidebar blue" data-rgb="2"></label></div>
    <button type="button">Reset sidebar color</button></div>`;
  const announcements = sidebar.querySelector('a[href="announcements.html"]');
  if (announcements) announcements.after(controls);
  else sidebar.querySelector('nav')?.append(controls);
  const colorInput = controls.querySelector('input[type="color"]');
  const rgbInputs = [...controls.querySelectorAll('[data-rgb]')];
  function changeBackground(color, persist = true) {
    const valid = /^#[\da-f]{6}$/i.test(color || '');
    colorInput.value = valid ? color : '#f8f4ee';
    const rgb = [1, 3, 5].map(index => parseInt(colorInput.value.slice(index, index + 2), 16));
    rgbInputs.forEach((input, index) => { input.value = rgb[index]; });
    if (valid) {
      sidebar.dataset.customSidebar = 'true';
      sidebar.style.setProperty('--custom-sidebar-bg', color);
      const linear = rgb.map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
      const light = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 > .179;
      sidebar.style.setProperty('--custom-sidebar-text', light ? '#35261e' : '#fff8f0');
      sidebar.style.setProperty('--custom-sidebar-divider', light ? '#35261e26' : '#ffffff33');
    } else {
      delete sidebar.dataset.customSidebar;
      for (const name of ['--custom-sidebar-bg', '--custom-sidebar-text', '--custom-sidebar-divider']) sidebar.style.removeProperty(name);
    }
    if (persist) { try { valid ? localStorage.setItem(backgroundKey, color) : localStorage.removeItem(backgroundKey); } catch {} }
    applySelection(false);
  }
  colorInput.addEventListener('input', () => changeBackground(colorInput.value));
  rgbInputs.forEach(input => input.addEventListener('input', () => {
    if (rgbInputs.some(field => field.value === '' || !field.validity.valid)) return;
    changeBackground('#' + rgbInputs.map(field => Number(field.value).toString(16).padStart(2, '0')).join(''));
  }));
  controls.querySelector('button').addEventListener('click', () => changeBackground(null));
  section.querySelector('.nav-style-reset').addEventListener('click', () => changeBackground(null));
  let savedBackground;
  try { savedBackground = localStorage.getItem(backgroundKey); } catch {}
  changeBackground(savedBackground, false);
  window.addEventListener('storage', event => { if (event.key === backgroundKey) changeBackground(event.newValue, false); });

  const pillControls = document.createElement('details');
  pillControls.className = 'sidebar-rgb-controls';
  pillControls.innerHTML = `<summary>Active pill color</summary><div class="sidebar-rgb-panel">
    <label class="sidebar-color-label">Choose color<input type="color" value="#f2e3d5" aria-label="Active pill background color"></label>
    <div class="sidebar-rgb-fields"><label>R<input type="number" min="0" max="255" step="1" aria-label="Pill red" data-pill-rgb="0"></label><label>G<input type="number" min="0" max="255" step="1" aria-label="Pill green" data-pill-rgb="1"></label><label>B<input type="number" min="0" max="255" step="1" aria-label="Pill blue" data-pill-rgb="2"></label></div>
    <p class="sidebar-pill-color-hint">Keeps your pill style. Tints Liquid Glass.</p><button type="button">Reset pill color</button></div>`;
  controls.after(pillControls);
  const pillPicker = pillControls.querySelector('input[type="color"]');
  const pillRgbInputs = [...pillControls.querySelectorAll('[data-pill-rgb]')];
  function syncPillPicker() {
    const preset = pills.find(item => item.id === selection.pill);
    const color = pillColor || (validColor(preset.bg) ? preset.bg : '#ffffff');
    pillPicker.value = color;
    const rgb = colorChannels(color);
    pillRgbInputs.forEach((input, index) => { input.value = rgb[index]; });
  }
  function changePillColor(color, persist = true) {
    pillColor = validColor(color) ? color : null;
    if (persist) { try { pillColor ? localStorage.setItem(pillColorKey, pillColor) : localStorage.removeItem(pillColorKey); } catch {} }
    applySelection(false);
    syncPillPicker();
    if (persist) document.dispatchEvent(new CustomEvent('sidebar:pill-changed'));
  }
  pillPicker.addEventListener('input', () => changePillColor(pillPicker.value));
  pillRgbInputs.forEach(input => input.addEventListener('input', () => {
    if (pillRgbInputs.some(field => field.value === '' || !field.validity.valid)) return;
    changePillColor('#' + pillRgbInputs.map(field => Number(field.value).toString(16).padStart(2, '0')).join(''));
  }));
  pillControls.querySelector('button').addEventListener('click', () => changePillColor(null));
  syncPillPicker();
  document.addEventListener('sidebar:highlight-color', event => {
    if (validColor(event.detail?.color)) changePillColor(event.detail.color);
  });
  window.addEventListener('storage', event => {
    if (event.key === pillColorKey) changePillColor(event.newValue, false);
    if (event.key === key) syncPillPicker();
  });

  const canvasKey = `mysuite-concierge-page-background-v1:${document.body.dataset.breadcrumb || 'dashboard'}`;
  const pageControls = document.createElement('details');
  pageControls.className = 'sidebar-rgb-controls';
  pageControls.innerHTML = `<summary>Page background</summary><div class="sidebar-rgb-panel"><label class="sidebar-color-label">Choose color<input type="color" aria-label="Page background color"></label><div class="sidebar-rgb-fields">${['R', 'G', 'B'].map((letter, index) => `<label>${letter}<input type="number" min="0" max="255" step="1" data-page-rgb="${index}" aria-label="Page background ${letter}"></label>`).join('')}</div><button type="button">Reset page background</button></div>`;
  pillControls.after(pageControls);
  const pagePicker = pageControls.querySelector('input[type="color"]');
  const pageRgbInputs = [...pageControls.querySelectorAll('[data-page-rgb]')];
  const originalBodyBackground = document.body.style.getPropertyValue('background');
  const originalMainBackground = main.style.getPropertyValue('background');
  function currentCanvasColor() {
    let value = getComputedStyle(main).backgroundColor;
    if (value === 'transparent' || value === 'rgba(0, 0, 0, 0)') value = getComputedStyle(document.body).backgroundColor;
    const values = value.match(/[\d.]+/g);
    return values?.length >= 3 ? '#' + values.slice(0, 3).map(n => Math.max(0, Math.min(255, Math.round(Number(n)))).toString(16).padStart(2, '0')).join('') : '#f8f4ee';
  }
  function changeCanvas(color, persist = true) {
    const valid = validColor(color);
    if (valid) {
      document.body.style.setProperty('background', color);
      main.style.setProperty('background', color);
    } else {
      if (originalBodyBackground) document.body.style.setProperty('background', originalBodyBackground);
      else document.body.style.removeProperty('background');
      if (originalMainBackground) main.style.setProperty('background', originalMainBackground);
      else main.style.removeProperty('background');
    }
    pagePicker.value = valid ? color : currentCanvasColor();
    const rgb = colorChannels(pagePicker.value);
    pageRgbInputs.forEach((input, index) => { input.value = rgb[index]; });
    if (persist) { try { valid ? localStorage.setItem(canvasKey, color) : localStorage.removeItem(canvasKey); } catch {} }
  }
  pagePicker.addEventListener('input', () => changeCanvas(pagePicker.value));
  pageRgbInputs.forEach(input => input.addEventListener('input', () => {
    if (pageRgbInputs.some(field => field.value === '' || !field.validity.valid)) return;
    changeCanvas('#' + pageRgbInputs.map(field => Number(field.value).toString(16).padStart(2, '0')).join(''));
  }));
  pageControls.querySelector('button').addEventListener('click', () => changeCanvas(null));
  let savedCanvas;
  try { savedCanvas = localStorage.getItem(canvasKey); } catch {}
  changeCanvas(savedCanvas, false);
  window.addEventListener('storage', event => { if (event.key === canvasKey) changeCanvas(event.newValue, false); });
})();
